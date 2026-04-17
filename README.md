# kreativwp.com

Official Astro website for [kreativwp.com](https://kreativwp.com).

## Overview

This repository contains the Astro source for Kreativ WP, including:

- plugin showcase content
- news and plugin detail routes
- SEO metadata and structured data
- favicon and branding assets
- responsive styles

## Files

- `src/pages/` - Astro routes
- `src/data/site.ts` - shared content for plugins and news
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

## Visual Regression Checks

- Run screenshots: `npm run test:visual`
- Outputs are saved to `tests/home-dark.png` and `tests/home-light.png`.

## Quality Checks

- Run built HTML validation: `npm run lint:html`
- Run built internal link checks: `npm run lint:links`
- Run all checks (HTML, links, visual tests): `npm run check`
