const { test, expect } = require("@playwright/test");

test("homepage nav and theme toggle work", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Kreativ WP/i);
  await expect(page.locator('nav.top-menu')).toBeVisible();
  await expect(page.locator('a.skip-link')).toHaveAttribute("href", "#main-content");
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
