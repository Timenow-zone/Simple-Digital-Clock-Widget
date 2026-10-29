import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { loadLab, openEditor, clockState } from './browser-helpers.mjs';

const { output, sites, credentials } = await loadLab();
const browser = await chromium.launch({ headless: true });
const results = [];
const started = Date.now();

const editor = (context, site) => openEditor(context, site, credentials);

try {
  for (const [index, site] of sites.entries()) {
    console.log(`[${index + 1}/${sites.length}] ${site.service}: editor and frontend; elapsed=${((Date.now() - started) / 1000).toFixed(1)}s`);
    const context = await browser.newContext({ timezoneId: 'UTC', locale: 'en-GB', viewport: { width: 1400, height: 1000 } });
    const row = { ...site, pageErrors: [], consoleErrors: [], failedRequests: [] };
    try {
      context.on('page', page => {
        page.on('pageerror', error => row.pageErrors.push(error.message));
        page.on('console', message => { if (message.type() === 'error') row.consoleErrors.push(message.text()); });
        page.on('requestfailed', request => row.failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
      });
      const page = await editor(context, site);
      row.adminWarnings = await page.locator('body').innerText().then(text => text.match(/(?:Warning|Deprecated|Fatal error|Notice):[^\n]+/g) || []);
      row.editor = await page.evaluate(async () => {
        const name = 'simple-digital-clock-block/widget-block';
        const block = wp.blocks.createBlock(name, { caption: 'Clock QA', locale: 'en-GB', timeZone: 'UTC', hundredths: true, date: true });
        wp.data.dispatch('core/block-editor').resetBlocks([block]);
        await wp.data.dispatch('core/editor').savePost();
        const content = wp.data.select('core/editor').getEditedPostContent();
        return { content, parsedValid: wp.blocks.parse(content).every(block => block.isValid), saveSucceeded: wp.data.select('core/editor').didPostSaveRequestSucceed() };
      });
      await page.waitForTimeout(1200);
      row.editorClock = await clockState(page);
      await page.screenshot({ path: path.join(output, `${site.service}-editor.png`), fullPage: false });
      const front = await context.newPage();
      const response = await front.goto(`${site.url}/?p=${site.post_id}`);
      await front.waitForFunction(() => document.querySelector('timenow-zone-sdcw')?.shadowRoot?.textContent?.includes('Clock QA'));
      row.frontendStatus = response.status();
      row.frontendClock = await clockState(front);
      row.frontendWarnings = await front.locator('body').innerText().then(text => text.match(/(?:Warning|Deprecated|Fatal error|Notice):[^\n]+/g) || []);
      const first = row.frontendClock.text;
      await front.waitForTimeout(1100);
      row.clockTicks = (await clockState(front)).text !== first;
      await front.screenshot({ path: path.join(output, `${site.service}-frontend.png`), fullPage: false });

      // Test serialized default attributes when a site is edited from a different browser timezone.
      row.defaultTimezoneFixture = await page.evaluate(() => wp.blocks.serialize([
        wp.blocks.createBlock('simple-digital-clock-block/widget-block', { caption: 'Timezone transfer fixture' }),
      ]));
      const transferId = await page.evaluate(async content => {
        const post = await wp.data.dispatch('core').saveEntityRecord('postType', 'post', {
          title: 'Clock timezone transfer probe', content, status: 'publish',
        });
        return post.id;
      }, row.defaultTimezoneFixture);
      const foreignContext = await browser.newContext({ timezoneId: 'America/New_York', locale: 'en-GB' });
      try {
        const foreignPage = await editor(foreignContext, site);
        row.crossTimezone = await foreignPage.evaluate(content => {
          const block = wp.blocks.parse(content)[0];
          return { valid: block.isValid, timezone: block.attributes.timeZone, validationIssues: block.validationIssues?.map(issue => issue.args?.map(arg => typeof arg === 'string' ? arg : String(arg))) };
        }, row.defaultTimezoneFixture);
        await foreignPage.goto(`${site.url}/wp-admin/post.php?post=${transferId}&action=edit`);
        await foreignPage.waitForFunction(() => window.wp?.data?.select('core/block-editor')?.getBlocks().some(block => block.name === 'simple-digital-clock-block/widget-block'));
        row.crossTimezone.editorValid = await foreignPage.evaluate(() => wp.data.select('core/block-editor').getBlocks().find(block => block.name === 'simple-digital-clock-block/widget-block').isValid);
        row.crossTimezone.postId = transferId;
        const dismissGuide = foreignPage.getByRole('button', { name: /Close (dialog|modal)/i });
        if (await dismissGuide.count() === 1) {
          await dismissGuide.click();
          await dismissGuide.waitFor({ state: 'hidden' });
        }
        row.crossTimezone.visibleInvalidMessage = false;
        for (const frame of foreignPage.frames()) {
          if (/block contains unexpected or invalid content/i.test(await frame.locator('body').innerText())) {
            row.crossTimezone.visibleInvalidMessage = true;
          }
        }
        await foreignPage.screenshot({ path: path.join(output, `${site.service}-timezone-invalid.png`), fullPage: false });
      } finally {
        await foreignContext.close();
      }

      // The clock runtime is local; blocked external font services must not prevent it from ticking.
      await context.route('https://fonts.googleapis.com/**', route => route.abort());
      await context.route('https://fonts.gstatic.com/**', route => route.abort());
      await front.reload();
      await front.waitForFunction(() => !!document.querySelector('timenow-zone-sdcw')?.shadowRoot);
      await front.locator('timenow-zone-sdcw').evaluate(element => element.setAttribute('font-family', 'Roboto Mono'));
      await front.waitForTimeout(400);
      row.blockedFontClock = await clockState(front);
      await front.waitForTimeout(1100);
      row.blockedFontClockTicks = (await clockState(front)).text !== row.blockedFontClock.text;
      row.pass = row.editor.saveSucceeded && row.editor.parsedValid && row.frontendStatus === 200 && row.editorClock?.shadow && row.clockTicks && row.blockedFontClockTicks && row.pageErrors.length === 0;
    } catch (error) {
      row.failure = error.stack;
      row.pass = false;
    } finally {
      await context.close();
    }
    results.push(row);
    await fs.writeFile(path.join(output, 'smoke-results.json'), JSON.stringify(results, null, 2) + '\n');
    console.log(`${site.service}: baseline=${row.pass ? 'PASS' : 'FAIL'}, cross-timezone=${row.crossTimezone?.valid}, failure=${row.failure?.split('\n')[0] || 'none'}`);
  }
} finally {
  await browser.close();
}
console.log(`Completed ${results.length}/${sites.length}; baseline passed=${results.filter(row => row.pass).length}; elapsed=${((Date.now() - started) / 1000).toFixed(1)}s; output=${output}`);
if (results.some(row => !row.pass)) process.exitCode = 1;
