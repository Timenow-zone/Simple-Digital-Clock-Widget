import fs from 'node:fs/promises';
import path from 'node:path';
import { launchLabBrowser } from './browser-helpers.mjs';

const [engine = 'chromium', label = 'review4'] = process.argv.slice(2);
if (!/^[a-z0-9-]+$/.test(label)) throw new Error('Invalid evidence label');
const directory = path.resolve('.local/wordpress-lab', label);
const target = path.join(directory, `boundaries-${engine}.json`);
await fs.access(target).then(() => { throw new Error('Refusing to overwrite review evidence'); }, error => { if (error.code !== 'ENOENT') throw error; });
const browser = await launchLabBrowser(engine);
const results = [];
try {
  const page = await browser.newPage();
  for (const [index, service] of ['wp71', 'wp84', 'wp63', 'wp68'].entries()) {
    const candidate = JSON.parse(await fs.readFile(path.join(directory, `${service}-candidate.json`), 'utf8'));
    const previous = JSON.parse(await fs.readFile(path.join(directory, `${service}-previous.json`), 'utf8'));
    const result = await page.evaluate(({ candidate, previous }) => {
      const attr = html => {
        const element = document.createElement('template');
        element.innerHTML = html;
        return element.content.querySelector('timenow-zone-sdcw')?.getAttribute('caption');
      };
      const newRegressions = [], existingDifferences = [], repeatedSaveRegressions = [], remainingInstability = [], repairs = [];
      for (const [index, row] of candidate.cases.entries()) {
        const old = previous.cases[index];
        if (row.name !== old.name || row.input !== old.input) throw new Error('Different comparison inputs');
        const expected = attr(row.input), actual = attr(row.output), oldValue = attr(old.output);
        const details = { name: row.name, input: row.input, output: row.output, expected, actual, previous: oldValue, again: row.again };
        if (actual !== expected) (oldValue === expected ? newRegressions : existingDifferences).push(details);
        if (actual === expected && oldValue !== expected) repairs.push(row.name);
        if (attr(row.again) !== actual) (attr(old.again) === oldValue ? repeatedSaveRegressions : remainingInstability).push(details);
      }
      return { cases: candidate.cases.length, newRegressions, existingDifferences, repeatedSaveRegressions, remainingInstability, repairs };
    }, { candidate, previous });
    results.push({ service, engine, ...result });
    console.log(`[${index + 1}/4] ${service}: new=${result.newRegressions.length}; repeated-new=${result.repeatedSaveRegressions.length}; previous-differences=${result.existingDifferences.length}; repairs=${result.repairs.length}`);
  }
  await fs.writeFile(target, JSON.stringify(results, null, 2) + '\n');
  if (results.some(row => row.newRegressions.length || row.repeatedSaveRegressions.length)) process.exitCode = 1;
} finally { await browser.close(); }
console.log('Output: ' + target);
