import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';

const [label, mode = '--source', value = 'wordpress/wporg-assets/blueprints/blueprint.json'] = process.argv.slice(2);
if (!/^[a-z0-9-]+$/.test(label || '') || !['--source', '--url'].includes(mode)) throw new Error('Usage: node tools/wordpress-preview/public-smoke.mjs <unique-label> [--source <blueprint.json>|--url <official-preview-url>]');
const source = await fs.readFile(mode === '--source' ? value : 'wordpress/wporg-assets/blueprints/blueprint.json');
const target = mode === '--source' ? 'https://playground.wordpress.net/#' + encodeURIComponent(JSON.stringify(JSON.parse(source))) : value;
if (mode === '--url' && !/^https:\/\/(wordpress\.org\/plugins\/simple-digital-clock\/\?preview=1|playground\.wordpress\.net\/)/.test(target)) throw new Error('Refusing a non-official public preview URL');
const folder = path.resolve('.local/wordpress-preview-evidence', label);
await fs.mkdir(path.dirname(folder), { recursive: true });
await fs.mkdir(folder);
const started = Date.now();
const safe = value => String(value).replace(/https:\/\/playground\.wordpress\.net\/#[^\s]*/g, 'https://playground.wordpress.net/#<blueprint-fragment-omitted>');
const result = { label, mode, startedAt: new Date().toISOString(), blueprintSha256: createHash('sha256').update(source).digest('hex'), blueprintBytes: source.length, checks: [], viewports: [], warnings: [], pageErrors: [], failedRequests: [], httpErrors: [] };
const check = (name, passed, detail) => { result.checks.push({ name, passed: !!passed, ...(!passed ? { detail } : {}) }); if (!passed) console.log(`CHECK FAIL: ${name}`); };
const progress = (phase, message) => { const seconds = (Date.now() - started) / 1000; console.log(`[${phase}/8] ${Math.round(phase / 8 * 100)}% ${message}; elapsed=${seconds.toFixed(1)}s; ETA=${(phase ? seconds / phase * (8 - phase) : 0).toFixed(1)}s`); };
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ timezoneId: 'UTC', viewport: { width: 1280, height: 900 } });
const shell = await context.newPage();
shell.setDefaultTimeout(20000);
shell.on('pageerror', error => result.pageErrors.push(safe(error.message)));
shell.on('console', message => { if (['error', 'warning'].includes(message.type())) result.warnings.push({ type: message.type(), text: safe(message.text()).slice(0, 1500) }); });
shell.on('requestfailed', request => result.failedRequests.push({ url: safe(request.url()), error: request.failure()?.errorText }));
shell.on('response', response => { if (response.status() >= 400) result.httpErrors.push({ url: safe(response.url()), status: response.status() }); });
let wp, data, homepage;
const clockSelector = '.sdc-live-result timenow-zone-sdcw';
async function findFrame(kind) {
  for (const frame of shell.frames()) {
    try {
      if (kind === 'frontend' && frame.name() !== 'editor-canvas' && !frame.url().includes('/wp-admin/') && await frame.locator('#sdc-preview-builder').count() && await frame.locator(clockSelector).count() === 1) return frame;
      if (kind === 'editor' && await frame.evaluate(() => !!window.wp?.data?.select('core/editor')?.__unstableIsEditorReady?.() && !!window.wp?.blocks?.getBlockType('simple-digital-clock-block/widget-block'))) return frame;
    } catch {}
  }
  return null;
}
async function acquire(kind, timeout = 60000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) { const found = await findFrame(kind); if (found) return found; await shell.waitForTimeout(250); }
  throw new Error(`Public Playground did not display ${kind}`);
}
async function ready() {
  wp = await acquire('frontend');
  await wp.waitForFunction(selector => document.querySelector('#sdc-preview-builder')?.dataset.ready === 'true' && /\d{1,2}:\d{2}/.test(document.querySelector(selector)?.shadowRoot?.querySelector('a')?.textContent || ''), clockSelector, { timeout: 30000 });
}
async function state() { return wp.locator(clockSelector).evaluate(clock => ({ attributes: Object.fromEntries([...clock.attributes].map(a => [a.name, a.value])), text: clock.shadowRoot.querySelector('a').textContent })); }
async function city(value) { await wp.locator('[name="city"]').fill(value); await wp.locator('#sdc-show-clock').click(); }
async function api(url, method = 'GET', body, withNonce = true) {
  return wp.evaluate(async ({ url, method, body, nonce }) => {
    const response = await fetch(url, { method, credentials: 'same-origin', headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(nonce ? { 'X-WP-Nonce': nonce } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    const text = await response.text(); let json; try { json = JSON.parse(text); } catch { json = null; }
    return { status: response.status, json, text };
  }, { url, method, body, nonce: withNonce ? data.restNonce : '' });
}
async function editorState() {
  return wp.evaluate(() => {
    const flatten = blocks => blocks.flatMap(block => [block, ...flatten(block.innerBlocks || [])]);
    const blocks = flatten(wp.data.select('core/block-editor').getBlocks());
    return { dirty: wp.data.select('core/editor').isEditedPostDirty(), count: blocks.length, invalid: blocks.filter(b => b.isValid === false).map(b => b.name), clocks: blocks.filter(b => b.name === 'simple-digital-clock-block/widget-block').map(b => ({ clientId: b.clientId, attributes: b.attributes })) };
  });
}
async function openEditor() {
  await wp.locator('#sdc-editor-link').click();
  wp = await acquire('editor');
  return editorState();
}
async function frontend() {
  await wp.evaluate(url => { window.location.href = url; }, homepage).catch(error => { if (!/Execution context was destroyed|detached|closed/i.test(String(error))) throw error; });
  await ready();
}
async function canvasReady() {
  const deadline = Date.now() + 45000;
  while (Date.now() < deadline) {
    for (const frame of shell.frames().filter(f => f.name() === 'editor-canvas')) {
      try {
        const actual = await frame.locator('timenow-zone-sdcw').evaluateAll(nodes => nodes.map(n => ({ text: n.shadowRoot?.querySelector('a')?.textContent, width: n.getBoundingClientRect().width, height: n.getBoundingClientRect().height })));
        if (actual.length === 1 && actual[0].text && actual[0].width > 0 && actual[0].height > 0) return actual;
      } catch {}
    }
    await shell.waitForTimeout(250);
  }
  throw new Error('Native editor canvas did not render the actual clock');
}
try {
  console.log(`Public Playground ${mode}; SHA256=${result.blueprintSha256}; bytes=${source.length}`);
  await shell.goto(target, { waitUntil: 'domcontentloaded', timeout: 45000 });
  for (let seconds = 0; seconds <= 150; seconds += 10) {
    wp = await findFrame('frontend');
    console.log(`[boot] ${seconds}s; guided frame=${!!wp}; frames=${shell.frames().length}`);
    if (wp) break;
    if (seconds === 150) throw new Error('Public Playground did not boot the guided demo within 150s');
    await shell.waitForTimeout(10000);
  }
  await ready();
  data = await wp.locator('#sdc-preview-data').evaluate(n => JSON.parse(n.textContent));
  const home = new URL(data.editorUrl); home.pathname = home.pathname.replace(/wp-admin\/post\.php$/, ''); home.search = ''; homepage = home.href;
  result.runtime = { homepage, editorUrl: data.editorUrl, saveUrl: data.saveUrl, postId: data.postId, presets: data.presets.map(p => p.id), cityCount: data.cities.length };
  result.initial = await state();
  check('Public browser WASM boots the actual guided clock', result.initial.attributes['time-zone'] === 'Europe/Kyiv' && !!result.initial.text);
  check('Preview is authenticated without another login', data.canEdit && !!data.restNonce);
  check('One H1, main and native clock', await wp.evaluate(() => document.querySelectorAll('h1').length === 1 && document.querySelectorAll('main').length === 1 && document.querySelectorAll('timenow-zone-sdcw').length === 1));
  check('No Google Font assigned to the plugin clock', !result.initial.attributes['font-family']);
  await shell.screenshot({ path: path.join(folder, 'initial-desktop.png'), fullPage: false });
  const before = result.initial.text;
  await wp.waitForFunction(({ selector, before }) => document.querySelector(selector).shadowRoot.querySelector('a').textContent !== before, { selector: clockSelector, before }, { timeout: 5000 });
  check('Actual clock seconds advance', before !== (await state()).text);
  progress(1, 'Public WASM and initial real clock');

  await wp.locator('[data-sdc-preset="minimal"]').focus();
  await wp.locator('[data-sdc-preset="minimal"]').press('Enter');
  check('Keyboard style selection updates the real widget', (await state()).attributes.background === data.presets.find(p => p.id === 'minimal').clock.background);
  check('Style selection advances guide to city', await wp.locator('[data-sdc-step="2"]').getAttribute('data-state') === 'current');
  await shell.setViewportSize({ width: 390, height: 844 });
  await city('New York');
  await wp.waitForFunction(() => document.querySelector('.sdc-live-result timenow-zone-sdcw').getAttribute('time-zone') === 'America/New_York');
  result.newYork = await state();
  check('City submission updates real caption and timezone', result.newYork.attributes.caption === 'New York' && result.newYork.attributes['time-zone'] === 'America/New_York');
  check('Mobile submission focuses visible real result', await wp.locator(clockSelector).evaluate(clock => { const r = clock.getBoundingClientRect(); return document.activeElement?.id === 'sdc-result-city' && r.top >= -1 && r.bottom <= innerHeight + 1; }));
  await shell.screenshot({ path: path.join(folder, 'mobile-result.png'), fullPage: false });
  await wp.locator('[name="use-24-hour"]').uncheck();
  await wp.waitForFunction(() => /[AP]M/.test(document.querySelector('.sdc-live-result timenow-zone-sdcw').shadowRoot.querySelector('a').textContent));
  check('12-hour control shows real AM/PM', /[AP]M/.test((await state()).text));
  await wp.locator('[name="use-24-hour"]').check();
  await wp.locator('[name="show-date"]').uncheck();
  check('Date and 24-hour controls use native attributes', (await state()).attributes.date === undefined && (await state()).attributes.period === 'false');
  await wp.locator('[name="show-date"]').check();
  progress(2, 'Style, city, mobile result and display');

  const attributes = (await state()).attributes;
  await city('No Such City 987654321');
  check('Unknown city is explicit and retains previous result', await wp.locator('#sdc-city-error').isVisible() && JSON.stringify((await state()).attributes) === JSON.stringify(attributes));
  await city('<img data-sdc-xss src=x onerror="window.sdcXss=true">');
  check('XSS input cannot inject DOM or change the clock', await wp.locator('img[data-sdc-xss]').count() === 0 && await wp.evaluate(() => !window.sdcXss) && JSON.stringify((await state()).attributes) === JSON.stringify(attributes));
  await city('Pacific/Auckland');
  check('Explicit IANA zone works', (await state()).attributes['time-zone'] === 'Pacific/Auckland');
  await city('Київ');
  check('Unicode alias resolves to Kyiv', (await state()).attributes['time-zone'] === 'Europe/Kyiv');
  await city('New York'); await wp.locator('[data-sdc-preset="bold"]').click();
  for (const width of [320, 390, 768, 1280]) {
    await shell.setViewportSize({ width, height: width === 1280 ? 900 : 900 });
    const geometry = await wp.locator(clockSelector).evaluate(clock => { const widget = clock.shadowRoot.querySelector('.widget').getBoundingClientRect(), text = clock.shadowRoot.querySelector('a').getBoundingClientRect(); return { width: innerWidth, documentWidth: document.documentElement.scrollWidth, left: widget.left, right: widget.right, textLeft: text.left, textRight: text.right }; });
    result.viewports.push({ requestedWidth: width, ...geometry });
    check(`${width}px: document and real clock fit`, geometry.documentWidth <= geometry.width + 1 && geometry.left >= -1 && geometry.right <= geometry.width + 1 && geometry.textLeft >= geometry.left - 1 && geometry.textRight <= geometry.right + 1, geometry);
  }
  await shell.screenshot({ path: path.join(folder, 'configured-desktop.png'), fullPage: false });
  progress(3, 'Validation and responsive real clock');

  await wp.locator('#sdc-install-toggle').click();
  check('Installation opens, focuses and advances step four', await wp.locator('#sdc-install').isVisible() && await wp.evaluate(() => document.activeElement?.id === 'sdc-install-title') && await wp.locator('[data-sdc-step="4"]').getAttribute('data-state') === 'current');
  const installText = await wp.locator('#sdc-install').innerText();
  check('Installation explains own dashboard and links to official plugin', /Plugins.*Add New/s.test(installText) && await wp.locator('#sdc-install a[href="https://wordpress.org/plugins/simple-digital-clock/"]').count() === 1);
  await shell.screenshot({ path: path.join(folder, 'installation.png'), fullPage: false });
  progress(4, 'Installation handoff');

  const readUrl = new URL(homepage); readUrl.search = `?rest_route=/wp/v2/pages/${data.postId}&context=edit`;
  const readBefore = await api(readUrl.href);
  check('Authenticated browser can inspect disposable saved page', readBefore.status === 200 && typeof readBefore.json?.content?.raw === 'string');
  const payload = { preset: 'bold', city: 'New York', timeZone: 'America/New_York', showDate: true, use24Hour: true };
  const denied = await api(data.saveUrl, 'POST', payload, false);
  check('Missing nonce is rejected in public browser runtime', [401, 403].includes(denied.status), denied.status);
  for (const [name, patch] of [['invalid timezone', { timeZone: '<script>bad</script>' }], ['unknown preset', { preset: 'not-a-style' }], ['string boolean', { showDate: 'false' }]]) {
    const rejected = await api(data.saveUrl, 'POST', { ...payload, ...patch });
    check(`REST rejects ${name}`, rejected.status === 400, rejected);
  }
  const readAfter = await api(readUrl.href);
  check('Rejected requests leave saved page unchanged', readBefore.json.content.raw === readAfter.json.content.raw);
  progress(5, 'Public runtime REST authorization and validation');

  const selected = (await state()).attributes;
  result.editor = await openEditor();
  check('Configured result opens valid clean Gutenberg document', result.editor.count === 11 && result.editor.invalid.length === 0 && result.editor.clocks.length === 1 && !result.editor.dirty, result.editor);
  const native = result.editor.clocks[0];
  check('Native editor retains selected city, style and format', native.attributes.timeZone === selected['time-zone'] && native.attributes.caption === selected.caption && native.attributes.background === selected.background && native.attributes.date === true && native.attributes.period === true, native.attributes);
  result.editorCanvas = await canvasReady();
  check('Native editor canvas actually renders the clock', result.editorCanvas.length === 1);
  await wp.evaluate(id => { wp.data.dispatch('core/block-editor').selectBlock(id); wp.data.dispatch('core/edit-post').openGeneralSidebar('edit-post/block'); }, native.clientId);
  const caption = wp.getByRole('textbox', { name: 'Caption', exact: true });
  if (!await caption.isVisible()) await wp.getByRole('button', { name: 'Container', exact: true }).click();
  await caption.fill('New York · Public native edit');
  const custom = 'linear-gradient(135deg, rgb(16, 42, 67) 0%, rgb(35, 63, 92) 100%)';
  await wp.evaluate(({ id, background }) => wp.data.dispatch('core/block-editor').updateBlockAttributes(id, { backgroundColor: '#102a43', background }), { id: native.clientId, background: custom });
  await wp.getByRole('button', { name: 'Save', exact: true }).click();
  await wp.waitForFunction(() => !wp.data.select('core/editor').isSavingPost() && !wp.data.select('core/editor').isEditedPostDirty() && wp.data.select('core/editor').didPostSaveRequestSucceed());
  await shell.screenshot({ path: path.join(folder, 'native-editor.png'), fullPage: false });
  await frontend();
  const returned = await state();
  check('Saved native caption and custom style survive frontend initialization', returned.attributes.caption === 'New York · Public native edit' && returned.attributes.background === custom, returned);
  check('Custom editor style does not falsely select a preset', await wp.locator('[data-sdc-preset][aria-pressed="true"]').count() === 0);
  progress(6, 'Native editor rendering, edit, save and return');

  await wp.locator('[name="show-date"]').uncheck();
  result.customEditor = await openEditor();
  check('Nullable-preset persistence preserves custom style and changed date', result.customEditor.invalid.length === 0 && result.customEditor.clocks.length === 1 && result.customEditor.clocks[0].attributes.background === custom && result.customEditor.clocks[0].attributes.date === false, result.customEditor);
  await frontend();
  await wp.locator('#sdc-preview-reset').click();
  check('Reset restores Classic Kyiv and display controls', (await state()).attributes['time-zone'] === 'Europe/Kyiv' && await wp.locator('[data-sdc-preset="classic"]').getAttribute('aria-pressed') === 'true' && await wp.locator('[name="show-date"]').isChecked() && await wp.locator('[name="use-24-hour"]').isChecked());
  const reset = await api(data.saveUrl, 'POST', { preset: 'classic', city: 'Kyiv', timeZone: 'Europe/Kyiv', showDate: true, use24Hour: true });
  check('Disposable saved probe is restored', reset.status === 200, reset.status);
  await shell.screenshot({ path: path.join(folder, 'restored-frontend.png'), fullPage: false });
  progress(7, 'Custom-style preservation and reset');
  check('No uncaught browser exceptions', result.pageErrors.length === 0, result.pageErrors);
  // Four deliberate negative REST requests must not obscure unrelated HTTP failures.
  result.expectedValidationHttpErrors = result.httpErrors.filter(error => error.url === data.saveUrl && [400, 401, 403].includes(error.status)).slice(0, 4);
  result.unexpectedHttpErrors = result.httpErrors.filter(error => !result.expectedValidationHttpErrors.includes(error));
  check('No unexpected HTTP errors', result.expectedValidationHttpErrors.length === 4 && result.unexpectedHttpErrors.length === 0, result.unexpectedHttpErrors);
} catch (error) {
  result.error = safe(error.stack || error);
  check('Public scenario completes', false, result.error);
  await shell.screenshot({ path: path.join(folder, 'failure.png'), fullPage: false }).catch(() => {});
  result.frameStates = await Promise.all(shell.frames().map(async frame => { try { return { url: safe(frame.url()), body: (await frame.locator('body').innerText()).slice(0, 1200) }; } catch { return { detached: true }; } }));
} finally {
  result.finalPageUrl = safe(shell.url());
  result.elapsedSeconds = (Date.now() - started) / 1000;
  result.failed = result.checks.filter(c => !c.passed).length;
  result.pass = result.failed === 0;
  await fs.writeFile(path.join(folder, 'results.json'), JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
  await browser.close();
  progress(8, result.pass ? 'PASS' : 'FAIL');
  console.log(`${result.pass ? 'PASS' : 'FAIL'} ${result.checks.length - result.failed}/${result.checks.length}; SHA256=${result.blueprintSha256}; output=${folder}/results.json`);
  if (!result.pass) process.exitCode = 1;
}
