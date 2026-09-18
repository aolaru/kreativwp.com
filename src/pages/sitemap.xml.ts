import { getCollection } from "astro:content";

export async function GET({ site }) {
  const newsPosts = await getCollection("news");
  const plugins = await getCollection("plugins");
  const routeRefreshDate = "2026-09-18";
  const lastModified = (date) => (date > routeRefreshDate ? date : routeRefreshDate);
  const urls = [
    { path: "/", lastmod: routeRefreshDate, changefreq: "weekly", priority: "1.0" },
    { path: "/about/", lastmod: routeRefreshDate, changefreq: "monthly", priority: "0.7" },
    { path: "/contact/", lastmod: routeRefreshDate, changefreq: "monthly", priority: "0.7" },
    { path: "/news/", lastmod: routeRefreshDate, changefreq: "monthly", priority: "0.6" },
    { path: "/themes/", lastmod: routeRefreshDate, changefreq: "weekly", priority: "0.8" },
    { path: "/plugins/", lastmod: routeRefreshDate, changefreq: "weekly", priority: "0.8" },
    { path: "/comparisons/", lastmod: routeRefreshDate, changefreq: "weekly", priority: "0.8" },
    { path: "/guides/", lastmod: routeRefreshDate, changefreq: "weekly", priority: "0.8" },
    { path: "/tools/", lastmod: routeRefreshDate, changefreq: "weekly", priority: "0.7" },
    { path: "/products/", lastmod: routeRefreshDate, changefreq: "monthly", priority: "0.7" },
    ...newsPosts.map((post) => ({
      path: `/news/${post.id}/`,
      lastmod: lastModified(post.data.published),
      changefreq: "monthly",
      priority: "0.5"
    })),
    ...plugins.map((plugin) => ({
      path: `/plugins/${plugin.id}/`,
      lastmod: lastModified(plugin.data.lastUpdatedIso),
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
