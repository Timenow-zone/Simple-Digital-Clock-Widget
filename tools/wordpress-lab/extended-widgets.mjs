import fs from 'node:fs/promises';
import path from 'node:path';
import { openEditor, launchLabBrowser } from './browser-helpers.mjs';

const [engine = 'chromium', label = 'review5-compat'] = process.argv.slice(2);
if (!/^[a-z0-9-]+$/.test(label)) throw new Error('Invalid widget evidence label');
const directory = path.resolve('.local/wordpress-lab', label);
const configuration = path.resolve('.local/wordpress-lab/review5-compat');
const target = path.join(directory, `widgets-dom-${engine}.json`);
await fs.access(target).then(() => { throw new Error('Refusing to overwrite widget evidence'); }, error => { if (error.code !== 'ENOENT') throw error; });
const sites = JSON.parse(await fs.readFile(path.join(configuration, 'sites.json'), 'utf8'));
const samples = JSON.parse(await fs.readFile(path.join(directory, 'widgets-rest.json'), 'utf8'));
const accounts = JSON.parse(await fs.readFile(path.join(configuration, 'credentials.json'), 'utf8'));
const browser = await launchLabBrowser(engine);
const results = [];
try {
  for (const [index, sample] of samples.entries()) {
    const site = sites.find(site => site.key === sample.key);
    if (!site || !/^http:\/\/127\.0\.0\.1:195(28|29|30|31)(\/clock-child\/)?$/.test(site.url)) throw new Error('Non-lab widget target');
    const context = await browser.newContext({ timezoneId: 'UTC' });
    try {
      const page = await openEditor(context, { ...site, url: site.url.replace(/\/$/, '') }, accounts);
      const rows = await page.evaluate(samples => {
        const inspect = content => {
          const template = document.createElement('template'); template.innerHTML = content;
          const elements = [...template.content.querySelectorAll('timenow-zone-sdcw')];
          return wp.blocks.parse(content).filter(block => block.name === 'simple-digital-clock-block/widget-block').map((block, i) => ({ valid: block.isValid, caption: block.attributes.caption, dom: elements[i]?.getAttribute('caption') || '' }));
        };
        return samples.map(sample => {
          if (sample.status !== 201) return { login: sample.login, status: sample.status, permission_denied: !sample.can_edit_widgets && sample.status === 403 };
          const expected = inspect(sample.input), actual = inspect(sample.content);
          if (expected.length !== 103 || actual.length !== 103 || expected.some(block => !block.valid)) throw new Error('Invalid native widget fixtures');
          return { login: sample.login, widget_id: sample.widget_id, status: sample.status, unfiltered_html: sample.unfiltered_html, can_edit_widgets: sample.can_edit_widgets, blocks: actual.length, failures: expected.flatMap((value, i) => actual[i].valid && actual[i].caption === value.caption && actual[i].dom === value.dom ? [] : [{ index: i, expected: value, actual: actual[i] }]) };
        });
      }, sample.results);
      results.push({ key: sample.key, php: sample.php, wordpress: sample.wordpress, theme: sample.theme, sidebar: sample.sidebar, records: rows });
      console.log(`[${index + 1}/5] ${sample.key}: widget failures=${rows.reduce((n, row) => n + (row.failures?.length || 0), 0)}`);
    } finally { await context.close(); }
  }
  await fs.writeFile(target, JSON.stringify(results, null, 2) + '\n');
  if (results.some(row => row.records.some(record => record.failures?.length))) process.exitCode = 1;
} finally { await browser.close(); }
console.log('Output: ' + target);
