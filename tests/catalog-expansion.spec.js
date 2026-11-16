const { test, expect } = require("@playwright/test");

const themes = ["ona", "woostify", "bjork", "tove", "twenty-twenty-two", "ashe", "bricksy", "blockbase", "responsive", "twenty-twenty-one"];
const plugins = ["wpforms", "polylang", "akismet", "all-in-one-wp-migration", "wpvivid", "code-snippets", "simple-history", "regenerate-thumbnails", "complianz", "wp-super-cache"];

test("new profiles publish documented scope, official sources, and locally cached images", async ({ page, request }) => {
  for (const [kind, ids] of [["themes", themes], ["plugins/reviews", plugins]]) {
    for (const id of ids) {
      await page.goto(`/${kind}/${id}/`);
      await expect(page.locator(".editorial-notice")).toContainText("documentation research");
      await expect(page.locator(".source-links a").first()).toHaveAttribute("href", /^https:\/\/wordpress\.org\//);
      const image = page.locator(".review-overview__image img");
      await expect(image).toHaveAttribute("src", /^\/media\/previews\/.*\.webp$/);
      const response = await request.get(await image.getAttribute("src"));
      expect(response.ok()).toBe(true);
    }
  }
});

test("new alternatives are linked and privacy filtering finds Complianz", async ({ page }) => {
  await page.goto("/plugins/reviews/wpforms/");
  await expect(page.locator(".related-profiles a[href='/plugins/reviews/fluent-forms/']")).toBeVisible();
  await page.goto("/plugins/reviews/translatepress-multilingual/");
  await expect(page.locator(".related-profiles a[href='/plugins/reviews/polylang/']")).toBeVisible();
  await page.goto("/plugins/");
  await page.locator(".library-filter__details summary").click();
  await page.getByRole("button", { name: "Privacy", exact: true }).click();
  await expect(page.locator("[data-library-card]:visible h3")).toHaveText("Complianz");
  await page.goto("/plugins/reviews/akismet/");
  await expect(page.locator(".review-overview__image--icon img")).toHaveAttribute("alt", /icon/i);
});
