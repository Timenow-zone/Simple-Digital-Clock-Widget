import fs from 'node:fs/promises';
import path from 'node:path';
import { launchLabBrowser, openEditor, loadBetaProfile } from './browser-helpers.mjs';

const [engine, profile, label = 'ui-fixed', expectation = 'fixed'] = process.argv.slice(2);
if (!/^[a-z0-9-]+$/.test(label) || !['fixed', 'broken'].includes(expectation)) throw new Error('Invalid UI acceptance arguments');
const { site } = await loadBetaProfile(profile);
const folder = path.resolve('.local/wordpress-lab/wp72-beta');
const target = path.join(folder, `${label}-${profile}-${engine}.json`);
await fs.access(target).then(() => { throw new Error('Evidence exists'); }, error => { if (error.code !== 'ENOENT') throw error; });
const accounts = JSON.parse(await fs.readFile(path.join(folder, 'accounts.json'), 'utf8'))[profile];
const fixtures = JSON.parse(await fs.readFile('tools/wordpress-lab/fixtures/1.1.1.json', 'utf8')).blocks;
const fixture = fixtures.find(fixture => fixture.name === 'all-options');
if (!fixture) throw new Error('Missing immutable official fixture');
const result = { engine, profile, checks: [], errors: [], teardownErrors: [] };
const check = (name, passed, details) => result.checks.push({ name, passed: !!passed, ...(passed ? {} : { details }) });
const browser = await launchLabBrowser(engine);
try {
  const adminContext = await browser.newContext();
  let id;
  try {
    const page = await openEditor(adminContext, site, accounts.administrator);
    id = await page.evaluate(async ({ content, owner }) => {
      const post = await wp.apiFetch({ path: '/wp/v2/posts', method: 'POST', data: { title: 'Beta actual UI save control', status: 'publish', author: owner, content } });
      return post.id;
    }, { content: fixture.content, owner: site.users.author.id });
  } finally { await adminContext.close(); }
  const context = await browser.newContext({ timezoneId: 'America/New_York' });
  let closing = false;
  context.on('page', page => page.on('pageerror', error => (closing ? result.teardownErrors : result.errors).push(error.message)));
  try {
    const page = await openEditor(context, { ...site, post_id: id }, accounts.author);
    const guide = page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true });
    if (await guide.count() === 1) await guide.click();
    const state = () => page.evaluate(async id => {
      const post = await wp.apiFetch({ path: `/wp/v2/posts/${id}?context=edit` });
      const blocks = wp.blocks.parse(post.content.raw);
      return { content: post.content.raw, caption: blocks[0].attributes.caption, valid: blocks.every(block => block.isValid), dirty: wp.data.select('core/editor').isEditedPostDirty() };
    }, id);
    result.before = await state();
    check('Official stored fixture opens valid and clean on 1.1.2', result.before.valid && !result.before.dirty && result.before.content === fixture.content);
    await page.evaluate(() => wp.data.dispatch('core/editor').editPost({ title: 'Beta actual UI title-only change' }));
    await page.waitForFunction(() => wp.data.select('core/editor').isEditedPostDirty());
    const response = page.waitForResponse(response => response.request().method() === 'POST' && decodeURIComponent(response.url()).includes(`/wp/v2/posts/${id}`));
    await page.getByRole('button', { name: /^(Save|Update)$/, exact: true }).click();
    check('Real Gutenberg Save succeeds', (await response).ok());
    await page.waitForFunction(() => !wp.data.select('core/editor').isSavingPost() && !wp.data.select('core/editor').isEditedPostDirty());
    result.afterSave = await state();
    await page.waitForLoadState('networkidle');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(id => wp.data.select('core/editor').getCurrentPostId() === id && wp.data.select('core/block-editor').getBlocks().length === 1, id);
    result.afterReload = await state();
    if (expectation === 'broken') {
      // Negative control against the retained prior ZIP only.
      check('Beta defect reproduced: title-only UI save changes caption JSON', result.afterSave.caption !== result.before.caption);
      check('Beta defect reproduced: old clock becomes invalid after reload', !result.afterReload.valid);
    } else {
      check('Title-only UI save retains exact caption JSON', result.afterSave.caption === result.before.caption);
      check('Old clock remains valid and clean after reload', result.afterReload.valid && !result.afterReload.dirty);
    }
    check('No uncaught runtime errors', result.errors.length === 0, result.errors);
    result.post_id = id;
    await page.screenshot({ path: path.join(folder, `${label}-${profile}-${engine}.png`), fullPage: true });
  } finally { closing = true; await context.close(); }
} catch (error) { result.error = error.stack; check('Diagnostic completes', false, error.stack); }
finally { await browser.close(); }
result.failed = result.checks.filter(check => !check.passed).length;
await fs.writeFile(target, JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
console.log(`${profile}/${engine}/${expectation}: ${result.checks.length - result.failed}/${result.checks.length}`);
if (result.failed) process.exitCode = 1;
