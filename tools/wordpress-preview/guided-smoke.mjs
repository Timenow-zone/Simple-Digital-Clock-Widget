import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { launchLabBrowser } from '../wordpress-lab/browser-helpers.mjs';

const [label, engine = 'chromium'] = process.argv.slice(2);
if (!/^[a-z0-9-]+$/.test(label || '') || !['chromium', 'firefox', 'webkit'].includes(engine)) {
  throw new Error('Usage: node tools/wordpress-preview/guided-smoke.mjs <unique-label> [chromium|firefox|webkit]');
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
  checks: [], viewports: [], editor: {}, externalRequests: [], pageErrors: [],
};
const check = (name, passed, detail) => result.checks.push({ name, passed: !!passed, ...(!passed ? { detail } : {}) });
const progress = (current, total, title) => {
  const elapsed = (Date.now() - started) / 1000;
  console.log(`[${current}/${total}] ${Math.round(current / total * 100)}% ${title}; elapsed=${elapsed.toFixed(1)}s; rate=${(current / Math.max(elapsed, 0.1)).toFixed(2)}/s; ETA=${(current ? elapsed / current * (total - current) : 0).toFixed(1)}s`);
};

const browser = await launchLabBrowser(engine);
const context = await browser.newContext({ timezoneId: 'UTC', viewport: { width: 1280, height: 720 } });
context.on('page', page => page.on('pageerror', error => result.pageErrors.push(error.message)));
context.on('request', request => {
  const url = new URL(request.url());
  if (url.origin !== base && ['http:', 'https:'].includes(url.protocol)) result.externalRequests.push(request.url());
});
await context.route('**/*', route => {
  const url = new URL(route.request().url());
  return url.origin === base || !['http:', 'https:'].includes(url.protocol) ? route.continue() : route.abort();
});

const liveSelector = '.sdc-live-result timenow-zone-sdcw';
let page;
let editorPage;
let previewData;
let savedProbe = false;

async function waitForClock(target = page) {
  await target.waitForFunction(selector => {
    const clock = document.querySelector(selector);
    return !!clock && /\d{1,2}:\d{2}/.test(clock.shadowRoot?.querySelector('a')?.textContent || '');
  }, liveSelector, { timeout: 30000 });
}

async function clockState() {
  return page.locator(liveSelector).evaluate(clock => ({
    attributes: Object.fromEntries([...clock.attributes].map(attribute => [attribute.name, attribute.value])),
    text: clock.shadowRoot?.querySelector('a')?.textContent,
    dateText: clock.shadowRoot?.innerText,
  }));
}

async function submitCity(value) {
  await page.locator('#sdc-preview-form [name="city"]').fill(value);
  await page.locator('#sdc-preview-form button[type="submit"]').click();
}

async function expectZone(timeZone) {
  await page.waitForFunction(({ selector, timeZone }) => document.querySelector(selector)?.getAttribute('time-zone') === timeZone, { selector: liveSelector, timeZone }, { timeout: 10000 });
}

async function editorState() {
  return editorPage.evaluate(() => {
    const flatten = blocks => blocks.flatMap(block => [block, ...flatten(block.innerBlocks || [])]);
    const blocks = flatten(wp.data.select('core/block-editor').getBlocks());
    return {
      postId: wp.data.select('core/editor').getCurrentPostId(),
      dirty: wp.data.select('core/editor').isEditedPostDirty(),
      total: blocks.length,
      invalid: blocks.filter(block => block.isValid === false).map(block => ({ name: block.name, attributes: block.attributes })),
      clocks: blocks.filter(block => block.name === 'simple-digital-clock-block/widget-block').map(block => ({ clientId: block.clientId, attributes: block.attributes, isValid: block.isValid })),
    };
  });
}

try {
  page = await context.newPage();
  const response = await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 45000 });
  check('Guided preview returns HTTP 200', response?.status() === 200, response?.status());
  await page.locator('#sdc-preview-builder').waitFor({ state: 'visible' });
  await waitForClock();
  await page.waitForFunction(() => ['true', 'error'].includes(document.querySelector('#sdc-preview-builder')?.dataset.ready), null, { timeout: 15000 });
  const controlsReady = await page.locator('#sdc-preview-builder').getAttribute('data-ready');
  check('Guided controls initialize successfully', controlsReady === 'true', await page.locator('#sdc-result-status').textContent());
  if (controlsReady !== 'true') throw new Error('Guided controls reported an initialization error');
  const data = await page.locator('#sdc-preview-data').evaluate(node => JSON.parse(node.textContent));
  previewData = data;
  result.initial = await clockState();
  check('Initial preview is Classic Kyiv', result.initial.attributes?.['time-zone'] === 'Europe/Kyiv' && await page.locator('[data-sdc-preset="classic"]').getAttribute('aria-pressed') === 'true', result.initial);
  check('Native plugin custom element renders an actual shadow clock', !!result.initial.text && await page.locator(liveSelector).evaluate(clock => !!customElements.get('timenow-zone-sdcw') && !!clock.shadowRoot));
  const markup = await page.evaluate(() => ({
    h1: document.querySelectorAll('h1').length,
    main: document.querySelectorAll('main').length,
    clocks: document.querySelectorAll('timenow-zone-sdcw').length,
    fontAttrs: [...document.querySelectorAll('timenow-zone-sdcw')].map(clock => clock.getAttribute('font-family')),
    steps: [...document.querySelectorAll('[data-sdc-step]')].map(step => ({ step: step.dataset.sdcStep, state: step.dataset.state })),
  }));
  result.markup = markup;
  check('One H1 and one main landmark', markup.h1 === 1 && markup.main === 1, markup);
  check('The scenario stays focused on one real clock', markup.clocks === 1, markup.clocks);
  check('Four explicit scenario steps are present', markup.steps.length === 4, markup.steps);
  check('Every clock uses the bundled system-font path', markup.fontAttrs.every(value => !value), markup.fontAttrs);
  await page.screenshot({ path: path.join(folder, 'guided-initial-desktop.png'), fullPage: false });
  progress(1, 8, 'Initial scenario and native clock');

  const timeBefore = result.initial.text;
  const statusBefore = await page.locator('#sdc-result-status').textContent();
  await page.waitForFunction(({ selector, before }) => document.querySelector(selector)?.shadowRoot?.querySelector('a')?.textContent !== before, { selector: liveSelector, before: timeBefore }, { timeout: 5000 });
  check('Clock seconds advance', timeBefore !== (await clockState()).text);
  check('Ticking clock does not spam the live status', await page.locator('#sdc-result-status').textContent() === statusBefore);

  const minimal = page.locator('[data-sdc-preset="minimal"]');
  await minimal.focus();
  await minimal.press('Enter');
  const minimalPreset = data.presets.find(preset => preset.id === 'minimal');
  await page.waitForFunction(({ selector, expected }) => document.querySelector(selector)?.getAttribute('background') === expected, { selector: liveSelector, expected: minimalPreset.clock.background });
  check('Preset can be selected with the keyboard', await minimal.getAttribute('aria-pressed') === 'true');
  check('Choosing a style advances the guide to the city step', await page.locator('[data-sdc-step="2"]').getAttribute('data-state') === 'current');
  check('Preset updates the actual widget background', (await clockState()).attributes.background === minimalPreset.clock.background);
  check('Only one preset is selected', await page.locator('[data-sdc-preset][aria-pressed="true"]').count() === 1);

  await page.setViewportSize({ width: 390, height: 844 });
  await submitCity('New York');
  await expectZone('America/New_York');
  const mobileResult = await page.locator(liveSelector).evaluate(clock => ({ top: clock.getBoundingClientRect().top, bottom: clock.getBoundingClientRect().bottom, height: innerHeight }));
  check('Mobile city submission focuses the live result heading', await page.evaluate(() => document.activeElement?.id === 'sdc-result-city'));
  check('Mobile city submission brings the actual clock into view', mobileResult.top >= -1 && mobileResult.bottom <= mobileResult.height + 1, mobileResult);
  await page.screenshot({ path: path.join(folder, 'guided-mobile-after-submit.png'), fullPage: false });
  await page.setViewportSize({ width: 1280, height: 720 });
  result.newYork = await clockState();
  check('City submission changes actual timezone and caption', result.newYork.attributes.caption === 'New York' && result.newYork.attributes['time-zone'] === 'America/New_York', result.newYork);
  check('City summary reflects the result', /New York/.test(await page.locator('#sdc-result-city').innerText()) && /America\/New_York/.test(await page.locator('#sdc-result-timezone').innerText()));
  check('Applying a city advances the guide to the live result', await page.locator('[data-sdc-step="3"]').getAttribute('data-state') === 'current');
  await page.locator('[name="use-24-hour"]').uncheck();
  await page.waitForFunction(selector => /[AP]M/.test(document.querySelector(selector)?.shadowRoot?.querySelector('a')?.textContent || ''), liveSelector);
  check('12-hour toggle shows AM/PM through the plugin', /[AP]M/.test((await clockState()).text));
  await page.locator('[name="use-24-hour"]').check();
  check('24-hour toggle uses native period=false serialization', (await clockState()).attributes.period === 'false');
  await page.locator('[name="show-date"]').uncheck();
  check('Date toggle removes the actual date attribute', (await clockState()).attributes.date === undefined);
  await page.locator('[name="show-date"]').check();
  check('Date toggle restores the actual date attribute', (await clockState()).attributes.date !== undefined);
  progress(2, 8, 'Keyboard style, city and display controls');

  const validBefore = (await clockState()).attributes;
  await submitCity('No Such City 987654321');
  await page.locator('#sdc-city-error').waitFor({ state: 'visible' });
  check('Unknown city gives an explicit validation error', !!(await page.locator('#sdc-city-error').innerText()).trim());
  check('Unknown city keeps focus on the field to fix', await page.locator('[name="city"]').evaluate(input => input === document.activeElement));
  check('Unknown city retains the previous valid result', JSON.stringify((await clockState()).attributes) === JSON.stringify(validBefore));
  await submitCity('<img data-sdc-xss src=x onerror="window.sdcXss=true">');
  check('User city text cannot inject HTML or execute script', await page.locator('img[data-sdc-xss]').count() === 0 && await page.evaluate(() => window.sdcXss !== true));
  check('XSS-like input does not silently change the result', JSON.stringify((await clockState()).attributes) === JSON.stringify(validBefore));
  await submitCity('Pacific/Auckland');
  await expectZone('Pacific/Auckland');
  check('Explicit valid IANA timezone is accepted', (await clockState()).attributes['time-zone'] === 'Pacific/Auckland');
  const kyiv = data.cities.find(city => city.timeZone === 'Europe/Kyiv');
  const unicodeAlias = kyiv?.aliases?.find(alias => /[^\x00-\x7f]/.test(alias));
  if (unicodeAlias) {
    await submitCity(unicodeAlias);
    await expectZone('Europe/Kyiv');
    check('Unicode city alias resolves without escaping damage', (await clockState()).attributes['time-zone'] === 'Europe/Kyiv');
  }
  await submitCity('New York');
  await expectZone('America/New_York');
  await page.locator('[data-sdc-preset="bold"]').click();
  const boldPreset = data.presets.find(preset => preset.id === 'bold');
  check('Bold selection applies the advertised widget style', (await clockState()).attributes.background === boldPreset.clock.background);
  await page.screenshot({ path: path.join(folder, 'guided-result-desktop.png'), fullPage: false });
  progress(3, 8, 'Validation, IANA input and result');

  for (const [index, width] of [320, 390, 768, 1280].entries()) {
    await page.setViewportSize({ width, height: width === 1280 ? 720 : 900 });
    // Native resize events drive the production widget's responsive sizing.
    await page.waitForFunction(selector => document.querySelector(selector)?.getBoundingClientRect().width > 0, liveSelector);
    const geometry = await page.locator(liveSelector).evaluate(clock => {
      const rect = element => {
        const box = element.getBoundingClientRect();
        return { left: box.left, top: box.top, right: box.right, bottom: box.bottom, width: box.width, height: box.height };
      };
      return { host: rect(clock), widget: rect(clock.shadowRoot.querySelector('.widget')), text: rect(clock.shadowRoot.querySelector('a')), documentWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth };
    });
    result.viewports.push({ width, ...geometry });
    check(`${width}px: no horizontal document overflow`, geometry.documentWidth <= width + 1, geometry);
    check(`${width}px: actual clock fits the viewport`, geometry.widget.left >= -1 && geometry.widget.right <= width + 1 && geometry.widget.height > 0, geometry);
    check(`${width}px: time text fits its clock`, geometry.text.left >= geometry.widget.left - 1 && geometry.text.right <= geometry.widget.right + 1, geometry);
    await page.screenshot({ path: path.join(folder, `guided-result-${width}.png`), fullPage: width !== 1280 });
    progress(3 + (index + 1) / 4, 8, `Result viewport ${width}px`);
  }
  progress(4, 8, 'Responsive result');

  await page.locator('#sdc-install-toggle').click();
  await page.locator('#sdc-install').waitFor({ state: 'visible' });
  check('Installation action reveals the installation instructions', await page.locator('#sdc-install').isVisible());
  check('Installation advances the guide to the final step', await page.locator('[data-sdc-step="4"]').getAttribute('data-state') === 'current');
  check('Installation heading receives focus', await page.evaluate(() => document.activeElement?.id === 'sdc-install-title'));
  const install = await page.locator('#sdc-install').innerText();
  check('Instructions identify the users own WordPress dashboard', /Plugins/i.test(install) && /Simple Digital Clock/i.test(install), install);
  const installationLinks = await page.locator('#sdc-install a[href]').evaluateAll(links => links.map(link => link.href));
  check('Install section provides an official plugin/download destination', installationLinks.some(link => ['wordpress.org', 'downloads.wordpress.org'].includes(new URL(link).hostname)), installationLinks);
  await page.screenshot({ path: path.join(folder, 'guided-installation.png'), fullPage: false });
  progress(5, 8, 'Installation handoff');

  // The editor link must carry the configured result into native Gutenberg.
  const configured = (await clockState()).attributes;
  const editorLink = await page.locator('#sdc-editor-link').getAttribute('href');
  result.editor.link = editorLink;
  check('Advanced editor link targets the temporary WordPress instance', new URL(editorLink, base).origin === base && new URL(editorLink, base).pathname === '/wp-admin/post.php', editorLink);
  result.configured = configured;
  const saveUrl = new URL(data.saveUrl, base);
  if (saveUrl.origin !== base) throw new Error('Refusing a non-local preview save endpoint');
  if (!Number.isInteger(data.postId) || data.postId < 1) throw new Error('Missing demo page ID');
  const readSavedContent = async () => {
    const read = await context.request.get(`${base}/?rest_route=/wp/v2/pages/${data.postId}&context=edit`, { headers: { 'X-WP-Nonce': data.restNonce } });
    if (read.status() !== 200) throw new Error(`Cannot inspect the temporary demo page: HTTP ${read.status()}`);
    return (await read.json()).content.raw;
  };
  const beforeInvalidWrites = await readSavedContent();
  const payload = { preset: 'bold', city: 'New York', timeZone: 'America/New_York', showDate: true, use24Hour: true };
  const noNonce = await context.request.post(saveUrl.href, { data: payload });
  check('Preview persistence rejects missing REST nonce', noNonce.status() === 401 || noNonce.status() === 403, noNonce.status());
  const invalidPayload = await context.request.post(saveUrl.href, { headers: { 'X-WP-Nonce': data.restNonce }, data: { ...payload, timeZone: '<script>bad</script>' } });
  check('Preview persistence rejects invalid timezone input', invalidPayload.status() === 400, { status: invalidPayload.status(), body: await invalidPayload.text() });
  const invalidPreset = await context.request.post(saveUrl.href, { headers: { 'X-WP-Nonce': data.restNonce }, data: { ...payload, preset: 'not-a-style' } });
  check('Preview persistence rejects unknown styles', invalidPreset.status() === 400, { status: invalidPreset.status(), body: await invalidPreset.text() });
  const mismatchedCity = await context.request.post(saveUrl.href, { headers: { 'X-WP-Nonce': data.restNonce }, data: { ...payload, city: 'London' } });
  check('Preview persistence rejects mismatched city and timezone', mismatchedCity.status() === 400, { status: mismatchedCity.status(), body: await mismatchedCity.text() });
  const stringBoolean = await context.request.post(saveUrl.href, { headers: { 'X-WP-Nonce': data.restNonce }, data: { ...payload, showDate: 'false' } });
  check('Preview persistence rejects string boolean fields', stringBoolean.status() === 400, { status: stringBoolean.status(), body: await stringBoolean.text() });
  check('Rejected persistence requests leave the saved page unchanged', await readSavedContent() === beforeInvalidWrites);
  const caseVariant = await context.request.post(saveUrl.href, { headers: { 'X-WP-Nonce': data.restNonce }, data: { ...payload, preset: 'classic', city: 'Kyiv', timeZone: 'europe/kyiv' } });
  savedProbe = caseVariant.status() === 200;
  const caseVariantBody = await caseVariant.json();
  check('Explicit IANA case variant resolves consistently on the server', caseVariant.status() === 200 && caseVariantBody.attributes?.timeZone === 'Europe/Kyiv', caseVariantBody);
  const saveResponse = page.waitForResponse(response => response.url() === saveUrl.href && response.request().method() === 'POST');
  await page.locator('#sdc-editor-link').click();
  const saved = await saveResponse;
  savedProbe = saved.status() === 200;
  check('Opening Gutenberg saves the selected result', savedProbe, saved.status());
  result.editor.saveResponse = { status: saved.status() };
  await page.waitForURL('**/wp-admin/post.php?**', { waitUntil: 'domcontentloaded', timeout: 45000 });
  editorPage = page;
  result.editor.loginRequired = await editorPage.locator('#user_login').isVisible();
  check('Configured result opens Gutenberg without another login', !result.editor.loginRequired, editorPage.url());
  if (result.editor.loginRequired) throw new Error('Preview editor unexpectedly requires manual login');
  await editorPage.waitForFunction(() => window.wp?.data?.select('core/editor')?.__unstableIsEditorReady?.() && !!wp.blocks.getBlockType('simple-digital-clock-block/widget-block'), null, { timeout: 45000 });
  result.editor.state = await editorState();
  check('All native Gutenberg blocks remain valid', result.editor.state.invalid.length === 0 && result.editor.state.clocks.length === 1, result.editor.state);
  check('Editor opens with a clean saved document', !result.editor.state.dirty, result.editor.state);
  const mainClock = result.editor.state.clocks[0]?.attributes;
  check('Gutenberg contains the selected city and style', mainClock?.timeZone === configured['time-zone'] && mainClock?.caption === configured.caption && mainClock?.background === configured.background, mainClock);
  check('Gutenberg contains the selected date and 24-hour display', mainClock?.date === true && mainClock?.period === true, mainClock);
  const dialogs = await editorPage.getByRole('dialog').allTextContents();
  check('Editor does not interrupt the scenario with a welcome guide', !dialogs.some(text => /Welcome to the|Welcome to WordPress|Get started/i.test(text)), dialogs);
  const selected = result.editor.state.clocks[0];
  await editorPage.evaluate(clientId => {
    wp.data.dispatch('core/block-editor').selectBlock(clientId);
    wp.data.dispatch('core/edit-post').openGeneralSidebar('edit-post/block');
  }, selected.clientId);
  const captionInput = editorPage.getByRole('textbox', { name: 'Caption', exact: true });
  if (!await captionInput.isVisible()) await editorPage.getByRole('button', { name: 'Container', exact: true }).click();
  await captionInput.fill('New York · Native edit');
  const customBackground = 'linear-gradient(135deg, rgb(16, 42, 67) 0%, rgb(35, 63, 92) 100%)';
  // The public block API supplies a custom style outside the three demo presets.
  await editorPage.evaluate(({ clientId, background }) => {
    wp.data.dispatch('core/block-editor').updateBlockAttributes(clientId, { backgroundColor: '#102a43', background });
  }, { clientId: selected.clientId, background: customBackground });
  await editorPage.getByRole('button', { name: 'Save', exact: true }).click();
  await editorPage.waitForFunction(() => {
    const editor = wp.data.select('core/editor');
    return !editor.isSavingPost() && !editor.isEditedPostDirty() && editor.didPostSaveRequestSucceed();
  }, null, { timeout: 30000 });
  check('Native Gutenberg Caption edit saves cleanly', !(await editorState()).dirty);
  await editorPage.screenshot({ path: path.join(folder, 'guided-editor.png'), fullPage: false });
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await waitForClock();
  const afterEditor = await clockState();
  check('Saved result renders after returning from Gutenberg', afterEditor.attributes['time-zone'] === configured['time-zone'], afterEditor);
  check('Frontend initialization preserves a native Gutenberg Caption edit', afterEditor.attributes.caption === 'New York · Native edit', afterEditor);
  check('Frontend initialization preserves a custom native Gutenberg style', afterEditor.attributes.background === customBackground, afterEditor);
  check('Custom editor style does not falsely select a demo preset', await page.locator('[data-sdc-preset][aria-pressed="true"]').count() === 0);
  await page.locator('[name="show-date"]').uncheck();
  check('A builder display change preserves the custom editor style', (await clockState()).attributes.background === customBackground);
  const customRequest = page.waitForRequest(request => request.url() === saveUrl.href && request.method() === 'POST');
  const customResponse = page.waitForResponse(response => response.url() === saveUrl.href && response.request().method() === 'POST');
  await page.locator('#sdc-editor-link').click();
  const customSent = (await customRequest).postDataJSON();
  const customSaved = await customResponse;
  check('UI persists a custom editor style without substituting a demo preset', customSent.preset === null && customSaved.status() === 200, { payload: customSent, status: customSaved.status() });
  await page.waitForURL('**/wp-admin/post.php?**', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForFunction(() => window.wp?.data?.select('core/editor')?.__unstableIsEditorReady?.() && !!wp.blocks.getBlockType('simple-digital-clock-block/widget-block'), null, { timeout: 45000 });
  result.editor.customState = await editorState();
  check('Custom style and builder display setting reopen as a valid native block', result.editor.customState.invalid.length === 0 && result.editor.customState.clocks.length === 1 && result.editor.customState.clocks[0].attributes.background === customBackground && result.editor.customState.clocks[0].attributes.date === false, result.editor.customState);
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await waitForClock();
  check('Saved page still contains exactly one real clock', await page.locator('timenow-zone-sdcw').count() === 1);
  progress(6, 8, 'Persisted result in native Gutenberg');

  await page.locator('#sdc-preview-reset').click();
  await expectZone('Europe/Kyiv');
  check('Reset restores Classic Kyiv', await page.locator('[data-sdc-preset="classic"]').getAttribute('aria-pressed') === 'true' && (await clockState()).attributes['time-zone'] === 'Europe/Kyiv');
  check('Reset restores the initial display toggles', await page.locator('[name="show-date"]').isChecked() && await page.locator('[name="use-24-hour"]').isChecked());
  check('Reset collapses the installation section', !await page.locator('#sdc-install').isVisible());
  const restored = await context.request.post(saveUrl.href, {
    headers: { 'X-WP-Nonce': data.restNonce },
    data: { preset: 'classic', city: 'Kyiv', timeZone: 'Europe/Kyiv', showDate: true, use24Hour: true },
  });
  check('Temporary persisted probe is restored for the next run', restored.status() === 200, restored.status());
  savedProbe = restored.status() !== 200;
  result.final = await clockState();
  await page.screenshot({ path: path.join(folder, 'guided-final-desktop.png'), fullPage: false });
  progress(7, 8, 'Reset returns to a clean scenario');
} catch (error) {
  result.error = error.stack;
  check('Guided preview scenario completes', false, error.stack);
  if (page) {
    result.failureUrl = page.url();
    result.failureText = await page.locator('body').innerText().catch(() => 'Unavailable');
    await page.screenshot({ path: path.join(folder, 'guided-failure.png'), fullPage: true }).catch(() => {});
  }
} finally {
  if (savedProbe && previewData) {
    try {
      const restored = await context.request.post(new URL(previewData.saveUrl, base).href, {
        headers: { 'X-WP-Nonce': previewData.restNonce },
        data: { preset: 'classic', city: 'Kyiv', timeZone: 'Europe/Kyiv', showDate: true, use24Hour: true },
      });
      result.cleanupRestored = restored.status() === 200;
      check('Failure cleanup restores the temporary persisted probe', result.cleanupRestored, restored.status());
    } catch (error) {
      result.cleanupError = error.stack;
      check('Failure cleanup restores the temporary persisted probe', false, error.stack);
    }
  }
  check('No uncaught browser exceptions', result.pageErrors.length === 0, result.pageErrors);
  check('No Google Fonts requests', result.externalRequests.every(url => !/fonts\.(googleapis|gstatic)\.com/.test(url)), result.externalRequests);
  await context.close();
  await browser.close();
  result.elapsedSeconds = (Date.now() - started) / 1000;
  result.failed = result.checks.filter(row => !row.passed).length;
  const target = path.join(folder, 'results.json');
  await fs.writeFile(target, JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
  progress(8, 8, 'Finished');
  console.log(`${result.failed ? 'FAIL' : 'PASS'} ${result.checks.length - result.failed}/${result.checks.length}; failed=${result.failed}; output=${target}`);
  if (result.failed) process.exitCode = 1;
}
