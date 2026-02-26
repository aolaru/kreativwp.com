const { test, expect } = require("@playwright/test");

test("captures dark and light homepage screenshots", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Kreativ WP/i);

  await page.screenshot({ path: "tests/home-dark.png", fullPage: true });

  await page.click("#theme-toggle");
  await page.screenshot({ path: "tests/home-light.png", fullPage: true });
});
