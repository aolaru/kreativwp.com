import { getCollection } from "astro:content";
import { themeFilters, pluginFilters, editorialRank } from "./library";

export async function getFinderCatalog() {
  const [themes, plugins] = await Promise.all([getCollection("themeReviews"), getCollection("pluginReviews")]);
  return {
    themes: themes.filter((entry) => !entry.data.isPlaceholder).map((entry) => ({
      id: entry.id, name: entry.data.themeName, href: `/themes/${entry.id}/`,
      tags: themeFilters[entry.id] || [], free: entry.data.freeVersion === "Available",
      rank: editorialRank(entry.id, "themes") ?? 99
    })),
    plugins: plugins.filter((entry) => !entry.data.isPlaceholder).map((entry) => ({
      id: entry.id, name: entry.data.pluginName, href: `/plugins/reviews/${entry.id}/`,
      tags: pluginFilters[entry.id] || [], free: entry.data.freeVersion === "Available",
      rank: editorialRank(entry.id, "plugins") ?? 99
    }))
  };
}
