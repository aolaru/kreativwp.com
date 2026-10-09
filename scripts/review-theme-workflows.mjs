import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { chromium } from "@playwright/test";

// Run only against an isolated local WordPress install: this changes its theme,
// menu assignments, and one page while recording the free-edition workflow.
const [wpRoot, wpCli, baseUrl = "http://127.0.0.1:5502"] = process.argv.slice(2);
if (!wpRoot || !wpCli || !process.env.THEME_LAB_PASSWORD) {
  throw new Error("Usage: THEME_LAB_PASSWORD=… node scripts/review-theme-workflows.mjs <isolated-wp-root> <wp-cli.phar> [loopback-url]");
}
assert(["127.0.0.1", "localhost"].includes(new URL(baseUrl).hostname), "Use a loopback test site.");
const wp = (...args) => execFileSync("php", ["-d", "error_reporting=22527", wpCli, `--path=${wpRoot}`, "--quiet", ...args], { encoding: "utf8", timeout: 60000 });
const date = new Date().toISOString().slice(0, 10);
const themeSlugs = (process.env.THEME_LAB_THEMES || "astra,generatepress,blocksy,kadence").split(",");
const prefix = `/research/${date}`;
const output = path.join(process.cwd(), "public", prefix);
fs.mkdirSync(output, { recursive: true });
const baseline = JSON.parse(wp("eval", 'echo wp_json_encode(["content"=>get_post(4)->post_content,"wordpress"=>get_bloginfo("version"),"php"=>PHP_VERSION,"sqlite"=>SQLite3::version()["versionString"],"plugins"=>get_option("active_plugins")]);').trim());
const report = {
  date, wordpressVersion: baseline.wordpress, phpVersion: baseline.php, sqliteVersion: baseline.sqlite,
  databaseIntegration: "SQLite Database Integration 3.1.0",
  environment: "Local PHP development server on macOS; SQLite; Chromium; free editions; WordPress core blocks; no starter-site import or companion theme plugins.",
  fixture: "scripts/theme-review-fixture.php",
  limitations: ["Local functional checks, not production hosting or Core Web Vitals benchmarks.", "Premium features, starter-site imports, WooCommerce, other plugins, updates, support quality, and a full accessibility audit were not tested."],
  themes: []
};
const previousReportPath = path.join(output, "theme-workflows.json");
if (fs.existsSync(previousReportPath)) {
  const previous = JSON.parse(fs.readFileSync(previousReportPath, "utf8"));
  assert(previous.wordpressVersion === report.wordpressVersion && previous.phpVersion === report.phpVersion, "Do not combine different test environments.");
  report.themes = previous.themes.filter((theme) => !themeSlugs.includes(theme.slug));
}
const browser = await chromium.launch();
try {
  const publicContext = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  const adminContext = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  await adminContext.request.get(`${baseUrl}/wp-login.php`);
  await adminContext.request.post(`${baseUrl}/wp-login.php`, { form: {
    log: process.env.THEME_LAB_USERNAME || "theme_reviewer", pwd: process.env.THEME_LAB_PASSWORD,
    redirect_to: `${baseUrl}/wp-admin/`, testcookie: "1"
  } });
  const page = await publicContext.newPage();
  const admin = await adminContext.newPage();
  let pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  const inspect = () => page.evaluate(() => ({
    viewport: { width: innerWidth, height: innerHeight },
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
    pageHeading: document.querySelector("h1")?.innerText || "",
    columns: document.querySelectorAll(".wp-block-column").length,
    textPresent: document.body.innerText.includes("A calmer place to build your next idea."),
    brokenImages: [...document.images].filter((image) => image.complete && !image.naturalWidth).length
  }));
  for (const slug of themeSlugs) {
    wp("theme", "activate", slug);
    wp("eval", 'set_theme_mod("nav_menu_locations", array_fill_keys(array_keys(get_registered_nav_menus()), 2)); update_option("blogname", "KreativWP Theme Lab");');
    const themeVersion = wp("theme", "get", slug, "--field=version").trim();
    pageErrors = [];
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    const desktop = await inspect();
    assert(desktop.textPresent && desktop.columns === 3 && !desktop.horizontalOverflow, `${slug}: desktop content`);
    const desktopScreenshot = `${prefix}/${slug}-desktop.png`;
    await page.screenshot({ path: path.join(process.cwd(), "public", desktopScreenshot), fullPage: true });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload({ waitUntil: "networkidle" });
    const mobile = await inspect();
    assert(mobile.textPresent && !mobile.horizontalOverflow, `${slug}: mobile content`);
    const toggle = page.locator('button[aria-expanded="false"]:visible, button[aria-controls="offcanvas"]:visible').first();
    assert(await toggle.count(), `${slug}: mobile menu toggle`);
    const menuLabel = await toggle.getAttribute("aria-label") || (await toggle.innerText()).trim();
    await toggle.click();
    await page.waitForFunction(() => [...document.querySelectorAll('a')].some((a) => a.textContent.trim() === 'Journal' && a.getBoundingClientRect().width > 0));
    const mobileMenuOpened = await page.getByRole("link", { name: "Journal", exact: true }).first().isVisible();
    const close = page.locator('button[aria-expanded="true"]:visible').first();
    const drawerClose = page.getByRole("button", { name: /close/i });
    if (await drawerClose.count()) await drawerClose.first().click();
    else if (await close.count()) await close.click();
    await page.getByRole("link", { name: "Journal", exact: true }).first().waitFor({ state: "hidden" });
    const mobileScreenshot = `${prefix}/${slug}-mobile.png`;
    await page.screenshot({ path: path.join(process.cwd(), "public", mobileScreenshot), fullPage: true });
    await page.goto(`${baseUrl}/?p=1`, { waitUntil: "networkidle" });
    const articleRendered = (await page.locator("body").innerText()).includes("Start with one real workflow");
    assert(articleRendered && mobileMenuOpened, `${slug}: article and navigation`);

    await admin.goto(`${baseUrl}/wp-admin/post.php?post=4&action=edit`, { waitUntil: "domcontentloaded" });
    await admin.waitForFunction(() => window.wp?.data?.select('core/editor')?.getCurrentPostId() === 4);
    const welcome = admin.getByRole("dialog");
    if (await welcome.count()) await welcome.getByRole("button", { name: "Close", exact: true }).click();
    const canvas = admin.frames().find((frame) => frame.url().startsWith("blob:"));
    assert(canvas, `${slug}: block editor canvas`);
    const paragraph = canvas.locator('p[contenteditable="true"]').first();
    await paragraph.fill("We help small teams make thoughtful websites. Saved and rechecked in the KreativWP theme lab.");
    await admin.getByRole("button", { name: "Save", exact: true }).click();
    await admin.waitForFunction(() => !wp.data.select('core/editor').isSavingPost() && !wp.data.select('core/editor').isEditedPostDirty());
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    const editorSaveVerified = (await page.locator("body").innerText()).includes("Saved and rechecked in the KreativWP theme lab.");
    assert(editorSaveVerified, `${slug}: editor save persisted on public page`);
    wp("eval", `wp_update_post(["ID"=>4,"post_content"=>${JSON.stringify(baseline.content).replace(/\$/g, "\\$")}]);`);

    await admin.goto(`${baseUrl}/wp-admin/customize.php`, { waitUntil: "domcontentloaded" });
    await admin.waitForFunction(() => window.wp?.customize?.section('title_tagline'));
    const customizerSections = await admin.evaluate(() => Object.values(wp.customize.section._value).map((section) => section.params.title));
    await admin.evaluate(() => wp.customize.section('title_tagline').expand());
    const siteTitle = admin.locator('input[data-customize-setting-link="blogname"]');
    await siteTitle.fill("KreativWP Preview Check");
    await siteTitle.dispatchEvent("change");
    await admin.waitForFunction(() => wp.customize('blogname').get() === 'KreativWP Preview Check');
    const customizerTitleChangeAccepted = true;
    const result = { slug, themeVersion, desktop, mobile, menuLabel, mobileMenuOpened, articleRendered, editorSaveVerified, customizerSections, customizerTitleChangeAccepted, browserErrors: [...pageErrors], screenshots: { desktop: desktopScreenshot, mobile: mobileScreenshot } };
    report.themes.push(result);
    console.log(JSON.stringify(result));
    fs.writeFileSync(path.join(output, "theme-workflows.json"), JSON.stringify(report, null, 2) + "\n");
  }
} finally {
  await browser.close();
}
