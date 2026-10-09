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

## Newsletter integration

The newsletter form can post directly to any provider-compatible endpoint. Set `PUBLIC_NEWSLETTER_FORM_ACTION` in the build environment to that endpoint; until it is configured, the form retains its email-request fallback. A provider account and its exact subscribe endpoint are required before live email capture can be enabled.

## Measurement and Search Console

Set `PUBLIC_GOOGLE_ANALYTICS_ID` to enable Google Analytics page views and tool-completion events. Set `PUBLIC_GOOGLE_SITE_VERIFICATION` to add the Search Console verification meta tag. Both are optional, so no third-party tracking script is shipped until an ID is configured.

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

## Theme checklist

The homepage links to `/theme-checklist/`, an immediately usable 20-point checklist with print controls and a text download at `/downloads/kreativwp-theme-checklist.txt`. No email is collected for this resource. The newsletter component remains available for a separately configured subscription workflow.

## Homepage selections

Choose the published theme, plugin, and guide IDs in `src/data/site.ts`. The build rejects missing or unpublished selections, so date ties cannot silently choose the homepage features. Theme and plugin profiles can supply a short `homepageSummary`; the homepage shows their recorded checked dates without changing those dates merely because homepage copy changed.

Live products can supply an official `downloadHref` and a `homepageScreenshot` with its source, caption, alt text, and dimensions. The homepage keeps the ZIP download separate from the detail-page link. The current Report Broken Link preview is its official WordPress.org dashboard screenshot; this product collects visitor reports and is not an automatic link scanner.

## Hands-on theme evidence

The first free-theme workflow reviews cover Astra 4.14.0, GeneratePress 3.6.1, Blocksy 2.1.59, and Kadence 1.5.2. Evidence and screenshots live in `public/research/2026-10-09/`. The recorded environment is WordPress 7.1.3, PHP 8.5.3, SQLite Database Integration 3.1.0, and Chromium on a local macOS PHP server. These are functional checks, not production performance benchmarks or full accessibility audits.

To repeat the workflow, prepare a fresh isolated WordPress installation with the SQLite integration drop-in, install the four free themes, and run `scripts/theme-review-fixture.php` through WP-CLI's `eval-file` command. The fixture uses the standard fresh-install IDs: page 4, journal page 5, and menu 2. Serve that installation on a loopback URL, then run:

```sh
THEME_LAB_PASSWORD='<local-test-password>' node scripts/review-theme-workflows.mjs /path/to/isolated-wordpress /path/to/wp-cli.phar http://127.0.0.1:5502
```

The default local reviewer username is `theme_reviewer`; override it with `THEME_LAB_USERNAME`. This script changes the isolated site's active theme, menu assignments, site title, and sample page; do not point it at an existing site. It saves generated evidence under a dated `public/research/` directory. Review the evidence before updating editorial copy or marking a profile `hands-on`; that status requires the test scope, versions, checks, limitations, and evidence link in the content schema.
