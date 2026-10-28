import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { launchLabBrowser } from './browser-helpers.mjs';
import { compareClockRenders, freezeDate } from './visual-helpers.mjs';

const [stage, theme, mode, engine = 'chromium'] = process.argv.slice(2);
if (![stage, theme, mode].every(value => /^[a-z0-9-]+$/.test(value || ''))) throw new Error('Invalid integration arguments');
const folder = path.resolve('.local/wordpress-lab/gap-closure-921/integrations');
const target = path.join(folder, `front-${stage}-${theme}-${mode}-${engine}.json`);
await fs.access(target).then(() => { throw new Error('Evidence exists'); }, error => { if (error.code !== 'ENOENT') throw error; });
const seeds = JSON.parse(await fs.readFile(path.join(folder, 'seeds.json'), 'utf8'));
if (Object.values(seeds.posts).some(post => new URL(post.url).origin !== 'http://127.0.0.1:19532')) throw new Error('Wrong lab');
const baseline = stage.startsWith('baseline') ? null : JSON.parse(await fs.readFile(path.join(folder, `front-baseline-ready-${theme}-${mode}-${engine}.json`), 'utf8'));
const browser = await launchLabBrowser(engine);
const rows = [];
try {
  for (const [role, post] of Object.entries(seeds.posts)) {
    for (const width of [1440, 390]) {
      const row = { role, width, checks: [], errors: [] };
      const check = (name, passed, details) => row.checks.push({ name, passed: !!passed, ...(passed ? {} : { details }) });
      const context = await browser.newContext({ timezoneId: 'UTC', viewport: { width, height: 1000 } });
      context.on('page', page => page.on('pageerror', error => row.errors.push(error.message)));
      try {
        await context.route('**/*', route => new URL(route.request().url()).origin === 'http://127.0.0.1:19532' ? route.continue() : route.abort());
        const page = await context.newPage();
        await freezeDate(page, '2026-10-28T12:34:56.780Z');
        // Exercise the returning visitor and populated page/asset caches explicitly.
        await page.goto(post.url, { waitUntil: 'load' });
        const response = await page.reload({ waitUntil: 'load' });
        await page.waitForFunction(() => {
          const root = document.querySelector('.entry-content, .wp-block-post-content');
          const aside = document.querySelector('#sdcw-integration-widget');
          return root && aside && [root, aside].every(root => root.querySelectorAll('timenow-zone-sdcw').length === 7 && [...root.querySelectorAll('timenow-zone-sdcw')].every(node => node.shadowRoot?.querySelector('a')?.textContent.match(/\p{N}/u)));
        });
        await page.evaluate(() => document.fonts.ready);
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const html = await response.text();
        row.status = response.status();
        row.cacheHeader = response.headers()['x-wp-super-cache'] || '';
        row.htmlSha256 = createHash('sha256').update(html).digest('hex');
        row.cacheComments = html.match(/<!--[^]*?(?:WP-Super-Cache|super cache|Cached page generated)[^]*?-->/gi)?.map(text => text.slice(-600)) || [];
        row.assetUrls = await page.evaluate(() => [...document.querySelectorAll('script[src],link[rel=stylesheet]')].map(node => node.src || node.href));
        row.optimizedAssets = row.assetUrls.filter(url => url.includes('/cache/autoptimize/'));
        row.clockInOptimizedJs = false;
        row.optimizedResponses = [];
        // Autoptimize may serve generated JavaScript through a .php URL.
        for (const url of row.optimizedAssets) {
          const asset = await context.request.get(url);
          const type = asset.headers()['content-type'] || '';
          const body = await asset.text();
          row.optimizedResponses.push({ url, status: asset.status(), type, sha256: createHash('sha256').update(body).digest('hex') });
          if (asset.ok() && /javascript/.test(type) && body.includes('timenow-zone-sdcw')) row.clockInOptimizedJs = true;
        }
        row.clocks = await page.evaluate(() => {
          const roots = [document.querySelector('.entry-content, .wp-block-post-content'), document.querySelector('#sdcw-integration-widget')];
          return roots.flatMap(root => [...root.querySelectorAll('timenow-zone-sdcw')].map(node => {
            const style = getComputedStyle(node.shadowRoot.querySelector('.widget'));
            const anchor = node.shadowRoot.querySelector('a');
            return { attrs: Object.fromEntries([...node.attributes].map(attr => [attr.name, attr.value])), width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height, text: anchor.textContent, font: getComputedStyle(anchor).fontSize, color: style.color, background: style.backgroundImage, backgroundColor: style.backgroundColor, border: style.borderWidth, rounded: style.borderRadius, shadow: style.boxShadow };
          }));
        });
        row.markers = await page.locator('.entry-content, .wp-block-post-content').first().innerText();
        check('HTTP 200 and fourteen rendered clocks', row.status === 200 && row.clocks.length === 14);
        check('No uncaught browser errors', row.errors.length === 0, row.errors);
        if (['optimized', 'both'].includes(mode)) check('Clock JavaScript is actually processed by Autoptimize', row.optimizedAssets.length > 0 && row.clockInOptimizedJs, row.optimizedAssets);
        if (['cached', 'both'].includes(mode)) check('Actual WP Super Cache HIT is observed', row.cacheHeader.includes('Served'), row.cacheHeader);
        if (baseline) {
          const before = baseline.find(item => item.role === role && item.width === width);
          row.comparison = compareClockRenders(before.clocks, row.clocks);
          check('All clock settings, text, geometry and styles match official 1.1.1', row.comparison.equal, row.comparison);
        }
      } catch (error) { row.error = error.stack; check('Scenario completes', false, error.stack); }
      finally { await context.close(); }
      row.failed = row.checks.filter(check => !check.passed).length;
      rows.push(row);
    }
  }
} finally { await browser.close(); }
await fs.writeFile(target, JSON.stringify(rows, null, 2) + '\n', { flag: 'wx' });
console.log(`${stage}/${theme}/${mode}/${engine}: ${rows.length} page/viewport runs; failed=${rows.reduce((sum, row) => sum + row.failed, 0)}`);
if (rows.some(row => row.failed)) process.exitCode = 1;
