import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const decode = (value) => value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
export function checkInternalLinks(targetDir) {
  const root = path.resolve(targetDir);
  const htmlFiles = [];
  const problems = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if ([".git", "node_modules"].includes(entry.name)) continue;
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (file.endsWith(".html")) htmlFiles.push(file);
    }
  };
  walk(root);
  const ids = new Map();
  for (const file of htmlFiles) ids.set(file, new Set([...fs.readFileSync(file, "utf8").matchAll(/\bid=["']([^"']+)["']/g)].map((match) => decode(match[1]))));
  for (const file of htmlFiles) {
    const from = "/" + path.relative(root, file).replaceAll(path.sep, "/").replace(/index\.html$/, "");
    const text = fs.readFileSync(file, "utf8");
    const links = [...text.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)].map((match) => decode(match[1]));
    for (const match of text.matchAll(/\bsrcset=["']([^"']+)["']/g)) links.push(...decode(match[1]).split(",").map((item) => item.trim().split(/\s+/)[0]));
    for (const link of links) {
      if (/^(?:mailto:|tel:|javascript:|data:|blob:)/i.test(link)) continue;
      let url;
      try { url = new URL(link, "https://kreativwp.com" + from); } catch { problems.push({ file, link, reason: "Invalid URL" }); continue; }
      if (!["kreativwp.com", "www.kreativwp.com"].includes(url.hostname)) continue;
      let pathname, fragment;
      try { pathname = decodeURIComponent(url.pathname); fragment = decodeURIComponent(url.hash.slice(1)); } catch { problems.push({ file, link, reason: "Invalid encoding" }); continue; }
      let target = path.resolve(root, "." + pathname);
      if (!target.startsWith(root + path.sep) && target !== root) { problems.push({ file, link, reason: "Path escapes output" }); continue; }
      if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, "index.html");
      if (!fs.existsSync(target)) problems.push({ file, link, reason: "Missing file" });
      else if (fragment && target.endsWith(".html") && !fragment.startsWith(":~:text=") && !ids.get(target)?.has(fragment)) problems.push({ file, link, reason: "Missing fragment #" + fragment });
    }
  }
  return { count: htmlFiles.length, problems };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const result = checkInternalLinks(process.argv[2] || "dist");
  for (const issue of result.problems) console.error(`${path.relative(process.cwd(), issue.file)}: ${issue.link} — ${issue.reason}`);
  console.log(`Checked ${result.count} HTML files, assets, responsive image variants, and fragments: ${result.problems.length} problems.`);
  if (result.problems.length) process.exitCode = 1;
}
