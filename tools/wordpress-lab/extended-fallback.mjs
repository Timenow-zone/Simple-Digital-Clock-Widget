import fs from 'node:fs/promises';
import path from 'node:path';
import { openEditor, launchLabBrowser } from './browser-helpers.mjs';

const [mode, engine = 'chromium', seedLabel = '', label = 'review5-compat'] = process.argv.slice(2);
if (!['prepare', 'test', 'read'].includes(mode) || (seedLabel && !/^[a-z0-9-]+$/.test(seedLabel)) || !/^[a-z0-9-]+$/.test(label)) throw new Error('Invalid fallback probe mode');
const directory = path.resolve('.local/wordpress-lab', label);
const configuration = path.resolve('.local/wordpress-lab/review5-compat');
const sites = JSON.parse(await fs.readFile(path.join(configuration, 'sites.json'), 'utf8'));
const account = JSON.parse(await fs.readFile(path.join(configuration, 'credentials.json'), 'utf8'));
const seeds = mode !== 'prepare' ? JSON.parse(await fs.readFile(path.join(directory, `fallback-seeds${seedLabel ? '-' + seedLabel : ''}.json`), 'utf8')) : null;
const target = path.join(directory, mode === 'prepare' ? 'fallback-inputs.json' : `fallback-${mode === 'read' ? 'read-' : ''}${seedLabel ? seedLabel + '-' : ''}${engine}.json`);
await fs.access(target).then(() => { throw new Error('Refusing to overwrite fallback evidence'); }, error => { if (error.code !== 'ENOENT') throw error; });
const browser = await launchLabBrowser(engine);
const results = [];
async function preview(page) {
  await page.waitForFunction(() => [document, ...[...document.querySelectorAll('iframe')].map(frame => frame.contentDocument).filter(Boolean)].some(document => document.querySelector('timenow-zone-sdcw')));
  for (const frame of page.frames()) {
    const element = frame.locator('timenow-zone-sdcw').first();
    if (await element.count()) return element.evaluate(node => ({ caption: node.getAttribute('caption'), shadow: !!node.shadowRoot }));
  }
  return null;
}
try {
  for (const [i, input] of sites.entries()) {
    if (!/^http:\/\/127\.0\.0\.1:195(28|29|30|31)(\/clock-child\/)?$/.test(input.url)) throw new Error('Non-lab target');
    const site = { ...input, url: input.url.replace(/\/$/, '') };
    const context = await browser.newContext({ timezoneId: 'UTC' });
    try {
      const page = await openEditor(context, site, account);
      if (mode === 'prepare') {
        const cases = await page.evaluate(() => ['&#039; <clock>', '&#x27; <clock>', '&apos; <clock>'].map(caption => {
          const source = wp.blocks.serialize([wp.blocks.createBlock('simple-digital-clock-block/widget-block', { caption, timeZone: 'UTC' })]);
          const content = source.replace(/(<!-- wp:simple-digital-clock-block\/widget-block )(\{.*?\})( -->)/, (_, start, json, end) => { const attrs = JSON.parse(json); delete attrs.caption; return start + JSON.stringify(attrs) + end; });
          const parsed = wp.blocks.parse(content)[0];
          if (!parsed.isValid || parsed.attributes.caption !== "' <clock>") throw new Error('Invalid HTML-sourced caption fixture');
          return { caption, content, expectedCaption: parsed.attributes.caption };
        }));
        results.push({ key: site.key, cases });
      } else {
        const cases = [];
        for (const seed of seeds.find(row => row.key === site.key).cases) {
          await page.goto(`${site.url}/wp-admin/post.php?post=${seed.id}&action=edit`, { waitUntil: 'domcontentloaded' });
          await page.waitForFunction(id => wp.data.select('core/editor').getCurrentPostId() === id && wp.data.select('core/block-editor').getBlocks().length === 1, seed.id);
          const beforePreview = await preview(page);
          if (beforePreview?.caption !== seed.expectedCaption) throw new Error('Unexpected original preview: ' + JSON.stringify({ key: site.key, id: seed.id, beforePreview }));
          const values = await page.evaluate(async ({ id, mode }) => {
            const inspect = html => { const block = wp.blocks.parse(html)[0]; const template = document.createElement('template'); template.innerHTML = html; return { caption: block.attributes.caption, valid: block.isValid, dom: template.content.querySelector('timenow-zone-sdcw').getAttribute('caption') }; };
            const before = await wp.apiFetch({ path: `/wp/v2/posts/${id}?context=edit` });
            if (mode === 'test') await wp.apiFetch({ path: `/wp/v2/posts/${id}`, method: 'POST', data: { title: 'Fallback title-only update' } });
            const after = await wp.apiFetch({ path: `/wp/v2/posts/${id}?context=edit` });
            const attrs = JSON.parse(after.content.raw.match(/<!-- wp:simple-digital-clock-block\/widget-block (.*?) -->/s)[1]);
            return { before: inspect(before.content.raw), after: inspect(after.content.raw), content: after.content.raw, titleCaptionOmitted: !Object.hasOwn(attrs, 'caption') };
          }, { id: seed.id, mode });
          await page.reload({ waitUntil: 'domcontentloaded' });
          await page.waitForFunction(id => wp.data.select('core/editor').getCurrentPostId() === id && wp.data.select('core/block-editor').getBlocks().length === 1, seed.id);
          const afterPreview = await preview(page);
          let fullSave = null;
          if (mode === 'test') {
            fullSave = await page.evaluate(async id => {
              const before = await wp.apiFetch({ path: `/wp/v2/posts/${id}?context=edit` });
              await wp.apiFetch({ path: `/wp/v2/posts/${id}`, method: 'POST', data: { content: wp.blocks.serialize(wp.blocks.parse(before.content.raw)) } });
              const full = await wp.apiFetch({ path: `/wp/v2/posts/${id}?context=edit` });
              await wp.apiFetch({ path: `/wp/v2/posts/${id}`, method: 'POST', data: { content: full.content.raw } });
              const repeated = await wp.apiFetch({ path: `/wp/v2/posts/${id}?context=edit` });
              const block = wp.blocks.parse(repeated.content.raw)[0];
              return { caption: block.attributes.caption, valid: block.isValid, stable: full.content.raw === repeated.content.raw, content: repeated.content.raw };
            }, seed.id);
          }
          await page.goto(`${site.url}/?p=${seed.id}`, { waitUntil: 'domcontentloaded' });
          await page.waitForSelector('timenow-zone-sdcw');
          const frontend = await page.locator('.wp-block-post-content timenow-zone-sdcw, .entry-content timenow-zone-sdcw').first().getAttribute('caption');
          if (!values.before.valid || values.before.caption !== seed.expectedCaption || beforePreview?.caption !== seed.expectedCaption) throw new Error('The original HTML-sourced caption was not valid and equivalent');
          cases.push({ id: seed.id, input: seed.caption, expectedCaption: seed.expectedCaption, ...values, beforePreview, afterPreview, fullSave, frontend, failed: values.after.caption !== seed.expectedCaption || !values.after.valid || afterPreview?.caption !== seed.expectedCaption || frontend !== seed.expectedCaption || (mode === 'test' && (!values.titleCaptionOmitted || fullSave.caption !== seed.expectedCaption || !fullSave.valid || !fullSave.stable)) });
        }
        results.push({ key: site.key, wordpress: site.wordpress, php: site.php, cases });
      }
      console.log(`[${i + 1}/5] ${site.key}: ${mode === 'prepare' ? 'prepared' : 'metadata failures=' + results.at(-1).cases.filter(row => row.failed).length}`);
    } finally { await context.close(); }
  }
  await fs.writeFile(target, JSON.stringify(results, null, 2) + '\n');
  if (mode !== 'prepare' && results.some(row => row.cases.some(test => test.failed))) process.exitCode = 1;
} finally { await browser.close(); }
console.log('Output: ' + target);
