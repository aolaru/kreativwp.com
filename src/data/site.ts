export type Plugin = {
  slug: string;
  name: string;
  description: string;
  canonicalPath: string;
  cardMeta: string;
  cardUse: string;
  thumb: string;
  imageAlt: string;
  title: string;
  metaDescription: string;
  detailTitle: string;
  detailItems: Array<{ title: string; body: string }>;
  ctaTitle: string;
  ctaLines: string[];
  ctaHref?: string;
  ctaLabel?: string;
  lastUpdated?: string;
  live: boolean;
  homepageStatus?: string;
};

export type NewsPost = {
  slug: string;
  title: string;
  description: string;
  canonicalPath: string;
  metaDescription: string;
  date: string;
  tag: string;
  intro: string;
  sectionTitle: string;
  items: Array<{ title: string; body: string }>;
};

export const footerLinks = [
  { label: "Kreativ Font", href: "https://kreativfont.com" },
  { label: "Kreativ Sound", href: "https://kreativsound.com" },
  { label: "Kreativ Tools", href: "https://kreativtools.com" },
  { label: "Kreativ WP", href: "https://kreativwp.com" }
];

export const plugins: Plugin[] = [
  {
    slug: "kreativ-report-broken-link",
    name: "Kreativ Report Broken Link",
    description: "Find broken internal and external links and export clean maintenance reports.",
    canonicalPath: "/plugins/kreativ-report-broken-link.html",
    cardMeta: "Scan and report broken links.",
    cardUse: "Find broken internal and external links and export clean reports.",
    thumb: "/thumb-kreativ-report-broken-link-128.svg",
    imageAlt: "Kreativ Report Broken Link thumbnail",
    title: "Kreativ Report Broken Link | Kreativ WP",
    metaDescription:
      "Scan internal and external links, detect breakage, and export actionable maintenance reports.",
    detailTitle: "Key Features",
    detailItems: [
      {
        title: "Internal + external scanning",
        body: "Crawls links across your content and highlights broken targets by type, source, and status code."
      },
      {
        title: "Actionable reporting",
        body: "Exports clear reports for cleanup sessions so teams can resolve link debt quickly."
      },
      {
        title: "Maintenance-first workflow",
        body: "Designed for recurring audits in real WordPress maintenance cycles."
      }
    ],
    ctaTitle: "Get the Plugin",
    ctaLines: ["Last updated: March 28, 2026"],
    ctaHref: "https://wordpress.org/plugins/kreativ-report-broken-link/",
    ctaLabel: "View on WordPress.org",
    lastUpdated: "March 28, 2026",
    live: true
  },
  {
    slug: "kreativ-broken-image-finder",
    name: "Kreativ Broken Image Finder",
    description: "Catch missing images early and keep content quality high across your site.",
    canonicalPath: "/plugins/kreativ-broken-image-finder.html",
    cardMeta: "Detect missing media references.",
    cardUse: "Catch missing images across posts and pages before users see them.",
    thumb: "/thumb-kreativ-broken-image-finder-128.svg",
    imageAlt: "Kreativ Broken Image Finder thumbnail",
    title: "Kreativ Broken Image Finder | Kreativ WP",
    metaDescription:
      "Detect missing image references across posts and pages before they impact trust and UX.",
    detailTitle: "Key Features",
    detailItems: [
      {
        title: "Broken media detection",
        body: "Scans content for missing or unreachable image references that harm trust and readability."
      },
      {
        title: "Content-level visibility",
        body: "Highlights affected posts and pages so teams can prioritize high-impact fixes first."
      },
      {
        title: "Maintenance ready",
        body: "Supports recurring quality checks as part of routine WordPress maintenance workflows."
      }
    ],
    ctaTitle: "Get the Plugin",
    ctaLines: ["Last updated: March 28, 2026"],
    ctaHref: "https://wordpress.org/plugins/kreativ-broken-image-finder/",
    ctaLabel: "View on WordPress.org",
    lastUpdated: "March 28, 2026",
    live: true
  },
  {
    slug: "kreativ-internal-links-audit",
    name: "Kreativ Internal Links Audit",
    description: "A full internal linking health audit to improve structure, crawl depth, and discoverability.",
    canonicalPath: "/plugins/kreativ-internal-links-audit.html",
    cardMeta: "Audit internal linking quality across your site.",
    cardUse: "Identify weak, missing, and unbalanced internal links to improve structure and crawlability.",
    thumb: "/thumb-kreativ-internal-links-audit-128.svg",
    imageAlt: "Kreativ Internal Links Audit thumbnail",
    title: "Kreativ Internal Links Audit | Kreativ WP",
    metaDescription: "Audit internal link quality, discover weak link patterns, and improve crawlability.",
    detailTitle: "Planned Features",
    detailItems: [
      {
        title: "Link distribution analysis",
        body: "Identify underlinked pages and excessive concentration around a small subset of URLs."
      },
      {
        title: "Coverage and opportunity signals",
        body: "Surface link gaps where related pages should reference each other for better navigation and crawl paths."
      },
      {
        title: "Actionable prioritization",
        body: "Highlight high-value fixes first so teams can improve structural quality with predictable effort."
      }
    ],
    ctaTitle: "Status",
    ctaLines: [
      "Last updated: March 28, 2026",
      "Current status: In development. Release target: April 2026.",
      "Follow our News page for release updates."
    ],
    lastUpdated: "March 28, 2026",
    live: false,
    homepageStatus: "In development · Release target: April 2026"
  },
  {
    slug: "kreativ-smart-related-posts",
    name: "Kreativ Smart Related Posts",
    description: "Show relevant related content based on context to increase discovery and engagement.",
    canonicalPath: "/plugins/kreativ-smart-related-posts.html",
    cardMeta: "Show context-aware related content.",
    cardUse: "Improve discovery and session depth with smarter internal recommendations.",
    thumb: "/thumb-kreativ-smart-related-posts-128.svg",
    imageAlt: "Kreativ Smart Related Posts thumbnail",
    title: "Kreativ Smart Related Posts | Kreativ WP",
    metaDescription:
      "Context-aware related post recommendations to improve content discovery and session depth.",
    detailTitle: "Planned Features",
    detailItems: [
      {
        title: "Context-aware recommendations",
        body: "Prioritize related posts using content context and topical proximity instead of static tag overlap alone."
      },
      {
        title: "Flexible display controls",
        body: "Configure placement, limit, and presentation style to match different themes and content layouts."
      },
      {
        title: "Engagement-focused defaults",
        body: "Designed to support longer sessions and stronger internal discovery without manual curation overhead."
      }
    ],
    ctaTitle: "Status",
    ctaLines: [
      "Last updated: March 28, 2026",
      "Current status: Prototype in progress. Planned after Internal Links Audit.",
      "Follow our News page for release updates."
    ],
    lastUpdated: "March 28, 2026",
    live: false,
    homepageStatus: "Prototype in progress · Planned after Internal Links Audit"
  }
];

export const newsPosts: NewsPost[] = [
  {
    slug: "april-2026-status-note",
    title: "Early April 2026 Status Note",
    description:
      "A short early April update on Kreativ WP priorities, including plugin submission prep and the next release target.",
    canonicalPath: "/news/april-2026-status-note.html",
    metaDescription:
      "A short early April update on Kreativ WP priorities, including plugin submission prep and the next release target.",
    date: "April 4, 2026",
    tag: "Status Update",
    intro:
      "Work slowed down for a bit, but Internal Links Audit remains the active next release and plugin submission prep is back in focus.",
    sectionTitle: "Quick Update",
    items: [
      {
        title: "Work paused briefly",
        body: "Progress slowed down for a short stretch while attention moved to other work. This is a pause in momentum, not a roadmap reset."
      },
      {
        title: "Submission prep is back in focus",
        body: "The immediate goal now is to review plugin state, prepare WordPress.org submission materials, and get back into a reliable release rhythm."
      },
      {
        title: "Next public target remains unchanged",
        body: "Kreativ Internal Links Audit is still positioned as the next release target, with Smart Related Posts following after that work stabilizes."
      }
    ]
  },
  {
    slug: "march-2026-progress-update",
    title: "Late March 2026 Progress Update",
    description:
      "A late March update on Kreativ Internal Links Audit, Smart Related Posts, and the current Kreativ WP release focus.",
    canonicalPath: "/news/march-2026-progress-update.html",
    metaDescription:
      "A late March update on Kreativ Internal Links Audit, Smart Related Posts, and the current Kreativ WP release focus.",
    date: "March 28, 2026",
    tag: "Product Update",
    intro:
      "Internal Links Audit moved into active development and Smart Related Posts is now positioned as the next follow-up release.",
    sectionTitle: "Current Focus",
    items: [
      {
        title: "Internal Links Audit moved into active development",
        body: "The next release priority is now centered on Kreativ Internal Links Audit. Current work is focused on turning the audit concept into a first practical release with clear signals for weak, missing, and unbalanced internal links."
      },
      {
        title: "Smart Related Posts stays in the near-term pipeline",
        body: "Kreativ Smart Related Posts remains part of the active roadmap, but it is positioned after Internal Links Audit rather than being presented as an immediate parallel launch."
      },
      {
        title: "Homepage and plugin pages updated",
        body: "We refreshed status messaging across the site so upcoming plugins now show clearer progress states instead of a generic coming-soon label."
      }
    ]
  },
  {
    slug: "internal-links-audit-announcement",
    title: "Kreativ Internal Links Audit Announced",
    description: "Kreativ Internal Links Audit is the next planned plugin in the Kreativ WP roadmap.",
    canonicalPath: "/news/internal-links-audit-announcement.html",
    metaDescription:
      "The next Kreativ WP plugin will focus on auditing internal links and site structure quality.",
    date: "March 7, 2026",
    tag: "Product Update",
    intro:
      "Our next plugin focuses on auditing internal link quality, link balance, and crawl structure opportunities.",
    sectionTitle: "What’s New",
    items: [
      {
        title: "Next plugin direction",
        body: "Kreativ Internal Links Audit is now the next planned plugin in our lineup. It replaces the previous concept focused only on orphan pages with a broader internal linking audit approach."
      },
      {
        title: "Planned capabilities",
        body: "The first release is planned to highlight weak and missing internal links, identify linking imbalance across key pages, and surface actionable structure recommendations."
      },
      {
        title: "Status",
        body: "Currently in planning and UX scoping. We will publish implementation and changelog updates in upcoming monthly notes."
      }
    ]
  },
  {
    slug: "navigation-and-news-refresh",
    title: "Navigation and News Refresh Shipped",
    description: "Kreativ WP navigation, footer, and news structure have been refreshed.",
    canonicalPath: "/news/navigation-and-news-refresh.html",
    metaDescription:
      "A website update covering navigation cleanup, footer branding, and a more structured news flow for Kreativ WP.",
    date: "March 5, 2026",
    tag: "Website Update",
    intro:
      "We introduced streamlined navigation, clearer footer branding, and a structured news publishing flow.",
    sectionTitle: "What Changed",
    items: [
      {
        title: "Navigation cleaned up",
        body: "The main header now uses a simpler centered navigation structure with direct access to Home, News, About, and Contact."
      },
      {
        title: "News became a real section",
        body: "Instead of placeholder copy, the site now has a dedicated News page and separate update pages for roadmap and release notes."
      },
      {
        title: "Branding tightened",
        body: "Footer links and supporting brand references were aligned with the wider KREATIV ecosystem for clearer positioning."
      }
    ]
  }
];
