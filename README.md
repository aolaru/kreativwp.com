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

Without a provider, the updates form explicitly opens an email request. Visitors must send that message; the website does not claim they have subscribed. No email is stored by the website.

For automatic subscription, set `PUBLIC_NEWSLETTER_FORM_ACTION` to a verified HTTPS endpoint that accepts a standard POST with an `email` field. Providers requiring tokens, different fields, or server-side calls need an adapter first. Verify its confirmation, unsubscribe, consent, and privacy flow before enabling it, and name the service in `/privacy/`. A submitted request event is not proof of a confirmed subscription.

## Measurement and Search Console

The existing Cloudflare Web Analytics beacon remains enabled. Set `PUBLIC_GOOGLE_ANALYTICS_ID` to enable optional Google Analytics page views and bounded interaction events: product download clicks, profile opens, finder completion, checklist actions, and updates requests. Custom event parameters do not contain email addresses, search text, or full destination URLs. Download clicks are not verified installs. No GA account receives these events when its ID is absent. Evaluate consent requirements before enabling GA. Set `PUBLIC_GOOGLE_SITE_VERIFICATION` for the optional Search Console verification meta tag.

## Workspace Reliability

- Do not use a Dropbox-synced folder as the primary live working tree for this repo.
- Git index operations and Astro builds can time out in synced folders.
- Preferred workflow: keep the active clone in a normal local path and let Dropbox sync only backups or exports if needed.

## Visual Regression Checks

- Run screenshots: `npm run test:visual`
- Outputs are saved to `tests/home-dark.png` and `tests/home-light.png`.

## Quality Checks

- Run built HTML validation: `npm run lint:html`
- Run built internal link checks: `npm run lint:links`
- Internal checks include fragments, same-site absolute links, image sources, and responsive `srcset` files.
- Run network diagnostics separately: `npm run check:external`. Blocked responses are reported as indeterminate, not healthy. Use `--strict` to fail on blocked checks as well. PR/manual workflow: `.github/workflows/external-links.yml`.
- Run all checks (HTML, links, visual tests): `npm run check`

## Editorial Content

Unpublished editorial seeds use `isPlaceholder: true` and `noindex`. Published documented research is explicitly distinguished from scoped hands-on work; publication does not imply the product was tested. Existing product routes under `/plugins/<slug>/` remain canonical; `/products/` is the product archive.

## Theme checklist

The homepage links to `/theme-checklist/`, an immediately usable 20-point checklist with print controls and a text download at `/downloads/kreativwp-theme-checklist.txt`. No email is collected for this resource. The newsletter component remains available for a separately configured subscription workflow.

## Homepage selections

Choose the published theme, plugin, and guide IDs in `src/data/site.ts`. The build rejects missing or unpublished selections, so date ties cannot silently choose the homepage features. Theme and plugin profiles can supply a short `homepageSummary`; the homepage shows their recorded checked dates without changing those dates merely because homepage copy changed.

Live products can supply an official `downloadHref` and a `homepageScreenshot` with its source, caption, alt text, and dimensions. The homepage keeps the ZIP download separate from the detail-page link. The current Report Broken Link preview is its official WordPress.org dashboard screenshot; this product collects visitor reports and is not an automatic link scanner.

## Library discovery

The theme and plugin libraries share name search, name/recent/editorial sorting, URL-backed filters, and eight-card progressive loading. The full catalog remains in the HTML and is readable without JavaScript. URLs use `q`, `filters` (comma-separated values), and `sort` (`name`, `recent`, or `editorial`); loading more cards is local to the current view and resets when search, filters, or sorting change.

Classification, filter groups, and explicit ordered editorial picks live in `src/data/library.ts`. Options in a “match any” group are alternatives; separate groups must all match. Theme “Requirements” is a “match all” group. Cards use a short excerpt from the existing profile’s `bestFor` text, or product `cardUse`, and do not enlarge the first alphabetical entry. Editorial selection is distinct from the profile’s research method and does not imply a default-install stack.

Theme, plugin, and stack finders share the normalized catalog and pure rules in `src/data/recommendations.ts`. Free budgets exclude paid-only tools; unknown/managed hosting does not trigger a cache purchase; existing capabilities are skipped. A stack contains plugins only for explicitly selected jobs. These are research shortlists, not compatibility guarantees.

## Optimized previews

Run `npm run assets:previews` after adding catalog screenshots. It caches published HTTPS previews as local 320/640/1000px WebP variants where the source permits, and records provenance, dimensions, and byte counts in `public/media/previews.json`. `--refresh` replaces cached variants from their sources. Cards retain attribution and full-size source links. The shared preview component supplies responsive sizes and a graceful card fallback. Never manufacture a vendor screenshot.

## Hands-on plugin evidence

Scoped free-edition checks for Fluent Forms, UpdraftPlus, and Site Kit, plus both KreativWP products, are recorded in `public/research/2026-10-09/plugins/plugin-workflows.json`. Fluent Forms covers creation, embedding, submission, and dashboard retrieval. UpdraftPlus covers a local uploads archive and byte readback, **not** a full restore. Site Kit covers activation and its local/staging setup boundary, **not** connected Google reporting. Each page displays versions, limitations, and real screenshots.

To repeat, create a fresh throwaway WordPress/SQLite installation inside a directory named `kreativwp-plugin-lab.<unique-suffix>`, install the five plugins, set WP_HOME/WP_SITEURL to its loopback server, disable WP cron, and install a lab-only MU-plugin containing `add_filter('pre_wp_mail', '__return_false');`. Never use production data or accounts. Serve it on port 5503 and this site's production preview on 5501, then run:

```sh
node scripts/review-plugin-workflows.mjs /private/tmp/kreativwp-plugin-lab.<unique-suffix>/wordpress /path/to/wp-cli.phar http://127.0.0.1:5503
```

The recorder creates a temporary reviewer account, fixture content/forms, an uploads backup, reports, and scan results in that lab. It does not authorize Google, send email, restore a site, or mutate this site's production WordPress installation. Review generated evidence before publishing it. Set `PLUGIN_LAB_PLUGINS` to a comma-separated subset to repeat individual checks.

## Hands-on theme evidence

The first free-theme workflow reviews cover Astra 4.14.0, GeneratePress 3.6.1, Blocksy 2.1.59, and Kadence 1.5.2. Evidence and screenshots live in `public/research/2026-10-09/`. The recorded environment is WordPress 7.1.3, PHP 8.5.3, SQLite Database Integration 3.1.0, and Chromium on a local macOS PHP server. These are functional checks, not production performance benchmarks or full accessibility audits.

To repeat the workflow, prepare a fresh isolated WordPress installation with the SQLite integration drop-in, install the four free themes, and run `scripts/theme-review-fixture.php` through WP-CLI's `eval-file` command. The fixture uses the standard fresh-install IDs: page 4, journal page 5, and menu 2. Serve that installation on a loopback URL, then run:

```sh
THEME_LAB_PASSWORD='<local-test-password>' node scripts/review-theme-workflows.mjs /path/to/isolated-wordpress /path/to/wp-cli.phar http://127.0.0.1:5502
```

The default local reviewer username is `theme_reviewer`; override it with `THEME_LAB_USERNAME`. This script changes the isolated site's active theme, menu assignments, site title, and sample page; do not point it at an existing site. It saves generated evidence under a dated `public/research/` directory. Review the evidence before updating editorial copy or marking a profile `hands-on`; that status requires the test scope, versions, checks, limitations, and evidence link in the content schema.
