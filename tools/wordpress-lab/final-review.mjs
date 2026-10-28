import fs from 'node:fs/promises';
import path from 'node:path';
import { loadLab, openEditor, launchLabBrowser } from './browser-helpers.mjs';

const [mode, label = 'final-review', engine = 'chromium'] = process.argv.slice(2);
if (!['seed', 'save', 'rollback', 'reupgrade'].includes(mode) || !/^[a-z0-9-]+$/.test(label) || !['chromium', 'firefox', 'webkit'].includes(engine) || (mode === 'seed' && engine !== 'chromium')) {
  throw new Error('Usage: final-review.mjs seed|save|rollback|reupgrade [label] [chromium|firefox|webkit]');
}
const { output, sites, credentials } = await loadLab();
const directory = path.join(output, label);
await fs.mkdir(directory, { recursive: true });
const snapshot = path.join(directory, 'browser-seed.json');
const suffix = engine === 'chromium' ? '' : `-${engine}`;
const resultPath = path.join(directory, `browser-${mode}${suffix}.json`);
try { await fs.access(resultPath); throw new Error('Refusing to overwrite final review evidence'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const author = JSON.parse(await fs.readFile(path.join(output, 'patch-author.json'), 'utf8'));
const siblingProbes = JSON.parse(await fs.readFile(path.join(directory, 'php.json'), 'utf8'))
  .map(row => ({ service: row.service, ...row.foreign_probe }));
const seeds = mode === 'seed' ? null : JSON.parse(await fs.readFile(snapshot, 'utf8'));
const readOnly = mode === 'rollback' || mode === 'reupgrade';
const readerVersion = mode === 'rollback' ? '1.1.1' : '1.1.2';
const saved = readOnly ? JSON.parse(await fs.readFile(path.join(directory, `browser-save${suffix}.json`), 'utf8')) : null;
const clockName = 'simple-digital-clock-block/widget-block';
const specs = [
  { name: 'normal', caption: 'Київ & <clock> "quoted"' },
  { name: 'literal-entities', caption: '&amp; &lt; &#34; &#x1F552;' },
  { name: 'mixed-entities', caption: '&lt; &#34; <clock>' },
  { name: 'zero', caption: '0' },
  { name: 'html5-apostrophe', caption: '&apos; <clock>' },
  { name: 'literal-html5-apostrophe', caption: '&amp;apos; <clock>' },
];
const browser = await launchLabBrowser(engine);
const results = [];
const started = Date.now();

async function registerProbe(page) {
  await page.evaluate(() => {
    const name = 'vendor/review';
    if (wp.blocks.getBlockType(name)) return;
    wp.blocks.registerBlockType(name, {
      apiVersion: 3, title: 'Review object config', category: 'widgets',
      attributes: { options: { type: 'object', default: { fallback: 'lost original config' } }, empty: { type: 'object' } },
      save: ({ attributes }) => wp.element.createElement('div', {}, Object.values(attributes.options).join(',')),
    });
  });
}

async function readForeignProbe(page, probe) {
  await registerProbe(page);
  return page.evaluate(probe => {
    const before = wp.blocks.parse(probe.input).find(block => block.name === 'vendor/review');
    const after = wp.blocks.parse(probe.candidate_content).find(block => block.name === 'vendor/review');
    return { beforeValid: before.isValid, afterValid: after.isValid, before: before.attributes, after: after.attributes };
  }, probe);
}

try {
  for (const [index, site] of sites.entries()) {
    console.log(`[${index + 1}/4] Final review ${mode}: ${site.service}; elapsed=${((Date.now() - started) / 1000).toFixed(1)}s`);
    const row = { service: site.service, checks: [], records: [] };
    const check = (name, passed, details) => row.checks.push({ name, passed: !!passed, ...(passed ? {} : { details }) });
    const originalRecords = seeds?.find(item => item.service === site.service).records;
    for (const role of ['administrator', 'author']) {
      const context = await browser.newContext({ timezoneId: 'UTC', viewport: { width: 1400, height: 1000 } });
      try {
        const user = role === 'author' && mode === 'save' ? author : credentials;
        const page = await openEditor(context, { ...site, post_id: role === 'author' && mode === 'save' ? author.post_ids[site.service] : site.post_id }, user);
        await registerProbe(page);
        for (const spec of specs) {
          const original = originalRecords?.find(record => record.role === role && record.name === spec.name);
          const result = await page.evaluate(async ({ mode, spec, role, original, clockName, authorPostId }) => {
            const normalizeCaption = content => {
              const template = document.createElement('template'); template.innerHTML = content;
              return template.content.querySelector('timenow-zone-sdcw')?.getAttribute('caption') || '';
            };
            const leaves = blocks => blocks.flatMap(block => [block, ...leaves(block.innerBlocks)]);
            if (mode === 'seed') {
              const clock = wp.blocks.createBlock(clockName, { timeZone: 'UTC', caption: spec.caption || '' });
              const content = wp.blocks.serialize([clock]);
              if (!wp.blocks.parse(content).every(block => block.isValid)) throw new Error('Baseline fixture is invalid');
              const payload = { title: `Final review ${role}/${spec.name}`, content, status: 'draft' };
              if (role === 'author') payload.author = (await wp.apiFetch({ path: `/wp/v2/posts/${authorPostId}?context=edit` })).author;
              const post = await wp.data.dispatch('core').saveEntityRecord('postType', 'post', payload);
              const stored = await wp.apiFetch({ path: `/wp/v2/posts/${post.id}?context=edit` });
              if (stored.content.raw !== content) throw new Error('Original 1.1.1 seed changed content: ' + JSON.stringify({ role, spec, expected: content, actual: stored.content.raw }));
              return { id: post.id, role, name: spec.name, content, expectedCaption: spec.caption || '' };
            }
            const before = await wp.apiFetch({ path: `/wp/v2/posts/${original.id}?context=edit` });
            if (mode === 'save') {
              await wp.apiFetch({ path: `/wp/v2/posts/${original.id}`, method: 'POST', data: { title: 'Final review title-only update' } });
            }
            let stored = await wp.apiFetch({ path: `/wp/v2/posts/${original.id}?context=edit` });
            const titleOnly = leaves(wp.blocks.parse(stored.content.raw));
            const titleOnlyCaption = titleOnly.find(block => block.name === clockName)?.attributes.caption;
            if (mode === 'save') {
              await wp.apiFetch({ path: `/wp/v2/posts/${original.id}`, method: 'POST', data: { content: wp.blocks.serialize(wp.blocks.parse(stored.content.raw)) } });
              stored = await wp.apiFetch({ path: `/wp/v2/posts/${original.id}?context=edit` });
            }
            const parsed = leaves(wp.blocks.parse(stored.content.raw));
            const clock = parsed.find(block => block.name === clockName);
            return {
              id: original.id, role, name: spec.name, content: stored.content.raw,
              expectedCaption: original.expectedCaption, allBlocksValid: parsed.every(block => block.isValid),
              clockCaption: clock?.attributes.caption, htmlCaption: normalizeCaption(stored.content.raw),
              expectedHtmlCaption: normalizeCaption(original.content), titleOnlyCaption,
              contentUnchanged: stored.content.raw === original.content,
              beforeSaveContent: before.content.raw,
            };
          }, { mode, spec, role, original, clockName, authorPostId: author.post_ids[site.service] });
          row.records.push(result);
          if (mode === 'seed') {
            check(`${role}/${spec.name}: official 1.1.1 seed retained`, !!result.id);
          } else {
            check(`${role}/${spec.name}: blocks remain valid`, result.allBlocksValid, result);
            check(`${role}/${spec.name}: caption and original HTML semantics unchanged`, result.clockCaption === spec.caption && result.htmlCaption === result.expectedHtmlCaption, result);
            if (mode === 'save') check(`${role}/${spec.name}: title-only update retains original JSON text`, result.titleOnlyCaption === spec.caption, result);
            if (readOnly) {
              const afterSave = saved.find(item => item.service === site.service).records.find(record => record.id === result.id);
              check(`${role}/${spec.name}: rollback did not rewrite database`, result.content === afterSave.content);
            }
          }
        }
        if (readOnly) {
          for (const example of ['literal-entities', 'html5-apostrophe']) {
            const record = originalRecords.find(record => record.role === role && record.name === example);
            await page.goto(`${site.url}/wp-admin/post.php?post=${record.id}&action=edit`);
            await page.waitForFunction(id => window.wp?.data?.select('core/editor')?.getCurrentPostId() === id && wp.data.select('core/block-editor').getBlocks().length > 0, record.id);
            const editor = await page.evaluate(name => {
              const block = wp.data.select('core/block-editor').getBlocks().find(block => block.name === name);
              return { valid: block?.isValid, caption: block?.attributes.caption, dirty: wp.data.select('core/editor').isEditedPostDirty() };
            }, clockName);
            check(`${role}/${example}: actual ${readerVersion} editor retains caption without dirty state`, editor.valid && editor.caption === record.expectedCaption && !editor.dirty, editor);
          }
          if (role === 'administrator') {
            const foreign = await readForeignProbe(page, siblingProbes.find(item => item.service === site.service));
            check(`${readerVersion} reader accepts preserved foreign object block`, foreign.beforeValid && foreign.afterValid, foreign);
            check(`${readerVersion} reader retains foreign object values`, JSON.stringify(foreign.before) === JSON.stringify(foreign.after), foreign);
          }
        }
      } finally { await context.close(); }
    }
    if (mode === 'save') {
      const context = await browser.newContext({ timezoneId: 'Asia/Tokyo', viewport: { width: 1400, height: 1000 } });
      try {
        const page = await openEditor(context, site, credentials);
        await page.evaluate(() => {
          wp.data.dispatch('core/preferences').set('core/edit-post', 'welcomeGuide', false);
          wp.data.dispatch('core/block-editor').resetBlocks([]);
        });
        await page.getByRole('button', { name: /^(Toggle block inserter|Block Inserter)$/ }).click();
        await page.locator('button[class*="editor-block-list-item-simple-digital-clock-block-widget-block"]').click();
        await page.waitForFunction(name => wp.data.select('core/block-editor').getBlocks().some(block => block.name === name), clockName);
        const inserted = await page.evaluate(name => wp.data.select('core/block-editor').getBlocks().find(block => block.name === name), clockName);
        check('real inserter applies browser timezone', inserted.isValid && inserted.attributes.timeZone === 'Asia/Tokyo', inserted);
        const foreign = await readForeignProbe(page, siblingProbes.find(item => item.service === site.service));
        check('foreign object block valid before new post filter', foreign.beforeValid, foreign);
        check('foreign object block valid after new post filter', foreign.afterValid, foreign);
        check('foreign object values preserved after new post filter', JSON.stringify(foreign.before) === JSON.stringify(foreign.after), foreign);
      } finally { await context.close(); }
    }
    row.failed = row.checks.filter(item => !item.passed).length;
    results.push(row);
    await fs.writeFile(resultPath, JSON.stringify(results, null, 2) + '\n');
    console.log(`${row.checks.length - row.failed}/${row.checks.length} passed; failed=${row.failed}`);
  }
  if (mode === 'seed') await fs.writeFile(snapshot, JSON.stringify(results, null, 2) + '\n');
  if (results.some(row => row.failed)) process.exitCode = 1;
} finally { await browser.close(); }
console.log(`Completed ${mode}; output=${resultPath}`);
