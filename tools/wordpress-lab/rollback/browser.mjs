import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const [directory, phase] = process.argv.slice(2);
assert(['legacy', 'update', 'rollback', 'reupdate'].includes(phase));
const sites = JSON.parse(await readFile(path.join(directory, 'sites.json'), 'utf8'));
const credentials = JSON.parse(await readFile(path.join(directory, 'credentials.json'), 'utf8'));
const statePath = path.join(directory, 'writer-records.json');
const records = phase === 'legacy' ? {} : JSON.parse(await readFile(statePath, 'utf8'));
const results = [];
const name = 'simple-digital-clock-block/widget-block';
const captions = ['Plain caption', 'Terminal\\', 'Terminal\\\\', 'Terminal\\\\\\', '&copy;\\',
  '&amp;copy;\\', 'Literal \\u0022 \\u2028\\', 'Quotes " Київ 🕒\\', '&NotEqualTilde;\\',
  '&#128338;\\', '<!-- wp:paragraph --> literal\\'];
const settings = { width: 180, rounded: 7, timeZone: 'UTC', locale: 'uk', fontFamily: 'Arial',
  period: true, second: true, date: true, hundredths: false, border: true, shadow: 'shadow-md',
  backgroundColor: '#123456', className: 'rollback-custom-class', lock: { move: true, remove: true } };
const browser = await chromium.launch({ headless: true });
const start = Date.now();
try {
  for (const [siteName, site] of Object.entries(sites)) {
    assert.match(site.url, /^http:\/\/127\.0\.0\.1:\d+$/);
    records[siteName] ||= {};
    for (const role of ['admin', 'editor', 'author']) {
      const context = await browser.newContext({ timezoneId: 'UTC' });
      try {
        await context.route('**/*', route => new URL(route.request().url()).origin === site.url ? route.continue() : route.abort());
        const page = await context.newPage();
        await page.goto(site.url + '/wp-login.php');
        await page.locator('#user_login').fill('lab_' + role);
        await page.locator('#user_pass').fill(credentials[role]);
        await Promise.all([page.waitForURL('**/wp-admin/**'), page.locator('#wp-submit').click()]);
        const open = async id => {
          await page.goto(site.url + (id ? `/wp-admin/post.php?post=${id}&action=edit` : '/wp-admin/post-new.php'), { waitUntil: 'domcontentloaded' });
          await page.waitForFunction(blockName => window.wp?.blocks?.getBlockType(blockName) && wp.data.select('core/editor')?.getCurrentPostId() > 0, name);
          if (id) await page.waitForFunction(() => wp.data.select('core/block-editor').getBlocks().length > 0);
        };
        const save = async () => {
          await page.evaluate(async () => { await wp.data.dispatch('core/editor').savePost(); });
          await page.waitForFunction(() => !wp.data.select('core/editor').isSavingPost());
          assert(await page.evaluate(() => wp.data.select('core/editor').didPostSaveRequestSucceed()), 'Native editor save succeeded');
          return await page.evaluate(async () => {
            const id = wp.data.select('core/editor').getCurrentPostId();
            const post = await wp.apiFetch({ path: `/wp/v2/posts/${id}?context=edit` });
            return { id, content: post.content.raw };
          });
        };
        const inspect = async (record, expected, strict = true) => {
          const observed = await page.evaluate(({ content, name }) => wp.blocks.parse(content).filter(b => b.name === name).map(b => ({ valid: b.isValid, attributes: b.attributes })), { content: record.content, name });
          const checks = observed.map((block, i) => ({ valid: block.valid,
            exact: Object.entries(expected[i] || {}).every(([key, value]) => JSON.stringify(block.attributes[key]) === JSON.stringify(value)), attributes: block.attributes }));
          if (strict) {
            assert.equal(observed.length, expected.length, 'All clock blocks retained');
            for (const [i, check] of checks.entries()) assert(check.valid && check.exact, `${phase}/${siteName}/${role}/${i}: ${JSON.stringify({ expected: expected[i], actual: check })}`);
          }
          return { checks, passed: observed.length === expected.length && checks.every(c => c.valid && c.exact) };
        };
        const create = async (values, label) => {
          await open();
          const expected = values.map(caption => ({ ...settings, caption }));
          const incoming = await page.evaluate(({ name, expected, title }) => {
            const blocks = expected.map(a => wp.blocks.createBlock(name, a));
            for (const [i, block] of blocks.entries()) {
              for (const [key, value] of Object.entries(expected[i])) {
                if (JSON.stringify(block.attributes[key]) !== JSON.stringify(value)) {
                  throw new Error(`Fixture violates the actual block schema: ${key}`);
                }
              }
            }
            wp.data.dispatch('core/block-editor').resetBlocks(blocks);
            wp.data.dispatch('core/editor').editPost({ title, status: 'draft' });
            return wp.blocks.serialize(blocks);
          }, { name, expected, title: 'Rollback contract ' + role + ' ' + label });
          const saved = await save();
          return { ...saved, expected, incoming };
        };
        const row = { phase, site: siteName, role, checks: [] };
        if (phase === 'legacy') {
          const baseline = await create(['Legacy plain', 'Literal &copy;', 'Quoted " Київ'], 'valid baseline');
          row.baseline = await inspect(baseline, baseline.expected);
          records[siteName][role] = { baseline };
          const negative = await create(captions, 'original writer negative control');
          row.negative = { ...negative, ...await inspect(negative, negative.expected, false) };
          if (siteName === 'minimum') assert.equal(row.negative.passed, false, 'Original writer must reproduce the defect');
        } else {
          const roleRecords = records[siteName][role];
          if (phase === 'update') roleRecords.fixed = await create(captions, 'fixed corpus');
          for (const kind of ['baseline', 'fixed']) {
            const record = roleRecords[kind];
            await open(record.id);
            const before = await page.evaluate(async id => (await wp.apiFetch({ path: `/wp/v2/posts/${id}?context=edit` })).content.raw, record.id);
            await inspect({ content: before }, record.expected);
            const editor = await page.evaluate(() => ({ valid: wp.data.select('core/block-editor').getBlocks().every(b => b.isValid), dirty: wp.data.select('core/editor').isEditedPostDirty() }));
            assert(editor.valid && !editor.dirty, 'Reopened editor valid and clean');
            await page.evaluate(title => wp.data.dispatch('core/editor').editPost({ title }), `Rollback contract ${role} ${kind} ${phase}`);
            const titleSave = await save();
            await inspect(titleSave, record.expected);
            // Real attribute edits force native serialization on every transition.
            await page.evaluate(() => {
              const first = wp.data.select('core/block-editor').getBlocks()[0];
              wp.data.dispatch('core/block-editor').updateBlockAttributes(first.clientId, { width: 181 });
            });
            const edited = await save();
            await inspect(edited, record.expected.map((a, i) => i ? a : { ...a, width: 181 }));
            await page.evaluate(() => {
              const first = wp.data.select('core/block-editor').getBlocks()[0];
              wp.data.dispatch('core/block-editor').updateBlockAttributes(first.clientId, { width: 180 });
            });
            const final = await save();
            const inspected = await inspect(final, record.expected);
            await open(record.id);
            assert(await page.evaluate(() => wp.data.select('core/block-editor').getBlocks().every(b => b.isValid)), 'Saved blocks reopen valid');
            row.checks.push({ kind, id: record.id, clocks: record.expected.length, titleSave, edited, final, ...inspected });
          }
        }
        results.push(row);
        await writeFile(statePath, JSON.stringify(records, null, 2) + '\n');
        await writeFile(path.join(directory, `writer-${phase}.json`), JSON.stringify(results, null, 2) + '\n');
        console.log(`[${results.length}/6] ${phase}/${siteName}/${role}: PASS; elapsed=${((Date.now()-start)/1000).toFixed(1)}s; ETA=${((Date.now()-start)/1000/results.length*(6-results.length)).toFixed(1)}s`);
      } finally { await context.close(); }
    }
  }
} finally {
  await browser.close();
  await writeFile(path.join(directory, `writer-${phase}.json`), JSON.stringify(results, null, 2) + '\n');
}
console.log(`PASS: phase=${phase}; roles/environments=${results.length}; output=${directory}`);
