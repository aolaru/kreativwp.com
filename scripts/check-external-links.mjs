import fs from "node:fs";
import path from "node:path";

// Separate network diagnostics from deterministic deployment checks. A blocked
// bot request is indeterminate, never reported as a validated destination.
const root = path.resolve(process.argv[2] || "dist");
const destinations = new Map();
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (file.endsWith(".html")) {
      const html = fs.readFileSync(file, "utf8");
      const tags = [...html.matchAll(/<(?:a|img|script|link)\b[^>]*>/g)].map((match) => match[0]).filter((tag) => !/\brel=["'](?:preconnect|dns-prefetch)["']/.test(tag));
      for (const tag of tags) for (const match of tag.matchAll(/\b(?:href|src)=["'](https:\/\/[^"']+)["']/g)) {
        const url = match[1].replace(/&amp;/g, "&").split("#")[0];
        if (new URL(url).hostname === "kreativwp.com") continue;
        destinations.set(url, { file: path.relative(root, file), download: /downloads\.wordpress\.org.*\.zip/.test(url), image: /\.(png|jpe?g|gif|webp)(\?|$)/i.test(url) });
      }
    }
  }
}
walk(root);
let cursor = 0;
const results = [];
const entries = [...destinations];
async function probe(url) {
  let lastError;
  for (const method of ["HEAD", "GET"]) {
    try {
      let response = await fetch(url, { method, signal: AbortSignal.timeout(15000) });
      if (method === "HEAD" && [403, 405, 500, 502, 503, 504].includes(response.status)) {
        await response.body?.cancel();
        continue;
      }
      return response;
    } catch (error) { lastError = error; }
  }
  throw lastError || new Error("No response from destination");
}
await Promise.all(Array.from({ length: 4 }, async () => {
  while (cursor < entries.length) {
    const [url, info] = entries[cursor++];
    try {
      const response = await probe(url);
      const type = response.headers.get("content-type") || "";
      const blocked = [401, 403, 429].includes(response.status);
      let ok = response.ok;
      if (info.image && !type.startsWith("image/")) ok = false;
      if (info.download && !/zip|octet-stream/.test(type)) ok = false;
      await response.body?.cancel();
      results.push({ url, ...info, status: response.status, type, state: blocked ? "indeterminate" : ok ? "ok" : "failed" });
    } catch (error) { results.push({ url, ...info, state: "failed", error: error.message }); }
  }
}));
const failed = results.filter((result) => result.state === "failed");
const blocked = results.filter((result) => result.state === "indeterminate");
for (const result of [...failed, ...blocked]) console.log(JSON.stringify(result));
console.log(`External destinations: ${results.length - failed.length - blocked.length} verified, ${failed.length} failed, ${blocked.length} blocked/indeterminate.`);
if (failed.length || (blocked.length && process.argv.includes("--strict"))) process.exitCode = 1;
