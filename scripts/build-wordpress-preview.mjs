import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = process.argv[2];
if (!['--build', '--check'].includes(mode)) {
  throw new Error('Usage: node scripts/build-wordpress-preview.mjs --build|--check');
}
const [source, css, javascript, runtime, clock, configuration] = await Promise.all([
  fs.readFile(path.join(root, 'wordpress/preview/seed.php'), 'utf8'),
  fs.readFile(path.join(root, 'wordpress/preview/demo.css'), 'utf8'),
  fs.readFile(path.join(root, 'wordpress/preview/demo.js'), 'utf8'),
  fs.readFile(path.join(root, 'wordpress/preview/runtime.php'), 'utf8'),
  fs.readFile(path.join(root, 'wordpress/preview/clock.php'), 'utf8'),
  fs.readFile(path.join(root, 'wordpress/preview/config.json'), 'utf8'),
]);
const marker = '/* SDC_PREVIEW_CSS */';
const configMarker = '/* SDC_PREVIEW_CONFIG */';
if (source.split(marker).length !== 2 || css.includes('\nHTML;') || source.split(configMarker).length !== 2 || configuration.includes('\nSDC_CONFIG;')) {
  throw new Error('The preview CSS must have exactly one safe insertion point.');
}
const config = JSON.parse(configuration);
if (config.presets.length !== 3 || !config.cities.length || !config.initial) {
  throw new Error('The guided preview configuration is incomplete.');
}
const blueprint = {
  $schema: 'https://playground.wordpress.net/blueprint-schema.json',
  landingPage: '/',
  preferredVersions: { php: '8.3', wp: 'latest' },
  features: { networking: false },
  login: true,
  steps: [
    {
      step: 'installPlugin',
      pluginData: { resource: 'wordpress.org/plugins', slug: 'simple-digital-clock' },
      options: { activate: true },
      progress: { caption: 'Installing Simple Digital Clock' },
    },
    {
      step: 'installTheme',
      themeData: { resource: 'wordpress.org/themes', slug: 'twentytwentyfive' },
      options: { activate: true },
      progress: { caption: 'Preparing your clock workspace' },
    },
    { step: 'mkdir', path: '/wordpress/wp-content/mu-plugins/sdc-preview' },
    { step: 'writeFile', path: '/wordpress/wp-content/mu-plugins/sdc-preview/clock.php', data: clock },
    { step: 'writeFile', path: '/wordpress/wp-content/mu-plugins/sdc-preview.php', data: runtime },
    { step: 'writeFile', path: '/wordpress/wp-content/mu-plugins/sdc-preview/demo.js', data: javascript },
    {
      step: 'runPHP',
      code: source.replace(marker, css.trimEnd()).replace(configMarker, configuration.trimEnd()),
      progress: { caption: 'Getting your live clock ready' },
    },
  ],
};
const target = path.join(root, 'wordpress/wporg-assets/blueprints/blueprint.json');
const output = JSON.stringify(blueprint, null, 2) + '\n';
if (mode === '--check') {
  if (await fs.readFile(target, 'utf8') !== output) {
    throw new Error('The generated blueprint is stale. Run this script with --build.');
  }
} else {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, output);
}
console.log(`PASS: preview ${mode === '--check' ? 'matches its sources' : 'built'}; ${Buffer.byteLength(output)} bytes; ${target}`);
