const { test, expect } = require("@playwright/test");

test("homepage navigation and theme toggle work", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/KreativWP/i);
  await expect(page.locator('nav.top-menu')).toBeVisible();
  await expect(page.locator('a.skip-link')).toHaveAttribute("href", "#main-content");
  const nav = page.locator("nav.top-menu");
  await expect(nav.getByRole("link", { name: "Themes" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Plugins" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Comparisons" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Guides" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Tools" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Products" })).toBeVisible();

  await page.screenshot({ path: "tests/home-dark.png", fullPage: true });

  const root = page.locator("html");
  await expect(root).toHaveAttribute("data-theme", /dark|light/);

  const beforeTheme = await root.getAttribute("data-theme");
  await page.click("#theme-toggle");
  const afterTheme = await root.getAttribute("data-theme");
  expect(afterTheme).not.toBe(beforeTheme);
  await page.screenshot({ path: "tests/home-light.png", fullPage: true });
});

test("news page exposes article links and signup form", async ({ page }) => {
  await page.goto("/news/");
  await expect(page).toHaveTitle(/News \| Kreativ WP/i);
  await expect(page.getByRole("link", { name: /Internal Links Audit announced/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Navigation and News refresh shipped/i })).toBeVisible();
  await expect(page.locator("#updates-form")).toBeVisible();
  await expect(page.locator("#updates-email")).toBeVisible();
});

test("plugin detail pages are reachable", async ({ page }) => {
  const pages = [
    { url: "/plugins/kreativ-report-broken-link/", title: /Kreativ Report Broken Link/i },
    { url: "/plugins/kreativ-broken-image-finder/", title: /Kreativ Broken Image Finder/i },
    { url: "/plugins/kreativ-internal-links-audit/", title: /Kreativ Internal Links Audit/i },
    { url: "/plugins/kreativ-smart-related-posts/", title: /Kreativ Smart Related Posts/i }
  ];

  for (const entry of pages) {
    await page.goto(entry.url);
    await expect(page).toHaveTitle(entry.title);
    await expect(page.locator("main#main-content")).toBeVisible();
  }
});

test("editorial archives and search are reachable", async ({ page }) => {
  for (const entry of [
    { url: "/themes/", title: /WordPress Theme Reviews/i },
    { url: "/plugins/", title: /WordPress Plugin Reviews/i },
    { url: "/comparisons/", title: /WordPress Comparisons/i },
    { url: "/guides/", title: /WordPress Guides/i },
    { url: "/tools/", title: /Free WordPress Tools/i },
    { url: "/products/", title: /KreativWP Products/i },
    { url: "/methodology/", title: /Editorial Methodology/i },
    { url: "/guides/testing-methodology/", title: /How KreativWP Tests/i },
    { url: "/search/?q=theme", title: /Search KreativWP/i }
  ]) {
    await page.goto(entry.url);
    await expect(page).toHaveTitle(entry.title);
    await expect(page.locator("main#main-content")).toBeVisible();
  }
});

test("theme and plugin libraries use the visual discovery cards", async ({ page }) => {
  await page.goto("/themes/");
  await expect(page.locator(".theme-card")).toHaveCount(15);
  await expect(page.locator(".theme-card img")).toHaveCount(15);
  await expect(page.locator('.theme-card img[alt*="WordPress.org listing"]')).toHaveCount(14);

  await page.goto("/themes/astra/");
  await expect(page.locator(".source-links")).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index,follow");

  await page.goto("/plugins/");
  await expect(page.locator(".plugin-card")).toHaveCount(15);
  await expect(page.locator(".plugin-thumbnail--product img")).toHaveCount(2);
});

test("homepage remains usable on a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(page.locator("nav.top-menu")).toBeVisible();
  await expect(page.locator(".feature-desk")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
