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
  await expect(page.locator(".theme-card")).toHaveCount(30);
  await expect(page.locator(".theme-card img")).toHaveCount(30);
  await expect(page.locator('.theme-card img[alt*="WordPress.org listing"]')).toHaveCount(29);

  await page.getByRole("button", { name: "Page builder" }).click();
  await expect(page.locator(".theme-card:visible")).toHaveCount(16);

  await page.goto("/themes/astra/");
  await expect(page.locator(".source-links")).toBeVisible();
  await expect(page.locator(".verdict-panel")).toBeVisible();
  await expect(page.locator(".verdict-panel")).toContainText("last checked");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index,follow");

  await page.goto("/plugins/");
  await expect(page.locator(".plugin-card")).toHaveCount(32);
  await expect(page.locator(".plugin-thumbnail--product img")).toHaveCount(2);

  await page.getByRole("button", { name: "Security" }).click();
  await expect(page.locator(".plugin-card:visible")).toHaveCount(4);

  await page.getByRole("button", { name: "All plugins" }).click();
  await page.getByRole("button", { name: "Ecommerce" }).click();
  await expect(page.locator(".plugin-card:visible")).toHaveCount(3);
});

test("homepage is the interactive theme library", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".theme-card")).toHaveCount(30);
  await expect(page.locator("#theme-finder-form")).toBeVisible();
  await expect(page.locator("#theme-shortlist-form")).toBeVisible();
  await page.getByRole("button", { name: "WooCommerce" }).click();
  await expect(page.locator(".theme-card:visible")).toHaveCount(11);
  await page.getByRole("button", { name: "Free" }).click();
  await expect(page.locator(".theme-card:visible")).toHaveCount(10);
});

test("published theme comparisons include a workflow decision guide", async ({ page }) => {
  for (const url of [
    "/comparisons/astra-vs-divi/",
    "/comparisons/astra-vs-generatepress/",
    "/comparisons/blocksy-vs-kadence/",
    "/comparisons/generatepress-vs-kadence/"
  ]) {
    await page.goto(url);
    await expect(page.locator(".comparison-decision")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Choose for the workflow." })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index,follow");
  }
});

test("stack finder returns a constrained theme and plugin shortlist", async ({ page }) => {
  await page.goto("/tools/stack-finder/");
  await page.getByLabel("An online store").check();
  await page.getByLabel("A visual page builder").check();
  await page.getByLabel("LiteSpeed or QUIC.cloud").check();
  await page.getByLabel("Contact or lead-capture forms").check();
  await page.getByRole("button", { name: "Build my starting stack" }).click();
  const result = page.locator("#stack-finder-result");
  await expect(result).toBeVisible();
  await expect(result).toContainText("LiteSpeed Cache");
  await expect(result).toContainText("WooCommerce");
  await expect(result).toContainText("Fluent Forms");
});

test("theme finder returns a workflow-specific shortlist", async ({ page }) => {
  await page.goto("/tools/theme-finder/");
  await page.getByLabel("An online store").check();
  await page.getByLabel("A visual page builder").check();
  await page.getByRole("button", { name: "Build my theme shortlist" }).click();
  const result = page.locator("#theme-finder-result");
  await expect(result).toBeVisible();
  await expect(result).toContainText("Astra");
  await expect(result).toContainText("Blocksy");
  await expect(result).toContainText("Neve");
});

test("plugin finder returns a requirement-specific shortlist", async ({ page }) => {
  await page.goto("/tools/plugin-finder/");
  await page.getByLabel("Security and recovery").check();
  await page.getByRole("button", { name: "Build my plugin shortlist" }).click();
  const result = page.locator("#plugin-finder-result");
  await expect(result).toBeVisible();
  await expect(result).toContainText("Wordfence");
  await expect(result).toContainText("UpdraftPlus");
});

test("flagship lightweight theme guide is published and linked to the finder", async ({ page }) => {
  await page.goto("/guides/best-lightweight-wordpress-themes/");
  await expect(page).toHaveTitle(/Best Lightweight WordPress Themes/i);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index,follow");
  await expect(page.getByRole("link", { name: "Use the WordPress Theme Finder" })).toHaveAttribute("href", "/tools/theme-finder/");
});

test("performance and broken-image guides are published", async ({ page }) => {
  for (const entry of [
    { url: "/guides/speed-up-wordpress/", title: /How to Speed Up WordPress/i },
    { url: "/guides/find-broken-images/", title: /How to Find Broken Images/i }
  ]) {
    await page.goto(entry.url);
    await expect(page).toHaveTitle(entry.title);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index,follow");
  }
});

test("homepage remains usable on a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(page.locator("nav.top-menu")).toBeVisible();
  await expect(page.locator(".theme-archive")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
