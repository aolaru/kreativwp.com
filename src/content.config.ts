import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const plugins = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/plugins" }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    cardMeta: z.string(),
    cardUse: z.string(),
    thumb: z.string(),
    imageAlt: z.string(),
    metaDescription: z.string(),
    detailTitle: z.string(),
    detailItems: z.array(
      z.object({
        title: z.string(),
        body: z.string()
      })
    ),
    ctaTitle: z.string(),
    ctaLines: z.array(z.string()),
    ctaHref: z.string().optional(),
    ctaLabel: z.string().optional(),
    downloadHref: z.string().url().optional(),
    homepageScreenshot: z.object({
      src: z.string(),
      alt: z.string(),
      caption: z.string(),
      width: z.number().positive(),
      height: z.number().positive()
    }).optional(),
    release: z.object({ version: z.string(), updated: z.string(), wordpress: z.string(), php: z.string(), tested: z.string(), checked: z.string(), source: z.string().url() }).optional(),
    quickStart: z.array(z.string()).optional(),
    screenshots: z.array(z.object({ src: z.string(), alt: z.string(), label: z.string(), width: z.number(), height: z.number() })).optional(),
    supportingLinks: z
      .array(
        z.object({
          label: z.string(),
          href: z.string()
        })
      )
      .optional(),
    lastUpdated: z.string(),
    lastUpdatedIso: z.string(),
    additionalSections: z
      .array(
        z.object({
          title: z.string(),
          items: z.array(
            z.object({
              title: z.string(),
              body: z.string()
            })
          )
        })
      )
      .optional(),
    changelogTitle: z.string().optional(),
    changelog: z
      .array(
        z.object({
          date: z.string(),
          label: z.string(),
          body: z.string()
        })
      )
      .optional(),
    live: z.boolean(),
    homepageStatus: z.string().optional(),
    statusPhase: z.enum(["live", "in-development", "prototype"]),
    sortOrder: z.number()
  })
});

const news = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/news" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    metaDescription: z.string(),
    published: z.string(),
    publishedLabel: z.string(),
    tag: z.string(),
    kind: z.enum(["release", "process", "status", "website"]),
    featured: z.boolean().optional(),
    ctaLabel: z.string().optional(),
    ctaHref: z.string().optional(),
    intro: z.string(),
    sectionTitle: z.string(),
    items: z.array(
      z.object({
        title: z.string(),
        body: z.string()
      })
    )
  })
});

const editorialBase = z.object({
  title: z.string(),
  description: z.string(),
  homepageSummary: z.string().max(160).optional(),
  metaDescription: z.string(),
  category: z.string(),
  updated: z.string(),
  updatedLabel: z.string(),
  featured: z.boolean().optional(),
  isPlaceholder: z.boolean().default(true),
  thumbnail: z.string().optional(),
  thumbnailAlt: z.string().optional()
});

const handsOnTest = z.object({
  date: z.string(), pluginVersion: z.string(), wordpressVersion: z.string(), phpVersion: z.string(),
  environment: z.string(), checks: z.array(z.object({ title: z.string(), detail: z.string() })).min(1),
  limitations: z.array(z.string()).min(1),
  screenshots: z.array(z.object({ src: z.string(), alt: z.string(), label: z.string(), width: z.number(), height: z.number() })).min(1),
  evidenceHref: z.string()
});

const themeReviews = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/theme-reviews" }),
  schema: editorialBase.extend({
    themeName: z.string(),
    developer: z.string(),
    previewStyle: z.string(),
    freeVersion: z.string(),
    price: z.string(),
    highlights: z.array(z.string()),
    bestFor: z.string(),
    researchMethod: z.enum(["documented-research", "hands-on"]),
    researchScope: z.string(),
    caveats: z.string(),
    sources: z.array(z.object({ label: z.string(), href: z.string().url() })).min(1),
    officialUrl: z.string().url().optional(),
    affiliateId: z.string().optional(),
    handsOnTest: z.object({
      date: z.string(),
      themeVersion: z.string(),
      wordpressVersion: z.string(),
      phpVersion: z.string(),
      environment: z.string(),
      checks: z.array(z.object({ title: z.string(), detail: z.string() })).min(1),
      limitations: z.array(z.string()).min(1),
      screenshots: z.array(z.object({ src: z.string(), alt: z.string(), label: z.string(), width: z.number(), height: z.number() })),
      evidenceHref: z.string()
    }).optional()
  }).superRefine((entry, context) => {
    if (entry.researchMethod === "hands-on" && !entry.handsOnTest) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["handsOnTest"], message: "Hands-on reviews must include their test evidence and scope." });
    }
  })
});

const pluginReviews = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/plugin-reviews" }),
  schema: editorialBase.extend({
    pluginName: z.string(),
    developer: z.string(),
    pricing: z.string(),
    freeVersion: z.string(),
    highlights: z.array(z.string()),
    bestFor: z.string(),
    previewStyle: z.string(),
    recommendationType: z.enum(["core", "conditional", "research"]).default("research"),
    researchMethod: z.enum(["documented-research", "hands-on"]).optional(),
    researchScope: z.string().optional(),
    caveats: z.string().optional(),
    sources: z.array(z.object({ label: z.string(), href: z.string().url() })).optional(),
    officialUrl: z.string().url().optional(),
    affiliateId: z.string().optional(),
    handsOnTest: handsOnTest.optional()
  }).superRefine((entry, context) => {
    if (entry.researchMethod === "hands-on" && !entry.handsOnTest) context.addIssue({ code: z.ZodIssueCode.custom, path: ["handsOnTest"], message: "Hands-on plugin reviews require recorded evidence and limitations." });
  })
});

const comparisons = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/comparisons" }),
  schema: editorialBase.extend({
    leftName: z.string(),
    rightName: z.string(),
    comparisonAreas: z.array(z.string()),
    takeaway: z.string(),
    leftHref: z.string(),
    rightHref: z.string(),
    rows: z.array(z.object({ label: z.string(), left: z.string(), right: z.string(), sourceIds: z.array(z.string()).min(1) })).min(4),
    sources: z.array(z.object({ id: z.string(), label: z.string(), href: z.string().url() })).min(2),
    migration: z.string(),
    decisionGuide: z
      .object({
        chooseLeft: z.string(),
        chooseRight: z.string(),
        verify: z.string()
      })
      .optional()
  }).superRefine((entry, context) => {
    const ids = new Set(entry.sources.map((source) => source.id));
    for (const [index, row] of entry.rows.entries()) if (row.sourceIds.some((id) => !ids.has(id))) context.addIssue({ code: z.ZodIssueCode.custom, path: ["rows", index, "sourceIds"], message: "Every comparison row must reference a declared official source." });
  })
});

const guides = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/guides" }),
  schema: editorialBase.extend({
    intro: z.string(),
    sections: z.array(z.object({ title: z.string(), body: z.string() })),
    relatedLinks: z.array(z.object({ label: z.string(), href: z.string() })).optional()
  })
});

const tools = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/tools" }),
  schema: editorialBase.extend({
    availability: z.enum(["planned", "in-progress", "available"]),
    purpose: z.string()
  })
});

export const collections = { plugins, news, themeReviews, pluginReviews, comparisons, guides, tools };
