const { test, expect } = require("@playwright/test");
const fs = require("node:fs");

const content = (collection) => fs.readdirSync(`src/content/${collection}`).filter((name) => name.endsWith(".json")).map((name) => JSON.parse(fs.readFileSync(`src/content/${collection}/${name}`, "utf8")));
const themeNames = content("theme-reviews").map((entry) => entry.themeName);
const pluginNames = [...content("plugin-reviews").map((entry) => entry.pluginName), ...content("plugins").filter((entry) => entry.live).map((entry) => entry.name)];
const alphabetic = (names) => [...names].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));
const visibleNames = (page) => page.locator("[data-library-card]:visible h3").allTextContents();
const expandAll = async (page) => {
  const button = page.locator("[data-library-more]");
  while (await button.isVisible()) await button.click();
};

test.beforeEach(async ({ page }) => {
  await page.route(/https:\/\/(?:ps|ts)\.w\.org\//, (route) => route.fulfill({ contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750"><rect width="1200" height="750" fill="#e5f1fc"/></svg>' }));
});

test("name search is immediate, case insensitive, and scoped to each library", async ({ page }) => {
  for (const [path, resource, query, names] of [
    ["/themes/", "themes", "aStRa", ["Astra"]],
    ["/plugins/", "plugins", "fLuEnT", ["Fluent Forms"]]
  ]) {
    await page.goto(path);
    await page.getByLabel(`Search ${resource} by name`).fill(query);
    await expect(page.locator("[data-library-card]:visible")).toHaveCount(names.length);
    expect((await visibleNames(page)).sort()).toEqual(names.sort());
    expect(new URL(page.url()).searchParams.get("q")).toBe(query);
    await expect(page.locator("[data-library-more]")).toBeHidden();
  }
});

test("name sorting is global, including specialized plugins and own products", async ({ page }) => {
  for (const [path, resource, names] of [["/themes/", "themes", themeNames], ["/plugins/", "plugins", pluginNames]]) {
    await page.goto(path);
    await page.getByLabel(`Sort ${resource}`).selectOption("name");
    await expandAll(page);
    expect(await visibleNames(page)).toEqual(alphabetic(names));
    expect(new Set(await visibleNames(page)).size).toBe(names.length);
  }
});

test("recent sorting follows checked dates and breaks ties by name", async ({ page }) => {
  for (const [path, resource] of [["/themes/", "themes"], ["/plugins/", "plugins"]]) {
    await page.goto(path);
    const expected = await page.locator("[data-library-card]").evaluateAll((cards) => cards.map((card) => ({ name: card.dataset.cardName, updated: card.dataset.updated })).sort((a, b) => b.updated.localeCompare(a.updated) || a.name.localeCompare(b.name, "en", { sensitivity: "base" })).map((card) => card.name));
    await page.getByLabel(`Sort ${resource}`).selectOption("recent");
    await expandAll(page);
    expect(await visibleNames(page)).toEqual(expected);
    expect(new URL(page.url()).searchParams.get("sort")).toBe("recent");
  }
});

test("editorial selections are explicit and all cards have short best-for lines", async ({ page }) => {
  for (const [path, picks] of [
    ["/themes/", ["GeneratePress", "Astra", "Blocksy", "Kadence"]],
    ["/plugins/", ["Fluent Forms", "UpdraftPlus", "Site Kit by Google", "Wordfence"]]
  ]) {
    await page.goto(path);
    await expect(page.locator("[data-library-filter]")).toBeVisible();
    expect((await visibleNames(page)).slice(0, 4)).toEqual(picks);
    await expect(page.locator("[data-library] .card-selection")).toHaveCount(4);
    await expect(page.locator("[data-library] .theme-card--featured, [data-library] .plugin-card--featured")).toHaveCount(0);
    const fits = await page.locator("[data-library-card] .card-best-for").allTextContents();
    expect(fits.length).toBe(path === "/themes/" ? 30 : 32);
    for (const fit of fits) { expect(fit).toMatch(/^Best for:/); expect(fit.length).toBeLessThanOrEqual(121); }
  }
});

test("workflow alternatives use OR, while separate groups and requirements use AND", async ({ page }) => {
  await page.goto("/themes/");
  await page.getByRole("button", { name: "Page builder", exact: true }).click();
  await page.getByRole("button", { name: "Full site editing", exact: true }).click();
  await page.getByRole("button", { name: "Free", exact: true }).click();
  await page.getByRole("button", { name: "Starter sites", exact: true }).click();
  await page.getByRole("button", { name: "Portfolio", exact: true }).click();
  await expect(page.locator("[data-library-card]:visible")).toHaveCount(4);
  expect((await visibleNames(page)).sort()).toEqual(["Colibri WP", "Inspiro", "Qi Theme", "Sydney"].sort());
});

test("shareable URL parameters restore search, filter selections, and sort after reload", async ({ page }) => {
  await page.goto("/themes/?q=astra&filters=page-builder,free&sort=name#theme-reviews-title");
  for (let attempt = 0; attempt < 2; attempt++) {
    await expect(page.getByLabel("Search themes by name")).toHaveValue("astra");
    await expect(page.getByLabel("Sort themes")).toHaveValue("name");
    await expect(page.getByRole("button", { name: "Page builder", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "Free", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-library-card]:visible h3")).toHaveText("Astra");
    if (!attempt) await page.reload();
  }
});

test("browser Back and Forward restore filter state", async ({ page }) => {
  await page.goto("/plugins/");
  await page.getByRole("button", { name: "Events", exact: true }).click();
  await expect(page.locator("[data-library-card]:visible h3")).toHaveText("The Events Calendar");
  await page.getByRole("button", { name: "Translation", exact: true }).click();
  await expect(page.locator("[data-library-card]:visible")).toHaveCount(2);
  await page.goBack();
  await expect(page.locator("[data-library-card]:visible h3")).toHaveText("The Events Calendar");
  await expect(page.getByRole("button", { name: "Translation", exact: true })).toHaveAttribute("aria-pressed", "false");
  await page.goForward();
  await expect(page.locator("[data-library-card]:visible")).toHaveCount(2);
});

test("empty results explain how to recover and reset without hiding the controls", async ({ page }) => {
  await page.goto("/themes/?q=no-such-theme&filters=free&sort=name&ref=share#theme-reviews-title");
  await expect(page.locator("[data-library-empty]")).toBeVisible();
  await expect(page.locator("[data-library-empty]")).toContainText("Try a shorter name");
  await expect(page.getByLabel("Search themes by name")).toBeVisible();
  await expect(page.locator("[data-library-card]:visible")).toHaveCount(0);
  await page.getByRole("button", { name: "Clear search and filters" }).click();
  await expect(page.getByLabel("Search themes by name")).toBeFocused();
  await expect(page.getByLabel("Search themes by name")).toHaveValue("");
  await expect(page.getByLabel("Sort themes")).toHaveValue("editorial");
  await expect(page.locator("[data-library-empty]")).toBeHidden();
  await expect(page.locator("[data-library-card]:visible")).toHaveCount(8);
  const url = new URL(page.url());
  expect(url.searchParams.get("ref")).toBe("share");
  expect(url.hash).toBe("#theme-reviews-title");
  for (const key of ["q", "filters", "sort"]) expect(url.searchParams.has(key)).toBe(false);
});

test("load-more batches have accurate counts, no duplicates, and usable keyboard focus", async ({ page }) => {
  for (const [path, count] of [["/themes/", 30], ["/plugins/", 32]]) {
    await page.goto(path);
    await expect(page.locator("[data-library-card]:visible")).toHaveCount(8);
    await expect(page.locator(".library-filter__status")).toContainText(`Showing 8 of ${count}`);
    await page.locator("[data-library-more]").click();
    await expect(page.locator("[data-library-card]:visible")).toHaveCount(16);
    await expect(page.locator("[data-library-card]:visible h3 a").nth(8)).toBeFocused();
    await expandAll(page);
    await expect(page.locator("[data-library-card]:visible")).toHaveCount(count);
    await expect(page.locator("[data-library-more]")).toBeHidden();
    await page.getByLabel(/Search .* by name/).fill("zzzz");
    await page.getByLabel(/Search .* by name/).fill("");
    await expect(page.locator("[data-library-card]:visible")).toHaveCount(8);
  }
});

test("missing task filters reveal events, translation, and images", async ({ page }) => {
  for (const [label, name] of [["Events", "The Events Calendar"], ["Translation", "TranslatePress"], ["Images", "ShortPixel"]]) {
    await page.goto("/plugins/");
    await page.getByRole("button", { name: label, exact: true }).click();
    await expect(page.locator("[data-library-card]:visible h3")).toHaveText(name);
  }
  await page.getByRole("button", { name: "Core stack", exact: true }).click();
  await expect(page.locator("[data-library-empty]")).toBeVisible();
});

test("invalid URL filter and sort values are ignored safely", async ({ page }) => {
  await page.goto("/themes/?filters=unknown&sort=invalid");
  await expect(page.getByLabel("Sort themes")).toHaveValue("editorial");
  await expect(page.getByRole("button", { name: "All themes", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-library-card]:visible")).toHaveCount(8);
});

test("mobile grids are balanced, bounded, and do not overflow in either theme", async ({ page }) => {
  for (const path of ["/themes/", "/plugins/"]) {
    await page.goto(path);
    for (const width of [320, 375, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const cards = page.locator("[data-library-card]:visible");
      const first = await cards.first().boundingBox();
      const second = await cards.nth(1).boundingBox();
      expect(first.width).toBeCloseTo(second.width, 0);
      const thumbnail = await cards.first().locator(".theme-thumbnail, .plugin-thumbnail").boundingBox();
      expect(thumbnail.height / thumbnail.width).toBeCloseTo(10 / 16, 1);
    }
    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: "Switch to light theme" }).click();
  }
});

test("without JavaScript all profiles remain readable and filter controls stay hidden", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const [path, count] of [["/themes/", 30], ["/plugins/", 32]]) {
    await page.goto(`http://127.0.0.1:5500${path}`);
    await expect(page.locator("[data-library-card]:visible")).toHaveCount(count);
    await expect(page.locator("[data-library-filter]")).toBeHidden();
    await expect(page.locator("[data-library-more]")).toBeHidden();
  }
  await context.close();
});
