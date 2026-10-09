export type Candidate = { id: string; name: string; href: string; tags: string[]; free: boolean; rank: number };
export type Catalog = { themes: Candidate[]; plugins: Candidate[] };
export type Recommendation = Candidate & { reason: string };
export type FinderOptions = { site?: string; editor?: string; priority?: string; budget?: string; hosting?: string; jobs?: string[]; existing?: string[] };

export const pluginJobs = [
  ["performance", "Page performance and caching"], ["security", "Security and recovery"],
  ["forms", "Forms or lead capture"], ["analytics", "Search and analytics reporting"],
  ["maintenance", "Redirects or media maintenance"], ["backups", "Backups"],
  ["seo", "SEO"], ["email", "Email delivery"], ["ecommerce", "Ecommerce"],
  ["images", "Image optimization"], ["translation", "Translation"], ["events", "Events"],
  ["content", "Tables and structured content"], ["development", "Developer diagnostics"],
  ["accessibility", "Accessibility assistance"], ["page-builder", "Visual page building"]
];

export function recommendThemes(catalog: Catalog, options: FinderOptions): Recommendation[] {
  const workflow = options.editor === "visual" ? "page-builder" : "block-editor";
  const preferred = workflow === "page-builder" && options.site === "store"
    ? (options.budget === "premium" ? ["astra", "divi", "blocksy", "neve"] : ["astra", "blocksy", "neve"])
    : workflow === "page-builder"
    ? (options.budget === "premium" ? ["astra", "divi", "neve", "oceanwp"] : ["astra", "hello-elementor", "neve", "oceanwp"])
    : options.priority === "design" ? ["kadence", "blocksy", "spectra-one"] : ["generatepress", "spectra-one", "astra"];
  return catalog.themes.filter((theme) => theme.tags.includes(workflow)
    && (options.budget !== "free" || theme.free)
    && (options.site !== "store" || theme.tags.includes("ecommerce")))
    .sort((a, b) => {
      const score = (theme: Candidate) => {
        const position = preferred.indexOf(theme.id);
        return (position < 0 ? 0 : 50 - position * 8)
          + (options.priority === "lean" && theme.tags.includes("lightweight") ? 10 : 0)
          + (options.priority === "design" && theme.tags.includes("starter-sites") ? 10 : 0);
      };
      return score(b) - score(a) || a.rank - b.rank || a.name.localeCompare(b.name);
    }).slice(0, 3).map((theme) => ({ ...theme, reason: `${workflow === "page-builder" ? "Page-builder" : "Block-editor"} fit${options.site === "store" ? "; WooCommerce catalog fit" : ""}${theme.free ? "; free edition available" : "; paid only"}. Check the profile’s edition and integration limits.` }));
}

export function recommendPlugins(catalog: Catalog, options: FinderOptions) {
  const recommendations: Recommendation[] = [];
  const notes: string[] = [];
  const existing = new Set(options.existing || []);
  const jobs = new Set(options.jobs || []);
  if (jobs.has("security")) jobs.add("backups");
  const preferences: Record<string, string[]> = {
    security: ["wordfence", "two-factor"], backups: ["updraftplus"], forms: ["fluent-forms", "contact-form-7"],
    analytics: ["site-kit"], seo: ["rank-math", "yoast-seo"], email: ["wp-mail-smtp"], ecommerce: ["woocommerce", "surecart"],
    maintenance: ["redirection"], images: ["shortpixel"], translation: ["translatepress-multilingual"],
    events: ["the-events-calendar"], content: ["tablepress"], development: ["query-monitor"],
    accessibility: ["wp-accessibility"], "page-builder": ["elementor"]
  };
  for (const job of jobs) {
    if (existing.has(job)) { notes.push(`You already have ${job} covered. Review that setup before adding an overlapping plugin.`); continue; }
    if (job === "performance") {
      if (existing.has("cache") || options.hosting === "managed") {
        notes.push("Keep the existing or host-provided page cache. Do not add a second full-page cache plugin."); continue;
      }
      if (!options.hosting || options.hosting === "unknown") {
        notes.push("Hosting is unknown: ask your host about its cache before choosing a caching plugin. No paid cache is assumed."); continue;
      }
      preferences.performance = options.hosting === "litespeed" ? ["litespeed-cache"] : options.budget === "premium" ? ["wp-rocket"] : ["wp-optimize"];
    }
    const preferred = preferences[job] || [];
    const matches = catalog.plugins.filter((plugin) => plugin.tags.includes(job)
      && (options.budget !== "free" || plugin.free)
      && preferred.includes(plugin.id)).sort((a, b) => preferred.indexOf(a.id) - preferred.indexOf(b.id));
    // Alternatives are not a combined install list: select one starting point per job.
    const candidate = matches[0];
    if (candidate && !recommendations.some((entry) => entry.id === candidate.id)) recommendations.push({ ...candidate, reason: `For your ${job} requirement. ${candidate.free ? "A free edition is available; check quotas and paid-feature boundaries." : "Paid option; confirm the current plan before buying."}` });
  }
  if (!jobs.size) notes.push("No extra plugin job was selected. Keep the existing stack; add a plugin only when you have a specific unmet requirement.");
  if (jobs.has("ecommerce")) notes.push("Store tools are alternatives, not additions to an existing store. Test checkout and account pages before launch.");
  return { recommendations, notes };
}
