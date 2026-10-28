import fs from 'node:fs/promises';
import path from 'node:path';
import { launchLabBrowser, openEditor } from './browser-helpers.mjs';

const [phase, engine = 'chromium', run = 'v2', mode = 'ui'] = process.argv.slice(2);
if (!['published', 'candidate'].includes(phase) || !['chromium', 'webkit'].includes(engine)) throw new Error('Invalid LocalWP recheck arguments');
if (!/^[a-z0-9-]+$/.test(run)) throw new Error('Invalid evidence suffix');
if (!['ui', 'read'].includes(mode) || (mode === 'read' && phase !== 'candidate')) throw new Error('Unsupported recheck mode');
const output = path.resolve('.local/wordpress-lab/published-localwp-recheck');
const prefix = `${phase}-${engine}-${run}${mode === 'read' ? '-read' : ''}`;
const target = path.join(output, `${prefix}.json`);
await fs.access(target).then(() => { throw new Error('Refusing to overwrite evidence'); }, error => { if (error.code !== 'ENOENT') throw error; });
const info = JSON.parse(await fs.readFile(path.join(output, 'site-info.json'), 'utf8'));
if (info.id !== 'ujo3kaSGV' || info.url !== 'http://localhost:10003') throw new Error('Refusing a non-lab LocalWP site');
const records = JSON.parse(await fs.readFile(path.join(output, `${phase}-posts-${run}.json`), 'utf8'));
const credentials = JSON.parse(await fs.readFile('.local/wordpress-lab/review5-compat/credentials.json', 'utf8'));
const blockName = 'simple-digital-clock-block/widget-block';
const caption = 'LocalWP Київ & <clock> "quoted"';
const browser = await launchLabBrowser(engine);
const results = { phase, engine, mode, site: info.url, started: new Date().toISOString(), records: [], assertions: [] };
const started = Date.now();
const check = (name, passed, details) => results.assertions.push({ name, passed: !!passed, ...(passed ? {} : { details }) });
const saveEvidence = () => fs.writeFile(target, JSON.stringify(results, null, 2) + '\n');

async function editor(context, record, user) {
  const page = await openEditor(context, { url: info.url, post_id: record.id }, user);
  const close = page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true });
  if (await close.count()) await close.click();
  await page.getByRole('button', { name: 'Block Inserter', exact: true }).waitFor();
  return page;
}

async function inspect(page, id) {
  return page.evaluate(async ({ id, blockName }) => {
    const post = await wp.apiFetch({ path: `/wp/v2/posts/${id}?context=edit` });
    const block = wp.data.select('core/block-editor').getBlocks().find(item => item.name === blockName);
    return { content: post.content.raw, status: post.status, valid: block?.isValid, attrs: block?.attributes, dirty: wp.data.select('core/editor').isEditedPostDirty(), hasClock: post.content.raw.includes('<timenow-zone-sdcw') };
  }, { id, blockName });
}

async function publish(page) {
  await page.getByRole('button', { name: 'Publish', exact: true }).first().click();
  await page.getByRole('button', { name: 'Publish', exact: true }).last().click();
  await page.waitForFunction(() => !wp.data.select('core/editor').isSavingPost() && wp.data.select('core/editor').getCurrentPost().status === 'publish' && wp.data.select('core/editor').didPostSaveRequestSucceed());
}

async function frontend(context, id) {
  const page = await context.newPage();
  try {
    const response = await page.goto(`${info.url}/?p=${id}`, { waitUntil: 'domcontentloaded' });
    const exists = await page.locator('timenow-zone-sdcw').count();
    if (!exists) return { status: response.status(), clocks: 0 };
    await page.waitForFunction(() => document.querySelector('timenow-zone-sdcw')?.shadowRoot?.textContent?.match(/\d{1,2}:\d{2}/));
    const read = () => page.locator('timenow-zone-sdcw').first().evaluate(element => ({
      attributes: Object.fromEntries([...element.attributes].map(attribute => [attribute.name, attribute.value])),
      text: element.shadowRoot.textContent,
      visibleText: element.shadowRoot.innerText ?? element.shadowRoot.textContent,
      width: element.getBoundingClientRect().width,
      height: element.getBoundingClientRect().height,
      injectedElement: !!element.shadowRoot.querySelector('clock'),
    }));
    const before = await read();
    // Sampling a ticking clock requires elapsed time rather than a network event.
    await page.waitForTimeout(1200);
    return { status: response.status(), clocks: exists, before, after: await read() };
  } finally { await page.close(); }
}

async function reopenTimezone(record, timezoneId, expected) {
  const context = await browser.newContext({ timezoneId, viewport: { width: 1440, height: 1000 } });
  try {
    const page = await editor(context, record, credentials);
    const state = await inspect(page, record.id);
    if (!expected) await page.frameLocator('iframe[name="editor-canvas"]').getByText('Block contains unexpected or invalid content.', { exact: true }).waitFor();
    const warning = (await Promise.all(page.frames().map(frame => frame.getByText('Block contains unexpected or invalid content.', { exact: true }).count()))).reduce((sum, count) => sum + count, 0);
    await page.screenshot({ path: path.join(output, `${prefix}-${record.case}-${timezoneId.replaceAll('/', '-')}.png`) });
    check(`${record.case}/${timezoneId}: validation matches expectation`, state.valid === expected, state);
    check(`${record.case}/${timezoneId}: warning matches validation`, !!warning === !expected, { warning, valid: state.valid });
    check(`${record.case}/${timezoneId}: opening does not dirty post`, !state.dirty, state.dirty);
    return { timezoneId, warning, ...state };
  } finally { await context.close(); }
}

try {
  if (mode === 'read') {
    const saved = JSON.parse(await fs.readFile(path.join(output, `candidate-chromium-${run}.json`), 'utf8'));
    for (const [index, record] of records.entries()) {
      const role = record.case.split('-')[0];
      const user = role === 'admin' ? credentials : { username: credentials[`${role}_username`], password: credentials[`${role}_password`] };
      const context = await browser.newContext({ timezoneId: 'Asia/Tokyo', viewport: { width: 1440, height: 1000 } });
      try {
        const page = await editor(context, record, user);
        const state = await inspect(page, record.id);
        const expected = saved.records.find(row => row.id === record.id).final;
        const front = await frontend(context, record.id);
        check(`${record.case}: saved content and complete settings match Chromium`, state.valid && !state.dirty && state.content === expected.content && JSON.stringify(state.attrs) === JSON.stringify(expected.attrs), state);
        check(`${record.case}: frontend renders unchanged in second engine`, front.status === 200 && front.clocks === 1 && front.before.width > 0 && front.before.text.includes(caption + ' updated') && front.before.attributes['time-zone'] === expected.attrs.timeZone, front);
        results.records.push({ ...record, ...state, frontend: front });
        console.log(`[${index + 1}/${records.length}] ${phase}/${engine}/${record.case}: read in Asia/Tokyo; elapsed=${((Date.now() - started) / 1000).toFixed(1)}s`);
      } finally { await context.close(); }
    }
  } else {
  for (const [index, record] of records.entries()) {
    const role = record.case.split('-')[0];
    const user = role === 'admin' ? credentials : { username: credentials[`${role}_username`], password: credentials[`${role}_password`] };
    const timezoneId = record.case === 'admin-new-york' ? 'America/New_York' : 'UTC';
    const context = await browser.newContext({ timezoneId, viewport: { width: 1440, height: 1000 } });
    const row = { ...record, timezoneId, pageErrors: [], restErrors: [] };
    context.on('page', page => {
      page.on('pageerror', error => row.pageErrors.push(error.message));
      page.on('response', response => { if (response.url().includes('/wp-json/') && response.status() >= 400) row.restErrors.push({ url: response.url(), status: response.status() }); });
    });
    try {
      const page = await editor(context, record, user);
      const before = await inspect(page, record.id);
      if (before.content !== '') throw new Error('Refusing to replace non-empty test draft');
      const me = await page.evaluate(() => wp.apiFetch({ path: '/wp/v2/users/me?context=edit' }));
      if (me.id !== record.owner) throw new Error('Wrong test account');
      await page.getByRole('button', { name: 'Block Inserter', exact: true }).click();
      await page.getByRole('searchbox', { name: 'Search', exact: true }).fill('clock');
      await page.locator('.block-editor-block-types-list__item').filter({ hasText: 'Simple Digital Clock' }).click();
      await page.waitForFunction(name => wp.data.select('core/block-editor').getBlocks().some(item => item.name === name), blockName);
      const closeInserter = page.getByRole('button', { name: 'Close Block Inserter', exact: true });
      if (await closeInserter.count()) await closeInserter.click();
      await page.getByRole('button', { name: 'Container', exact: true }).click();
      await page.getByRole('textbox', { name: 'Caption', exact: true }).fill(caption);
      if (record.case.endsWith('-options')) {
        const zone = page.getByRole('combobox', { name: 'Time Zone', exact: true });
        await zone.fill('Europe/Kyiv');
        await page.getByRole('option', { name: 'Europe/Kyiv', exact: true }).click();
        const locale = page.getByRole('combobox', { name: 'Locale', exact: true });
        await locale.fill('Українська');
        await page.getByRole('option', { name: 'Українська', exact: true }).click();
        await page.getByRole('checkbox', { name: '24-Hour', exact: true }).uncheck();
        await page.getByRole('checkbox', { name: 'Second', exact: true }).check();
        await page.getByRole('checkbox', { name: 'Hundredths of a second', exact: true }).check();
        await page.getByRole('checkbox', { name: 'Date', exact: true }).check();
      }
      row.inserted = await page.evaluate(name => {
        const block = wp.data.select('core/block-editor').getBlocks().find(item => item.name === name);
        return { valid: block.isValid, attrs: block.attributes, serialized: wp.blocks.serialize([block]) };
      }, blockName);
      // The public menu labels Europe/Kyiv and stores the IANA alias Europe/Kiev.
      const expectedZone = record.case.endsWith('-options') ? 'Europe/Kiev' : timezoneId;
      check(`${record.case}: UI insertion is valid with expected timezone`, row.inserted.valid && row.inserted.attrs.timeZone === expectedZone, row.inserted);
      if (record.case.endsWith('-options')) check(`${record.case}: UI settings applied`, row.inserted.attrs.locale === 'uk' && row.inserted.attrs.period === false && row.inserted.attrs.second && row.inserted.attrs.hundredths && row.inserted.attrs.date && row.inserted.attrs.caption === caption, row.inserted.attrs);
      await publish(page);
      row.saved = await inspect(page, record.id);
      check(`${record.case}: normal publish succeeds`, row.saved.status === 'publish', row.saved.status);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForFunction(id => wp.data.select('core/editor').getCurrentPostId() === id && wp.data.select('core/block-editor').getBlocks().length > 0, record.id);
      row.reopened = await inspect(page, record.id);
      const shouldRetain = phase === 'candidate' || role !== 'author';
      check(`${record.case}: saved clock matches expected KSES behavior`, row.reopened.hasClock === shouldRetain, row.reopened);
      check(`${record.case}: validity matches expected KSES behavior`, row.reopened.valid === shouldRetain, row.reopened);
      check(`${record.case}: reopening does not dirty post`, !row.reopened.dirty, row.reopened.dirty);
      await page.screenshot({ path: path.join(output, `${prefix}-${record.case}-reopened.png`) });
      row.frontend = await frontend(context, record.id);
      check(`${record.case}: frontend HTTP 200`, row.frontend.status === 200, row.frontend);
      check(`${record.case}: frontend clock count matches save`, row.frontend.clocks === (shouldRetain ? 1 : 0), row.frontend);
      if (shouldRetain) {
        check(`${record.case}: visible clock and caption render`, row.frontend.before.width > 0 && row.frontend.before.height > 0 && row.frontend.before.text.includes(caption) && !row.frontend.before.injectedElement, row.frontend);
        check(`${record.case}: stored timezone renders on frontend`, row.frontend.before.attributes['time-zone'] === expectedZone, row.frontend.before.attributes);
        if (record.case.endsWith('-options')) check(`${record.case}: seconds advance`, row.frontend.before.text !== row.frontend.after.text, row.frontend);
        // A second UI edit forces the normal content-save path again.
        const frame = page.frames().find(frame => frame.name() === 'editor-canvas') ?? page.mainFrame();
        await frame.locator('[data-type="simple-digital-clock-block/widget-block"]').click();
        const container = page.getByRole('button', { name: 'Container', exact: true });
        if (await page.getByRole('textbox', { name: 'Caption', exact: true }).count() === 0) await container.click();
        await page.getByRole('textbox', { name: 'Caption', exact: true }).fill(caption + ' updated');
        await page.getByRole('button', { name: 'Save', exact: true }).click();
        await page.waitForFunction(() => !wp.data.select('core/editor').isSavingPost() && !wp.data.select('core/editor').isEditedPostDirty() && wp.data.select('core/editor').didPostSaveRequestSucceed());
        row.resaved = await inspect(page, record.id);
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForFunction(id => wp.data.select('core/editor').getCurrentPostId() === id && wp.data.select('core/block-editor').getBlocks().length > 0, record.id);
        row.final = await inspect(page, record.id);
        check(`${record.case}: UI edit/save/reopen preserves block and options`, row.final.valid && row.final.hasClock && JSON.stringify(row.final.attrs) === JSON.stringify({ ...row.inserted.attrs, caption: caption + ' updated' }) && !row.final.dirty, row.final);
      }
      check(`${record.case}: no uncaught browser exceptions`, row.pageErrors.length === 0, row.pageErrors);
      row.expectedCoreRoleProbes = row.restErrors.filter(item => role === 'author' && item.status === 403 && /^\/wp-json\/wp\/v2\/(tags|categories)$/.test(new URL(item.url).pathname) && new URL(item.url).searchParams.get('context') === 'edit');
      check(`${record.case}: no unexpected failed REST requests`, row.restErrors.length === row.expectedCoreRoleProbes.length, row.restErrors);
    } catch (error) {
      row.error = error.stack;
      check(`${record.case}: scenario completes`, false, error.stack);
    } finally { await context.close(); }
    results.records.push(row);
    await saveEvidence();
    console.log(`[${index + 1}/${records.length}] ${phase}/${engine}/${record.case}; elapsed=${((Date.now() - started) / 1000).toFixed(1)}s; assertion failures=${results.assertions.filter(item => !item.passed).length}`);
  }
  }
  const utc = records.find(record => record.case === 'admin-default');
  const ny = records.find(record => record.case === 'admin-new-york');
  results.timezone = [await reopenTimezone(utc, 'America/New_York', phase === 'candidate'), await reopenTimezone(ny, 'Asia/Tokyo', phase === 'candidate')];
  if (phase === 'candidate') {
    const original = JSON.parse(await fs.readFile(path.join(output, `published-posts-${run}.json`), 'utf8')).find(record => record.case === 'admin-default');
    results.oldPublishedPost = await reopenTimezone(original, 'America/New_York', true);
    const baseline = JSON.parse(await fs.readFile(path.join(output, `published-chromium-${run}.json`), 'utf8')).records.find(record => record.case === 'admin-default');
    check('Existing 1.1.1 post opens valid in another timezone without changing its stored content', results.oldPublishedPost.content === baseline.final.content, results.oldPublishedPost);
  }
} catch (error) {
  results.error = error.stack;
  check('Complete LocalWP recheck finishes', false, error.stack);
} finally {
  results.elapsedSeconds = (Date.now() - started) / 1000;
  results.failed = results.assertions.filter(item => !item.passed).length;
  await saveEvidence();
  await browser.close();
}
console.log(`Completed: ${results.assertions.length - results.failed}/${results.assertions.length} expected-behavior assertions; output=${target}`);
if (results.failed) process.exitCode = 1;
