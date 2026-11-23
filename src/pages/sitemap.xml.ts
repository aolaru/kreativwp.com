import { getCollection } from "astro:content";

export async function GET({ site }) {
  const [newsPosts, plugins, themes, reviews, comparisons, guides, tools] = await Promise.all([
    getCollection("news"), getCollection("plugins"), getCollection("themeReviews"),
    getCollection("pluginReviews"), getCollection("comparisons"), getCollection("guides"), getCollection("tools")
  ]);
  const urls = [
    { path: "/", changefreq: "weekly", priority: "1.0" },
    { path: "/about/", changefreq: "monthly", priority: "0.7" },
    { path: "/contact/", changefreq: "monthly", priority: "0.7" },
    { path: "/privacy/", changefreq: "monthly", priority: "0.4" },
    { path: "/methodology/", changefreq: "monthly", priority: "0.6" },
    { path: "/news/", changefreq: "monthly", priority: "0.6" },
    { path: "/themes/", changefreq: "weekly", priority: "0.8" },
    { path: "/plugins/", changefreq: "weekly", priority: "0.8" },
    { path: "/comparisons/", changefreq: "weekly", priority: "0.8" },
    { path: "/guides/", changefreq: "weekly", priority: "0.8" },
    { path: "/tools/", changefreq: "weekly", priority: "0.7" },
    { path: "/products/", changefreq: "monthly", priority: "0.7" },
    { path: "/products/kreativ-core/", lastmod: themes.find((entry) => entry.id === "kreativ-core")?.data.updated, changefreq: "monthly", priority: "0.8" },
    { path: "/theme-checklist/", changefreq: "monthly", priority: "0.6" },
    ...[
      { entries: themes, prefix: "/themes/" },
      { entries: reviews, prefix: "/plugins/reviews/" },
      { entries: comparisons, prefix: "/comparisons/" },
      { entries: guides, prefix: "/guides/" },
      { entries: tools.filter((entry) => entry.data.availability === "available"), prefix: "/tools/" }
    ].flatMap(({ entries, prefix }) => entries.filter((entry) => !entry.data.isPlaceholder).map((entry) => ({
      path: `${prefix}${entry.id}/`, lastmod: entry.data.updated, changefreq: "monthly", priority: "0.6"
    }))),
    ...newsPosts.map((post) => ({
      path: `/news/${post.id}/`,
      lastmod: post.data.published,
      changefreq: "monthly",
      priority: "0.5"
    })),
    ...plugins.map((plugin) => ({
      path: `/plugins/${plugin.id}/`,
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
${url.lastmod ? `    <lastmod>${url.lastmod}</lastmod>\n` : ""}
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
