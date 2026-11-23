import { getCollection } from "astro:content";
import { themeFilters, pluginFilters, editorialRank } from "./library";

export async function getFinderCatalog() {
  const [themes, plugins, products] = await Promise.all([getCollection("themeReviews"), getCollection("pluginReviews"), getCollection("plugins")]);
  return {
    themes: themes.filter((entry) => !entry.data.isPlaceholder).map((entry) => ({
      id: entry.id, name: entry.data.themeName, href: `/themes/${entry.id}/`,
      tags: themeFilters[entry.id] || [], free: entry.data.freeVersion === "Available",
      rank: editorialRank(entry.id, "themes") ?? 99
    })),
    plugins: [...plugins.filter((entry) => !entry.data.isPlaceholder).map((entry) => ({
      id: entry.id, name: entry.data.pluginName, href: `/plugins/reviews/${entry.id}/`,
      tags: pluginFilters[entry.id] || [], free: entry.data.freeVersion === "Available",
      rank: editorialRank(entry.id, "plugins") ?? 99
    })), ...products.filter((entry) => entry.data.live).map((entry) => ({
      id: entry.id, name: entry.data.name, href: `/plugins/${entry.id}/`,
      tags: entry.id === "kreativ-report-broken-link" ? ["broken-links"] : entry.id === "kreativ-broken-image-finder" ? ["broken-images"] : entry.id === "kreativ-smart-related-posts" ? ["related-posts"] : [],
      free: true, rank: 99, ownProduct: true
    }))]
  };
}
