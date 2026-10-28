import fs from 'node:fs/promises';
import path from 'node:path';
import { launchLabBrowser, openEditor, loadBetaProfile, waitForLabEditor } from './browser-helpers.mjs';

const [mode, label, engine = 'chromium', profile = 'localwp', sourceLabel = label] = process.argv.slice(2);
if (!['test', 'read'].includes(mode) || !/^[a-z0-9-]+$/.test(label || '') || !/^[a-z0-9-]+$/.test(sourceLabel || '') || !['localwp', 'wp70', 'ms85-child', 'beta83', 'beta85'].includes(profile)) throw new Error('Invalid locale test arguments');
const beta = ['beta83', 'beta85'].includes(profile) ? await loadBetaProfile(profile) : null;
const out = path.resolve(beta ? '.local/wordpress-lab/wp72-beta' : '.local/wordpress-lab/locale-fix');
await fs.mkdir(out, { recursive: true });
const target = path.join(out, `${label}-${profile}-${engine}.json`);
await fs.access(target).then(() => { throw new Error('Refusing to overwrite Locale evidence'); }, error => { if (error.code !== 'ENOENT') throw error; });
const config = path.resolve('.local/wordpress-lab/review5-compat');
const accounts = beta?.accounts ?? JSON.parse(await fs.readFile(path.join(config, 'credentials.json'), 'utf8'));
const site = beta?.site ?? (profile === 'localwp' ? JSON.parse(await fs.readFile('.local/wordpress-lab/widget-fallback-final/local-site.json', 'utf8')) : JSON.parse(await fs.readFile(path.join(config, 'sites.json'), 'utf8')).find(row => row.key === profile));
const allowed = { localwp: 'http://localhost:10003', wp70: 'http://127.0.0.1:19528', 'ms85-child': 'http://127.0.0.1:19531/clock-child/', beta83: 'http://127.0.0.1:19533', beta85: 'http://127.0.0.1:19534' };
if (!site || site.url !== allowed[profile]) throw new Error('Refusing a non-lab site');
site.url = site.url.replace(/\/$/, '');
const name = 'simple-digital-clock-block/widget-block';
const result = { mode, label, engine, profile, started: new Date().toISOString(), checks: [], records: [], errors: [], teardownErrors: [] };
const check = (name, passed, details) => result.checks.push({ name, passed: !!passed, ...(passed ? {} : { details }) });
const started = Date.now();
const browser = await launchLabBrowser(engine);
const closingPages = new WeakSet();

async function settle(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}
async function activate(locator) {
  await locator.click();
}
async function state(page) {
  return page.evaluate(name => {
    const blocks = wp.data.select('core/block-editor').getBlocks().filter(block => block.name === name);
    return blocks.map(block => ({ id: block.clientId, valid: block.isValid, attrs: block.attributes }));
  }, name);
}
async function load(page, id) {
  const next = await page.context().newPage();
  await next.goto(`${site.url}/wp-admin/post.php?post=${id}&action=edit`, { waitUntil: 'load' });
  await waitForLabEditor(next, id);
  closingPages.add(page);
  await page.close();
  const guide = next.getByRole('dialog').getByRole('button', { name: 'Close', exact: true });
  if (await guide.count()) await guide.click();
  return next;
}
async function insert(page) {
  await settle(page);
  const guide = page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true });
  if (await guide.count()) await guide.click();
  const count = (await state(page)).length;
  await activate(page.getByRole('button', { name: /^(Block Inserter|Toggle block inserter)$/i }));
  await page.getByRole('searchbox', { name: /Search/i }).fill('clock');
  const option = page.getByRole('option', { name: 'Simple Digital Clock', exact: true });
  await option.focus();
  await option.press('Enter');
  await page.waitForFunction(({ name, count }) => wp.data.select('core/block-editor').getBlocks().filter(block => block.name === name).length === count + 1, { name, count });
  await activate(page.getByRole('button', { name: /^(Block Inserter|Toggle block inserter)$/i }));
  await page.getByRole('combobox', { name: 'Locale', exact: true }).waitFor();
}
async function frontend(context, id) {
  const page = await context.newPage();
  try {
    const response = await page.goto(`${site.url}/?p=${id}`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => {
      const root = document.querySelector('.wp-block-post-content, .entry-content');
      const clocks = root ? [...root.querySelectorAll('timenow-zone-sdcw')] : [];
      return clocks.length > 0 && clocks.every(element => element.shadowRoot?.querySelector('a')?.textContent.match(/\d/));
    });
    return { status: response.status(), clocks: await page.locator('.wp-block-post-content, .entry-content').first().locator('timenow-zone-sdcw').evaluateAll(elements => elements.map(element => ({ locale: element.getAttribute('locale'), caption: element.getAttribute('caption'), width: element.getBoundingClientRect().width, text: element.shadowRoot.querySelector('a').textContent }))) };
  } finally { closingPages.add(page); await page.close(); }
}
async function snapshot(page, id) {
  const raw = await page.evaluate(id => wp.apiFetch({ path: `/wp/v2/posts/${id}?context=edit` }).then(post => post.content.raw), id);
  return { content: raw, blocks: await state(page), dirty: await page.evaluate(() => wp.data.select('core/editor').isEditedPostDirty()) };
}

try {
  const source = mode === 'read' ? JSON.parse(await fs.readFile(path.join(out, `${sourceLabel}-${profile}-chromium.json`), 'utf8')) : null;
  let authorStarter;
  for (const role of ['administrator', 'author']) {
    const user = role === 'administrator' ? accounts : { username: accounts.author_username, password: accounts.author_password };
    const context = await browser.newContext({ timezoneId: mode === 'read' ? 'Asia/Tokyo' : 'UTC', viewport: { width: 1440, height: 1000 } });
    let closing = false;
    context.on('page', page => page.on('pageerror', error => (closing || closingPages.has(page) ? result.teardownErrors : result.errors).push(error.message)));
    let page;
    try {
      const starter = mode === 'read' ? source.records.find(record => record.role === role).id : role === 'author' ? authorStarter : site.post_id;
      page = await openEditor(context, { ...site, post_id: starter }, user);
      const guide = page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true });
      if (await guide.count()) await guide.click();
      if (mode === 'read') {
        const original = source.records.find(record => record.role === role);
        await page.waitForFunction(id => wp.data.select('core/editor').getCurrentPostId() === id && wp.data.select('core/block-editor').getBlocks().length > 0, original.id);
        const actual = await snapshot(page, original.id);
        const front = await frontend(context, original.id);
        check(`${role}: saved content remains unchanged`, actual.content === original.final.content, actual.content);
        check(`${role}: old saved locale values remain valid in another timezone`, actual.blocks.every(block => block.valid) && !actual.dirty && JSON.stringify(actual.blocks.map(block => block.attrs)) === JSON.stringify(original.final.blocks.map(block => block.attrs)), actual);
        check(`${role}: frontend retains all locale codes`, front.status === 200 && JSON.stringify(front.clocks.map(clock => clock.locale)) === JSON.stringify(original.expected), front);
        result.records.push({ role, id: original.id, final: actual, frontend: front });
      } else {
        if (role === 'administrator') authorStarter = await page.evaluate(async ({ label, owner }) => {
          const post = await wp.apiFetch({ path: '/wp/v2/posts', method: 'POST', data: { title: `Locale ${label} author starter`, status: 'draft', author: owner } });
          return post.id;
        }, { label, owner: site.users.author_username });
        const id = await page.evaluate(async ({ role, label }) => {
          const me = await wp.apiFetch({ path: '/wp/v2/users/me?context=edit' });
          const post = await wp.apiFetch({ path: '/wp/v2/posts', method: 'POST', data: { title: `Locale ${label} ${role}`, status: 'draft', author: me.id } });
          return post.id;
        }, { role, label });
        page = await load(page, id);
        await insert(page);
        const input = page.getByRole('combobox', { name: 'Locale', exact: true });
        const read = async () => (await state(page)).at(-1).attrs.locale;
        await input.fill('Українська');
        await page.getByRole('option', { name: 'Українська', exact: true }).click();
        check(`${role}: selecting a built-in language works`, await read() === 'uk', await read());
        await input.fill('uk-UA');
        await input.press('Enter');
        await page.getByRole('combobox', { name: 'Time Zone', exact: true }).focus();
        await settle(page);
        check(`${role}: Enter commits a custom BCP-47 code`, await read() === 'uk-UA', await read());
        check(`${role}: a custom code stays visible after blur`, await input.inputValue() === 'uk-UA', await input.inputValue());
        await input.fill('en-GB');
        await input.press('Tab');
        await settle(page);
        check(`${role}: Tab commits a custom code`, await read() === 'en-GB', await read());
        await input.fill(' uk_UA ');
        await page.getByRole('combobox', { name: 'Time Zone', exact: true }).click();
        await settle(page);
        check(`${role}: clicking outside normalizes whitespace and underscore`, await read() === 'uk-UA', await read());
        await input.fill('ua');
        await input.press('Enter');
        await page.getByRole('combobox', { name: 'Time Zone', exact: true }).focus();
        await settle(page);
        check(`${role}: legacy ua alias still normalizes to uk`, await read() === 'uk', await read());
        await input.fill('fr');
        await page.getByRole('option', { name: 'Français (Canada)', exact: true }).click();
        const previous = await read();
        check(`${role}: built-in selection still works after custom input`, previous === 'fr-ca', previous);
        await input.fill('en-US<script>');
        const imeAllowed = await input.evaluate(element => element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true, cancelable: true, isComposing: true })));
        check(`${role}: IME composition Enter is not intercepted`, imeAllowed);
        await input.press('Enter');
        await input.press('Tab');
        await settle(page);
        check(`${role}: invalid input does not replace the saved value`, await read() === previous, await read());
        check(`${role}: invalid input reports an explicit validation error`, await page.getByText('Invalid BCP-47 locale tag.', { exact: true }).count() > 0);
        await input.fill('ja-JP');
        await input.press('Escape');
        await input.press('Tab');
        await settle(page);
        check(`${role}: Escape cancels pending input`, await read() === previous, await read());
        const container = input.locator('xpath=ancestor::div[contains(@class,"components-combobox-control")][1]');
        const siteLocale = await page.evaluate(() => (blockData.locale || 'en-US').replace('_', '-'));
        await activate(container.getByRole('button', { name: 'Reset', exact: true }));
        await settle(page);
        check(`${role}: Reset restores the valid site default`, await read() === siteLocale, await read());
        await page.evaluate(() => {
          window.sdcwLocaleEvents = [];
          for (const type of ['mousedown', 'mouseup', 'click', 'focusin', 'focusout']) document.addEventListener(type, event => {
            window.sdcwLocaleEvents.push({ type, tag: event.target.tagName, role: event.target.getAttribute('role'), text: event.target.textContent?.slice(0, 70), value: event.target.value });
          }, true);
        });
        await activate(page.getByRole('button', { name: 'Auto language', exact: true }));
        await page.waitForFunction(expected => wp.data.select('core/block-editor').getBlocks().filter(block => block.name === 'simple-digital-clock-block/widget-block').at(-1).attributes.locale === expected, siteLocale, { timeout: 1500 }).catch(() => {});
        await settle(page);
        check(`${role}: Auto language still selects the site locale`, await read() === siteLocale, { actual: await read(), events: await page.evaluate(() => window.sdcwLocaleEvents) });
        await input.fill('%%');
        await input.press('Tab');
        const reset = container.getByRole('button', { name: 'Reset', exact: true });
        await reset.focus();
        await reset.press('Enter');
        await settle(page);
        check(`${role}: keyboard Reset remains usable after invalid input`, await read() === siteLocale, await read());
        const malformed = async () => {
          await page.evaluate(name => {
            const block = wp.data.select('core/block-editor').getBlocks().filter(block => block.name === name).at(-1);
            wp.data.dispatch('core/block-editor').updateBlockAttributes(block.clientId, { locale: '%%' });
          }, name);
          await settle(page);
        };
        await malformed();
        await input.fill('uk-UA');
        await input.press('Enter');
        await settle(page);
        check(`${role}: Enter repairs a pre-existing invalid locale with a custom code`, await read() === 'uk-UA', await read());
        await malformed();
        await input.fill('Français (Canada)');
        await input.press('Enter');
        await settle(page);
        check(`${role}: Enter repairs a pre-existing invalid locale from the list`, await read() === 'fr-ca', await read());
        await input.fill('fr-CA');
        await input.press('Enter');
        await page.getByRole('combobox', { name: 'Time Zone', exact: true }).focus();
        await settle(page);
        check(`${role}: final custom code is committed`, await read() === 'fr-CA', await read());
        const expected = ['fr-CA'];
        if (role === 'administrator') {
          await insert(page);
          await input.fill('ja-JP');
          await input.press('Tab');
          await settle(page);
          expected.push('ja-JP');
          check('Separate clocks keep independent locale controls', JSON.stringify((await state(page)).map(block => block.attrs.locale)) === JSON.stringify(expected), await state(page));
        }
        await activate(page.getByRole('button', { name: 'Publish', exact: true }).first());
        await activate(page.getByRole('button', { name: 'Publish', exact: true }).last());
        await page.waitForFunction(() => !wp.data.select('core/editor').isSavingPost() && wp.data.select('core/editor').getCurrentPost().status === 'publish' && wp.data.select('core/editor').didPostSaveRequestSucceed());
        page = await load(page, id);
        const first = await snapshot(page, id);
        check(`${role}: save/reopen retains all locale codes and valid blocks`, first.blocks.every(block => block.valid) && !first.dirty && JSON.stringify(first.blocks.map(block => block.attrs.locale)) === JSON.stringify(expected), first);
        const front = await frontend(context, id);
        check(`${role}: frontend renders every saved locale`, front.status === 200 && front.clocks.length === expected.length && JSON.stringify(front.clocks.map(clock => clock.locale)) === JSON.stringify(expected) && front.clocks.every(clock => clock.width > 0), front);
        // Exercise the normal save pipeline again without changing locale values.
        await page.evaluate(async id => {
          await wp.apiFetch({ path: `/wp/v2/posts/${id}`, method: 'POST', data: { content: wp.data.select('core/editor').getEditedPostContent() } });
        }, id);
        page = await load(page, id);
        const final = await snapshot(page, id);
        check(`${role}: repeated save is byte-stable`, final.content === first.content && final.blocks.every(block => block.valid), final);
        await page.screenshot({ path: path.join(out, `${label}-${profile}-${engine}-${role}.png`) });
        result.records.push({ role, id, expected, final, frontend: front });
      }
    } catch (error) {
      if (page) {
        await page.screenshot({ path: path.join(out, `${label}-${profile}-${engine}-${role}-error.png`) });
        result.debug = { role, url: page.url(), buttons: await page.getByRole('button').evaluateAll(elements => elements.map(element => ({ text: element.textContent, label: element.getAttribute('aria-label') }))), text: (await page.locator('body').innerText()).slice(0, 5000) };
      }
      throw error;
    } finally { closing = true; await context.close(); }
    await fs.writeFile(target, JSON.stringify(result, null, 2) + '\n');
    console.log(`[${result.records.length}/2] ${label}/${profile}/${engine}/${role}: elapsed=${((Date.now() - started) / 1000).toFixed(1)}s; failed=${result.checks.filter(check => !check.passed).length}`);
  }
  check('No uncaught browser exceptions', result.errors.length === 0, result.errors);
} catch (error) {
  result.error = error.stack;
  check('Locale scenario completes', false, error.stack);
} finally {
  result.failed = result.checks.filter(check => !check.passed).length;
  result.elapsedSeconds = (Date.now() - started) / 1000;
  await fs.writeFile(target, JSON.stringify(result, null, 2) + '\n');
  await browser.close();
}
console.log(`Completed: ${result.checks.length - result.failed}/${result.checks.length}; output=${target}`);
if (result.failed) process.exitCode = 1;
