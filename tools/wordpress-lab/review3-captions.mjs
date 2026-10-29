import fs from 'node:fs/promises';
import path from 'node:path';
import { loadLab, openEditor, launchLabBrowser } from './browser-helpers.mjs';

const [mode, phase, engine = 'chromium', suite = 'original', label = 'entities-fix'] = process.argv.slice(2);
if (!['seed', 'save', 'read', 'control'].includes(mode) || !/^[a-z0-9-]+$/.test(phase || '') || !/^[a-z0-9-]+$/.test(label) || !['chromium', 'firefox', 'webkit'].includes(engine) || !['original', 'html5', 'numeric'].includes(suite) || (mode === 'seed' && engine !== 'chromium')) {
  throw new Error('Usage: review3-captions.mjs seed|save|read|control phase [engine] [original|html5|numeric] [label]');
}
const writes = mode === 'save' || mode === 'control';
const { output, sites, credentials } = await loadLab();
const directory = path.join(output, suite === 'original' ? 'review3' : label);
const resultPath = path.join(directory, `captions-${phase}-${engine}.json`);
const seedPath = path.join(directory, 'caption-seeds.json');
for (const file of mode === 'seed' ? [resultPath, seedPath] : [resultPath]) {
  try { await fs.access(file); throw new Error('Refusing to overwrite review evidence: ' + file); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}
const seeds = mode === 'seed' ? null : JSON.parse(await fs.readFile(seedPath, 'utf8'));
const author = JSON.parse(await fs.readFile(path.join(output, 'patch-author.json'), 'utf8'));
const captions = [
  '', '0', 'Plain clock', ' <clock> ', '&apos; <clock>', '&amp;apos; <clock>',
  '&amp;amp;apos; <clock>', '&amp;amp;amp;apos; <clock>', '&quot; <clock>', '&amp;quot; <clock>',
  '&lt; <clock>', '&amp;lt; <clock>', '&gt; <clock>', '&amp;gt; <clock>',
  '&#39; <clock>', '&#x27; <clock>', '&#X00027; <clock>', '&#00039; <clock>',
  '&#x1F552; <clock>', '&#128338; <clock>', '&nbsp; <clock>', '&euro; <clock>',
  '&NewLine; <clock>', '&Tab; <clock>', '&NotEqualTilde; <clock>', '&CounterClockwiseContourIntegral; <clock>',
  '&colon; <clock>', '&sol; <clock>', '&lbrace; <clock>', '&invalid; <clock>',
  '&apos <clock>', '&copy <clock>', '&amp=x <clock>', '& <clock>',
  '"double" <clock>', "'single' <clock>", '`backtick` <clock>', 'C:\\clock\\UTC <clock>',
  'first\nsecond <clock>', 'first\r\nsecond <clock>', 'first\tsecond <clock>',
  'Київ 🕒 العربية 日本語 <clock>', '<img src=x onerror=alert(1)>',
  '</timenow-zone-sdcw><script>alert(1)</script>', '--><script>alert(1)</script><!--',
  '<!-- wp:paragraph -->text<!-- /wp:paragraph -->',
];
if (suite !== 'original') {
  for (const name of ['NewLine', 'Tab', 'NotEqualTilde', 'CounterClockwiseContourIntegral', 'colon', 'sol', 'lbrace']) {
    captions.push(`&amp;${name}; <clock>`, `&amp;amp;${name}; <clock>`);
  }
  captions.push('&bsol;', '&amp;bsol;', 'end&bsol;', 'C:&bsol;clock&bsol;', '&QUOT; <clock>', '&LT; <clock>', '&GT; <clock>');
}
if (suite === 'numeric') {
  const additional = JSON.parse(await fs.readFile(new URL('./fixtures/numeric-captions.json', import.meta.url), 'utf8'));
  if (additional.length !== 29 || additional.some(caption => typeof caption !== 'string')) throw new Error('Unexpected numeric caption fixtures');
  captions.push(...additional);
}
const browser = await launchLabBrowser(engine);
const results = [];
const name = 'simple-digital-clock-block/widget-block';
const started = Date.now();
try {
  for (const [index, site] of sites.entries()) {
    console.log(`[${index + 1}/4] Caption review ${mode}/${phase}/${engine}: ${site.service}; elapsed=${((Date.now() - started) / 1000).toFixed(1)}s`);
    const row = { service: site.service, mode, phase, engine, checks: [], records: [] };
    const check = (name, passed, details) => row.checks.push({ name, passed: !!passed, ...(passed ? {} : { details }) });
    let inputs = seeds?.find(row => row.service === site.service).records;
    if (mode === 'control') {
      // Keep the main cycle untouched; create independent native-fixture copies.
      const context = await browser.newContext({ timezoneId: 'UTC' });
      try {
        const page = await openEditor(context, site, credentials);
        inputs = await page.evaluate(async records => {
          const copies = [];
          for (const record of records) {
            const owner = (await wp.apiFetch({ path: `/wp/v2/posts/${record.id}?context=edit` })).author;
            const copy = await wp.apiFetch({ path: '/wp/v2/posts', method: 'POST', data: { title: 'Review3 independent control ' + record.role, content: record.content, author: owner, status: 'draft' } });
            copies.push({ ...record, id: copy.id });
          }
          return copies;
        }, inputs);
      } finally { await context.close(); }
    }
    for (const [role, user] of [['administrator', credentials], ['author', author]]) {
      const context = await browser.newContext({ timezoneId: 'UTC' });
      try {
        const login = writes && role === 'author' ? user : credentials;
        const page = await openEditor(context, { ...site, post_id: writes && role === 'author' ? author.post_ids[site.service] : site.post_id }, login);
        const original = inputs?.find(record => record.role === role);
        const record = await page.evaluate(async ({ mode, captions, name, original, role, authorPostId }) => {
          const inspect = content => {
            const blocks = wp.blocks.parse(content).filter(block => block.name === name);
            const template = document.createElement('template'); template.innerHTML = content;
            const elements = [...template.content.querySelectorAll('timenow-zone-sdcw')];
            return blocks.map((block, index) => ({ valid: block.isValid, caption: block.attributes.caption, dom: elements[index]?.getAttribute('caption') || '' }));
          };
          if (mode === 'seed') {
            const content = wp.blocks.serialize(captions.map(caption => wp.blocks.createBlock(name, { timeZone: 'UTC', caption })));
            const before = inspect(content);
            if (before.length !== captions.length || before.some(block => !block.valid)) throw new Error('Original 1.1.1 fixture is invalid');
            const payload = { title: 'Review3 extended captions ' + role, content, status: 'draft' };
            if (role === 'author') payload.author = (await wp.apiFetch({ path: `/wp/v2/posts/${authorPostId}?context=edit` })).author;
            const post = await wp.apiFetch({ path: '/wp/v2/posts', method: 'POST', data: payload });
            const stored = await wp.apiFetch({ path: `/wp/v2/posts/${post.id}?context=edit` });
            return { id: post.id, role, content: stored.content.raw, expected: before, baselineUnchanged: stored.content.raw === content };
          }
          const before = await wp.apiFetch({ path: `/wp/v2/posts/${original.id}?context=edit` });
          if (mode === 'save') await wp.apiFetch({ path: `/wp/v2/posts/${original.id}`, method: 'POST', data: { title: 'Review3 title-only update' } });
          const titled = await wp.apiFetch({ path: `/wp/v2/posts/${original.id}?context=edit` });
          if (mode === 'save') await wp.apiFetch({ path: `/wp/v2/posts/${original.id}`, method: 'POST', data: { content: wp.blocks.serialize(wp.blocks.parse(titled.content.raw)) } });
          const stored = await wp.apiFetch({ path: `/wp/v2/posts/${original.id}?context=edit` });
          return { id: original.id, role, before: before.content.raw, content: stored.content.raw, titleOnly: inspect(titled.content.raw), actual: inspect(stored.content.raw), expected: original.expected, readUnchanged: mode !== 'read' || before.content.raw === stored.content.raw };
        }, { mode: mode === 'control' ? 'save' : mode, captions, name, original, role, authorPostId: author.post_ids[site.service] });
        row.records.push(record);
        if (mode === 'seed') {
          check(`${role}: official 1.1.1 retains complete native fixtures`, record.baselineUnchanged, record);
        } else {
          check(`${role}: all ${captions.length} blocks retained`, record.actual.length === captions.length && record.titleOnly.length === captions.length, record);
          for (const [index, caption] of captions.entries()) {
            const expected = record.expected[index];
            for (const [stage, blocks] of [['title', record.titleOnly], ['final', record.actual]]) {
              const actual = blocks[index];
              check(`${role}/${index}/${stage}: valid block and original JSON`, actual?.valid && actual.caption === caption, { caption, expected, actual });
              check(`${role}/${index}/${stage}: original DOM meaning`, actual?.dom === expected.dom, { caption, expected, actual });
            }
          }
          check(`${role}: read does not rewrite post`, record.readUnchanged, record);
          await page.goto(`${site.url}/wp-admin/post.php?post=${record.id}&action=edit`);
          await page.waitForFunction(id => window.wp?.data?.select('core/editor')?.getCurrentPostId() === id && wp.data.select('core/block-editor').getBlocks().length > 0, record.id);
          const editor = await page.evaluate(name => ({ valid: wp.data.select('core/block-editor').getBlocks().filter(block => block.name === name).every(block => block.isValid), dirty: wp.data.select('core/editor').isEditedPostDirty() }), name);
          check(`${role}: actual editor valid without dirty state`, editor.valid && !editor.dirty, editor);
        }
      } finally { await context.close(); }
    }
    row.failed = row.checks.filter(check => !check.passed).length;
    results.push(row);
    await fs.writeFile(resultPath, JSON.stringify(results, null, 2) + '\n');
    console.log(`${row.checks.length - row.failed}/${row.checks.length} passed; failed=${row.failed}`);
  }
  if (mode === 'seed') await fs.writeFile(seedPath, JSON.stringify(results, null, 2) + '\n');
  if (results.some(row => row.failed)) process.exitCode = 1;
} finally { await browser.close(); }
console.log('Output: ' + resultPath);
