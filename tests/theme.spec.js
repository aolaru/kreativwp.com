const { test, expect } = require("@playwright/test");

test("homepage nav and theme toggle work", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Kreativ WP/i);
  await expect(page.locator('nav.top-menu')).toBeVisible();
  await expect(page.getByRole("link", { name: "News" })).toBeVisible();
  await expect(page.getByRole("link", { name: "About" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Contact" })).toBeVisible();

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
  await page.goto("/news.html");
  await expect(page).toHaveTitle(/News \| Kreativ WP/i);
  await expect(page.getByRole("link", { name: /Internal Links Audit announced/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Navigation and News refresh shipped/i })).toBeVisible();
  await expect(page.locator("#updates-form")).toBeVisible();
  await expect(page.locator("#updates-email")).toBeVisible();
});
