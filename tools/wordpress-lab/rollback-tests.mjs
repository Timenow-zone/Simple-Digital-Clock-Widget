import fs from 'node:fs/promises';
import path from 'node:path';
import { loadLab, openEditor, launchLabBrowser } from './browser-helpers.mjs';

const [mode, label, engine = 'chromium'] = process.argv.slice(2);
if (!['seed', 'write', 'read'].includes(mode) || !/^[a-z0-9-]+$/.test(label || '') || !['chromium', 'firefox', 'webkit'].includes(engine)) {
  throw new Error('Usage: rollback-tests.mjs seed|write|read label [chromium|firefox|webkit]');
}
const { output, sites, credentials } = await loadLab();
const directory = path.join(output, 'rollback');
await fs.mkdir(directory, { recursive: true });
const author = JSON.parse(await fs.readFile(path.join(output, 'patch-author.json'), 'utf8'));
const fixtures = JSON.parse(await fs.readFile('tools/wordpress-lab/fixtures/1.1.1.json', 'utf8'));
const browser = await launchLabBrowser(engine);
const results = [];
const name = 'simple-digital-clock-block/widget-block';
const started = Date.now();

try {
  if (mode === 'seed' || mode === 'write') {
    const snapshot = path.join(directory, `${label}-${mode === 'seed' ? 'seed' : 'posts'}.json`);
    try { await fs.access(snapshot); throw new Error('Refusing to overwrite rollback evidence'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    const seeds = mode === 'write' ? JSON.parse(await fs.readFile(path.join(directory, `${label}-seed.json`), 'utf8')) : null;
    for (const [index, site] of sites.entries()) {
      console.log(`[${index + 1}/4] Save rollback records: ${site.service}`);
      const row = { service: site.service, posts: [] };
      for (const [role, user] of [['administrator', credentials], ['author', author]]) {
        const context = await browser.newContext({ timezoneId: mode === 'seed' ? 'UTC' : 'America/New_York' });
        try {
          const asAuthor = role === 'author' && mode === 'write';
          const page = await openEditor(context, { ...site, post_id: asAuthor ? author.post_ids[site.service] : site.post_id }, asAuthor ? user : credentials);
          const authorId = mode === 'seed' ? await page.evaluate(async id => (await wp.apiFetch({ path: `/wp/v2/posts/${id}?context=edit` })).author, author.post_ids[site.service]) : null;
          for (const fixture of [...fixtures.blocks, { ...fixtures.blocks[0], name: 'nested-default', nested: true }]) {
            const original = seeds?.find(row => row.service === site.service).posts.find(post => post.role === role && post.fixture === fixture.name);
            if (mode === 'write' && !original) throw new Error('Missing original post ID');
            row.posts.push(await page.evaluate(async ({ name, fixture, role, mode, authorId, original }) => {
              const block = wp.blocks.parse(fixture.content)[0];
              if (!block.isValid) throw new Error('Legacy fixture is invalid before saving: ' + fixture.name);
              const blocks = fixture.nested ? [wp.blocks.createBlock('core/group', {}, [block])] : [block];
              const serialized = wp.blocks.serialize(blocks);
              const payload = { title: 'Clock rollback: ' + role + ' / ' + fixture.name, content: serialized, status: 'publish' };
              if (mode === 'seed' && role === 'author') payload.author = authorId;
              if (mode === 'write') {
                payload.id = original.id;
                const before = await wp.apiFetch({ path: `/wp/v2/posts/${original.id}?context=edit` });
                if (before.content.raw !== original.savedContent) throw new Error('Original record changed before upgrade test');
              }
              const post = await wp.data.dispatch('core').saveEntityRecord('postType', 'post', payload);
              if (!post?.id) throw new Error('No saved post ID');
              if (mode === 'write' && post.id !== original.id) throw new Error('Update created a different post ID');
              const saved = await wp.apiFetch({ path: `/wp/v2/posts/${post.id}?context=edit` });
              const template = document.createElement('template');
              template.innerHTML = fixture.html;
              return { role, fixture: fixture.name, id: post.id, ...(original ? { updatedExistingId: original.id } : {}), savedContent: saved.content.raw, expectedHtml: template.innerHTML, expectedAttributes: fixture.attributes };
            }, { name, fixture, role, mode, authorId, original }));
          }
        } finally { await context.close(); }
      }
      results.push(row);
      console.log(`${row.posts.length} records saved; elapsed=${((Date.now() - started) / 1000).toFixed(1)}s`);
    }
    await fs.writeFile(snapshot, JSON.stringify(results, null, 2) + '\n');
  } else {
    const snapshot = JSON.parse(await fs.readFile(path.join(directory, `${label}-posts.json`), 'utf8'));
    for (const [index, site] of sites.entries()) {
      const row = { service: site.service, checks: [] };
      const check = (name, passed, details) => row.checks.push({ name, passed: !!passed, ...(passed ? {} : { details }) });
      console.log(`[${index + 1}/4] Read saved records with installed version: ${site.service} / ${engine}`);
      for (const timezone of ['America/New_York', 'Asia/Tokyo']) {
        const context = await browser.newContext({ timezoneId: timezone });
        try {
          const page = await openEditor(context, site, credentials);
          const records = snapshot.find(row => row.service === site.service).posts;
          const data = await page.evaluate(async ({ records, name }) => {
            const result = [];
            const leaves = blocks => blocks.flatMap(block => block.name === name ? [block] : leaves(block.innerBlocks));
            const normalize = html => { const template = document.createElement('template'); template.innerHTML = html; return template.innerHTML; };
            for (const record of records) {
              const saved = await wp.apiFetch({ path: `/wp/v2/posts/${record.id}?context=edit` });
              const parsed = wp.blocks.parse(saved.content.raw);
              const clocks = leaves(parsed);
              result.push({ id: record.id, unchanged: saved.content.raw === record.savedContent, valid: clocks.length === 1 && clocks[0].isValid, attributes: clocks[0]?.attributes, html: clocks[0] ? normalize(wp.blocks.getSaveContent(name, clocks[0].attributes)) : '', expectedHtml: normalize(record.expectedHtml) });
            }
            return result;
          }, { records, name });
          for (const record of records) {
            const actual = data.find(row => row.id === record.id);
            const prefix = `${timezone}/${record.role}/${record.fixture}`;
            check(prefix + ': database unchanged by version replacement', actual.unchanged, actual);
            check(prefix + ': block valid', actual.valid, actual);
            check(prefix + ': all rendered settings unchanged', actual.html === actual.expectedHtml, actual);
            check(prefix + ': timezone and caption unchanged', actual.attributes?.timeZone === record.expectedAttributes.timeZone && actual.attributes?.caption === record.expectedAttributes.caption, actual);
          }
          if (timezone === 'America/New_York') {
            for (const role of ['administrator', 'author']) {
              const record = records.find(record => record.role === role && record.fixture === 'all-options');
              await page.goto(`${site.url}/wp-admin/post.php?post=${record.id}&action=edit`);
              await page.waitForFunction(id => window.wp?.data?.select('core/editor')?.getCurrentPostId() === id && wp.data.select('core/block-editor').getBlocks().length > 0, record.id);
              const valid = await page.evaluate(() => wp.data.select('core/block-editor').getBlocks()[0].isValid);
              check(role + ': actual old editor opens resaved post', valid);
              const front = await context.newPage();
              try {
                await front.goto(`${site.url}/?p=${record.id}`);
                await front.waitForFunction(() => !!document.querySelector('timenow-zone-sdcw')?.shadowRoot);
                const caption = await front.locator('timenow-zone-sdcw').evaluate(element => element.shadowRoot.textContent);
                check(role + ': frontend caption retained after rollback', caption.includes(record.expectedAttributes.caption), caption);
              } finally { await front.close(); }
            }
          }
        } finally { await context.close(); }
      }
      row.failed = row.checks.filter(check => !check.passed).length;
      results.push(row);
      console.log(`${site.service}: ${row.checks.length - row.failed}/${row.checks.length} passed; failed=${row.failed}`);
      await fs.writeFile(path.join(directory, `${label}-${engine}-read.json`), JSON.stringify(results, null, 2) + '\n');
    }
    if (results.some(row => row.failed)) process.exitCode = 1;
  }
} finally { await browser.close(); }
console.log(`Completed ${mode}: ${label}; elapsed=${((Date.now() - started) / 1000).toFixed(1)}s; output=${directory}`);
