import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";

// Mechanical asset conversion. Source URLs and captions remain in the content.
const output = path.resolve("public/media/previews");
await fs.mkdir(output, { recursive: true });
const urls = new Set();
for (const collection of ["theme-reviews", "plugin-reviews", "plugins"]) {
  for (const name of await fs.readdir(`src/content/${collection}`)) {
    const entry = JSON.parse(await fs.readFile(`src/content/${collection}/${name}`, "utf8"));
    if (entry.isPlaceholder) continue;
    for (const url of [entry.thumbnail, entry.homepageScreenshot?.src]) if (url?.startsWith("https://")) urls.add(url);
  }
}
let manifest = {};
try { manifest = JSON.parse(await fs.readFile("public/media/previews.json", "utf8")); } catch {}
let cursor = 0;
const sources = [...urls];
await Promise.all(Array.from({ length: 4 }, async () => {
  while (cursor < sources.length) {
    const url = sources[cursor++];
    if (manifest[url] && !process.argv.includes("--refresh")) continue;
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) throw new Error(`Preview unavailable: ${response.status} ${url}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    const image = sharp(buffer, { animated: false });
    const meta = await image.metadata();
    const hash = createHash("sha256").update(url).digest("hex").slice(0, 16);
    const variants = [];
    for (const requestedWidth of [320, 640, 1000]) {
      const width = Math.min(requestedWidth, meta.width);
      if (variants.some((variant) => variant.width === width)) continue;
      const filename = `${hash}-${width}.webp`;
      const info = await sharp(buffer, { animated: false }).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 76, effort: 5 }).toFile(path.join(output, filename));
      variants.push({ src: `/media/previews/${filename}`, width: info.width, bytes: info.size });
    }
    manifest[url] = { source: url, checked: new Date().toISOString().slice(0, 10), width: meta.width, height: meta.height, originalBytes: buffer.length, src: variants.find((variant) => variant.width >= 640)?.src || variants.at(-1).src, variants };
    console.log(`${hash}: ${buffer.length} source bytes → ${variants.map((variant) => `${variant.width}px/${variant.bytes}B`).join(", ")}`);
  }
}));
await fs.writeFile("public/media/previews.json", JSON.stringify(Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b))), null, 2) + "\n");
