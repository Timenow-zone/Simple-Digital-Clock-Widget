import fs from 'node:fs/promises';
import path from 'node:path';
import { launchLabBrowser } from './browser-helpers.mjs';

const [phase, engine = 'chromium', label = 'entities-fix', count = '8500'] = process.argv.slice(2);
const expectedCases = Number(count);
if (!/^[a-z0-9-]+$/.test(phase || '') || !/^[a-z0-9-]+$/.test(label) || !['chromium', 'firefox', 'webkit'].includes(engine) || ![8500, 9684].includes(expectedCases)) {
  throw new Error('Usage: html5-entity-dom.mjs phase [engine] [label] [8500|9684]');
}
const directory = path.resolve('.local/wordpress-lab', label);
const target = path.join(directory, `all-entities-${phase}-${engine}.json`);
try { await fs.access(target); throw new Error('Refusing to overwrite entity evidence'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const samples = JSON.parse(await fs.readFile(path.join(directory, `pipeline-${phase}.json`), 'utf8'));
const browser = await launchLabBrowser(engine);
const results = [];
try {
  const page = await browser.newPage();
  for (const [index, sample] of samples.entries()) {
    const result = await page.evaluate(({ input, output, names }) => {
      const attributes = html => {
        const template = document.createElement('template'); template.innerHTML = html;
        return [...template.content.querySelectorAll('timenow-zone-sdcw')].map(element => element.getAttribute('caption'));
      };
      const before = attributes(input); const after = attributes(output);
      const failures = [];
      for (const [index, name] of names.entries()) {
        if (before[index] !== after[index]) failures.push({ name, expected: before[index], actual: after[index] });
      }
      return { cases: names.length, beforeCount: before.length, afterCount: after.length, failed: failures.length, failures };
    }, sample);
    if (result.beforeCount !== expectedCases || result.afterCount !== expectedCases || result.cases !== expectedCases) throw new Error('Invalid pipeline/DOM fixture count: ' + sample.service);
    results.push({ service: sample.service, engine, pipeline_failed: sample.failed, ...result });
    console.log(`[${index + 1}/${samples.length}] ${sample.service}/${engine}: ${result.cases - result.failed}/${result.cases} DOM meanings retained`);
  }
  await fs.writeFile(target, JSON.stringify(results, null, 2) + '\n');
  if (results.some(result => result.failed || result.pipeline_failed)) process.exitCode = 1;
} finally { await browser.close(); }
console.log('Output: ' + target);
