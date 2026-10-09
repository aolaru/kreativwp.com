const { test, expect } = require("@playwright/test");

const image = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jfXcAAAAASUVORK5CYII=", "base64");

test("loaded plugin previews hide fallback art and have bounded desktop and mobile heights", async ({ page }) => {
  await page.route(/https:\/\/(?:ps|ts)\.w\.org\//, (route) => route.fulfill({ contentType: "image/png", body: image }));
  await page.goto("/");
  const thumbnail = page.locator(".homepage-feature .plugin-thumbnail");
  await thumbnail.scrollIntoViewIfNeeded();
  await expect(thumbnail.locator("img")).toBeVisible();
  await expect(thumbnail.locator(".plugin-thumbnail__fallback")).toBeHidden();
  expect((await thumbnail.boundingBox()).height).toBeLessThanOrEqual(341);
  await page.setViewportSize({ width: 375, height: 812 });
  expect((await thumbnail.boundingBox()).height).toBeLessThan(240);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("failed plugin previews show only their fallback", async ({ page }) => {
  await page.route(/https:\/\/ps\.w\.org\//, (route) => route.abort());
  await page.goto("/");
  const thumbnail = page.locator(".homepage-feature .plugin-thumbnail");
  await thumbnail.scrollIntoViewIfNeeded();
  await expect(thumbnail).toHaveClass(/has-image-fallback/);
  await expect(thumbnail.locator("img")).toBeHidden();
  await expect(thumbnail.locator(".plugin-thumbnail__fallback")).toBeVisible();
});

test("dark mode keeps the selected library filter readable", async ({ page }) => {
  await page.goto("/themes/");
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  const ratio = await page.locator(".library-filter__button.is-active").evaluate((button) => {
    const luminance = (color) => {
      const channels = color.match(/[\d.]+/g).slice(0, 3).map(Number).map((v) => {
        const s = v / 255;
        return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4;
      });
      return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
    };
    const style = getComputedStyle(button);
    const values = [luminance(style.color), luminance(style.backgroundColor)].sort((a, b) => b - a);
    return (values[0] + .05) / (values[1] + .05);
  });
  expect(ratio).toBeGreaterThanOrEqual(4.5);
});

test("free theme shortlists exclude paid-only themes across site and design choices", async ({ page }) => {
  await page.goto("/tools/theme-finder/");
  for (const site of ["content", "store"]) {
    for (const editor of ["blocks", "visual"]) {
      for (const priority of ["lean", "design"]) {
        await page.locator(`input[name="site"][value="${site}"]`).check();
        await page.locator(`input[name="editor"][value="${editor}"]`).check();
        await page.locator(`input[name="priority"][value="${priority}"]`).check();
        await page.getByRole("button", { name: "Build my theme shortlist" }).click();
        await expect(page.locator("#theme-finder-result")).not.toContainText("Divi");
      }
    }
  }
  await page.locator('input[name="site"][value="content"]').check();
  await page.getByLabel("A paid workflow is acceptable").check();
  await page.getByRole("button", { name: "Build my theme shortlist" }).click();
  await expect(page.locator("#theme-finder-result")).toContainText("Divi");
});

test("published editorial resources are in the sitemap and previews stay out", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBe(true);
  const xml = await response.text();
  for (const path of ["/themes/astra/", "/plugins/reviews/fluent-forms/", "/comparisons/astra-vs-divi/", "/guides/best-lightweight-wordpress-themes/", "/tools/theme-finder/", "/theme-checklist/"]) {
    expect(xml).toContain(`https://kreativwp.com${path}</loc>`);
  }
  for (const path of ["/plugins/reviews/designer-plugins/", "/plugins/reviews/performance-plugins/", "/tools/theme-comparison/", "/tools/wordpress-stack-builder/", "/search/", "/404.html"]) {
    expect(xml).not.toContain(`https://kreativwp.com${path}</loc>`);
  }
});

test("the checklist is immediately usable and its text download contains the checklist", async ({ page, request }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Open the checklist" }).click();
  await expect(page.getByRole("checkbox")).toHaveCount(20);
  await page.getByRole("checkbox").first().check();
  await expect(page.getByRole("checkbox").first()).toBeChecked();
  await expect(page.getByRole("button", { name: "Print or save as PDF" })).toBeVisible();
  const response = await request.get("/downloads/kreativwp-theme-checklist.txt");
  expect(response.ok()).toBe(true);
  const content = await response.text();
  expect((content.match(/\[ \]/g) || []).length).toBe(20);
});

test("hands-on reviews expose matching evidence and actual screenshots", async ({ page, request }) => {
  const response = await request.get("/research/2026-10-09/theme-workflows.json");
  expect(response.ok()).toBe(true);
  const report = await response.json();
  expect(report.themes.map((theme) => theme.slug).sort()).toEqual(["astra", "blocksy", "generatepress", "kadence"]);
  for (const theme of report.themes) {
    await page.goto(`/themes/${theme.slug}/`);
    await expect(page.locator(".editorial-notice")).toContainText("hands-on review");
    await expect(page.locator(".hands-on-review")).toContainText(theme.themeVersion);
    await expect(page.locator(".hands-on-review")).toContainText(report.wordpressVersion);
    await expect(page.locator(".hands-on-review")).toContainText("Premium features");
    expect(theme.editorSaveVerified).toBe(true);
    for (const src of Object.values(theme.screenshots)) {
      const imageResponse = await request.get(src);
      expect(imageResponse.ok()).toBe(true);
      expect(imageResponse.headers()["content-type"]).toContain("image/png");
    }
  }
});
