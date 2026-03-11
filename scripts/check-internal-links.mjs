import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const htmlFiles = [];
const missing = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (entry.isFile() && full.endsWith(".html")) {
      htmlFiles.push(full);
    }
  }
}

function resolveInternalLink(link, fromFile) {
  const clean = link.split("#")[0].split("?")[0];
  if (!clean) return null;
  if (
    clean.startsWith("http://") ||
    clean.startsWith("https://") ||
    clean.startsWith("mailto:") ||
    clean.startsWith("tel:") ||
    clean.startsWith("javascript:") ||
    clean.startsWith("data:")
  ) {
    return null;
  }
  if (clean === "/") {
    return path.join(root, "index.html");
  }
  if (clean.startsWith("/")) {
    return path.join(root, clean.slice(1));
  }
  return path.resolve(path.dirname(fromFile), clean);
}

walk(root);

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, "utf8");
  const matches = content.matchAll(/\b(?:href|src)=["']([^"']+)["']/g);
  for (const match of matches) {
    const link = match[1];
    const target = resolveInternalLink(link, file);
    if (!target) continue;
    if (!fs.existsSync(target)) {
      missing.push({
        file: path.relative(root, file),
        link,
        target: path.relative(root, target)
      });
    }
  }
}

if (missing.length > 0) {
  console.error("Broken internal links found:");
  for (const item of missing) {
    console.error(`- ${item.file}: "${item.link}" -> ${item.target}`);
  }
  process.exit(1);
}

console.log(`Checked ${htmlFiles.length} HTML files: no broken internal links.`);
