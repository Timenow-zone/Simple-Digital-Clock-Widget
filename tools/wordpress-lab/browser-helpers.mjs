import fs from 'node:fs/promises';
import path from 'node:path';

export async function launchLabBrowser(engine) {
  if (!['chromium', 'firefox', 'webkit'].includes(engine)) throw new Error('Unsupported lab browser');
  const browsers = await import('playwright');
  const endpoint = process.env.SDCW_LAB_FIREFOX_WS;
  if (engine === 'firefox' && endpoint) {
    const url = new URL(endpoint);
    if (url.protocol !== 'ws:' || url.hostname !== '127.0.0.1' || url.port !== '19527') throw new Error('Refusing a non-local Firefox test endpoint');
    return browsers.firefox.connect(endpoint, { exposeNetwork: '<loopback>', timeout: 30000 });
  }
  return browsers[engine].launch({ headless: true, timeout: 45000 });
}

export async function loadLab() {
  const output = path.resolve('.local/wordpress-lab');
  const sites = JSON.parse(await fs.readFile(path.join(output, 'sites.json'), 'utf8'));
  const allowed = { wp71: 'http://127.0.0.1:19427', wp84: 'http://127.0.0.1:19428', wp63: 'http://127.0.0.1:19429', wp68: 'http://127.0.0.1:19430' };
  if (!Array.isArray(sites) || sites.length !== 4 || new Set(sites.map(site => site.service)).size !== 4 || sites.some(site => allowed[site.service] !== site.url || !Number.isInteger(site.post_id))) {
    throw new Error('Refusing to run against anything except the four generated loopback sites.');
  }
  const credentials = JSON.parse(await fs.readFile(path.join(output, 'browser-credentials.json'), 'utf8'));
  return { output, sites, credentials };
}

export async function openEditor(context, site, credentials) {
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  await page.goto(`${site.url}/wp-login.php`, { waitUntil: 'domcontentloaded' });
  await page.locator('#user_login').fill(credentials.username);
  await page.locator('#user_pass').fill(credentials.password);
  await Promise.all([
    page.waitForURL('**/wp-admin/**', { waitUntil: 'domcontentloaded' }),
    page.locator('#wp-submit').click(),
  ]);
  await page.goto(`${site.url}/wp-admin/post.php?post=${site.post_id}&action=edit`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.wp?.blocks?.getBlockType('simple-digital-clock-block/widget-block') && window.wp?.data?.select('core/editor')?.getCurrentPostId());
  const closeGuide = page.getByRole('button', { name: /Close (dialog|modal)|Dismiss this guide/i });
  if (await closeGuide.count() === 1) await closeGuide.click();
  return page;
}

export async function clockState(page) {
  for (const frame of page.frames()) {
    if (await frame.locator('timenow-zone-sdcw').count()) {
      return frame.locator('timenow-zone-sdcw').first().evaluate(element => ({
        defined: !!customElements.get('timenow-zone-sdcw'),
        shadow: !!element.shadowRoot,
        text: element.shadowRoot?.textContent,
        rect: { width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height },
      }));
    }
  }
  return null;
}
