type RelatedLink = { label: string; href: string };

const pluginGroups: RelatedLink[][] = [
  [{ label: "WPForms", href: "/plugins/reviews/wpforms/" }, { label: "Fluent Forms", href: "/plugins/reviews/fluent-forms/" }, { label: "Contact Form 7", href: "/plugins/reviews/contact-form-7/" }],
  [{ label: "Polylang", href: "/plugins/reviews/polylang/" }, { label: "TranslatePress", href: "/plugins/reviews/translatepress-multilingual/" }],
  [{ label: "Akismet", href: "/plugins/reviews/akismet/" }, { label: "Antispam Bee", href: "/plugins/reviews/antispam-bee/" }],
  [{ label: "All-in-One WP Migration", href: "/plugins/reviews/all-in-one-wp-migration/" }, { label: "WPvivid", href: "/plugins/reviews/wpvivid/" }, { label: "Duplicator", href: "/plugins/reviews/duplicator/" }, { label: "UpdraftPlus", href: "/plugins/reviews/updraftplus/" }],
  [{ label: "WP Super Cache", href: "/plugins/reviews/wp-super-cache/" }, { label: "LiteSpeed Cache", href: "/plugins/reviews/litespeed-cache/" }, { label: "WP Rocket", href: "/plugins/reviews/wp-rocket/" }],
  [{ label: "Regenerate Thumbnails", href: "/plugins/reviews/regenerate-thumbnails/" }, { label: "ShortPixel", href: "/plugins/reviews/shortpixel/" }],
  [{ label: "Code Snippets", href: "/plugins/reviews/code-snippets/" }, { label: "Query Monitor", href: "/plugins/reviews/query-monitor/" }, { label: "Advanced Custom Fields", href: "/plugins/reviews/advanced-custom-fields/" }],
  [{ label: "Simple History", href: "/plugins/reviews/simple-history/" }, { label: "Wordfence", href: "/plugins/reviews/wordfence/" }, { label: "Two Factor", href: "/plugins/reviews/two-factor/" }]
];
const themeGroups: RelatedLink[][] = [
  [{ label: "Ona", href: "/themes/ona/" }, { label: "Bricksy", href: "/themes/bricksy/" }, { label: "Ollie", href: "/themes/ollie/" }],
  [{ label: "Björk", href: "/themes/bjork/" }, { label: "Ashe", href: "/themes/ashe/" }, { label: "Inspiro", href: "/themes/inspiro/" }],
  [{ label: "Blockbase", href: "/themes/blockbase/" }, { label: "Twenty Twenty-Two", href: "/themes/twenty-twenty-two/" }, { label: "Twenty Twenty-Five", href: "/themes/twenty-twenty-five/" }],
  [{ label: "Woostify", href: "/themes/woostify/" }, { label: "Botiga", href: "/themes/botiga/" }, { label: "Storefront", href: "/themes/storefront/" }],
  [{ label: "Responsive", href: "/themes/responsive/" }, { label: "Astra", href: "/themes/astra/" }, { label: "Neve", href: "/themes/neve/" }],
  [{ label: "Tove", href: "/themes/tove/" }, { label: "Twenty Twenty-One", href: "/themes/twenty-twenty-one/" }, { label: "Twenty Twenty-Four", href: "/themes/twenty-twenty-four/" }]
];

export function relatedProfiles(kind: "themes" | "plugins", id: string): RelatedLink[] {
  const path = kind === "themes" ? `/themes/${id}/` : `/plugins/reviews/${id}/`;
  const groups = kind === "themes" ? themeGroups : pluginGroups;
  const group = groups.find((items) => items.some((item) => item.href === path));
  return group?.filter((item) => item.href !== path) ?? [];
}
