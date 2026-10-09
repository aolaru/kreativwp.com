const { test, expect } = require("@playwright/test");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { themeFilters, pluginFilters } = require("../src/data/library");
const { recommendThemes, recommendPlugins } = require("../src/data/recommendations");
const manifest = require("../public/media/previews.json");
const entries = (directory) => fs.readdirSync(directory).map((file) => ({ id: file.replace(/\.json$/, ""), ...JSON.parse(fs.readFileSync(path.join(directory, file), "utf8")) })).filter((entry) => !entry.isPlaceholder);
const themes = entries("src/content/theme-reviews");
const plugins = entries("src/content/plugin-reviews");
const catalog = {
  themes: themes.map((entry) => ({ id: entry.id, name: entry.themeName, href: `/themes/${entry.id}/`, tags: themeFilters[entry.id], free: entry.freeVersion === "Available", rank: 99 })),
  plugins: plugins.map((entry) => ({ id: entry.id, name: entry.pluginName, href: `/plugins/reviews/${entry.id}/`, tags: pluginFilters[entry.id], free: entry.freeVersion === "Available", rank: 99 }))
};

test("every theme recommendation matches the library workflow, store, and free constraints", () => {
  for (const site of ["content", "store"]) for (const editor of ["blocks", "visual"]) for (const priority of ["lean", "design"]) for (const budget of ["free", "premium"]) {
    const result = recommendThemes(catalog, { site, editor, priority, budget });
    expect(result.length).toBeGreaterThan(0);
    for (const entry of result) {
      expect(entry.tags).toContain(editor === "visual" ? "page-builder" : "block-editor");
      if (site === "store") expect(entry.tags).toContain("ecommerce");
      if (budget === "free") expect(entry.free).toBe(true);
    }
  }
});

test("plugin rules avoid unknown-host purchases, paid-only free results, and existing duplicates", () => {
  for (const hosting of ["unknown", "managed"]) expect(recommendPlugins(catalog, { jobs: ["performance"], budget: "premium", hosting }).recommendations).toEqual([]);
  expect(recommendPlugins(catalog, { jobs: ["performance"], budget: "premium", hosting: "other", existing: ["cache"] }).recommendations).toEqual([]);
  for (const hosting of ["litespeed", "other"]) for (const budget of ["free", "premium"]) {
    const result = recommendPlugins(catalog, { jobs: ["performance"], budget, hosting }).recommendations;
    expect(result).toHaveLength(1);
    if (budget === "free") expect(result[0].free).toBe(true);
  }
  const covered = recommendPlugins(catalog, { jobs: ["security", "forms", "analytics"], existing: ["security", "backups", "forms", "analytics"], budget: "free" });
  expect(covered.recommendations).toEqual([]);
  expect(recommendPlugins(catalog, { jobs: [] }).recommendations).toEqual([]);
});

test("all primary actions meet text contrast in light, dark, and hover states", async ({ page }) => {
  for (const route of ["/", "/theme-checklist/", "/tools/theme-finder/", "/plugins/kreativ-report-broken-link/"]) {
    await page.goto(route);
    for (const mode of ["light", "dark"]) {
      await page.locator("html").evaluate((root, value) => root.dataset.theme = value, mode);
      for (const button of await page.locator(".button-like--primary").all()) {
        for (const hover of [false, true]) {
          if (hover) await button.hover(); else await page.mouse.move(0, 0);
          await page.waitForFunction(() => document.getAnimations().every((animation) => animation.playState !== "running"));
          const ratio = await button.evaluate((element) => {
            const lum = (color) => color.match(/[\d.]+/g).slice(0, 3).map(Number).map((value) => { const v = value / 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }).reduce((sum, value, i) => sum + value * [.2126, .7152, .0722][i], 0);
            const s = getComputedStyle(element), levels = [lum(s.color), lum(s.backgroundColor)].sort((a, b) => b - a);
            return (levels[0] + .05) / (levels[1] + .05);
          });
          expect(ratio, `${route} ${mode} hover=${hover}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  }
});

test("mobile navigation has comfortable targets and live products offer installation in the first screen", async ({ page }) => {
  for (const width of [320, 375, 768]) {
    await page.setViewportSize({ width, height: 812 }); await page.goto("/");
    for (const control of await page.locator(".top-menu .menu-link, .top-menu button").all()) expect((await control.boundingBox()).height).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 375, height: 812 });
  for (const id of ["kreativ-report-broken-link", "kreativ-broken-image-finder"]) {
    await page.goto(`/plugins/${id}/`);
    const install = page.locator(".product-install .button-like");
    expect((await install.boundingBox()).y).toBeLessThan(700);
    await expect(page.locator("#quick-start")).toBeVisible();
    await expect(page.locator(".product-facts")).toContainText("Version");
    await expect(page.locator(".product-gallery img").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Ask Andrei for support" })).toHaveAttribute("href", "/contact/");
  }
});

test("all six comparisons have sourced rows, linked profiles, and migration advice", async ({ page }) => {
  for (const entry of entries("src/content/comparisons")) {
    await page.goto(`/comparisons/${entry.id}/`);
    await expect(page.locator(".comparison-table tbody tr")).toHaveCount(entry.rows.length);
    await expect(page.locator(".comparison-table thead a")).toHaveCount(2);
    await expect(page.getByRole("heading", { name: "Before switching" })).toBeVisible();
    for (const source of entry.sources) await expect(page.locator(`#source-${source.id}`)).toBeVisible();
  }
});

test("previews are responsive local images and the large homepage GIF is no longer requested", async ({ page }) => {
  const requests = []; page.on("request", (request) => requests.push(request.url()));
  await page.goto("/");
  const preview = page.locator(".homepage-feature--plugin img");
  await preview.scrollIntoViewIfNeeded();
  await expect(preview).toHaveAttribute("srcset", /320w/);
  await expect(preview).toHaveAttribute("src", /^\/media\/previews\/.*\.webp$/);
  expect(requests.some((url) => /fluentform.*\.gif/.test(url))).toBe(false);
  expect(requests.some((url) => url.includes("font-awesome"))).toBe(false);
  const ff = manifest[plugins.find((entry) => entry.id === "fluent-forms").thumbnail];
  expect(ff.variants.find((variant) => variant.width === 640).bytes).toBeLessThan(ff.originalBytes / 10);
});

test("the honest manual email flow and trust links are present without a configured provider", async ({ page }) => {
  await page.goto("/news/");
  await expect(page.locator("#updates-help")).toContainText("opens your email app");
  await expect(page.locator("#updates-form")).not.toHaveAttribute("action", /https:/);
  await expect(page.locator("#updates-email")).toHaveAttribute("aria-describedby", "updates-help");
  await expect(page.locator("#updates-form button")).toHaveText("Open email request");
  await expect(page.locator(".footer-trust a")).toHaveCount(5);
  await page.goto("/about/"); await expect(page.getByRole("heading", { level: 1 })).toContainText("Andrei");
  await page.goto("/privacy/"); await expect(page.locator("main")).toContainText("not enabled");
});

test("meaningful actions dispatch bounded events without collecting email or search text", async ({ page }) => {
  await page.addInitScript(() => {
    window.auditEvents = [];
    window.addEventListener("kreativwp:track", (event) => window.auditEvents.push(event.detail));
    document.addEventListener("click", (event) => { if (event.target.closest?.('[data-track="product_download"]')) event.preventDefault(); }, true);
  });
  await page.goto("/"); await page.locator('[data-track="product_download"]').first().click();
  expect(await page.evaluate(() => auditEvents)).toContainEqual({ name: "product_download", params: { product: "kreativ-report-broken-link" } });
  await page.goto("/tools/theme-finder/"); await page.getByRole("button", { name: "Build my theme shortlist" }).click();
  const events = await page.evaluate(() => auditEvents);
  expect(events.some((event) => event.name === "tool_completed")).toBe(true);
  expect(JSON.stringify(events)).not.toMatch(/email|https?:|@/);
});

test("link validation catches fragments, missing responsive variants, and same-site absolute links", async () => {
  const { checkInternalLinks } = await import("../scripts/check-internal-links.mjs");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kreativwp-link-test-"));
  fs.writeFileSync(path.join(dir, "index.html"), '<a href="#present">OK</a><div id="present"></div><a href="#missing">Bad fragment</a><a href="https://kreativwp.com/missing/">Bad route</a><img src="exists.svg" srcset="missing.webp 320w" alt="Fixture">');
  fs.writeFileSync(path.join(dir, "exists.svg"), '<svg xmlns="http://www.w3.org/2000/svg"/>');
  const result = checkInternalLinks(dir);
  expect(result.problems.map((problem) => problem.reason)).toEqual(["Missing fragment #missing", "Missing file", "Missing file"]);
});

test("published plugin checks have real versions, recorded outcomes, and readable evidence", async ({ page }) => {
  const report = require('../public/research/2026-10-09/plugins/plugin-workflows.json');
  expect(report.plugins).toHaveLength(5);
  expect(report.plugins.find((entry) => entry.slug === 'fluentform').savedEntryCount).toBe(1);
  expect(report.plugins.find((entry) => entry.slug === 'updraftplus').archiveReadbackVerified).toBe(true);
  expect(report.plugins.find((entry) => entry.slug === 'google-site-kit').authorizationAttempted).toBe(false);
  expect(report.plugins.find((entry) => entry.slug === 'kreativ-report-broken-link').csvVerified).toBe(true);
  expect(report.plugins.find((entry) => entry.slug === 'kreativ-broken-image-finder').scanStats.broken_images).toBeGreaterThan(0);
  for (const id of ['fluent-forms', 'updraftplus', 'site-kit']) {
    const profile = plugins.find((entry) => entry.id === id);
    expect(profile.researchMethod).toBe('hands-on');
    expect(profile.handsOnTest.pluginVersion).toMatch(/^\d+\.\d+/);
    await page.goto(`/plugins/reviews/${id}/`);
    await expect(page.locator('.hands-on-review')).toContainText('Limits of this check');
    await expect(page.locator('.editorial-byline')).toContainText('Andrei Olaru');
    for (const shot of profile.handsOnTest.screenshots) {
      const response = await page.request.get(shot.src);
      expect(response.ok()).toBe(true);
      expect(response.headers()['content-type']).toContain('image/png');
    }
  }
});

test("product evidence remains separate from vendor release metadata", async ({ page }) => {
  await page.goto('/plugins/kreativ-broken-image-finder/');
  await expect(page.locator('.product-facts')).toContainText('1.2.0');
  await expect(page.locator('.product-facts')).toContainText('2026-02-20');
  await expect(page.locator('.product-gallery img')).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Read the local workflow checks and limitations' })).toHaveAttribute('href', '/research/2026-10-09/plugins/plugin-workflows.json');
});
