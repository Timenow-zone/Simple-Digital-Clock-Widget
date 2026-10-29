import fs from 'node:fs/promises';
import path from 'node:path';

export async function loadBetaProfile(profile) {
  const allowed = { beta83: 'http://127.0.0.1:19533', beta85: 'http://127.0.0.1:19534' };
  if (!Object.hasOwn(allowed, profile)) throw new Error('Unknown beta lab profile');
  const folder = path.resolve('.local/wordpress-lab/wp72-beta');
  const sites = JSON.parse(await fs.readFile(path.join(folder, 'sites.json'), 'utf8'));
  const accounts = JSON.parse(await fs.readFile(path.join(folder, 'accounts.json'), 'utf8'))[profile];
  const site = sites.find(site => site.key === profile);
  if (!site || site.url !== allowed[profile] || site.wordpress !== '7.2-beta2' || !accounts) throw new Error('Wrong beta lab');
  return { site: { ...site, users: { ...site.users, author_username: site.users.author.id } }, accounts: {
    ...accounts.administrator, author_username: accounts.author.username, author_password: accounts.author.password,
  } };
}

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

export async function waitForLabEditor(page, postId) {
  await page.waitForFunction(id => {
    if (!window.wp?.blocks?.getBlockType('simple-digital-clock-block/widget-block') || wp.data.select('core/editor').getCurrentPostId() !== id || !wp.data.select('core/editor').__unstableIsEditorReady()) return false;
    const frame = document.querySelector('iframe[name="editor-canvas"]');
    return !!(frame ? frame.contentDocument : document)?.querySelector('.block-editor-block-list__layout');
  }, postId);
}

export async function openEditor(context, site, credentials) {
  // Keep external font/CDN requests outside the isolated acceptance environment.
  const origin = new URL(site.url).origin;
  await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.fallback() : route.abort());
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  const editorUrl = `${site.url}/wp-admin/post.php?post=${site.post_id}&action=edit`;
  // Login directly to the requested editor, avoiding a disposable dashboard.
  await page.goto(`${site.url}/wp-login.php?redirect_to=${encodeURIComponent(editorUrl)}`, { waitUntil: 'domcontentloaded' });
  await page.locator('#user_login').fill(credentials.username);
  await page.locator('#user_pass').fill(credentials.password);
  await Promise.all([
    page.waitForURL('**/wp-admin/**', { waitUntil: 'load' }),
    page.locator('#wp-submit').click(),
  ]);
  await waitForLabEditor(page, site.post_id);
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
