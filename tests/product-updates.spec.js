const { test, expect } = require("@playwright/test");

test("published Kreativ products have working screenshots, correct availability and download links", async ({ page }) => {
  for (const [slug, version, screenshots] of [["kreativ-smart-related-posts", "1.2.3", 2], ["kreativ-report-broken-link", "1.5.1", 3], ["kreativ-broken-image-finder", "1.3.0", 3]]) {
    await page.goto(`/plugins/${slug}/`);
    await expect(page.locator(".product-facts")).toContainText(version);
    await expect(page.getByRole("link", { name: "Get the free plugin ZIP" }).first()).toHaveAttribute("href", `https://downloads.wordpress.org/plugin/${slug}.latest-stable.zip`);
    const images = page.locator(".product-gallery img");
    await expect(images).toHaveCount(screenshots);
    for (const image of await images.all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
    }
  }
  await page.goto("/products/kreativ-core/");
  await expect(page.locator(".core-quick-facts")).toContainText("1.0.22");
  await page.goto("/themes/kreativ-core/");
  await expect(page.locator("#core-source-title + p")).toContainText("1.0.22");
});
