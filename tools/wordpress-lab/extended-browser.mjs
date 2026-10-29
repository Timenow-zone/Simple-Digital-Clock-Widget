import fs from 'node:fs/promises';
import path from 'node:path';
import { openEditor, launchLabBrowser, clockState } from './browser-helpers.mjs';

const [mode, phase, engine = 'chromium', profile = 'extended'] = process.argv.slice(2);
if (!['seed', 'save', 'read'].includes(mode) || !/^[a-z0-9-]+$/.test(phase || '') || (mode === 'seed' && engine !== 'chromium') || !['extended', 'localwp'].includes(profile)) throw new Error('Invalid extended review arguments');
const configuration = path.resolve('.local/wordpress-lab/review5-compat');
const directory = profile === 'localwp' ? path.resolve('.local/wordpress-lab/widget-fallback-fix-green/local-browser') : configuration;
await fs.mkdir(directory, { recursive: true });
const target = path.join(directory, `browser-${phase}-${engine}.json`);
await fs.access(target).then(() => { throw new Error('Refusing to overwrite extended evidence'); }, error => { if (error.code !== 'ENOENT') throw error; });
const sites = profile === 'localwp' ? [JSON.parse(await fs.readFile(path.resolve('.local/wordpress-lab/widget-fallback-fix-green/local-site.json'), 'utf8'))] : JSON.parse(await fs.readFile(path.join(configuration, 'sites.json'), 'utf8'));
const accounts = JSON.parse(await fs.readFile(path.join(configuration, 'credentials.json'), 'utf8'));
if (profile === 'localwp') {
  if (sites.length !== 1 || sites[0].key !== 'localwp' || sites[0].site_id !== 'ujo3kaSGV' || sites[0].url !== 'http://localhost:10003') throw new Error('Refusing a non-lab Local site');
} else if (sites.length !== 5 || new Set(sites.map(site => site.key)).size !== 5 || sites.some(site => !/^http:\/\/127\.0\.0\.1:195(28|29|30|31)(\/clock-child\/)?$/.test(site.url))) throw new Error('Refusing a non-lab target');
const original = mode === 'seed' ? null : JSON.parse(await fs.readFile(path.join(directory, 'posts-seed.json'), 'utf8'));
const fixtures = JSON.parse(await fs.readFile(path.resolve('.local/wordpress-lab/packages/regression-fixtures.json'), 'utf8'));
const base = JSON.parse(await fs.readFile(path.resolve('.local/wordpress-lab/numeric-fix/caption-seeds.json'), 'utf8'));
const captions = base[0].records[0].expected.map(block => block.caption);
if (captions.length !== 96 || fixtures.blocks.length !== 7) throw new Error('Unexpected native fixture counts');
const browser = await launchLabBrowser(engine);
const results = [];
const started = Date.now();
try {
  for (const [index, inputSite] of sites.entries()) {
    const site = { ...inputSite, url: inputSite.url.replace(/\/$/, '') };
    const roles = site.multisite ? ['superadmin', 'siteadmin', 'editor', 'author'] : ['administrator', 'editor', 'author'];
    const row = { key: site.key, service: site.service, wordpress: site.wordpress, php: site.php, records: [] };
    for (const role of roles) {
      const loginKey = ({ superadmin: 'username', administrator: 'username', siteadmin: 'site_admin_username', editor: 'editor_username', author: 'author_username' })[role];
      const passwordKey = ({ username: 'password', site_admin_username: 'site_admin_password', editor_username: 'editor_password', author_username: 'author_password' })[loginKey];
      const user = mode === 'seed' ? { username: accounts.username, password: accounts.password } : { username: accounts[loginKey], password: accounts[passwordKey] };
      const seed = original?.find(row => row.key === site.key).records.find(record => record.role === role);
      const context = await browser.newContext({ timezoneId: mode === 'seed' ? 'UTC' : 'America/New_York' });
      try {
        const page = await openEditor(context, { ...site, post_id: seed?.id || site.post_id }, user);
        const record = await page.evaluate(async ({ mode, captions, legacy, role, owner, seed }) => {
          const name = 'simple-digital-clock-block/widget-block';
          const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, canonical(v)])) : value;
          const inspect = content => {
            const nodes = document.createElement('template'); nodes.innerHTML = content;
            const elements = [...nodes.content.querySelectorAll('timenow-zone-sdcw')];
            return wp.blocks.parse(content).filter(block => block.name === name).map((block, i) => ({ valid: block.isValid, attrs: canonical(block.attributes), dom: canonical(Object.fromEntries([...elements[i].attributes].map(attribute => [attribute.name, attribute.value]))) }));
          };
          if (mode === 'seed') {
            const content = '<!-- wp:paragraph --><p>Adjacent &amp; preserved</p><!-- /wp:paragraph -->\n\n' + wp.blocks.serialize(captions.map(caption => wp.blocks.createBlock(name, { caption, timeZone: 'UTC' }))) + '\n\n' + legacy.map(fixture => fixture.content).join('\n\n');
            const expected = inspect(content);
            if (expected.length !== 103 || expected.some(block => !block.valid)) throw new Error('Invalid official 1.1.1 fixture');
            const created = await wp.apiFetch({ path: '/wp/v2/posts', method: 'POST', data: { title: `Extended review ${role}`, content, status: 'publish', author: owner } });
            const post = await wp.apiFetch({ path: `/wp/v2/posts/${created.id}?context=edit` });
            if (post.content.raw !== content) throw new Error('Unfiltered baseline changed content');
            return { id: post.id, role, original: content, expected, content };
          }
          const me = await wp.apiFetch({ path: '/wp/v2/users/me?context=edit' });
          if (me.id !== owner) throw new Error('Wrong test account');
          const before = await wp.apiFetch({ path: `/wp/v2/posts/${seed.id}?context=edit` });
          if (mode === 'save') await wp.apiFetch({ path: `/wp/v2/posts/${seed.id}`, method: 'POST', data: { title: `Extended updated ${role}` } });
          const titled = await wp.apiFetch({ path: `/wp/v2/posts/${seed.id}?context=edit` });
          if (mode === 'save') await wp.apiFetch({ path: `/wp/v2/posts/${seed.id}`, method: 'POST', data: { content: wp.blocks.serialize(wp.blocks.parse(titled.content.raw)) } });
          const full = await wp.apiFetch({ path: `/wp/v2/posts/${seed.id}?context=edit` });
          if (mode === 'save') await wp.apiFetch({ path: `/wp/v2/posts/${seed.id}`, method: 'POST', data: { content: full.content.raw } });
          const repeated = await wp.apiFetch({ path: `/wp/v2/posts/${seed.id}?context=edit` });
          const stages = { title: inspect(titled.content.raw), full: inspect(full.content.raw), repeated: inspect(repeated.content.raw) };
          const failures = [];
          for (const [stage, actual] of Object.entries(stages)) {
            if (actual.length !== seed.expected.length) failures.push({ stage, reason: 'clock count', actual: actual.length });
            for (const [i, expected] of seed.expected.entries()) if (!actual[i]?.valid || JSON.stringify(actual[i].attrs) !== JSON.stringify(expected.attrs) || JSON.stringify(actual[i].dom) !== JSON.stringify(expected.dom)) failures.push({ stage, index: i, expected, actual: actual[i] });
          }
          if (full.content.raw !== repeated.content.raw) failures.push({ reason: 'repeated content changed' });
          if (mode === 'read' && before.content.raw !== repeated.content.raw) failures.push({ reason: 'read changed content' });
          return { id: seed.id, role, content: repeated.content.raw, failures, clocks: stages.full.length };
        }, { mode, captions, legacy: fixtures.blocks, role, owner: site.users[loginKey], seed });
        if (mode !== 'seed') {
          await page.goto(`${site.url}/wp-admin/post.php?post=${record.id}&action=edit`, { waitUntil: 'domcontentloaded' });
          await page.waitForFunction(id => wp.data.select('core/editor').getCurrentPostId() === id && wp.data.select('core/block-editor').getBlocks().length === 104, record.id);
          record.editor = await page.evaluate(() => ({ valid: wp.data.select('core/block-editor').getBlocks().every(block => block.isValid), dirty: wp.data.select('core/editor').isEditedPostDirty() }));
          await page.goto(`${site.url}/?p=${record.id}`, { waitUntil: 'domcontentloaded' });
          await page.waitForFunction(() => customElements.get('timenow-zone-sdcw') && [...document.querySelectorAll('timenow-zone-sdcw')].every(element => element.shadowRoot));
          record.frontend = await clockState(page);
          if (!record.editor.valid || record.editor.dirty || !record.frontend?.shadow || record.frontend.rect.width <= 0) record.failures.push({ reason: 'editor/frontend integration', editor: record.editor, frontend: record.frontend });
        }
        row.records.push(record);
      } finally { await context.close(); }
    }
    results.push(row);
    await fs.writeFile(target, JSON.stringify(results, null, 2) + '\n');
    console.log(`[${index + 1}/${sites.length}] ${site.key}/${engine}: roles=${row.records.length}; failures=${row.records.reduce((n, record) => n + (record.failures?.length || 0), 0)}; elapsed=${((Date.now() - started) / 1000).toFixed(1)}s`);
  }
  if (mode === 'seed') await fs.writeFile(path.join(directory, 'posts-seed.json'), JSON.stringify(results, null, 2) + '\n');
  if (results.some(row => row.records.some(record => record.failures?.length))) process.exitCode = 1;
} finally { await browser.close(); }
console.log('Output: ' + target);
