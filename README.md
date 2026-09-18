# kreativwp.com

Official Astro website for [kreativwp.com](https://kreativwp.com).

## Overview

This repository contains the Astro source for KreativWP, including:

- editorial theme, plugin, comparison, guide, and tool content
- KreativWP product pages, news, and legacy plugin detail routes
- SEO metadata and structured data
- favicon and branding assets
- responsive styles

## Files

- `src/pages/` - Astro routes
- `src/data/site.ts` - shared content for plugins and news
- `src/data/affiliate.ts` - centrally managed affiliate destinations
- `src/content/` - JSON collections for editorial and product content
- `src/components/` - reusable cards, disclosures, breadcrumbs, and newsletter UI
- `src/layouts/BaseLayout.astro` - shared page shell
- `public/style.css` - site styling
- `public/favicon.svg` - site favicon
- `CNAME` - custom domain for GitHub Pages

## Deployment

Builds as a static Astro site for deployment on any static host.

## Local Development

- Install deps: `npm install`
- Start dev server: `npm run dev`
- Build static output: `npm run build`
- Preview production output: `npm run preview`

## Workspace Reliability

- Do not use a Dropbox-synced folder as the primary live working tree for this repo.
- Git index operations and Astro builds can time out in synced folders.
- Preferred workflow: keep the active clone in a normal local path and let Dropbox sync only backups or exports if needed.

## Workspace Reliability

- Do not use a Dropbox-synced folder as the primary live working tree for this repo.
- Git index operations and Astro builds can time out in synced folders.
- Preferred workflow: keep the active clone in a normal local path, then let Dropbox sync backups or a secondary copy if needed.

## Visual Regression Checks

- Run screenshots: `npm run test:visual`
- Outputs are saved to `tests/home-dark.png` and `tests/home-light.png`.

## Quality Checks

- Run built HTML validation: `npm run lint:html`
- Run built internal link checks: `npm run lint:links`
- Run all checks (HTML, links, visual tests): `npm run check`

## Editorial Content

Editorial seed entries are deliberately marked `isPlaceholder: true`. Their detail pages remain `noindex` until hands-on testing replaces the preview copy with substantiated editorial material. Existing product routes under `/plugins/<slug>/` remain the canonical product URLs; `/products/` is the dedicated product archive.
