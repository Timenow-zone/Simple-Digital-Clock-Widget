import fs from 'node:fs/promises';
import path from 'node:path';
import { launchLabBrowser } from './browser-helpers.mjs';
import { compareClockRenders, freezeDate } from './visual-helpers.mjs';

const [stage, engine = 'chromium', label = 'final-acceptance-921'] = process.argv.slice(2);
if (!/^[a-z0-9-]+$/.test(stage || '') || !/^[a-z0-9-]+$/.test(label)) throw new Error('Invalid stage');
const folder = path.resolve('.local/wordpress-lab', label);
const target = path.join(folder, `viewport-${stage}-${engine}.json`);
await fs.access(target).then(() => { throw new Error('Evidence already exists'); }, error => { if (error.code !== 'ENOENT') throw error; });
const sites = JSON.parse(await fs.readFile(path.join(folder, 'sites.json'), 'utf8'));
const baseline = stage === 'baseline' ? null : JSON.parse(await fs.readFile(path.join(folder, `viewport-baseline-${engine}.json`), 'utf8'));
const browser = await launchLabBrowser(engine);
const rows = [];
const started = Date.now();
try {
  for (const [index, site] of sites.entries()) {
    const url = new URL(site.url);
    if (!['localhost', '127.0.0.1'].includes(url.hostname)) throw new Error('Refusing a non-local target');
    const seed = JSON.parse(await fs.readFile(path.join(folder, `seed-${site.key}.json`), 'utf8'));
    for (const width of [390, 768]) {
      const context = await browser.newContext({ timezoneId: 'UTC', viewport: { width, height: 1000 } });
      const row = { key: site.key, width, checks: [] };
      const check = (name, passed) => row.checks.push({ name, passed });
      try {
        await context.route('**/*', route => ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
        const page = await context.newPage();
        await freezeDate(page, '2026-10-28T12:34:56.780Z');
        const response = await page.goto(`${site.url}/?p=${seed.postId}`, { waitUntil: 'domcontentloaded' });
        check('Visitor HTTP 200', response.status() === 200);
        const selector = '.wp-block-post-content timenow-zone-sdcw, .entry-content timenow-zone-sdcw';
        await page.waitForFunction(selector => [...document.querySelectorAll(selector)].length === 103 && [...document.querySelectorAll(selector)].every(node => node.shadowRoot?.querySelector('a')?.textContent), selector);
        await page.evaluate(() => document.fonts.ready);
        row.clocks = await page.locator(selector).evaluateAll(nodes => nodes.map(node => {
          const rect = node.getBoundingClientRect();
          const anchor = node.shadowRoot.querySelector('a');
          return { attrs: Object.fromEntries([...node.attributes].map(attr => [attr.name, attr.value])), width: rect.width, height: rect.height, font: getComputedStyle(anchor).fontSize, text: anchor.textContent };
        }));
        check('All 103 clocks retain visible geometry', row.clocks.every(clock => clock.width > 0 && clock.height > 0));
        const first = page.locator(selector).first();
        row.timeBefore = await first.evaluate(node => node.shadowRoot.querySelector('a').textContent);
        await page.clock.setFixedTime(new Date('2026-10-28T12:35:58.780Z'));
        await page.waitForFunction(({selector, before}) => document.querySelector(selector)?.shadowRoot.querySelector('a').textContent !== before, { selector, before: row.timeBefore });
        row.timeAfter = await first.evaluate(node => node.shadowRoot.querySelector('a').textContent);
        check('Clock updates after time advances', row.timeBefore !== row.timeAfter);
        if (baseline) {
          const before = baseline.find(item => item.key === site.key && item.width === width);
          row.comparison = compareClockRenders(before.clocks, row.clocks);
          check('All mobile/tablet clock attributes, geometry, text and font sizes unchanged', row.comparison.equal);
          check('Advancing time matches 1.1.1', before.timeBefore === row.timeBefore && before.timeAfter === row.timeAfter);
        }
      } catch (error) { row.error = error.stack; check('Scenario completes', false); }
      finally { await context.close(); }
      row.failed = row.checks.filter(check => !check.passed).length;
      rows.push(row);
    }
    const elapsed = (Date.now() - started) / 1000;
    console.log(`[${index + 1}/${sites.length}] ${site.key}/${engine}: failed=${rows.filter(row => row.key === site.key).reduce((sum, row) => sum + row.failed, 0)}; elapsed=${elapsed.toFixed(1)}s; ETA=${(elapsed / (index + 1) * (sites.length - index - 1)).toFixed(1)}s`);
  }
} finally { await browser.close(); }
await fs.writeFile(target, JSON.stringify(rows, null, 2) + '\n', { flag: 'wx' });
if (rows.some(row => row.failed)) process.exitCode = 1;
