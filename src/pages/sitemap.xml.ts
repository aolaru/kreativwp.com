import { newsPosts, plugins } from "../data/site";

export function GET({ site }) {
  const urls = [
    { path: "/", lastmod: "2026-04-04", changefreq: "weekly", priority: "1.0" },
    { path: "/about.html", lastmod: "2026-03-28", changefreq: "monthly", priority: "0.7" },
    { path: "/contact.html", lastmod: "2026-03-28", changefreq: "monthly", priority: "0.7" },
    { path: "/news.html", lastmod: "2026-04-04", changefreq: "monthly", priority: "0.6" },
    ...newsPosts.map((post) => ({
      path: post.canonicalPath,
      lastmod: post.slug === "april-2026-status-note" ? "2026-04-04" : "2026-03-28",
      changefreq: "monthly",
      priority: "0.5"
    })),
    ...plugins.map((plugin) => ({
      path: plugin.canonicalPath,
      lastmod: plugin.lastUpdated === "March 28, 2026" ? "2026-03-28" : "2026-03-16",
      changefreq: "monthly",
      priority: plugin.live ? "0.7" : "0.6"
    }))
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${new URL(url.path, site).toString()}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
}
