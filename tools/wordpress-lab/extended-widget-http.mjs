import fs from 'node:fs/promises';
import path from 'node:path';
import { openEditor, launchLabBrowser } from './browser-helpers.mjs';

const label = process.argv[2] || 'review5-compat';
if (!/^[a-z0-9-]+$/.test(label)) throw new Error('Invalid widget HTTP evidence label');
const directory = path.resolve('.local/wordpress-lab', label);
const configuration = path.resolve('.local/wordpress-lab/review5-compat');
const target = path.join(directory, 'widgets-http-chromium.json');
await fs.access(target).then(() => { throw new Error('Refusing to overwrite widget HTTP evidence'); }, error => { if (error.code !== 'ENOENT') throw error; });
const sites = JSON.parse(await fs.readFile(path.join(configuration, 'sites.json'), 'utf8'));
const seeds = JSON.parse(await fs.readFile(path.join(configuration, 'posts-seed.json'), 'utf8'));
const widgets = JSON.parse(await fs.readFile(path.join(directory, 'widgets-rest.json'), 'utf8'));
const account = JSON.parse(await fs.readFile(path.join(configuration, 'credentials.json'), 'utf8'));
const browser = await launchLabBrowser('chromium');
const results = [];
try {
  for (const site of sites.filter(site => site.multisite)) {
    if (!/^http:\/\/127\.0\.0\.1:19531(\/clock-child\/)?$/.test(site.url)) throw new Error('Non-lab widget target');
    const context = await browser.newContext({ timezoneId: 'UTC' });
    try {
      const seed = seeds.find(row => row.key === site.key).records.find(record => record.role === 'siteadmin');
      const page = await openEditor(context, { ...site, url: site.url.replace(/\/$/, ''), post_id: seed.id }, { username: account.site_admin_username, password: account.site_admin_password });
      const result = await page.evaluate(async ({ sidebar, userId, widgetId }) => {
        const me = await wp.apiFetch({ path: '/wp/v2/users/me?context=edit' });
        if (me.id !== userId || !me.capabilities.edit_theme_options) throw new Error('Unexpected widget test permissions');
        const inspect = content => {
          const block = wp.blocks.parse(content)[0];
          const template = document.createElement('template'); template.innerHTML = content;
          return { valid: block.isValid, caption: block.attributes.caption, dom: template.content.querySelector('timenow-zone-sdcw').getAttribute('caption') };
        };
        const input = wp.blocks.serialize([wp.blocks.createBlock('simple-digital-clock-block/widget-block', { caption: '&NotEqualTilde; <clock>', timeZone: 'UTC' })]);
        if (!inspect(input).valid) throw new Error('Invalid original widget');
        const created = await wp.apiFetch({ path: `/wp/v2/widgets/${widgetId}`, method: 'POST', data: { sidebar, instance: { raw: { content: input } } } });
        const saved = await wp.apiFetch({ path: `/wp/v2/widgets/${created.id}?context=edit` });
        // The users endpoint exposes role caps; multisite map_meta_cap denies unfiltered_html separately.
        return { id: created.id, user_id: me.id, role_cap_edit_widgets: me.capabilities.edit_theme_options, role_cap_unfiltered_html: !!me.capabilities.unfiltered_html, input, content: saved.instance.raw.content, before: inspect(input), after: inspect(saved.instance.raw.content) };
      }, { sidebar: site.key === 'ms85-child' ? 'sidebar-1' : 'sdcw-lab', userId: site.users.site_admin_username, widgetId: widgets.find(row => row.key === site.key).results.find(row => row.login === 'clock_site_admin').widget_id });
      if (site.key === 'ms85-child') {
        await page.goto(`${site.url}?p=${seed.id}`, { waitUntil: 'domcontentloaded' });
        const clock = page.locator(`#${result.id} timenow-zone-sdcw`);
        await clock.waitFor();
        result.frontend_caption = await clock.getAttribute('caption');
      }
      results.push({ key: site.key, ...result });
      console.log(`${site.key}: HTTP widget created=${result.id}, valid=${result.after.valid}`);
    } finally { await context.close(); }
  }
  await fs.writeFile(target, JSON.stringify(results, null, 2) + '\n');
  if (results.some(row => !row.after.valid || row.after.dom !== row.before.dom)) process.exitCode = 1;
} finally { await browser.close(); }
console.log('Output: ' + target);
