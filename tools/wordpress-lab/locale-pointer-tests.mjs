import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { launchLabBrowser, openEditor, loadBetaProfile, waitForLabEditor } from './browser-helpers.mjs';

const [stage, engine = 'webkit', profile = 'localwp'] = process.argv.slice(2);
if (!/^[a-z0-9-]+$/.test(stage || '') || !['localwp', 'wp70', 'ms85-child', 'beta83', 'beta85'].includes(profile)) throw new Error('Invalid arguments');
const beta = ['beta83', 'beta85'].includes(profile) ? await loadBetaProfile(profile) : null;
const folder = path.resolve(beta ? '.local/wordpress-lab/wp72-beta' : '.local/wordpress-lab/gap-closure-921');
const target = path.join(folder, `pointer-${stage}-${profile}-${engine}.json`);
await fs.access(target).then(() => { throw new Error('Evidence already exists'); }, error => { if (error.code !== 'ENOENT') throw error; });
const config = path.resolve('.local/wordpress-lab/review5-compat');
const accounts = beta?.accounts ?? JSON.parse(await fs.readFile(path.join(config, 'credentials.json'), 'utf8'));
const site = beta?.site ?? (profile === 'localwp' ? JSON.parse(await fs.readFile('.local/wordpress-lab/widget-fallback-final/local-site.json', 'utf8')) : JSON.parse(await fs.readFile(path.join(config, 'sites.json'), 'utf8')).find(site => site.key === profile));
const allowed = { localwp: 'http://localhost:10003', wp70: 'http://127.0.0.1:19528', 'ms85-child': 'http://127.0.0.1:19531/clock-child/', beta83: 'http://127.0.0.1:19533', beta85: 'http://127.0.0.1:19534' };
if (site.url !== allowed[profile]) throw new Error('Wrong lab');
site.url = site.url.replace(/\/$/, '');
const name = 'simple-digital-clock-block/widget-block';
const browser = await launchLabBrowser(engine);
const result = { stage, engine, profile, checks: [], records: [], resetRecords: [], errors: [], teardownErrors: [] };
const closingPages = new WeakSet();
const legacySource = await fs.readFile('.local/wordpress-lab/baseline-source/simple-digital-clock/block.js', 'utf8');
const legacySha256 = createHash('sha256').update(legacySource).digest('hex');
if (legacySha256 !== '1ce3df3a6aa541f09b5bb34a8f27e41582b417f3a309154d1eea6645d78f5eda') throw new Error('Wrong rollback reader');
const check = (name, passed, details) => result.checks.push({ name, passed: !!passed, ...(passed ? {} : { details }) });
const settle = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const preview = async page => {
  for (const frame of page.frames()) {
    const element = frame.locator('[data-type="simple-digital-clock-block/widget-block"] timenow-zone-sdcw').first();
    if (await element.count() && await element.isVisible()) return element.evaluate(node => ({ text: node.shadowRoot?.querySelector('a')?.textContent || '', locale: node.getAttribute('locale') }));
  }
  return null;
};
try {
  let seeds;
  for (const role of ['administrator', 'author']) {
    const context = await browser.newContext({ timezoneId: 'UTC', viewport: { width: 1440, height: 1100 } });
    let closing = false;
    context.on('page', page => page.on('pageerror', error => (closing || closingPages.has(page) ? result.teardownErrors : result.errors).push(error.message)));
    try {
      const user = role === 'administrator' ? accounts : { username: accounts.author_username, password: accounts.author_password };
      let page = await openEditor(context, { ...site, post_id: role === 'administrator' ? site.post_id : seeds.author }, user);
      if (!seeds) seeds = await page.evaluate(async ({ name, owner, stage }) => {
        const content = wp.blocks.serialize([wp.blocks.createBlock(name, { locale: 'uk', timeZone: 'America/New_York' })]);
        const ids = {};
        for (const role of ['administrator', 'author']) ids[role] = (await wp.apiFetch({ path: '/wp/v2/posts', method: 'POST', data: { title: `Pointer ${stage} ${role}`, status: 'draft', content, ...(role === 'author' ? { author: owner } : {}) } })).id;
        return ids;
      }, { name, owner: site.users.author_username, stage });
      if (await page.evaluate(() => wp.data.select('core/editor').getCurrentPostId()) !== seeds[role]) {
        const previous = page;
        page = await context.newPage();
        await page.goto(`${site.url}/wp-admin/post.php?post=${seeds[role]}&action=edit`, { waitUntil: 'load' });
        await waitForLabEditor(page, seeds[role]);
        closingPages.add(previous);
        await previous.close();
      }
      await page.waitForFunction(id => wp.data.select('core/editor').getCurrentPostId() === id && wp.data.select('core/block-editor').getBlocks().length === 1, seeds[role]);
      const close = page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true });
      if (await close.count()) await close.click();
      await page.evaluate(() => wp.data.dispatch('core/block-editor').selectBlock(wp.data.select('core/block-editor').getBlocks()[0].clientId));
      const locale = page.getByRole('combobox', { name: 'Locale', exact: true });
      const zone = page.getByRole('combobox', { name: 'Time Zone', exact: true });
      const auto = page.getByRole('button', { name: 'Auto language', exact: true });
      const read = () => page.evaluate(() => wp.data.select('core/block-editor').getBlocks()[0].attributes);
      const siteLocale = await page.evaluate(() => (blockData.locale || 'en-US').replace('_', '-'));
      const selectCustom = async value => { await locale.fill(value); await locale.press('Enter'); await zone.click(); await settle(page); };
      await locale.click();
      await auto.click();
      await settle(page);
      check(`${role}: first mouse Auto applies site language with an open list`, (await read()).locale === siteLocale, await read());
      check(`${role}: Auto shows the applied language after blur`, await locale.inputValue() === siteLocale, await locale.inputValue());
      const dirty = await page.waitForFunction(() => wp.data.select('core/editor').isEditedPostDirty(), null, { timeout: 3000 }).then(() => true, () => false);
      check(`${role}: a locale-only action marks the existing draft dirty`, dirty);
      if (dirty) {
        const response = page.waitForResponse(response => response.request().method() === 'POST' && decodeURIComponent(response.url()).includes(`/wp/v2/posts/${seeds[role]}`));
        await page.getByRole('button', { name: 'Save draft', exact: true }).click();
        const saved = await response;
        const stored = await page.evaluate(async id => wp.apiFetch({ path: `/wp/v2/posts/${id}?context=edit` }).then(post => wp.blocks.parse(post.content.raw)[0]), seeds[role]);
        check(`${role}: actual Save draft persists a locale-only change`, saved.ok() && stored.isValid && stored.attributes.locale === siteLocale, stored.attributes);
      } else check(`${role}: actual Save draft persists a locale-only change`, false, 'No dirty draft to save');
      await selectCustom('fr-CA');
      const container = locale.locator('xpath=ancestor::div[contains(@class,"components-combobox-control")][1]');
      await container.getByRole('button', { name: 'Reset', exact: true }).click();
      await settle(page);
      check(`${role}: mouse Reset restores a valid site default`, (await read()).locale === siteLocale, await read());
      // Allow a complete clock tick so stale text cannot hide an Intl error.
      await page.waitForTimeout(1200);
      const resetPreview = await preview(page);
      check(`${role}: Reset keeps the live preview working`, !!resetPreview?.text.match(/\d/) && resetPreview.locale === siteLocale, resetPreview);
      await locale.fill('fr-CA');
      await auto.click();
      await settle(page);
      check(`${role}: Auto wins over pending custom input`, (await read()).locale === siteLocale, await read());
      await locale.fill('%%');
      await auto.click();
      await settle(page);
      check(`${role}: Auto clears a rejected search and restores the default`, (await read()).locale === siteLocale && !(await page.getByText('Invalid BCP-47 locale tag.', { exact: true }).count()), await read());
      await selectCustom('fr-CA');
      await container.getByRole('button', { name: 'Reset', exact: true }).focus();
      await container.getByRole('button', { name: 'Reset', exact: true }).press('Enter');
      await settle(page);
      check(`${role}: keyboard Reset restores a valid site default`, (await read()).locale === siteLocale, await read());
      await selectCustom('uk-UA');
      await auto.focus(); await auto.press('Enter'); await settle(page);
      check(`${role}: keyboard Auto still works`, (await read()).locale === siteLocale, await read());
      await locale.click();
      const zoneContainer = zone.locator('xpath=ancestor::div[contains(@class,"components-combobox-control")][1]');
      await zoneContainer.getByRole('button', { name: 'Reset', exact: true }).click();
      await settle(page);
      check(`${role}: timezone Reset works while the language list is open`, !(await read()).timeZone, await read());
      await page.waitForTimeout(1200);
      check(`${role}: timezone Reset keeps the live preview working`, !!(await preview(page))?.text.match(/\d/), await preview(page));
      check(`${role}: timezone Reset preserves the string attribute contract`, (await read()).timeZone === '', await read());
      const resetResponse = page.waitForResponse(response => response.request().method() === 'POST' && decodeURIComponent(response.url()).includes(`/wp/v2/posts/${seeds[role]}`));
      await page.getByRole('button', { name: 'Save draft', exact: true }).click();
      const resetSaved = await resetResponse;
      const resetRecord = await page.evaluate(async ({ id, stage }) => {
        const saved = await wp.apiFetch({ path: `/wp/v2/posts/${id}?context=edit` });
        const block = wp.blocks.parse(saved.content.raw)[0];
        const copy = await wp.apiFetch({ path: '/wp/v2/posts', method: 'POST', data: { title: `Timezone Reset rollback ${stage}`, content: saved.content.raw, status: 'publish' } });
        return { id: copy.id, content: saved.content.raw, valid: block.isValid, attrs: block.attributes };
      }, { id: seeds[role], stage });
      check(`${role}: actual Save draft stores a valid viewer-local timezone`, resetSaved.ok() && resetRecord.valid && resetRecord.attrs.timeZone === '', resetRecord.attrs);
      const legacyContext = await browser.newContext({ timezoneId: 'Asia/Tokyo' });
      let intercepted = 0;
      try {
        await legacyContext.route('**/wp-content/plugins/simple-digital-clock/block.js*', route => {
          intercepted++;
          return route.fulfill({ status: 200, contentType: 'application/javascript', body: legacySource });
        });
        const legacyPage = await openEditor(legacyContext, { ...site, post_id: resetRecord.id }, user);
        const legacy = await legacyPage.evaluate(content => {
          const block = wp.blocks.parse(content)[0];
          return { valid: block.isValid, attrs: block.attributes };
        }, resetRecord.content);
        check(`${role}: public 1.1.1 accepts the saved Reset in another timezone`, intercepted > 0 && legacy.valid && legacy.attrs.timeZone === '', { intercepted, legacy });
        result.resetRecords.push({ role, ...resetRecord, legacy, legacySha256 });
      } finally { await legacyContext.close(); }
      await zone.click();
      await page.getByRole('button', { name: 'Auto Timezone', exact: true }).click();
      await settle(page);
      check(`${role}: first mouse Auto Timezone works with an open list`, (await read()).timeZone === 'UTC', await read());
      const content = await page.evaluate(() => wp.data.select('core/editor').getEditedPostContent());
      await page.evaluate(async ({ id, content }) => wp.apiFetch({ path: `/wp/v2/posts/${id}`, method: 'POST', data: { content, status: 'publish' } }), { id: seeds[role], content });
      const after = await page.evaluate(async id => {
        const post = await wp.apiFetch({ path: `/wp/v2/posts/${id}?context=edit` });
        const block = wp.blocks.parse(post.content.raw)[0];
        return { content: post.content.raw, valid: block.isValid, attrs: block.attributes };
      }, seeds[role]);
      check(`${role}: save retains valid default language and timezone`, after.valid && after.attrs.locale === siteLocale && after.attrs.timeZone === 'UTC', after.attrs);
      result.records.push({ role, id: seeds[role], ...after });
      console.log(`${stage}/${profile}/${engine}/${role}: failed=${result.checks.filter(check => !check.passed).length}`);
    } finally { closing = true; await context.close(); }
  }
  check('No uncaught browser errors', result.errors.length === 0, result.errors);
} catch (error) { result.error = error.stack; check('Scenario completes', false, error.stack); }
finally { await browser.close(); }
result.failed = result.checks.filter(check => !check.passed).length;
await fs.writeFile(target, JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
console.log(`Result: ${result.checks.length - result.failed}/${result.checks.length}; ${target}`);
if (result.failed) process.exitCode = 1;
