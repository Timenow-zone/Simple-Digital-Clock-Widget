import fs from 'node:fs/promises';
import path from 'node:path';
import { launchLabBrowser, openEditor, loadBetaProfile } from './browser-helpers.mjs';
import { freezeDate, compareClockRenders } from './visual-helpers.mjs';

const [mode, stage, engine = 'chromium', profile = 'beta83', label = 'kses72-fix'] = process.argv.slice(2);
if (!['seed', 'baseline', 'save', 'check'].includes(mode) || !/^[a-z0-9-]+$/.test(stage) || !/^[a-z0-9-]+$/.test(label)) throw new Error('Invalid widget acceptance arguments');
const { site } = await loadBetaProfile(profile);
const folder = path.resolve('.local/wordpress-lab', label);
const accounts = JSON.parse(await fs.readFile('.local/wordpress-lab/wp72-beta/accounts.json', 'utf8'))[profile];
const user = JSON.parse(await fs.readFile(path.join(folder, 'widget-accounts.json'), 'utf8'))[profile];
const fixtures = JSON.parse(await fs.readFile('tools/wordpress-lab/fixtures/1.1.1.json', 'utf8')).blocks;
const target = path.join(folder, `filtered-widget-${stage}-${profile}-${engine}.json`);
await fs.access(target).then(() => { throw new Error('Evidence exists'); }, e => { if (e.code !== 'ENOENT') throw e; });
const seedPath = path.join(folder, `filtered-widget-seed-${profile}.json`);
let seed = mode === 'seed' ? null : JSON.parse(await fs.readFile(seedPath, 'utf8'));
const result = { mode, stage, engine, profile, checks: [], errors: [], teardownErrors: [] };
const check = (name, passed, details) => result.checks.push({ name, passed: !!passed, ...(passed ? {} : { details }) });
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, canonical(v)])) : value;
const browser = await launchLabBrowser(engine);
const context = await browser.newContext({ timezoneId: ['seed', 'baseline'].includes(mode) ? 'UTC' : 'America/New_York' });
const visualContext = await browser.newContext({ timezoneId: 'UTC' });
await visualContext.route('**/*', route => new URL(route.request().url()).origin === new URL(site.url).origin ? route.continue() : route.abort());
let closing = false;
context.on('page', page => page.on('pageerror', error => (closing ? result.teardownErrors : result.errors).push(error.message)));
visualContext.on('page', page => page.on('pageerror', error => (closing ? result.teardownErrors : result.errors).push(error.message)));
try {
  const page = await openEditor(context, { ...site, post_id: seed?.post_id || site.post_id }, mode === 'seed' || mode === 'baseline' ? accounts.administrator : user);
  if (mode === 'seed') {
    seed = await page.evaluate(async ({ fixtures, owner }) => {
      const input = fixtures.map(fixture => fixture.content).join('\n');
      const post = await wp.apiFetch({ path: '/wp/v2/posts', method: 'POST', data: { title: 'Filtered widget acceptance', status: 'publish', content: '<!-- wp:paragraph --><p>Widget frontend control</p><!-- /wp:paragraph -->', author: owner } });
      const widgets = [];
      for (const sidebar of ['sdcw-filtered', 'wp_inactive_widgets']) {
        const w = await wp.apiFetch({ path: '/wp/v2/widgets', method: 'POST', data: { id_base: 'block', sidebar, instance: { raw: { content: input } } } });
        widgets.push({ id: w.id, sidebar, content: w.instance.raw.content });
      }
      await wp.apiFetch({ path: '/wp/v2/sidebars/sdcw-filtered', method: 'POST', data: { widgets: [widgets[0].id] } });
      return { post_id: post.id, widgets };
    }, { fixtures, owner: user.id });
  }
  const inspected = await page.evaluate(async ({ widgets, mode }) => {
    const rows = [];
    for (const widget of widgets) {
      if (mode === 'save') {
        const content = wp.blocks.serialize(wp.blocks.parse(widget.content));
        for (let i = 0; i < 2; i++) await wp.apiFetch({ path: `/wp/v2/widgets/${widget.id}`, method: 'POST', data: { instance: { raw: { content } } } });
      }
      const w = await wp.apiFetch({ path: `/wp/v2/widgets/${widget.id}?context=edit` });
      const inspect = content => {
        const t = document.createElement('template'); t.innerHTML = content;
        const blocks = wp.blocks.parse(content);
        return { valid: blocks.every(block => block.isValid), attrs: blocks.map(block => block.attributes), dom: [...t.content.querySelectorAll('timenow-zone-sdcw')].map(node => Object.fromEntries([...node.attributes].map(a => [a.name, a.value]))) };
      };
      rows.push({ id: w.id, sidebar: w.sidebar, actual: inspect(w.instance.raw.content), expected: widget.expected || inspect(widget.content) });
    }
    const me = await wp.apiFetch({ path: '/wp/v2/users/me?context=edit' });
    return { rows, me: { id: me.id, capabilities: me.capabilities } };
  }, { widgets: seed.widgets, mode });
  if (mode === 'seed') {
    for (const widget of seed.widgets) widget.expected = inspected.rows.find(row => row.id === widget.id).expected;
    await fs.writeFile(seedPath, JSON.stringify(seed, null, 2), { flag: 'wx' });
  }
  if (['save', 'check'].includes(mode)) check('Real REST actor can edit widgets without unfiltered HTML', inspected.me.id === user.id && inspected.me.capabilities.edit_theme_options && !inspected.me.capabilities.unfiltered_html, inspected.me);
  for (const row of inspected.rows) {
    check(row.id + ': sidebar retained', row.sidebar === seed.widgets.find(w => w.id === row.id).sidebar);
    check(row.id + ': all seven blocks remain valid', row.actual.valid && row.actual.attrs.length === 7, row.actual);
    check(row.id + ': exact captions/settings and DOM retained', JSON.stringify(canonical(row.actual)) === JSON.stringify(canonical(row.expected)), row.actual);
  }
  const visitor = await visualContext.newPage();
  await freezeDate(visitor, '2026-10-28T12:34:56.780Z');
  const response = await visitor.goto(`${site.url}/?p=${seed.post_id}&sdcw_widget_acceptance=1`, { waitUntil: 'load' });
  await visitor.waitForFunction(() => {
    const clocks = [...document.querySelectorAll('#sdcw-filtered-widget timenow-zone-sdcw')];
    return clocks.length === 7 && clocks.every(c => c.shadowRoot?.querySelector('a')?.textContent.match(/\p{N}/u));
  });
  await visitor.evaluate(() => document.fonts.ready);
  result.clocks = await visitor.locator('#sdcw-filtered-widget timenow-zone-sdcw').evaluateAll(nodes => nodes.map(node => ({ attrs: Object.fromEntries([...node.attributes].map(a => [a.name, a.value])), width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height, text: node.shadowRoot.querySelector('a').textContent })));
  check('Actual dynamic_sidebar renders seven working clocks', response.ok());
  const reference = path.join(folder, `filtered-widget-baseline-${profile}-${engine}.json`);
  if (['seed', 'baseline'].includes(mode)) await fs.writeFile(reference, JSON.stringify(result.clocks), { flag: 'wx' });
  else {
    const before = JSON.parse(await fs.readFile(reference, 'utf8'));
    check('Frontend retains all seven clock attributes, time and geometry', compareClockRenders(before, result.clocks).equal);
  }
  check('No uncaught browser errors', result.errors.length === 0, result.errors);
  result.widgets = inspected.rows;
} catch (error) { result.error = error.stack; check('Widget acceptance completes', false, error.stack); }
finally { closing = true; await context.close(); await visualContext.close(); await browser.close(); }
result.failed = result.checks.filter(c => !c.passed).length;
await fs.writeFile(target, JSON.stringify(result, null, 2), { flag: 'wx' });
console.log(`${stage}/${profile}/${engine}: ${result.checks.length - result.failed}/${result.checks.length}`);
if (result.failed) process.exitCode = 1;
