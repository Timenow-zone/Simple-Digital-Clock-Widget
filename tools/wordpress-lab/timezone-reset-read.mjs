import fs from 'node:fs/promises';
import path from 'node:path';
import { launchLabBrowser, openEditor } from './browser-helpers.mjs';
import { freezeDate } from './visual-helpers.mjs';

const [stage, engine = 'chromium', profile = 'localwp', sourceStage = 'accepted1e5v2'] = process.argv.slice(2);
if (![stage, sourceStage].every(value => /^[a-z0-9-]+$/.test(value || '')) || !['localwp', 'wp70', 'ms85-child'].includes(profile)) throw new Error('Invalid arguments');
const folder = path.resolve('.local/wordpress-lab/gap-closure-921');
const target = path.join(folder, `reset-read-${stage}-${profile}-${engine}.json`);
await fs.access(target).then(() => { throw new Error('Evidence exists'); }, error => { if (error.code !== 'ENOENT') throw error; });
const source = JSON.parse(await fs.readFile(path.join(folder, `pointer-${sourceStage}-${profile}-${engine}.json`), 'utf8'));
if (source.failed || source.resetRecords.length !== 2) throw new Error('Unaccepted Reset fixtures');
const sites = JSON.parse(await fs.readFile(path.join(folder, 'sites.json'), 'utf8'));
const site = sites.find(site => site.key === profile);
const allowed = { localwp: 'http://localhost:10003', wp70: 'http://127.0.0.1:19528', 'ms85-child': 'http://127.0.0.1:19531/clock-child' };
if (site?.url !== allowed[profile]) throw new Error('Wrong lab');
const accounts = JSON.parse(await fs.readFile('.local/wordpress-lab/review5-compat/credentials.json', 'utf8'));
const browser = await launchLabBrowser(engine);
const result = { stage, engine, profile, sourceStage, checks: [], records: [], errors: [], errorDetails: [], requestFailures: [], teardownErrors: [] };
const check = (name, passed, details) => result.checks.push({ name, passed: !!passed, ...(passed ? {} : { details }) });
try {
  for (const record of source.resetRecords) {
    const context = await browser.newContext({ timezoneId: 'Asia/Tokyo' });
    let closing = false;
    context.on('requestfailed', request => result.requestFailures.push({ role: record.role, url: request.url(), failure: request.failure(), closing }));
    context.on('page', page => page.on('pageerror', error => {
      (closing ? result.teardownErrors : result.errors).push(error.message);
      result.errorDetails.push({ role: record.role, url: page.url(), stack: error.stack, closing });
    }));
    try {
      const user = record.role === 'administrator' ? accounts : { username: accounts.author_username, password: accounts.author_password };
      const editor = await openEditor(context, { ...site, post_id: record.id }, user);
      await editor.waitForFunction(id => wp.data.select('core/editor').getCurrentPostId() === id && wp.data.select('core/block-editor').getBlocks().length === 1, record.id);
      const actual = await editor.evaluate(async id => {
        const post = await wp.apiFetch({ path: `/wp/v2/posts/${id}?context=edit` });
        const block = wp.data.select('core/block-editor').getBlocks()[0];
        return { content: post.content.raw, valid: block.isValid, attrs: block.attributes, dirty: wp.data.select('core/editor').isEditedPostDirty() };
      }, record.id);
      check(`${record.role}: saved content stays byte-identical`, actual.content === record.content);
      check(`${record.role}: Reset opens valid with unchanged settings`, actual.valid && actual.attrs.timeZone === '' && JSON.stringify(actual.attrs) === JSON.stringify(record.attrs), actual.attrs);
      check(`${record.role}: opening does not dirty the editor`, !actual.dirty);
      const visitor = await context.newPage();
      await freezeDate(visitor, '2026-10-28T12:34:56.780Z');
      const response = await visitor.goto(`${site.url}/?p=${record.id}`, { waitUntil: 'load' });
      const selector = '.entry-content timenow-zone-sdcw, .wp-block-post-content timenow-zone-sdcw';
      await visitor.waitForFunction(selector => document.querySelector(selector)?.shadowRoot?.querySelector('a')?.textContent.match(/\p{N}/u), selector);
      const front = await visitor.locator(selector).first().evaluate(node => {
        const locale = node.getAttribute('locale');
        const options = { hour: 'numeric', minute: 'numeric', second: 'numeric' };
        return { text: node.shadowRoot.querySelector('a').textContent, timeZone: node.getAttribute('time-zone'), expected: new Date().toLocaleTimeString(locale, options), utc: new Date().toLocaleTimeString(locale, { ...options, timeZone: 'UTC' }) };
      });
      check(`${record.role}: frontend retains viewer-local timezone`, response.ok() && front.timeZone === null, front);
      check(`${record.role}: displayed time follows Tokyo rather than UTC`, front.text === front.expected && front.text !== front.utc, front);
      result.records.push({ role: record.role, id: record.id, actual, front });
    } finally { closing = true; await context.close(); }
  }
  check('No uncaught browser errors', result.errors.length === 0, result.errors);
} catch (error) { result.error = error.stack; check('Scenario completes', false, error.stack); }
finally { await browser.close(); }
result.failed = result.checks.filter(check => !check.passed).length;
await fs.writeFile(target, JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
console.log(`${stage}/${profile}/${engine}: ${result.checks.length - result.failed}/${result.checks.length}`);
if (result.failed) process.exitCode = 1;
