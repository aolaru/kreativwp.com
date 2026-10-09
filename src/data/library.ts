export type Filter = { label: string; value: string };
export type FilterGroup = { label: string; mode: "any" | "all"; filters: Filter[] };

export const themeFilterGroups: FilterGroup[] = [
  { label: "Editing workflow", mode: "any", filters: [
    { label: "Block editor", value: "block-editor" }, { label: "Page builder", value: "page-builder" }, { label: "Full site editing", value: "full-site-editing" }
  ] },
  { label: "Site type", mode: "any", filters: [
    { label: "Business", value: "business" }, { label: "Portfolio", value: "portfolio" }, { label: "WooCommerce", value: "ecommerce" }
  ] },
  { label: "Requirements", mode: "all", filters: [
    { label: "Lightweight", value: "lightweight" }, { label: "Starter sites", value: "starter-sites" }, { label: "Free", value: "free" }
  ] }
];

export const pluginFilterGroups: FilterGroup[] = [
  { label: "Task", mode: "any", filters: [
    { label: "Performance", value: "performance" }, { label: "Security", value: "security" },
    { label: "Forms", value: "forms" }, { label: "Analytics", value: "analytics" },
    { label: "SEO", value: "seo" }, { label: "Email", value: "email" },
    { label: "Ecommerce", value: "ecommerce" }, { label: "Backups", value: "backups" },
    { label: "Page builder", value: "page-builder" }, { label: "Development", value: "development" },
    { label: "Accessibility", value: "accessibility" }, { label: "Content", value: "content" },
    { label: "Maintenance", value: "maintenance" }, { label: "Images", value: "images" },
    { label: "Translation", value: "translation" }, { label: "Events", value: "events" }
  ] },
  { label: "Profile type", mode: "any", filters: [
    { label: "Core stack", value: "core" }, { label: "Use when needed", value: "conditional" },
    { label: "Our products", value: "product" }, { label: "In research", value: "research" }
  ] }
];

// Explicit editorial choices, not the first alphabetical entries.
// These are starting points, never a default-install stack.
export const librarySelections = {
  themes: ["generatepress", "astra", "blocksy", "kadence"],
  plugins: ["fluent-forms", "updraftplus", "site-kit", "wordfence"]
};

export function editorialRank(id: string, collection: keyof typeof librarySelections) {
  const index = librarySelections[collection].indexOf(id);
  return index < 0 ? undefined : index;
}

export function shortBestFor(value: string) {
  const text = value.replace(/\s+/g, " ").trim();
  const firstSentence = text.split(/(?<=[.!?])\s/)[0];
  return firstSentence.length <= 110 ? firstSentence : firstSentence.slice(0, 107).replace(/\s+\S*$/, "") + "…";
}

export const themeFilters: Record<string, string[]> = {
  astra: ["lightweight", "block-editor", "page-builder", "ecommerce", "business", "starter-sites", "free"],
  blocksy: ["lightweight", "block-editor", "page-builder", "ecommerce", "business", "starter-sites", "free"],
  divi: ["page-builder", "ecommerce", "business", "starter-sites"],
  frost: ["block-editor", "full-site-editing", "portfolio", "free"],
  generatepress: ["lightweight", "block-editor", "business", "free"],
  go: ["lightweight", "block-editor", "ecommerce", "business", "free"],
  "hello-elementor": ["lightweight", "page-builder", "free"],
  "hello-biz": ["page-builder", "business", "starter-sites", "free"],
  hestia: ["page-builder", "ecommerce", "business", "starter-sites", "free"],
  inspiro: ["portfolio", "page-builder", "starter-sites", "free"],
  jadro: ["lightweight", "block-editor", "full-site-editing", "business", "free"],
  kadence: ["block-editor", "ecommerce", "business", "starter-sites", "free"],
  neve: ["lightweight", "block-editor", "page-builder", "ecommerce", "business", "starter-sites", "free"],
  oceanwp: ["ecommerce", "page-builder", "business", "starter-sites", "free"],
  ollie: ["block-editor", "full-site-editing", "free"],
  raft: ["lightweight", "block-editor", "full-site-editing", "page-builder", "ecommerce", "free"],
  "spectra-one": ["block-editor", "full-site-editing", "portfolio", "free"],
  storefront: ["ecommerce", "free"],
  sydney: ["page-builder", "block-editor", "portfolio", "business", "starter-sites", "free"],
  "twenty-twenty-three": ["block-editor", "full-site-editing", "portfolio", "free"],
  "twenty-twenty-four": ["block-editor", "full-site-editing", "portfolio", "free"],
  "twenty-twenty-five": ["block-editor", "full-site-editing", "portfolio", "free"],
  extendable: ["block-editor", "full-site-editing", "business", "starter-sites", "free"],
  botiga: ["ecommerce", "business", "starter-sites", "free"],
  zakra: ["page-builder", "business", "starter-sites", "free"],
  customify: ["page-builder", "business", "starter-sites", "free"],
  "colibri-wp": ["page-builder", "business", "portfolio", "starter-sites", "free"],
  qi: ["page-builder", "business", "portfolio", "starter-sites", "free"],
  shapely: ["page-builder", "business", "portfolio", "free"],
  panoramic: ["page-builder", "business", "portfolio", "ecommerce", "free"]
};

export const pluginFilters: Record<string, string[]> = {
  "wp-rocket": ["performance", "core"],
  "litespeed-cache": ["performance", "conditional"],
  updraftplus: ["backups", "core"],
  wordfence: ["security", "core"],
  "fluent-forms": ["forms", "core"],
  "site-kit": ["analytics", "core"],
  "wp-mail-smtp": ["email", "core"],
  "rank-math": ["seo", "core"],
  woocommerce: ["ecommerce", "conditional"],
  redirection: ["maintenance", "conditional"],
  shortpixel: ["images", "conditional"],
  "performance-plugins": ["research"],
  "designer-plugins": ["research"],
  "yoast-seo": ["seo", "conditional"],
  "contact-form-7": ["forms", "conditional"],
  elementor: ["page-builder", "conditional"],
  "advanced-custom-fields": ["development", "conditional"],
  mailpoet: ["email", "conditional"],
  "the-events-calendar": ["events", "conditional"],
  "translatepress-multilingual": ["translation", "conditional"],
  "wp-optimize": ["performance", "conditional"],
  jetpack: ["maintenance", "security", "conditional"],
  "two-factor": ["security", "conditional"],
  surecart: ["ecommerce", "conditional"],
  "easy-digital-downloads": ["ecommerce", "conditional"],
  duplicator: ["backups", "maintenance", "conditional"],
  "query-monitor": ["development", "performance", "conditional"],
  tablepress: ["content", "conditional"],
  "antispam-bee": ["security", "conditional"],
  "wp-accessibility": ["accessibility", "conditional"]
};
