import fs from 'node:fs/promises';
import path from 'node:path';
import { loadLab, openEditor, launchLabBrowser } from './browser-helpers.mjs';

const [mode, label, phase, engine = 'chromium', service = 'all'] = process.argv.slice(2);
if (!['save', 'read'].includes(mode) || !/^[a-z0-9-]+$/.test(label || '') || !/^[a-z0-9-]+$/.test(phase || '') || !['chromium', 'firefox', 'webkit'].includes(engine) || !['all', 'wp71', 'wp84', 'wp63', 'wp68'].includes(service)) {
  throw new Error('Usage: review2-entities.mjs save|read label phase [engine] [service]');
}
const { output, sites, credentials } = await loadLab();
const author = JSON.parse(await fs.readFile(path.join(output, 'patch-author.json'), 'utf8'));
const fixtures = JSON.parse(await fs.readFile('tools/wordpress-lab/fixtures/review2-entities.json', 'utf8'));
const directory = path.join(output, 'review2');
await fs.mkdir(directory, { recursive: true });
const resultPath = path.join(directory, `${label}-${phase}-${engine}-${service}.json`);
const snapshotPath = path.join(directory, `${label}-posts.json`);
for (const file of mode === 'save' ? [resultPath, snapshotPath] : [resultPath]) {
  try { await fs.access(file); throw new Error('Refusing to overwrite review evidence: ' + file); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}
const snapshot = mode === 'read' ? JSON.parse(await fs.readFile(snapshotPath, 'utf8')) : null;
const browser = await launchLabBrowser(engine);
const results = [];
const name = 'simple-digital-clock-block/widget-block';
try {
  for (const site of sites.filter(site => service === 'all' || site.service === service)) {
    console.log(`${site.service}: ${mode}, ${phase}, ${engine}`);
    const row = { service: site.service, phase, engine, checks: [], records: [] };
    const check = (name, passed, details) => row.checks.push({ name, passed: !!passed, ...(passed ? {} : { details }) });
    for (const [role, user] of [['administrator', credentials], ['author', author]]) {
      const context = await browser.newContext({ timezoneId: 'UTC', viewport: { width: 1400, height: 1000 } });
      try {
        const page = await openEditor(context, { ...site, post_id: role === 'author' ? author.post_ids[site.service] : site.post_id }, user);
        for (const fixture of fixtures.cases) {
          const original = snapshot?.find(row => row.service === site.service).records.find(record => record.role === role && record.caption === fixture.caption);
          const record = await page.evaluate(async ({ mode, fixture, original, role, name }) => {
            const before = wp.blocks.parse(fixture.content)[0];
            let post;
            if (mode === 'save') {
              post = await wp.apiFetch({ path: '/wp/v2/posts', method: 'POST', data: { title: 'Review2 entity regression', content: fixture.content, status: 'draft' } });
            } else { post = original; }
            const stored = await wp.apiFetch({ path: `/wp/v2/posts/${post.id}?context=edit` });
            const parsed = wp.blocks.parse(stored.content.raw)[0];
            const template = document.createElement('template'); template.innerHTML = stored.content.raw;
            return { id: post.id, role, caption: fixture.caption, beforeValid: before.isValid, afterValid: parsed?.isValid, savedCaption: parsed?.attributes.caption, domCaption: template.content.querySelector('timenow-zone-sdcw')?.getAttribute('caption'), expectedDOM: fixture.expected_dom_caption, content: stored.content.raw, unchanged: mode === 'save' || stored.content.raw === original.content };
          }, { mode, fixture, original, role, name });
          row.records.push(record);
          check(`${role}/${fixture.caption}: ${mode === 'save' ? 'input is valid' : 'database content unchanged'}`, mode === 'save' ? record.beforeValid : record.unchanged, record);
          check(`${role}/${fixture.caption}: stored JSON caption retained`, record.savedCaption === fixture.caption, record);
          check(`${role}/${fixture.caption}: HTML semantics retained`, record.domCaption === fixture.expected_dom_caption, record);
          check(`${role}/${fixture.caption}: stored block is valid`, record.afterValid, record);
        }
        const example = row.records.find(record => record.role === role && record.caption === '&apos; <clock>');
        await page.goto(`${site.url}/wp-admin/post.php?post=${example.id}&action=edit`);
        await page.waitForFunction(id => window.wp?.data?.select('core/editor')?.getCurrentPostId() === id && wp.data.select('core/block-editor').getBlocks().length > 0, example.id);
        const actualEditor = await page.evaluate(name => {
          const block = wp.data.select('core/block-editor').getBlocks().find(block => block.name === name);
          return { valid: block?.isValid, caption: block?.attributes.caption };
        }, name);
        check(`${role}: actual editor accepts mixed apostrophe entity caption`, actualEditor.valid && actualEditor.caption === example.caption, actualEditor);
        if (site.service === 'wp63' && role === 'author') {
          await page.evaluate(() => wp.data.dispatch('core/preferences').set('core/edit-post', 'welcomeGuide', false));
          await page.screenshot({ path: path.join(directory, `${label}-${phase}-${engine}-wp63-author.png`) });
        }
      } finally { await context.close(); }
    }
    row.failed = row.checks.filter(check => !check.passed).length;
    results.push(row);
    await fs.writeFile(resultPath, JSON.stringify(results, null, 2) + '\n');
    console.log(`${row.checks.length - row.failed}/${row.checks.length} passed; failed=${row.failed}`);
  }
  if (mode === 'save') await fs.writeFile(snapshotPath, JSON.stringify(results, null, 2) + '\n');
  if (results.some(row => row.failed)) process.exitCode = 1;
} finally { await browser.close(); }
console.log('Output: ' + resultPath);
