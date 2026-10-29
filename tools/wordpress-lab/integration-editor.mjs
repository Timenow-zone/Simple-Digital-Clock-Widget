import fs from 'node:fs/promises';
import path from 'node:path';
import { launchLabBrowser, openEditor } from './browser-helpers.mjs';

const [stage, theme, mode, label = 'gap-closure-921'] = process.argv.slice(2);
if (![stage, theme, mode, label].every(value => /^[a-z0-9-]+$/.test(value || ''))) throw new Error('Invalid integration case');
const folder = path.resolve('.local/wordpress-lab', label, 'integrations');
const target = path.join(folder, `editor-${stage}-${theme}-${mode}.json`);
await fs.access(target).then(() => { throw new Error('Evidence exists'); }, error => { if (error.code !== 'ENOENT') throw error; });
const seeds = JSON.parse(await fs.readFile(path.join(folder, 'seeds.json'), 'utf8'));
const accounts = JSON.parse(await fs.readFile(path.join(folder, 'accounts.json'), 'utf8'));
const url = 'http://127.0.0.1:19532';
if (Object.values(seeds.posts).some(post => new URL(post.url).origin !== url)) throw new Error('Wrong lab');
const browser = await launchLabBrowser('chromium');
const result = { stage, theme, mode, checks: [], posts: [], errors: [] };
const cacheControl = JSON.parse(await fs.readFile(path.join(folder, 'core-widget-cache-control-v3.json'), 'utf8'));
if (cacheControl.clockPluginActive !== false || !cacheControl.beforeObserved || !cacheControl.stale || !cacheControl.freshAfterManualPurge) throw new Error('Unconfirmed Core cache policy');
const check = (name, passed, details) => result.checks.push({ name, passed: !!passed, ...(passed ? {} : { details }) });
// Warm real anonymous cache entries before testing save invalidation.
for (const post of Object.values(seeds.posts)) for (let i = 0; i < 2; i++) { const response = await fetch(post.url); if (!response.ok) throw new Error('Cannot warm the integration post'); await response.text(); }
try {
  for (const role of ['administrator', 'author', 'filtered']) {
    const post = seeds.posts[role === 'author' ? 'author' : 'administrator'];
    const context = await browser.newContext({ timezoneId: 'America/New_York' });
    context.on('page', page => page.on('pageerror', error => result.errors.push(error.message)));
    try {
      await context.route('**/*', route => new URL(route.request().url()).origin === url ? route.continue() : route.abort());
      const user = role === 'administrator' ? accounts : { username: accounts[role === 'author' ? 'author_username' : 'filtered_username'], password: accounts[role === 'author' ? 'author_password' : 'filtered_password'] };
      const page = await openEditor(context, { url, post_id: post.id }, user);
      const marker = `Cache marker: ${stage}-${theme}-${mode}-${role}`;
      const saved = await page.evaluate(async ({ post, role, owner, marker }) => {
        const name = 'simple-digital-clock-block/widget-block';
        const inspect = content => {
          const blocks = wp.blocks.parse(content); const template = document.createElement('template'); template.innerHTML = content;
          return { valid: blocks.every(block => block.isValid), attrs: blocks.filter(block => block.name === name).map(block => block.attributes), dom: [...template.content.querySelectorAll('timenow-zone-sdcw')].map(node => Object.fromEntries([...node.attributes].map(attr => [attr.name, attr.value]))) };
        };
        const me = await wp.apiFetch({ path: '/wp/v2/users/me?context=edit' }); if (me.id !== owner) throw new Error('Wrong actor');
        const before = await wp.apiFetch({ path: `/wp/v2/posts/${post.id}?context=edit` });
        await wp.apiFetch({ path: `/wp/v2/posts/${post.id}`, method: 'POST', data: { title: `Clock integration ${role}` } });
        const titled = await wp.apiFetch({ path: `/wp/v2/posts/${post.id}?context=edit` });
        const blocks = wp.blocks.parse(titled.content.raw); blocks.find(block => block.name === 'core/paragraph').attributes.content = marker;
        await wp.apiFetch({ path: `/wp/v2/posts/${post.id}`, method: 'POST', data: { content: wp.blocks.serialize(blocks) } });
        const full = await wp.apiFetch({ path: `/wp/v2/posts/${post.id}?context=edit` });
        await wp.apiFetch({ path: `/wp/v2/posts/${post.id}`, method: 'POST', data: { content: full.content.raw } });
        const repeated = await wp.apiFetch({ path: `/wp/v2/posts/${post.id}?context=edit` });
        return { before: inspect(before.content.raw), title: inspect(titled.content.raw), full: inspect(full.content.raw), repeated: inspect(repeated.content.raw), stable: full.content.raw === repeated.content.raw, content: repeated.content.raw };
      }, { post, role, owner: seeds.users[role], marker });
      for (const step of ['title', 'full', 'repeated']) check(`${role}/${step}: all seven old clock settings and markup retained`, JSON.stringify(saved.before) === JSON.stringify(saved[step]), saved[step]);
      check(`${role}: repeated save is stable`, saved.stable);
      const anonymous = await fetch(post.url); const body = await anonymous.text();
      check(`${role}: changed content reaches anonymous visitors without a manual cache purge`, anonymous.ok && body.includes(marker));
      if (role === 'filtered') {
        if (['cached', 'both'].includes(mode)) {
          const warm = [];
          for (let attempt = 0; attempt < 5; attempt++) {
            const response = await fetch(seeds.posts.administrator.url);
            const body = await response.text();
            warm.push({ status: response.status, hit: response.headers.get('x-wp-super-cache'), currentPost: body.includes(marker) });
            if (response.ok && warm.at(-1).hit?.includes('Served') && warm.at(-1).currentPost) break;
          }
          result.widgetCacheWarm = warm;
          check('Widget save starts with a confirmed current page-cache HIT', warm.at(-1).status === 200 && warm.at(-1).hit?.includes('Served') && warm.at(-1).currentPost, warm);
        }
        const widget = await page.evaluate(async ({ widget, marker }) => {
          const before = await wp.apiFetch({ path: `/wp/v2/widgets/${widget.id}?context=edit` });
          const blocks = wp.blocks.parse(before.instance.raw.content);
          const original = blocks.filter(block => block.name === 'simple-digital-clock-block/widget-block').map(block => block.attributes);
          blocks.find(block => block.name === 'core/paragraph').attributes.content = marker;
          await wp.apiFetch({ path: `/wp/v2/widgets/${widget.id}`, method: 'POST', data: { instance: { raw: { content: wp.blocks.serialize(blocks) } } } });
          const after = await wp.apiFetch({ path: `/wp/v2/widgets/${widget.id}?context=edit` });
          const parsed = wp.blocks.parse(after.instance.raw.content);
          return { original, actual: parsed.filter(block => block.name === 'simple-digital-clock-block/widget-block').map(block => block.attributes), valid: parsed.every(block => block.isValid), sidebar: after.sidebar };
        }, { widget: seeds.widget, marker });
        check('Filtered administrator retains widget settings and its sidebar', widget.valid && widget.sidebar === 'sdcw-integration' && JSON.stringify(widget.original) === JSON.stringify(widget.actual), widget);
        const response = await fetch(seeds.posts.administrator.url); const body = await response.text();
        const aside = body.slice(body.indexOf('<aside id="sdcw-integration-widget">'));
        if (['cached', 'both'].includes(mode)) {
          result.widgetCache = { hit: response.headers.get('x-wp-super-cache'), stale: !aside.includes(marker), marker, requiresManualPurge: !aside.includes(marker) };
          check('Widget response is fresh or follows the confirmed Core cache policy', response.ok && (!result.widgetCache.stale || result.widgetCache.hit?.includes('Served')), result.widgetCache);
        } else check('Changed block widget reaches anonymous visitors', response.ok && aside.includes(marker));
      }
      result.posts.push({ role, id: post.id, marker, ...saved });
    } finally { await context.close(); }
  }
  check('No uncaught browser errors', result.errors.length === 0, result.errors);
} catch (error) { result.error = error.stack; check('Editor scenario completes', false, error.stack); }
finally { await browser.close(); }
result.failed = result.checks.filter(check => !check.passed).length;
await fs.writeFile(target, JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
console.log(`Editor ${theme}/${mode}: ${result.checks.length - result.failed}/${result.checks.length}`);
if (result.failed) process.exitCode = 1;
