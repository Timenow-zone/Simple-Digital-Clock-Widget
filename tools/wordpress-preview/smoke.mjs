import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { launchLabBrowser } from '../wordpress-lab/browser-helpers.mjs';

const [label, engine = 'chromium'] = process.argv.slice(2);
if (!/^[a-z0-9-]+$/.test(label || '') || !['chromium', 'firefox', 'webkit'].includes(engine)) {
  throw new Error('Usage: node tools/wordpress-preview/smoke.mjs <unique-label> [chromium|firefox|webkit]');
}
const base = 'http://127.0.0.1:19644';
const folder = path.resolve('.local/wordpress-preview-evidence', `${label}-${engine}`);
await fs.mkdir(path.dirname(folder), { recursive: true });
await fs.mkdir(folder);
const source = await fs.readFile('wordpress/wporg-assets/blueprints/blueprint.json');
const started = Date.now();
const result = {
  label, engine, base, startedAt: new Date().toISOString(),
  blueprintSha256: createHash('sha256').update(source).digest('hex'),
  checks: [], viewports: [], editor: {}, pageErrors: [], externalRequests: [],
};
const check = (name, passed, detail) => result.checks.push({ name, passed: !!passed, ...(!passed ? { detail } : {}) });
const progress = (current, total, title) => {
  const elapsed = (Date.now() - started) / 1000;
  const eta = current ? elapsed / current * (total - current) : 0;
  console.log(`[${current}/${total}] ${Math.round(current / total * 100)}% ${title}; elapsed=${elapsed.toFixed(1)}s; ETA=${eta.toFixed(1)}s`);
};
const browser = await launchLabBrowser(engine);
const context = await browser.newContext({ timezoneId: 'UTC', viewport: { width: 1280, height: 900 } });
let restoring = null;
let editorPage;
context.on('page', page => page.on('pageerror', error => result.pageErrors.push(error.message)));
context.on('request', request => {
  const url = new URL(request.url());
  if (url.origin !== base && ['http:', 'https:'].includes(url.protocol)) result.externalRequests.push(request.url());
});
await context.route('**/*', route => {
  const url = new URL(route.request().url());
  return url.origin === base || !['http:', 'https:'].includes(url.protocol) ? route.continue() : route.abort();
});

async function waitForClocks(page) {
  await page.waitForFunction(() => {
    const clocks = [...document.querySelectorAll('timenow-zone-sdcw')];
    return clocks.length === 9 && clocks.every(clock => /\d{1,2}:\d{2}/.test(clock.shadowRoot?.querySelector('a')?.textContent || ''));
  }, null, { timeout: 30000 });
}

async function inspectEditor(page) {
  return page.evaluate(() => {
    const flatten = blocks => blocks.flatMap(block => [block, ...flatten(block.innerBlocks || [])]);
    const blocks = flatten(wp.data.select('core/block-editor').getBlocks());
    return {
      postId: wp.data.select('core/editor').getCurrentPostId(),
      dirty: wp.data.select('core/editor').isEditedPostDirty(),
      invalid: blocks.filter(block => block.isValid === false).map(block => ({ name: block.name, attributes: block.attributes, validationIssues: block.validationIssues })),
      clockCount: blocks.filter(block => block.name === 'simple-digital-clock-block/widget-block').length,
      blockCount: blocks.length,
      clocks: blocks.filter(block => block.name === 'simple-digital-clock-block/widget-block').map(block => ({ clientId: block.clientId, attributes: block.attributes, isValid: block.isValid })),
    };
  });
}

async function waitForEditor(page) {
  await page.waitForFunction(() => {
    if (!window.wp?.data?.select('core/editor')?.__unstableIsEditorReady?.() || !wp.blocks.getBlockType('simple-digital-clock-block/widget-block')) return false;
    const flatten = blocks => blocks.flatMap(block => [block, ...flatten(block.innerBlocks || [])]);
    return flatten(wp.data.select('core/block-editor').getBlocks()).filter(block => block.name === 'simple-digital-clock-block/widget-block').length === 9;
  }, null, { timeout: 45000 });
}

async function save(page) {
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.waitForFunction(() => {
    const editor = wp.data.select('core/editor');
    return !editor.isSavingPost() && !editor.isEditedPostDirty() && editor.didPostSaveRequestSucceed();
  }, null, { timeout: 30000 });
}

async function selectCaption(page, clientId) {
  await page.evaluate(id => {
    wp.data.dispatch('core/block-editor').selectBlock(id);
    wp.data.dispatch('core/edit-post').openGeneralSidebar('edit-post/block');
  }, clientId);
  const input = page.getByRole('textbox', { name: 'Caption', exact: true });
  if (!await input.isVisible()) await page.getByRole('button', { name: 'Container', exact: true }).click();
  await input.waitFor({ state: 'visible' });
  return input;
}

try {
  const page = await context.newPage();
  const response = await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 45000 });
  check('Frontend HTTP 200', response?.status() === 200, response?.status());
  await waitForClocks(page);
  const firstText = await page.locator('timenow-zone-sdcw').first().evaluate(clock => clock.shadowRoot.querySelector('a').textContent);
  await page.waitForFunction(before => document.querySelector('timenow-zone-sdcw')?.shadowRoot?.querySelector('a')?.textContent !== before, firstText, { timeout: 5000 });
  check('Live seconds advance', firstText !== await page.locator('timenow-zone-sdcw').first().evaluate(clock => clock.shadowRoot.querySelector('a').textContent));
  const markup = await page.evaluate(() => ({
    h1: document.querySelectorAll('h1').length,
    main: document.querySelectorAll('main').length,
    fontAttrs: [...document.querySelectorAll('timenow-zone-sdcw')].map(clock => clock.getAttribute('font-family')),
    zones: [...document.querySelectorAll('timenow-zone-sdcw')].map(clock => clock.getAttribute('time-zone')),
    newYork: document.querySelector('timenow-zone-sdcw[time-zone="America/New_York"]')?.shadowRoot?.querySelector('a')?.textContent,
    utc: document.querySelector('timenow-zone-sdcw[time-zone="UTC"]')?.getAttribute('period'),
    kyivLocale: document.querySelector('timenow-zone-sdcw[time-zone="Europe/Kyiv"]')?.getAttribute('locale'),
    editorUrl: document.querySelector('a.sdc-demo-primary')?.href,
  }));
  result.markup = markup;
  check('Exactly one H1 and one main landmark', markup.h1 === 1 && markup.main === 1, markup);
  check('All nine clocks use system fonts', markup.fontAttrs.length === 9 && markup.fontAttrs.every(value => value === null), markup.fontAttrs);
  check('New York displays AM/PM', /[AP]M/.test(markup.newYork || ''), markup.newYork);
  check('UTC explicitly uses 24-hour serialization', markup.utc === 'false', markup.utc);
  check('Kyiv demonstrates Ukrainian locale', markup.kyivLocale === 'uk', markup.kyivLocale);
  check('Customize link targets this demo editor', markup.editorUrl?.startsWith(`${base}/wp-admin/post.php?post=`), markup.editorUrl);

  const widths = [320, 360, 390, 768, 900, 1280];
  for (const [index, width] of widths.entries()) {
    await page.setViewportSize({ width, height: width === 1280 ? 720 : 900 });
    // A new navigation reflects the widget's initial responsive font measurement.
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForClocks(page);
    await page.evaluate(() => document.fonts.ready);
    const geometry = await page.locator('timenow-zone-sdcw').evaluateAll(clocks => {
      const rect = element => {
        const box = element.getBoundingClientRect();
        return { left: box.left, top: box.top, right: box.right, bottom: box.bottom, width: box.width, height: box.height };
      };
      return clocks.map(clock => ({
        caption: clock.getAttribute('caption'), host: rect(clock),
        widget: rect(clock.shadowRoot.querySelector('.widget')),
        card: rect(clock.closest('.wp-block-column')),
        anchor: rect(clock.shadowRoot.querySelector('a')),
        text: clock.shadowRoot.querySelector('a').textContent,
      }));
    });
    const overflow = await page.evaluate(() => ({ innerWidth, scrollWidth: document.documentElement.scrollWidth }));
    const row = { width, overflow, clocks: geometry, screenshot: path.join(folder, `frontend-${width}.png`) };
    result.viewports.push(row);
    check(`${width}px: no horizontal document overflow`, overflow.scrollWidth <= width + 1, overflow);
    check(`${width}px: all clocks fit their cards`, geometry.every(clock => clock.widget.left >= clock.card.left - 1 && clock.widget.right <= clock.card.right + 1 && clock.widget.width > 80 && clock.widget.height > 0), geometry);
    check(`${width}px: clock text fits the widget`, geometry.every(clock => clock.anchor.left >= clock.widget.left - 1 && clock.anchor.right <= clock.widget.right + 1 && clock.anchor.width > 0), geometry);
    if (width === 1280) check('Desktop first row of clocks appears without scrolling at 1280x720', geometry.slice(0, 3).every(clock => clock.widget.top < 720 && clock.widget.bottom <= 720), geometry.slice(0, 3));
    await page.screenshot({ path: row.screenshot, fullPage: true });
    progress(index + 1, 8, `Frontend ${width}px`);
  }

  editorPage = await context.newPage();
  await editorPage.goto(markup.editorUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
  result.editor.loginRequired = await editorPage.locator('#user_login').isVisible();
  check('Customize opens editor without a login form', !result.editor.loginRequired, editorPage.url());
  if (result.editor.loginRequired) {
    await editorPage.locator('#user_login').fill('admin');
    await editorPage.locator('#user_pass').fill('password');
    await Promise.all([
      editorPage.waitForURL('**/wp-admin/**', { waitUntil: 'domcontentloaded', timeout: 30000 }),
      editorPage.locator('#wp-submit').click(),
    ]);
  }
  result.editor.url = editorPage.url();
  await editorPage.screenshot({ path: path.join(folder, 'editor-arrival.png'), fullPage: false });
  await waitForEditor(editorPage);
  result.editor.initial = await inspectEditor(editorPage);
  check('All native Gutenberg blocks valid on first open', result.editor.initial.invalid.length === 0 && result.editor.initial.clockCount === 9, result.editor.initial.invalid);
  check('Opening gallery does not mark content dirty', !result.editor.initial.dirty, result.editor.initial);
  const guides = await editorPage.getByRole('dialog').allTextContents();
  check('First editor visit has no welcome guide', !guides.some(text => /Welcome to the|Welcome to WordPress|Get started/i.test(text)), guides);
  check('Editor has no block recovery controls', await editorPage.getByRole('button', { name: /Attempt (Block )?Recovery|Resolve/i }).count() === 0);
  await editorPage.screenshot({ path: path.join(folder, 'editor-first-open.png'), fullPage: false });
  progress(7, 8, 'Gutenberg first open');
  if (result.editor.initial.invalid.length) throw new Error('Refusing to resave invalid blocks. Fix seed serialization first.');

  const original = result.editor.initial.clocks[0];
  restoring = { originalCaption: original.attributes.caption, clientId: original.clientId };
  const probeCaption = `${original.attributes.caption} · Preview smoke`;
  await (await selectCaption(editorPage, original.clientId)).fill(probeCaption);
  await save(editorPage);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForClocks(page);
  check('Native Caption edit/save updates frontend', await page.locator('timenow-zone-sdcw').first().getAttribute('caption') === probeCaption);
  result.editor.edited = await inspectEditor(editorPage);
  check('Native edit retains all nine valid blocks', result.editor.edited.invalid.length === 0 && result.editor.edited.clockCount === 9, result.editor.edited.invalid);
  await (await selectCaption(editorPage, original.clientId)).fill(original.attributes.caption);
  await save(editorPage);
  restoring = null;
  await editorPage.reload({ waitUntil: 'domcontentloaded' });
  await waitForEditor(editorPage);
  result.editor.final = await inspectEditor(editorPage);
  check('Restored gallery reopens valid and clean', result.editor.final.invalid.length === 0 && result.editor.final.clockCount === 9 && !result.editor.final.dirty && result.editor.final.clocks[0].attributes.caption === original.attributes.caption, result.editor.final);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForClocks(page);
  check('Original frontend caption restored', await page.locator('timenow-zone-sdcw').first().getAttribute('caption') === original.attributes.caption);
  await editorPage.screenshot({ path: path.join(folder, 'editor-final.png'), fullPage: false });
  progress(8, 8, 'Native Caption edit/save/reopen/restore');
} catch (error) {
  result.error = error.stack;
  if (editorPage) {
    result.editor.failureUrl = editorPage.url();
    result.editor.failureText = await editorPage.locator('body').innerText().catch(() => 'Unavailable');
    await editorPage.screenshot({ path: path.join(folder, 'editor-failure.png'), fullPage: false }).catch(() => {});
  }
  check('Smoke scenario completes', false, error.stack);
} finally {
  if (restoring && editorPage) {
    try {
      await (await selectCaption(editorPage, restoring.clientId)).fill(restoring.originalCaption);
      await save(editorPage);
      result.cleanupRestoredCaption = true;
    } catch (error) { result.cleanupError = error.stack; }
  }
  check('No uncaught browser exceptions', result.pageErrors.length === 0, result.pageErrors);
  check('No Google Font requests', result.externalRequests.every(url => !/fonts\.(googleapis|gstatic)\.com/.test(url)), result.externalRequests);
  await context.close();
  await browser.close();
  result.elapsedSeconds = (Date.now() - started) / 1000;
  result.failed = result.checks.filter(row => !row.passed).length;
  const target = path.join(folder, 'results.json');
  await fs.writeFile(target, JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
  console.log(`${result.failed ? 'FAIL' : 'PASS'} ${result.checks.length - result.failed}/${result.checks.length}; failed=${result.failed}; elapsed=${result.elapsedSeconds.toFixed(1)}s; output=${target}`);
  if (result.failed || result.cleanupError) process.exitCode = 1;
}
