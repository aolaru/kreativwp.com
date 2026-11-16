const { test, expect } = require("@playwright/test");
const fs = require("node:fs");

const products = ["kreativ-report-broken-link", "kreativ-broken-image-finder"].map((id) => ({ id, ...JSON.parse(fs.readFileSync(`src/content/plugins/${id}.json`, "utf8")) }));

test("the personal homepage introduces Kreativ Core and both live plugins", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".hero .tagline")).toContainText("Hi, I’m Andrei.");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("WordPress, with care.");
  await expect(page.locator(".home-core")).toContainText("Kreativ Core");
  await expect(page.locator(".home-core img")).toHaveAttribute("alt", /artwork/i);
  await expect(page.locator(".home-core a").first()).toHaveAttribute("href", "/products/kreativ-core/");
  for (const product of products) {
    const card = page.locator(".home-product").filter({ has: page.getByRole("heading", { name: product.name, exact: true }) });
    await expect(card.locator("img").first()).toBeVisible();
    await expect(card.getByRole("link", { name: `Download free: ${product.name}` })).toHaveAttribute("href", product.downloadHref);
    await expect(card.getByRole("link", { name: "View product" })).toHaveAttribute("href", `/plugins/${product.id}/`);
  }
});

test("three curated theme and plugin picks link to profiles and retain checked dates", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".homepage-feature .theme-card")).toHaveCount(3);
  await expect(page.locator(".homepage-feature .plugin-card")).toHaveCount(3);
  for (const card of await page.locator(".homepage-feature .theme-card, .homepage-feature .plugin-card").all()) {
    await expect(card.locator("time")).toHaveAttribute("datetime", /\d{4}-\d{2}-\d{2}/);
    await expect(card.locator("img")).toHaveAttribute("alt", /.+/);
  }
  await expect(page.locator(".home-guide a")).toHaveAttribute("href", "/guides/choose-wordpress-theme/");
});

test("a missing product screenshot falls back to its icon without hiding its actions", async ({ page }) => {
  await page.route(/\/media\/previews\/.*\.webp/, (route) => route.abort());
  await page.goto("/");
  const card = page.locator(".home-product").first();
  await card.scrollIntoViewIfNeeded();
  await expect(card.locator("a.has-image-fallback .home-product__fallback img")).toBeVisible();
  await expect(card.getByRole("link", { name: "View product" })).toBeVisible();
});

test("header search identifies Kreativ Core as our own theme", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox", { name: "Search KreativWP" }).fill("Kreativ Core");
  await page.getByRole("button", { name: "Submit search" }).click();
  await expect(page).toHaveURL(/\/search\/\?q=Kreativ\+Core/);
  const result = page.locator("#search-results [data-search]:visible").filter({ has: page.getByRole("link", { name: "Kreativ Core", exact: true }) });
  await expect(result).toContainText("KreativWP theme");
});

test("the homepage and navigation remain usable on small screens", async ({ page }) => {
  await page.goto("/");
  for (const width of [320, 375, 768, 980, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 375, height: 900 });
  await page.locator(".mobile-menu summary").click();
  await expect(page.locator(".mobile-menu__links").getByRole("link", { name: "Themes" })).toBeVisible();
  await expect(page.locator(".mobile-menu__links").getByRole("link", { name: "Themes" })).toHaveAttribute("href", "/themes/");
  await page.locator(".mobile-menu__links a").first().focus();
  await page.keyboard.press("Escape");
  await expect(page.locator(".mobile-menu")).not.toHaveAttribute("open");
  await expect(page.locator(".mobile-menu summary")).toBeFocused();
  await page.goto("/themes/");
  await page.locator(".mobile-menu summary").click();
  await expect(page.locator(".mobile-menu__links").getByRole("link", { name: "Themes" })).toHaveAttribute("aria-current", "page");
  await page.locator(".hero h1").click({ position: { x: 5, y: 5 } });
  await expect(page.locator(".mobile-menu")).not.toHaveAttribute("open");
});

test("product buttons retain accessible contrast in both themes", async ({ page }) => {
  await page.goto("/");
  const button = page.locator(".home-product .button-like--primary").first();
  const contrast = () => button.evaluate((element) => {
    const luminance = (color) => {
      const values = color.match(/[\d.]+/g).slice(0, 3).map(Number).map((value) => {
        const s = value / 255;
        return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4;
      });
      return values[0] * .2126 + values[1] * .7152 + values[2] * .0722;
    };
    const style = getComputedStyle(element);
    const values = [luminance(style.color), luminance(style.backgroundColor)].sort((a, b) => b - a);
    return (values[0] + .05) / (values[1] + .05);
  });
  for (const mode of ["light", "dark"]) {
    if (mode === "dark") await page.getByRole("button", { name: "Switch to dark theme" }).click();
    expect(await contrast()).toBeGreaterThanOrEqual(4.5);
  }
});
