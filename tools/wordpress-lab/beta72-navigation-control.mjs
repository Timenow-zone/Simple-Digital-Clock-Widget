import fs from 'node:fs/promises';
import path from 'node:path';
import { launchLabBrowser, loadBetaProfile } from './browser-helpers.mjs';

const [profile] = process.argv.slice(2);
const { site, accounts } = await loadBetaProfile(profile);
const folder = path.resolve('.local/wordpress-lab/wp72-beta');
const target = path.join(folder, `core-navigation-${profile}.json`);
await fs.access(target).then(() => { throw new Error('Evidence exists'); }, error => { if (error.code !== 'ENOENT') throw error; });
const result = { profile, engine: 'webkit', plugin_disabled: false, core_saves: [], errors: [], teardownErrors: [], requestFailures: [] };
const browser = await launchLabBrowser('webkit');
const context = await browser.newContext();
let closing = false;
context.on('page', page => page.on('pageerror', error => (closing ? result.teardownErrors : result.errors).push({ url: page.url(), message: error.message, stack: error.stack })));
context.on('requestfailed', request => result.requestFailures.push({ url: request.url(), failure: request.failure(), closing }));
try {
  const page = await context.newPage();
  await page.goto(`${site.url}/wp-login.php`);
  await page.locator('#user_login').fill(accounts.username);
  await page.locator('#user_pass').fill(accounts.password);
  await Promise.all([page.waitForURL('**/wp-admin/**'), page.locator('#wp-submit').click()]);
  await page.goto(`${site.url}/wp-admin/post.php?post=${site.post_id}&action=edit`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.wp?.data?.select('core/editor')?.getCurrentPostId());
  result.plugin_disabled = await page.evaluate(() => !wp.blocks.getBlockType('simple-digital-clock-block/widget-block'));
  if (!result.plugin_disabled) throw new Error('Core control requires the clock plugin disabled');
  const ids = await page.evaluate(async () => {
    const ids = [];
    for (let i = 0; i < 3; i++) {
      const post = await wp.apiFetch({ path: '/wp/v2/posts', method: 'POST', data: { title: 'Beta Core Paragraph navigation control', status: 'publish', content: '<!-- wp:paragraph --><p>Core Paragraph only</p><!-- /wp:paragraph -->' } });
      ids.push(post.id);
    }
    return ids;
  });
  for (const id of ids) {
    await page.goto(`${site.url}/wp-admin/post.php?post=${id}&action=edit`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(id => wp.data.select('core/editor').getCurrentPostId() === id && wp.data.select('core/block-editor').getBlocks().length === 1, id);
    const saved = await page.evaluate(async id => {
      const post = await wp.apiFetch({ path: `/wp/v2/posts/${id}`, method: 'POST', data: { title: 'Beta Core title saved' } });
      return { id, valid: wp.blocks.parse(post.content.raw).every(block => block.isValid) };
    }, id);
    result.core_saves.push(saved);
    await page.goto(`${site.url}/?p=${id}`, { waitUntil: 'domcontentloaded' });
    await page.locator('.wp-block-post-content, .entry-content').first().waitFor();
  }
} catch (error) { result.error = error.stack; }
finally { closing = true; await context.close(); await browser.close(); }
await fs.writeFile(target, JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
console.log(`${profile}: Core saves=${result.core_saves.length}, clock disabled=${result.plugin_disabled}, navigation errors=${result.errors.length}`);
if (result.error || !result.plugin_disabled || result.core_saves.length !== 3 || result.core_saves.some(row => !row.valid)) process.exitCode = 1;
