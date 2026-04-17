import { getCollection } from "astro:content";

export async function GET({ site }) {
  const newsPosts = await getCollection("news");
  const plugins = await getCollection("plugins");
  const urls = [
    { path: "/", lastmod: "2026-04-04", changefreq: "weekly", priority: "1.0" },
    { path: "/about.html", lastmod: "2026-03-28", changefreq: "monthly", priority: "0.7" },
    { path: "/contact.html", lastmod: "2026-03-28", changefreq: "monthly", priority: "0.7" },
    { path: "/news.html", lastmod: "2026-04-04", changefreq: "monthly", priority: "0.6" },
    ...newsPosts.map((post) => ({
      path: `/news/${post.id}.html`,
      lastmod: post.data.published,
      changefreq: "monthly",
      priority: "0.5"
    })),
    ...plugins.map((plugin) => ({
      path: `/plugins/${plugin.id}.html`,
      lastmod: plugin.data.lastUpdatedIso,
      changefreq: "monthly",
      priority: plugin.data.live ? "0.7" : "0.6"
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
