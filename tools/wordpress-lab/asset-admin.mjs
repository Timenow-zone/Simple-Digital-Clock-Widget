import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { chromium, webkit } from "playwright";

const directory = path.resolve(process.argv[2]);
const output = path.resolve(process.argv[3]);
const sites = JSON.parse(await readFile(path.join(directory, "sites.json"), "utf8"));
const credentials = JSON.parse(await readFile(path.join(directory, "credentials.json"), "utf8"));
const result = [];
try {
  for (const [engine, type] of Object.entries({ chromium, webkit })) {
    const browser = await type.launch({ headless: true });
    try {
      for (const [name, site] of Object.entries(sites)) {
        assert.match(site.url, /^http:\/\/127\.0\.0\.1:\d+$/);
        // Each browser starts with a visible notice; dismissal is persisted in Core.
        execFileSync('docker', ['compose', '--file', path.join(directory, 'compose.json'), 'exec', '-T', name,
          'php', '/lab/downloads/wp-cli.phar', 'eval',
          'delete_user_meta(get_user_by("login", "lab_admin")->ID, "simple_digital_clock_hide_notice");', '--allow-root'], { stdio: 'pipe' });
        const context = await browser.newContext();
        try {
          await context.route("**/*", route => new URL(route.request().url()).origin === site.url ? route.continue() : route.abort());
          const page = await context.newPage();
          await page.goto(site.url + "/wp-login.php");
          await page.locator("#user_login").fill("lab_admin");
          await page.locator("#user_pass").fill(credentials.admin);
          await Promise.all([page.waitForURL("**/wp-admin/**"), page.locator("#wp-submit").click()]);
          for (const admin of ["index.php", "plugins.php", "tools.php?page=plugin-check"]) {
            await page.goto(site.url + "/wp-admin/" + admin, { waitUntil: "networkidle" });
            const assets = await page.locator('script[src*="/plugins/simple-digital-clock/"],link[href*="/plugins/simple-digital-clock/"]').count();
            assert.equal(assets, 0, `${name} ${admin}: no plugin assets`);
          }
          await page.goto(site.url + "/wp-admin/options-general.php?page=simple-digital-clock", { waitUntil: "networkidle" });
          assert.equal(await page.locator("#simple-digital-clock-script-js").count(), 1);
          assert.equal(await page.locator("#simple-digital-clock-js").count(), 0);
          await page.locator("#simple-digital-clock-notice .notice-dismiss").click();
          await page.waitForTimeout(500);
          await page.reload({ waitUntil: "networkidle" });
          assert.equal(await page.locator("#simple-digital-clock-script-js").count(), 0, "Dismissed notice has no script");
          assert.equal(await page.locator("#simple-digital-clock-notice").count(), 0);
          await page.goto(site.url + "/wp-admin/post-new.php?post_type=page", { waitUntil: "domcontentloaded" });
          await page.waitForFunction(() => window.wp?.data?.select("core/block-editor") && window.wp.blocks.getBlockType("simple-digital-clock-block/widget-block"));
          await page.evaluate(() => {
            const block = wp.blocks.createBlock("simple-digital-clock-block/widget-block", { caption: "Editor asset contract", second: true, width: 240 });
            wp.data.dispatch("core/block-editor").insertBlocks(block);
          });
          let preview;
          for (let attempt = 0; attempt < 50; attempt++) {
            for (const frame of page.frames()) {
              if (await frame.locator("timenow-zone-sdcw").count()) {
                preview = frame;
                break;
              }
            }
            if (preview) break;
            await page.waitForTimeout(200);
          }
          assert(preview, "Inserted block must have a live preview");
          await preview.waitForFunction(() => document.querySelector("timenow-zone-sdcw")?.shadowRoot?.querySelector("a")?.textContent?.match(/\d{1,2}:\d{2}/));
          for (const frame of page.frames()) {
            const count = await frame.locator('script[src*="/plugins/simple-digital-clock/assets/public/js/"]').count();
            assert(count <= 1, "One runtime tag per editor document");
            assert.equal(await frame.locator('link[href*="/plugins/simple-digital-clock/"]').count(), 0, 'No external plugin stylesheet in editor');
            assert(await frame.locator('#simple-digital-clock-block-style-inline-css').count() <= 1, 'One inline integration rule per editor document');
          }
          const iframe = preview !== page.mainFrame();
          await page.evaluate(async () => {
            wp.data.dispatch('core/editor').editPost({ title: 'Asset contract editor draft' });
            await wp.data.dispatch('core/editor').savePost();
          });
          await page.waitForFunction(() => !wp.data.select('core/editor').isSavingPost() && !wp.data.select('core/editor').isEditedPostDirty());
          const postId = await page.evaluate(() => wp.data.select('core/editor').getCurrentPostId());
          await page.goto(`${site.url}/wp-admin/post.php?post=${postId}&action=edit`);
          await page.waitForFunction(() => wp.data?.select('core/block-editor')?.getBlocks().some(block => block.name === 'simple-digital-clock-block/widget-block'));
          assert.equal(await page.evaluate(() => wp.data.select('core/block-editor').getBlocks().every(block => block.isValid && (block.name !== 'simple-digital-clock-block/widget-block' || block.attributes.caption === 'Editor asset contract'))), true);
          result.push({ engine, site: name, ordinary_admin_assets: 0, notice_script_only_when_visible: true, first_insert_preview: true, saved_draft_reopened_valid: true, external_css: 0, inline_rule_deduplicated: true, iframe });
          console.log(`[${result.length}/4] ${engine} ${name}: admin and editor PASS (iframe=${iframe})`);
        } finally {
          await context.close();
        }
      }
    } finally {
      await browser.close();
    }
  }
} finally {
  await writeFile(path.join(output, "asset-admin-results.json"), JSON.stringify(result, null, 2) + "\n");
}
