import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { execFileSync } from "node:child_process";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const [wpRoot, wpCli, baseUrl = "http://127.0.0.1:5503"] = process.argv.slice(2);
assert(wpRoot && wpCli && ["127.0.0.1", "localhost"].includes(new URL(baseUrl).hostname), "Use an isolated loopback WordPress lab.");
assert(path.basename(path.dirname(fs.realpathSync(wpRoot))).startsWith("kreativwp-plugin-lab."), "Refusing to change anything outside an explicitly named throwaway plugin lab.");
assert(fs.existsSync(path.join(wpRoot, "wp-content/mu-plugins/kreativwp-lab.php")), "Install the lab-only pre_wp_mail blocking filter before recording.");
const wp = (...args) => execFileSync("php", ["-d", "error_reporting=22527", wpCli, `--path=${wpRoot}`, "--quiet", ...args], { encoding: "utf8", timeout: 60000 });
assert.equal(wp('eval', 'echo wp_json_encode(apply_filters("pre_wp_mail", null, []));').trim(), 'false', 'The lab must actively block outgoing email.');
assert.equal(wp("eval", "echo site_url();").trim(), baseUrl, "WP_HOME and WP_SITEURL must match the lab server.");
const password = randomBytes(24).toString("hex");
if (wp("user", "list", "--field=user_login").split(/\s+/).includes("plugin_reviewer")) wp("user", "update", "plugin_reviewer", `--user_pass=${password}`);
else wp("user", "create", "plugin_reviewer", "plugin-reviewer@example.test", "--role=administrator", `--user_pass=${password}`);
const date = new Date().toISOString().slice(0, 10);
const prefix = `/research/${date}/plugins`;
const output = path.join(process.cwd(), "public", prefix);
fs.mkdirSync(output, { recursive: true });
const reportPath = path.join(output, "plugin-workflows.json");
const report = { date, wordpressVersion: wp("core", "version").trim(), phpVersion: wp("eval", "echo PHP_VERSION;").trim(), environment: "Isolated local macOS PHP server; SQLite Database Integration; Chromium; free editions. Email sending disabled by a lab-only filter. No production accounts or site data.", plugins: [] };
const selected = (process.env.PLUGIN_LAB_PLUGINS || "fluentform,updraftplus,google-site-kit,kreativ-report-broken-link,kreativ-broken-image-finder").split(",");
if (fs.existsSync(reportPath)) {
  const previous = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  if (previous.wordpressVersion === report.wordpressVersion) report.plugins = previous.plugins.filter((entry) => !selected.includes(entry.slug));
}
const makePost = (title, content, type = "page") => Number(wp("eval", `echo wp_insert_post(["post_title"=>${JSON.stringify(title)},"post_content"=>${JSON.stringify(content)},"post_status"=>"publish","post_type"=>${JSON.stringify(type)}]);`).trim());
const browser = await chromium.launch();
try {
  const context = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  const publicContext = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  await context.request.get(`${baseUrl}/wp-login.php`);
  await context.request.post(`${baseUrl}/wp-login.php`, { form: { log: "plugin_reviewer", pwd: password, redirect_to: `${baseUrl}/wp-admin/`, testcookie: "1" } });
  const admin = await context.newPage(), visitor = await publicContext.newPage();
  const shot = async (page, name, label) => {
    const src = `${prefix}/${name}.png`, file = path.join(process.cwd(), "public", src);
    await page.screenshot({ path: file, fullPage: true });
    const meta = await sharp(file).metadata();
    return { src, label, alt: label + " in the isolated KreativWP plugin lab", width: meta.width, height: meta.height };
  };
  const routes = { fluentform: "/wp-admin/admin.php?page=fluent_forms", updraftplus: "/wp-admin/options-general.php?page=updraftplus", "google-site-kit": "/wp-admin/admin.php?page=googlesitekit-splash", "kreativ-report-broken-link": "/wp-admin/admin.php?page=krbl_reports", "kreativ-broken-image-finder": "/wp-admin/admin.php?page=kreativ-broken-image-finder" };
  for (const slug of selected) {
    assert(routes[slug], "Unknown review plugin.");
    const result = { slug, pluginVersion: wp("plugin", "get", slug, "--field=version").trim(), checks: [], limitations: [], screenshots: [] };
    await admin.goto(baseUrl + routes[slug], { waitUntil: "networkidle" });
    assert(!admin.url().includes("wp-login.php"), "Lab login failed.");
    if (slug === "fluentform") {
      await admin.getByText("Add New Form", { exact: true }).click();
      await admin.getByText("Choose a Template", { exact: true }).click();
      await admin.getByRole("button", { name: "Create Form", exact: true }).first().click();
      await admin.waitForURL((url) => url.searchParams.has("form_id"));
      const formId = Number(new URL(admin.url()).searchParams.get("form_id"));
      await admin.getByRole("button", { name: /Save Form/ }).waitFor();
      result.screenshots.push(await shot(admin, "fluentform-builder", "A newly created free contact-form template in the builder"));
      const pageId = makePost("Contact form workflow", `<!-- wp:shortcode -->[fluentform id="${formId}"]<!-- /wp:shortcode -->`);
      await visitor.goto(`${baseUrl}/?page_id=${pageId}`, { waitUntil: "networkidle" });
      await visitor.getByPlaceholder("First Name", { exact: true }).fill("Lab");
      await visitor.getByPlaceholder("Last Name", { exact: true }).fill("Reviewer");
      const email = `workflow-${formId}@example.test`;
      await visitor.getByPlaceholder("Email Address", { exact: true }).fill(email);
      await visitor.getByPlaceholder("Subject", { exact: true }).fill("Local workflow check");
      await visitor.locator("textarea").first().fill("A synthetic contact request recorded in the isolated lab.");
      result.screenshots.push(await shot(visitor, "fluentform-public", "The contact form embedded on a published WordPress page"));
      await visitor.getByRole("button", { name: "Submit Form", exact: true }).click();
      await visitor.locator(".ff-message-success").waitFor({ state: "visible" });
      const count = Number(wp("eval", `global $wpdb; echo $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}fluentform_submissions WHERE form_id=${formId}");`).trim());
      assert.equal(count, 1, "The submitted entry must be saved.");
      await admin.goto(`${baseUrl}/wp-admin/admin.php?page=fluent_forms&route=entries&form_id=${formId}`, { waitUntil: "networkidle" });
      await admin.locator('.ff_entry_table_cell__content').filter({ hasText: email }).first().waitFor();
      result.screenshots.push(await shot(admin, "fluentform-entry", "The submitted contact entry in the WordPress dashboard"));
      result.checks = [{ title: "Create and embed", detail: "Created a free contact template through the plugin UI and embedded its shortcode on a published page." }, { title: "Submit and retrieve", detail: "Submitted synthetic name, email, subject, and message fields. The public success message appeared; one database entry and its dashboard row were verified." }];
      result.formId = formId; result.savedEntryCount = count;
      result.limitations = ["Email sending was disabled, so notification deliverability is not established.", "Payments, Pro integrations, spam handling, high-volume behavior, and production MySQL compatibility were not tested."];
    } else if (slug === "updraftplus") {
      const fixture = "KreativWP local uploads backup fixture.";
      wp("eval", `file_put_contents(wp_upload_dir()["basedir"]."/kreativwp-backup-fixture.txt", ${JSON.stringify(fixture)}); foreach (["plugins","themes","others","mu-plugins"] as $key) update_option("updraft_include_".$key, false); update_option("updraft_include_uploads", true);`);
      await admin.reload({ waitUntil: "networkidle" });
      const exitWizard = admin.getByRole('button', { name: /Exit setup/i });
      if (await exitWizard.waitFor({ timeout: 5000 }).then(() => true, () => false)) {
        await exitWizard.click();
        await exitWizard.waitFor({ state: 'hidden' });
      }
      await admin.locator("#updraft-backupnow-button").click();
      await admin.locator("#backupnow_includedb").uncheck();
      await admin.locator('#backupnow_includefiles_showmoreoptions').click();
      for (const input of await admin.locator('#backupnow_includefiles_moreoptions input[type="checkbox"]').all()) {
        await input.setChecked(await input.getAttribute('name') === 'updraft_include_uploads');
      }
      const response = admin.waitForResponse((res) => res.url().includes("admin-ajax.php") && (res.request().postData() || "").includes("backupnow"));
      await admin.locator(".ui-dialog:visible").getByRole("button", { name: "Backup Now", exact: true }).click();
      await response;
      wp("cron", "event", "run", "--due-now");
      let backup;
      for (let attempt = 0; attempt < 12 && !backup; attempt++) {
        const history = JSON.parse(wp("eval", 'echo wp_json_encode(get_option("updraft_backup_history", []));').trim());
        backup = Object.values(history).filter((entry) => entry.uploads && !entry.plugins && !entry.themes).at(-1);
        if (!backup) await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      assert(backup, "The uploads archive must be recorded in backup history.");
      const filename = Array.isArray(backup.uploads) ? backup.uploads[0] : backup.uploads;
      const archive = path.join(wpRoot, "wp-content/updraft", path.basename(filename));
      const listing = execFileSync("unzip", ["-Z1", archive], { encoding: "utf8" }).split("\n");
      const member = listing.find((name) => name.endsWith("kreativwp-backup-fixture.txt"));
      assert(member, "The archive must include the fixture.");
      assert.equal(execFileSync("unzip", ["-p", archive, member], { encoding: "utf8" }), fixture);
      await admin.reload({ waitUntil: "networkidle" });
      await admin.getByRole("button", { name: "Restore", exact: true }).first().waitFor();
      result.screenshots.push(await shot(admin, "updraftplus-backup", "A completed local uploads backup and its restore controls"));
      result.archiveReadbackVerified = true;
      result.checks = [{ title: "Create a local file backup", detail: "Started an uploads-only backup from the dashboard with database backup excluded. Ran due cron jobs in the isolated lab and verified the recorded uploads ZIP." }, { title: "Check archive contents", detail: "Read back the known fixture from the generated ZIP and matched its bytes to the original. The dashboard exposed the backup and restore controls." }];
      result.limitations = ["This is an uploads-archive check, not a full plugin restore or disaster-recovery exercise.", "Database backup, MySQL restores, scheduled timing, remote storage, and Premium features were not tested. SQLite is not a production MySQL test."];
    } else if (slug === "google-site-kit") {
      await admin.getByText("Your site may not be ready for Site Kit", { exact: true }).waitFor();
      await admin.getByText("Sign in with Google", { exact: true }).waitFor();
      await admin.getByRole('checkbox').first().uncheck();
      result.screenshots.push(await shot(admin, "google-site-kit-setup", "Site Kit’s local/staging warning and Google authorization step"));
      result.authorizationAttempted = false;
      result.checks = [{ title: "Activation and setup boundary", detail: "Activated the free plugin and opened its setup UI. It displayed the local/staging readiness warning and a Google sign-in step." }, { title: "No account changes", detail: "No Google authorization, service connection, Analytics configuration, or production-site change was attempted. Anonymous usage-data sharing was left off." }];
      result.limitations = ["Connected Search Console/Analytics reports and verified public-site setup were not tested.", "A public site and explicitly authorized Google account are required for a complete integration test; local activation is not proof of connected reporting."];
    } else if (slug === "kreativ-report-broken-link") {
      const postId = makePost("Visitor feedback fixture", '<p>A synthetic post for checking the visitor report workflow.</p>', "post");
      await visitor.goto(`${baseUrl}/?p=${postId}`, { waitUntil: "networkidle" });
      result.screenshots.push(await shot(visitor, "kreativ-report-broken-link-visitor", "The visitor-facing report button on a published post"));
      await visitor.getByRole("button", { name: "Report broken links on this page" }).click();
      await visitor.locator(".krbl-output").getByText("Thanks, your report has been sent!", { exact: true }).waitFor();
      await admin.reload({ waitUntil: "networkidle" });
      const resolve = admin.locator(`a[href*="krbl_action=resolve"]`).first();
      await resolve.click();
      assert(/Resolved:\s*[1-9]\d*/.test(await admin.locator("#wpbody-content").innerText()), "The report must be resolved.");
      const downloadEvent = admin.waitForEvent("download");
      await admin.locator("#krbl-export-csv").click();
      const download = await downloadEvent, stream = await download.createReadStream();
      const chunks = []; for await (const chunk of stream) chunks.push(chunk);
      const csv = Buffer.concat(chunks).toString("utf8");
      assert(csv.includes("resolved") && csv.includes(String(postId)), "The resolved report must be exported.");
      result.screenshots.push(await shot(admin, "kreativ-report-broken-link-admin", "A resolved visitor report in the dashboard"));
      result.reportResolved = true; result.csvVerified = true;
      result.checks = [{ title: "Report and resolve", detail: "Submitted a report from an anonymous visitor session, reviewed it in the dashboard, and marked it resolved." }, { title: "Export", detail: "Downloaded the CSV and verified the resolved report’s post ID and status." }];
      result.limitations = ["Notifications, spam/abuse handling, and large report volumes were not tested.", "This is visitor feedback, not an automatic link crawler."];
    } else {
      makePost("Image scan fixture", '<p><img src="http://127.0.0.1:5501/favicon-32x32.png" alt="Reachable fixture"><img src="http://127.0.0.1:5501/kreativwp-lab-missing-image.png" alt="Missing fixture"></p>');
      await admin.locator("#kbif-start-scan").click();
      await admin.waitForURL((url) => url.searchParams.has("kbif_scanned"), { timeout: 60000 });
      const stats = JSON.parse(wp("eval", 'echo wp_json_encode(get_option("kbif_last_scan_stats"));').trim());
      assert(stats.broken_images >= 1 && stats.total_images_found >= 2, "Both known image references must be checked and the missing file flagged.");
      await admin.getByRole('cell', { name: '404', exact: true }).first().waitFor();
      result.screenshots.push(await shot(admin, "kreativ-broken-image-finder-admin", "A completed manual scan with a missing-image HTTP 404 result"));
      result.scanStats = stats;
      result.checks = [{ title: "Controlled image scan", detail: "Scanned a fixture containing one reachable local image URL and one known missing URL. The completed report recorded the missing request as HTTP 404." }];
      result.limitations = ["Large sites, remote hosts that block HEAD, CSS backgrounds, and responsive srcset variants were not tested.", "The scan was manually started; no automatic schedule is claimed."];
    }
    report.plugins.push(result);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");
    console.log(JSON.stringify(result));
  }
} finally { await browser.close(); }
