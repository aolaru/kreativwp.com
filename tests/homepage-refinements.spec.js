const { test, expect } = require("@playwright/test");
const fs = require("node:fs");

const theme = JSON.parse(fs.readFileSync("src/content/theme-reviews/generatepress.json", "utf8"));
const plugin = JSON.parse(fs.readFileSync("src/content/plugin-reviews/fluent-forms.json", "utf8"));
const products = ["kreativ-report-broken-link", "kreativ-broken-image-finder"].map((id) => ({ id, ...JSON.parse(fs.readFileSync(`src/content/plugins/${id}.json`, "utf8")) }));
const productPreview = "https://ps.w.org/kreativ-report-broken-link/assets/screenshot-2.png?rev=3446681";

test.beforeEach(async ({ page }) => {
  // Rendering regressions should not depend on WordPress.org availability.
  await page.route(/https:\/\/(?:ps|ts)\.w\.org\//, (route) => route.fulfill({
    contentType: "image/svg+xml",
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="2762" height="1494"><rect width="2762" height="1494" fill="#e5f1fc"/></svg>'
  }));
});

test("a personal, shorter hero brings products into the first desktop viewport", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".hero .tagline")).toContainText("Hi, I’m Andrei.");
  await expect(page.getByRole("link", { name: "A little about me" })).toHaveAttribute("href", "/about/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("WordPress, with care.");
  const productPanel = await page.locator(".product-edition").boundingBox();
  expect(productPanel.y).toBeLessThan(450);
  await expect(page.getByRole("heading", { name: "Theme pick", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Plugin pick", exact: true })).toBeVisible();
});

test("spotlights use audience summaries, specific CTAs, and genuine checked dates", async ({ page }) => {
  await page.goto("/");
  for (const [selector, entry, name, href] of [
    [".theme-card", theme, theme.themeName, "/themes/generatepress/"],
    [".plugin-card", plugin, plugin.pluginName, "/plugins/reviews/fluent-forms/"]
  ]) {
    const card = page.locator(selector);
    await expect(card).toContainText(entry.homepageSummary);
    await expect(card.locator("time")).toHaveAttribute("datetime", entry.updated);
    await expect(card.locator(".profile-checked")).toContainText("Checked");
    await expect(card.getByRole("link", { name: `Explore ${name}` })).toHaveAttribute("href", href);
  }
  await expect(page.getByRole("link", { name: "View profile", exact: true })).toHaveCount(0);
});

test("both products have a direct free ZIP and a separate detail link with a real preview", async ({ page }) => {
  await page.goto("/");
  for (const product of products) {
    const row = page.locator(".product-edition__list article").filter({ has: page.getByRole("heading", { name: product.name, exact: true }) });
    await expect(row.getByRole("link", { name: `Get the free plugin: ${product.name}`, exact: true })).toHaveAttribute("href", product.downloadHref);
    await expect(row.getByRole("link", { name: `Learn about ${product.name}`, exact: true })).toHaveAttribute("href", `/plugins/${product.id}/`);
  }
  const image = page.locator(".product-edition__preview img");
  await image.scrollIntoViewIfNeeded();
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute("src", productPreview);
  await expect(image).toHaveAttribute("width", "2762");
  await expect(image).toHaveAttribute("height", "1494");
  await expect.poll(() => image.evaluate((element) => element.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator(".product-edition__preview figcaption")).toContainText("Visitor reports");
  await expect(page.locator(".product-edition__list")).not.toContainText("Scan and report broken links");
});

test("a failed product preview hides its broken image and keeps the workflow link", async ({ page }) => {
  await page.route(productPreview, (route) => route.abort());
  await page.goto("/");
  const figure = page.locator(".product-edition__preview");
  await figure.scrollIntoViewIfNeeded();
  await expect(figure.locator("img")).toBeHidden();
  await expect(figure.locator("figcaption a")).toBeVisible();
  await expect(figure.locator("figcaption a")).toHaveAttribute("href", "/plugins/kreativ-report-broken-link/");
});

test("the guide follows the picks and the page remains usable at narrow widths", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".home-guide a")).toHaveAttribute("href", "/guides/choose-wordpress-theme/");
  expect(await page.locator(".home-guide").evaluate((guide) => Boolean(guide.previousElementSibling?.classList.contains("homepage-feature--plugin")))).toBe(true);
  for (const width of [320, 375, 768, 980, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const buttons = page.locator(".product-edition__actions .button-like");
    for (const button of await buttons.all()) expect((await button.boundingBox()).width).toBeLessThan(width);
  }
});

test("product download buttons remain readable in both themes and on hover", async ({ page }) => {
  await page.goto("/");
  const button = page.locator(".product-edition__actions .button-like--primary").first();
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
    await button.hover();
    await page.waitForFunction(() => document.getAnimations().every((animation) => animation.playState !== "running"));
    expect(await contrast()).toBeGreaterThanOrEqual(4.5);
    await page.mouse.move(0, 0);
  }
});
