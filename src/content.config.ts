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
    lastUpdated: z.string(),
    lastUpdatedIso: z.string(),
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

export const collections = { plugins, news };
