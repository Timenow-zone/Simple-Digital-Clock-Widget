import fs from 'node:fs/promises';
import path from 'node:path';
import { loadLab, openEditor, clockState, launchLabBrowser } from './browser-helpers.mjs';

const mode = process.argv[2];
if (!['seed', 'test'].includes(mode)) throw new Error('Usage: node tools/wordpress-lab/patch-tests.mjs seed|test');
const phase = process.argv[3] || mode;
if (!/^[a-z0-9-]+$/.test(phase)) throw new Error('Invalid result label');
const browserName = process.argv[4] || 'chromium';
if (!['chromium', 'firefox', 'webkit'].includes(browserName)) throw new Error('Unsupported browser');
const { output, sites, credentials } = await loadLab();
const directory = path.join(output, 'patch');
await fs.mkdir(directory, { recursive: true });
const browser = await launchLabBrowser(browserName);
const name = 'simple-digital-clock-block/widget-block';
const started = Date.now();
const results = [];
const author = JSON.parse(await fs.readFile(path.join(output, 'patch-author.json'), 'utf8'));
const specs = [
  { name: 'default', attributes: {} },
  { name: 'explicit-zone', attributes: { timeZone: 'Asia/Kathmandu', caption: 'Nepal', locale: 'ne-NP' } },
  { name: 'viewer-local', attributes: { timeZone: '', caption: 'Viewer local', locale: 'en-GB' } },
  { name: 'all-options', attributes: { timeZone: 'Europe/Kyiv', locale: 'uk', width: 0, rounded: 0, border: true, second: false, hundredths: true, period: true, date: true, shadow: 'shadow-xl', align: 'right', caption: 'Київ & <clock> "quoted"', fontFamily: 'Roboto Mono', backgroundColor: '#123abc', background: 'radial-gradient(rgb(106, 17, 203) 0%, rgb(37, 117, 252) 100%)' } },
  { name: 'solid-color', attributes: { background: '', backgroundColor: 'rgba(12, 34, 56, 0.8)', width: 333, rounded: 0.25, align: 'center', timeZone: 'America/New_York' } },
  { name: 'cleared-colors', attributes: { background: '', backgroundColor: '', rounded: 2.5, width: 1000, second: false, timeZone: 'UTC' } },
  { name: 'period-and-seconds', attributes: { period: true, second: true, date: true, hundredths: false, locale: 'en-US', timeZone: 'UTC', border: true } },
];

async function saveFixture(page, content, title) {
  return page.evaluate(async ({ content, title }) => {
    const post = await wp.data.dispatch('core').saveEntityRecord('postType', 'post', { title, content, status: 'publish' });
    if (!post?.id) throw new Error('Fixture save did not return a post ID');
    return post.id;
  }, { content, title });
}

try {
  if (mode === 'seed') {
    const fixturePath = path.join(directory, 'baseline-posts.json');
    try { await fs.access(fixturePath); throw new Error('Baseline posts already exist; refusing to overwrite upgrade evidence'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    const seeds = [];
    let blocks;
    for (const [index, site] of sites.entries()) {
      console.log(`[${index + 1}/4] Seed immutable 1.1.1 posts on ${site.service}`);
      const context = await browser.newContext({ timezoneId: 'UTC' });
      try {
        const page = await openEditor(context, site, credentials);
        blocks = await page.evaluate(({ specs, name }) => specs.map(spec => {
          const block = wp.blocks.createBlock(name, spec.attributes);
          return { name: spec.name, attributes: block.attributes, content: wp.blocks.serialize([block]), html: wp.blocks.getSaveContent(name, block.attributes) };
        }), { specs, name });
        const posts = [];
        for (const block of blocks) posts.push({ name: block.name, id: await saveFixture(page, block.content, `Clock immutable 1.1.1: ${block.name}`), content: block.content });
        seeds.push({ service: site.service, posts });
      } finally { await context.close(); }
    }
    const source = await fs.readFile(path.join(output, 'baseline-source/simple-digital-clock/block.js'), 'utf8');
    const gradients = [...new Set([...source.matchAll(/gradient:\s*"([^"]+)"/g)].map(match => match[1]))];
    if (!gradients.length) throw new Error('No baseline gradients extracted');
    const fixtures = { source: 'Official simple-digital-clock.1.1.1.zip', blocks, gradients };
    await fs.writeFile(path.join(output, 'packages/regression-fixtures.json'), JSON.stringify(fixtures, null, 2) + '\n');
    await fs.writeFile(path.join(directory, 'baseline-posts.json'), JSON.stringify(seeds, null, 2) + '\n');
    await fs.mkdir('tools/wordpress-lab/fixtures', { recursive: true });
    await fs.writeFile('tools/wordpress-lab/fixtures/1.1.1.json', JSON.stringify(fixtures, null, 2) + '\n');
    console.log(`Seeded ${seeds.length * blocks.length} posts, ${gradients.length} distinct gradient presets; ${directory}`);
  } else {
    const fixtures = JSON.parse(await fs.readFile('tools/wordpress-lab/fixtures/1.1.1.json', 'utf8'));
    const seeds = JSON.parse(await fs.readFile(path.join(directory, 'baseline-posts.json'), 'utf8'));
    for (const [index, site] of sites.entries()) {
      console.log(`[${index + 1}/4] ${phase}: ${site.service}; elapsed=${((Date.now() - started) / 1000).toFixed(1)}s`);
      const row = { service: site.service, checks: [], pageErrors: [] };
      const check = (name, passed, details) => row.checks.push({ name, passed: !!passed, ...(passed ? {} : { details }) });
      const context = await browser.newContext({ timezoneId: 'America/New_York', viewport: { width: 1400, height: 1000 } });
      context.on('page', page => page.on('pageerror', error => row.pageErrors.push(error.message)));
      try {
        const page = await openEditor(context, site, credentials);
        row.parsed = await page.evaluate(fixtures => fixtures.blocks.map(fixture => {
          const block = wp.blocks.parse(fixture.content)[0];
          const normalize = html => {
            const template = document.createElement('template');
            template.innerHTML = html;
            return template.innerHTML;
          };
          return { name: fixture.name, valid: block.isValid, timezone: block.attributes.timeZone, html: normalize(wp.blocks.getSaveContent(block.name, block.attributes)), expectedHtml: normalize(fixture.html) };
        }), fixtures);
        for (const parsed of row.parsed) {
          const fixture = fixtures.blocks.find(block => block.name === parsed.name);
          check(`legacy/${parsed.name}: valid`, parsed.valid, parsed);
          check(`legacy/${parsed.name}: timezone retained`, parsed.timezone === fixture.attributes.timeZone, parsed.timezone);
          check(`legacy/${parsed.name}: rendered HTML unchanged`, parsed.html === parsed.expectedHtml, parsed.html);
        }
        const fresh = await page.evaluate(name => {
          const variation = wp.data.select('core/blocks').getDefaultBlockVariation(name, 'inserter');
          const block = wp.blocks.createBlock(name, variation?.attributes);
          return { timezone: block.attributes.timeZone, content: wp.blocks.serialize([block]), browserTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone };
        }, name);
        check('new block uses browser timezone on insertion', fresh.timezone === fresh.browserTimezone, fresh);
        const localContext = await browser.newContext({ timezoneId: 'Asia/Tokyo' });
        try {
          const localPage = await openEditor(localContext, site, credentials);
          const transferred = await localPage.evaluate(content => {
            const block = wp.blocks.parse(content)[0]; return { valid: block.isValid, timezone: block.attributes.timeZone };
          }, fresh.content);
          check('new block stays valid in another timezone', transferred.valid && transferred.timezone === fresh.timezone, transferred);
        } finally { await localContext.close(); }

        const originalPost = seeds.find(seed => seed.service === site.service).posts.find(post => post.name === 'default');
        await page.goto(`${site.url}/wp-admin/post.php?post=${originalPost.id}&action=edit`);
        await page.waitForFunction(() => window.wp?.data?.select('core/block-editor')?.getBlocks().some(block => block.name === 'simple-digital-clock-block/widget-block'));
        const loaded = await page.evaluate(() => ({ valid: wp.data.select('core/block-editor').getBlocks()[0].isValid, dirty: wp.data.select('core/editor').isEditedPostDirty() }));
        check('persisted 1.1.1 post opens valid', loaded.valid, loaded);
        check('opening old post does not mark it dirty', !loaded.dirty, loaded);
        if (loaded.valid) {
          const resaved = await page.evaluate(async () => {
            wp.data.dispatch('core/editor').editPost({ content: wp.blocks.serialize(wp.data.select('core/block-editor').getBlocks()) });
            await wp.data.dispatch('core/editor').savePost();
            return { saved: wp.data.select('core/editor').didPostSaveRequestSucceed(), content: wp.data.select('core/editor').getEditedPostContent() };
          });
          check('old post can be resaved', resaved.saved, resaved);
        }
        const front = await context.newPage();
        await front.goto(`${site.url}/?p=${originalPost.id}`);
        await front.waitForFunction(() => document.querySelector('timenow-zone-sdcw')?.shadowRoot?.textContent?.match(/\d{1,2}:\d{2}/));
        const state = await clockState(front);
        check('old frontend renders after upgrade', state?.shadow && !state.text.includes('Error'), state);
        await page.screenshot({ path: path.join(directory, `${phase}-${site.service}-editor.png`), fullPage: false });

        const authorContext = await browser.newContext({ timezoneId: 'America/New_York' });
        try {
          const authorPage = await openEditor(authorContext, { ...site, post_id: author.post_ids[site.service] }, author);
          const authorResult = await authorPage.evaluate(async fixture => {
            const block = wp.blocks.parse(fixture.content)[0];
            if (!block.isValid) return { valid: false, saved: false };
            wp.data.dispatch('core/block-editor').resetBlocks([block]);
            await wp.data.dispatch('core/editor').savePost();
            return { valid: true, saved: wp.data.select('core/editor').didPostSaveRequestSucceed() };
          }, fixtures.blocks.find(block => block.name === 'all-options'));
          check('author can save legacy clock through editor/REST', authorResult.valid && authorResult.saved, authorResult);
          await authorPage.reload();
          await authorPage.waitForFunction(() => window.wp?.data?.select('core/editor')?.getCurrentPostId());
          const authorReload = await authorPage.evaluate(name => {
            const block = wp.data.select('core/block-editor').getBlocks().find(block => block.name === name);
            const template = document.createElement('template');
            template.innerHTML = block ? wp.blocks.getSaveContent(block.name, block.attributes) : '';
            return { valid: block?.isValid, timezone: block?.attributes.timeZone, html: template.innerHTML, content: wp.data.select('core/editor').getEditedPostContent() };
          }, name);
          check('author reload preserves clock and timezone', authorReload.valid && authorReload.timezone === 'Europe/Kyiv' && authorReload.content.includes('<timenow-zone-sdcw'), authorReload);
          check('author reload preserves all options and caption', authorReload.html === row.parsed.find(block => block.name === 'all-options').expectedHtml, authorReload);
          if (authorReload.valid && authorReload.content.includes('<timenow-zone-sdcw')) {
            const authorFront = await authorContext.newPage();
            await authorFront.goto(`${site.url}/?p=${author.post_ids[site.service]}`);
            await authorFront.waitForFunction(() => !!document.querySelector('timenow-zone-sdcw')?.shadowRoot);
            const authorState = await clockState(authorFront);
            check('author frontend renders caption as text', authorState.text.includes('Київ & <clock> "quoted"'), authorState);
            check('caption does not create HTML elements', await authorFront.locator('timenow-zone-sdcw').evaluate(element => element.shadowRoot.querySelector('clock') === null));
          } else {
            check('author frontend has a saved clock', false, 'Clock was removed or invalidated during saving');
          }
        } finally { await authorContext.close(); }
        check('no uncaught browser exceptions', row.pageErrors.length === 0, row.pageErrors);
      } catch (error) { check('browser test completes', false, error.stack); }
      finally { await context.close(); }
      row.failed = row.checks.filter(check => !check.passed).length;
      results.push(row);
      await fs.writeFile(path.join(directory, `${phase}-browser.json`), JSON.stringify(results, null, 2) + '\n');
      console.log(`${site.service}: ${row.checks.length - row.failed}/${row.checks.length} passed; failed=${row.failed}`);
    }
    if (results.some(row => row.failed)) process.exitCode = 1;
  }
} finally { await browser.close(); }
console.log(`Completed ${mode}; elapsed=${((Date.now() - started) / 1000).toFixed(1)}s; output=${directory}`);
