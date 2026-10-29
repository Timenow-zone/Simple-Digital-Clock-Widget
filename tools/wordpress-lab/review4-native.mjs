import fs from 'node:fs/promises';
import path from 'node:path';
import { loadLab, openEditor, launchLabBrowser } from './browser-helpers.mjs';

const [mode = 'save', phase = 'candidate', engine = 'chromium', seedPhase = 'candidate'] = process.argv.slice(2);
if (!['save', 'read'].includes(mode) || !/^[a-z0-9-]+$/.test(phase) || !/^[a-z0-9-]+$/.test(seedPhase)) throw new Error('Invalid native review arguments');
const { output, sites, credentials } = await loadLab();
const directory = path.join(output, 'review4');
const target = path.join(directory, `native-${phase}-${engine}.json`);
await fs.access(target).then(() => { throw new Error('Refusing to overwrite review evidence'); }, error => { if (error.code !== 'ENOENT') throw error; });
const author = JSON.parse(await fs.readFile(path.join(output, 'patch-author.json'), 'utf8'));
const seeds = mode === 'read' ? JSON.parse(await fs.readFile(path.join(directory, `native-${seedPhase}-chromium.json`), 'utf8')) : null;
const captions = ['&#13; <clock>', '&#xD; <clock>', '&amp;#13; <clock>', '&NewLine; <clock>', '&#10; <clock>', '&copy <clock>', '&AMP;amp; <clock>', '&NotEqualTilde;amp; <clock>', '&amp;#34; <clock>', '&amp;#x1F552; <clock>', '&amp;amp;#34; <clock>', '&amp;amp;#x1F552; <clock>'];
const browser = await launchLabBrowser(engine);
const results = [];
try {
  for (const [index, site] of sites.entries()) {
    const row = { service: site.service, engine, mode, records: [] };
    for (const role of ['administrator', 'author']) {
      const context = await browser.newContext();
      try {
        const page = await openEditor(context, site, credentials);
        const seed = seeds?.find(row => row.service === site.service).records.find(record => record.role === role);
        const expectedCaptions = seed ? seed.before.map(block => block.caption) : captions;
        const original = seed || await page.evaluate(async ({ captions, role, authorPost }) => {
          const content = wp.blocks.serialize(captions.map(caption => wp.blocks.createBlock('simple-digital-clock-block/widget-block', { caption, timeZone: 'UTC' })));
          if (wp.blocks.parse(content).some(block => !block.isValid)) throw new Error('Invalid native input');
          const payload = { title: `Review4 native ${role}`, content, status: 'draft' };
          if (role === 'author') payload.author = (await wp.apiFetch({ path: `/wp/v2/posts/${authorPost}?context=edit` })).author;
          const post = await wp.apiFetch({ path: '/wp/v2/posts', method: 'POST', data: payload });
          if (post.content.raw !== content) throw new Error('Unfiltered input changed');
          return { id: post.id, role, original: content };
        }, { captions, role, authorPost: author.post_ids[site.service] });
        if (mode === 'save' && role === 'author') {
          await page.close();
          await context.clearCookies();
          const authorPage = await openEditor(context, { ...site, post_id: author.post_ids[site.service] }, author);
          await authorPage.evaluate(async id => {
            await wp.apiFetch({ path: `/wp/v2/posts/${id}`, method: 'POST', data: { title: 'Review4 title-only update' } });
          }, original.id);
          await authorPage.close();
          await context.clearCookies();
        }
        const reader = mode === 'save' && role === 'author' ? await openEditor(context, site, credentials) : page;
        const inspected = await reader.evaluate(async ({ original, captions }) => {
          const inspect = content => {
            const template = document.createElement('template'); template.innerHTML = content;
            const elements = [...template.content.querySelectorAll('timenow-zone-sdcw')];
            return wp.blocks.parse(content).filter(block => block.name === 'simple-digital-clock-block/widget-block').map((block, i) => ({ caption: block.attributes.caption, valid: block.isValid, dom: elements[i]?.getAttribute('caption') }));
          };
          const saved = await wp.apiFetch({ path: `/wp/v2/posts/${original.id}?context=edit` });
          const expected = inspect(original.original), actual = inspect(saved.content.raw);
          return { content: saved.content.raw, before: expected, actual, failures: captions.flatMap((caption, i) => actual[i]?.valid && actual[i]?.caption === caption && actual[i]?.dom === expected[i]?.dom ? [] : [{ caption, expected: expected[i], actual: actual[i] }]) };
        }, { original, captions: expectedCaptions });
        await reader.goto(`${site.url}/wp-admin/post.php?post=${original.id}&action=edit`, { waitUntil: 'domcontentloaded' });
        await reader.waitForFunction(({ id, count }) => window.wp?.data?.select('core/editor')?.getCurrentPostId() === id && wp.data.select('core/block-editor')?.getBlocks().length === count, { id: original.id, count: expectedCaptions.length });
        const editor = await reader.evaluate(() => ({ valid: wp.data.select('core/block-editor').getBlocks().every(block => block.isValid), dirty: wp.data.select('core/editor').isEditedPostDirty() }));
        row.records.push({ ...original, ...inspected, editor });
      } finally { await context.close(); }
    }
    results.push(row);
    console.log(`[${index + 1}/4] ${site.service}/${engine}: failures=${row.records.reduce((n, r) => n + r.failures.length, 0)}`);
  }
  await fs.writeFile(target, JSON.stringify(results, null, 2) + '\n');
  if (results.some(row => row.records.some(record => record.failures.length || !record.editor.valid || record.editor.dirty))) process.exitCode = 1;
} finally { await browser.close(); }
console.log('Output: ' + target);
