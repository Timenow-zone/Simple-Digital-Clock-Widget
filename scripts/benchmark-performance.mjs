#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";

const ROOT = process.cwd();
const TAG = "timenow-zone-sdcw";
const LEGACY_PATH = path.join(ROOT, "dist", "0.6.0.min.js");
const CANDIDATE_PATH = path.join(ROOT, "dist", "latest.min.js");

const RUNS = Number(process.env.BENCH_RUNS || 5);
const WARMUPS = Number(process.env.BENCH_WARMUPS || 1);
const DURATION_MS = Number(process.env.BENCH_DURATION_MS || 1500);
const HEADED = process.env.BENCH_HEADED === "1";

const JSON_OUT = path.join(ROOT, "performance-results.json");
const MD_OUT = path.join(ROOT, "performance-results.md");

const scenarios = [
  { id: "legacy-second-1", build: "legacy", count: 1, hundredths: false },
  { id: "candidate-second-1", build: "candidate", count: 1, hundredths: false },

  { id: "legacy-second-25", build: "legacy", count: 25, hundredths: false },
  { id: "candidate-second-25", build: "candidate", count: 25, hundredths: false },

  { id: "legacy-second-100", build: "legacy", count: 100, hundredths: false },
  { id: "candidate-second-100", build: "candidate", count: 100, hundredths: false },

  { id: "candidate-hundredths-1", build: "candidate", count: 1, hundredths: true },
  { id: "candidate-hundredths-25", build: "candidate", count: 25, hundredths: true },
  { id: "candidate-hundredths-50", build: "candidate", count: 50, hundredths: true },
  { id: "candidate-hundredths-100", build: "candidate", count: 100, hundredths: true },
];

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
}

function metricMap(metrics) {
  return Object.fromEntries(metrics.map(({ name, value }) => [name, value]));
}

function deltaMetric(before, after, name, multiplier = 1) {
  return ((after[name] || 0) - (before[name] || 0)) * multiplier;
}

function fmt(value, digits = 1) {
  return Number.isFinite(value) ? value.toFixed(digits) : "n/a";
}

function ratio(candidate, legacy) {
  if (!Number.isFinite(candidate) || !Number.isFinite(legacy) || legacy <= 0) return null;
  return candidate / legacy;
}

function direction(r, absoluteDelta, noiseFloor = 2) {
  if (r == null) return "n/a";
  if (Math.abs(absoluteDelta) < noiseFloor) return "≈ same";
  if (r <= 0.90) return "better";
  if (r >= 1.10) return "worse";
  return "≈ same";
}

async function readBundle(filePath, label) {
  const code = await fs.readFile(filePath, "utf8");
  if (!code.includes(TAG)) {
    throw new Error(`${label}: ${filePath} does not look like the widget bundle.`);
  }
  return code;
}

async function collectRun(browser, bundleCode, scenario) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });

  const page = await context.newPage();

  await page.setContent(`
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          html, body { margin: 0; padding: 0; }
          #root {
            display: grid;
            grid-template-columns: repeat(10, 120px);
            gap: 2px;
            align-items: start;
          }
        </style>
      </head>
      <body><div id="root"></div></body>
    </html>
  `);

  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.stack || error.message));

  await page.addScriptTag({ content: bundleCode });
  await page.waitForFunction(
    (tag) => Boolean(customElements.get(tag)),
    TAG,
    { timeout: 3000 },
  );

  const cdp = await context.newCDPSession(page);
  await cdp.send("Performance.enable");

  const mount = await page.evaluate(
    async ({ tag, count, hundredths }) => {
      const root = document.getElementById("root");
      const start = performance.now();

      for (let i = 0; i < count; i += 1) {
        const el = document.createElement(tag);
        el.setAttribute("width", "120");
        el.setAttribute("locale", i % 2 === 0 ? "en-US" : "de-DE");
        el.setAttribute("time-zone", "UTC");
        el.setAttribute("period", "false");

        if (hundredths) {
          el.setAttribute("hundredths", "");
        } else {
          el.setAttribute("second", "");
        }

        root.appendChild(el);
      }

      const deadline = performance.now() + 3000;

      while (performance.now() < deadline) {
        const widgets = [...root.querySelectorAll(tag)];
        const ready =
          widgets.length === count &&
          widgets.every((el) => {
            const anchor = el.shadowRoot?.querySelector("a");
            return Boolean(anchor && anchor.textContent);
          });

        if (ready) {
          return {
            mountMs: performance.now() - start,
            mounted: widgets.length,
          };
        }

        await new Promise((resolve) => requestAnimationFrame(resolve));
      }

      throw new Error(`Only part of ${count} widgets became ready before timeout.`);
    },
    { tag: TAG, count: scenario.count, hundredths: scenario.hundredths },
  );

  // Let initial resize/layout/font work settle before steady-state measurement.
  await page.waitForTimeout(250);

  const before = metricMap((await cdp.send("Performance.getMetrics")).metrics);

  const frameStats = await page.evaluate(async (durationMs) => {
    const frameGaps = [];
    const longTasks = [];
    let previous = 0;

    let observer = null;
    if (typeof PerformanceObserver !== "undefined") {
      try {
        observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            longTasks.push(entry.duration);
          }
        });
        observer.observe({ entryTypes: ["longtask"] });
      } catch (_) {
        observer = null;
      }
    }

    const started = performance.now();

    await new Promise((resolve) => {
      function tick(now) {
        if (previous) frameGaps.push(now - previous);
        previous = now;

        if (performance.now() - started >= durationMs) {
          resolve();
          return;
        }

        requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    });

    if (observer) observer.disconnect();

    return {
      frameGaps,
      longTasks,
    };
  }, DURATION_MS);

  const after = metricMap((await cdp.send("Performance.getMetrics")).metrics);

  const frameAverage = frameStats.frameGaps.length
    ? frameStats.frameGaps.reduce((sum, value) => sum + value, 0) /
      frameStats.frameGaps.length
    : 0;

  const result = {
    mountMs: mount.mountMs,
    mounted: mount.mounted,
    fps: frameAverage > 0 ? 1000 / frameAverage : 0,
    frameP95Ms: percentile(frameStats.frameGaps, 0.95),
    frameMaxMs: frameStats.frameGaps.length
      ? Math.max(...frameStats.frameGaps)
      : 0,
    longTaskCount: frameStats.longTasks.length,
    longTaskTotalMs: frameStats.longTasks.reduce((sum, value) => sum + value, 0),

    // CDP Performance metrics are cumulative seconds; convert to ms.
    taskMs: deltaMetric(before, after, "TaskDuration", 1000),
    scriptMs: deltaMetric(before, after, "ScriptDuration", 1000),
    layoutMs: deltaMetric(before, after, "LayoutDuration", 1000),
    recalcStyleMs: deltaMetric(before, after, "RecalcStyleDuration", 1000),

    heapUsedMb: (after.JSHeapUsedSize || 0) / 1024 / 1024,
    runtimeErrors,
  };

  await context.close();
  return result;
}

function aggregateScenario(scenario, runs) {
  const fields = [
    "mountMs",
    "fps",
    "frameP95Ms",
    "frameMaxMs",
    "longTaskCount",
    "longTaskTotalMs",
    "taskMs",
    "scriptMs",
    "layoutMs",
    "recalcStyleMs",
    "heapUsedMb",
  ];

  const medianResult = {};
  for (const field of fields) {
    medianResult[field] = median(runs.map((run) => run[field]));
  }

  return {
    ...scenario,
    durationMs: DURATION_MS,
    runs: runs.length,
    median: medianResult,
    runtimeErrors: runs.flatMap((run) => run.runtimeErrors),
    raw: runs,
  };
}

function comparisonRows(aggregates) {
  const byId = Object.fromEntries(aggregates.map((item) => [item.id, item]));
  const rows = [];

  for (const count of [1, 25, 100]) {
    const legacy = byId[`legacy-second-${count}`].median;
    const candidate = byId[`candidate-second-${count}`].median;

    for (const [metric, label, noiseFloor] of [
      ["mountMs", "mount", 2],
      ["taskMs", "task", 2],
      ["scriptMs", "script", 2],
      ["frameP95Ms", "frame p95", 0.5],
    ]) {
      const r = ratio(candidate[metric], legacy[metric]);
      const delta = candidate[metric] - legacy[metric];
      rows.push({
        count,
        metric,
        label,
        legacy: legacy[metric],
        candidate: candidate[metric],
        delta,
        ratio: r,
        direction: direction(r, delta, noiseFloor),
      });
    }
  }

  return rows;
}

function renderMarkdown(aggregates, comparisons, metadata) {
  const lines = [];

  lines.push("# Simple Digital Clock Widget — performance benchmark");
  lines.push("");
  lines.push(`- Date: ${metadata.date}`);
  lines.push(`- Chromium: ${metadata.chromiumVersion}`);
  lines.push(`- Runs: ${RUNS} measured + ${WARMUPS} warmup(s)`);
  lines.push(`- Steady-state window: ${DURATION_MS} ms`);
  lines.push(`- Legacy SHA256: \`${metadata.legacySha256}\``);
  lines.push(`- Candidate SHA256: \`${metadata.candidateSha256}\``);
  lines.push("");

  lines.push("## Scenario medians");
  lines.push("");
  lines.push(
    "| Scenario | Widgets | Mount ms | Task ms | Script ms | FPS | p95 frame ms | Max frame ms | Long tasks | Heap MB |"
  );
  lines.push("|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|");

  for (const item of aggregates) {
    const m = item.median;
    lines.push(
      `| ${item.id} | ${item.count} | ${fmt(m.mountMs)} | ${fmt(m.taskMs)} | ${fmt(m.scriptMs)} | ${fmt(m.fps)} | ${fmt(m.frameP95Ms)} | ${fmt(m.frameMaxMs)} | ${fmt(m.longTaskCount, 0)} | ${fmt(m.heapUsedMb)} |`
    );
  }

  lines.push("");
  lines.push("## Candidate legacy-mode vs immutable 0.6.0");
  lines.push("");
  lines.push("| Widgets | Metric | Legacy | Candidate | Δ | Ratio | Direction |");
  lines.push("|---:|---|---:|---:|---:|---:|---|");

  for (const row of comparisons) {
    lines.push(
      `| ${row.count} | ${row.label} | ${fmt(row.legacy)} | ${fmt(row.candidate)} | ${fmt(row.delta)} | ${row.ratio == null ? "n/a" : `${fmt(row.ratio, 2)}×`} | ${row.direction} |`
    );
  }

  const errors = aggregates.flatMap((item) =>
    item.runtimeErrors.map((error) => ({ scenario: item.id, error })),
  );

  lines.push("");
  lines.push("## Runtime errors");
  lines.push("");

  if (!errors.length) {
    lines.push("None.");
  } else {
    for (const item of errors) {
      lines.push(`- **${item.scenario}**: ${item.error}`);
    }
  }

  lines.push("");
  lines.push(
    "> Direction is deliberately conservative: differences under the absolute noise floor are reported as ≈ same; otherwise ≥10% is marked better/worse. Final release judgment should use the raw medians and repeatability, not the label alone."
  );

  return `${lines.join("\n")}\n`;
}

async function sha256(filePath) {
  const { createHash } = await import("node:crypto");
  const data = await fs.readFile(filePath);
  return createHash("sha256").update(data).digest("hex");
}

async function main() {
  console.log("Simple Digital Clock Widget — performance benchmark");
  console.log(`Runs: ${RUNS} measured + ${WARMUPS} warmup(s) per scenario`);
  console.log(`Steady-state window: ${DURATION_MS} ms`);
  console.log(`Mode: ${HEADED ? "headed" : "headless"} Chromium`);
  console.log("");

  const [legacyCode, candidateCode] = await Promise.all([
    readBundle(LEGACY_PATH, "legacy"),
    readBundle(CANDIDATE_PATH, "candidate"),
  ]);

  const browser = await chromium.launch({ headless: !HEADED });

  try {
    const chromiumVersion = browser.version();
    const aggregates = [];

    for (let index = 0; index < scenarios.length; index += 1) {
      const scenario = scenarios[index];
      const bundleCode = scenario.build === "legacy" ? legacyCode : candidateCode;

      console.log(
        `[${index + 1}/${scenarios.length}] ${scenario.id} — ${scenario.count} widget(s)`
      );

      for (let warmup = 0; warmup < WARMUPS; warmup += 1) {
        await collectRun(browser, bundleCode, scenario);
      }

      const runs = [];
      for (let run = 0; run < RUNS; run += 1) {
        const result = await collectRun(browser, bundleCode, scenario);
        runs.push(result);

        process.stdout.write(
          `  run ${run + 1}/${RUNS}: mount=${fmt(result.mountMs)}ms task=${fmt(result.taskMs)}ms script=${fmt(result.scriptMs)}ms fps=${fmt(result.fps)} p95=${fmt(result.frameP95Ms)}ms\n`
        );
      }

      const aggregate = aggregateScenario(scenario, runs);
      aggregates.push(aggregate);

      const m = aggregate.median;
      console.log(
        `  MEDIAN: mount=${fmt(m.mountMs)}ms task=${fmt(m.taskMs)}ms script=${fmt(m.scriptMs)}ms fps=${fmt(m.fps)} p95=${fmt(m.frameP95Ms)}ms`
      );

      if (aggregate.runtimeErrors.length) {
        console.log(`  RUNTIME ERRORS: ${aggregate.runtimeErrors.length}`);
      }

      console.log("");
    }

    const comparisons = comparisonRows(aggregates);

    const metadata = {
      date: new Date().toISOString(),
      node: process.version,
      chromiumVersion,
      runs: RUNS,
      warmups: WARMUPS,
      durationMs: DURATION_MS,
      headed: HEADED,
      legacyPath: path.relative(ROOT, LEGACY_PATH),
      candidatePath: path.relative(ROOT, CANDIDATE_PATH),
      legacySha256: await sha256(LEGACY_PATH),
      candidateSha256: await sha256(CANDIDATE_PATH),
    };

    const report = {
      metadata,
      aggregates,
      comparisons,
    };

    await fs.writeFile(JSON_OUT, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    await fs.writeFile(
      MD_OUT,
      renderMarkdown(aggregates, comparisons, metadata),
      "utf8",
    );

    console.log("Candidate legacy-mode vs immutable 0.6.0");
    console.log("------------------------------------------------");
    for (const count of [1, 25, 100]) {
      const rows = comparisons.filter((row) => row.count === count);
      console.log(`${count} widget(s):`);
      for (const row of rows) {
        console.log(
          `  ${row.label.padEnd(10)} legacy=${fmt(row.legacy).padStart(7)} candidate=${fmt(row.candidate).padStart(7)} Δ=${fmt(row.delta).padStart(7)} ratio=${row.ratio == null ? "n/a" : `${fmt(row.ratio, 2)}x`} -> ${row.direction}`
        );
      }
    }

    const runtimeErrors = aggregates.reduce(
      (sum, item) => sum + item.runtimeErrors.length,
      0,
    );

    console.log("");
    console.log(`Runtime errors: ${runtimeErrors}`);
    console.log(`JSON: ${path.relative(ROOT, JSON_OUT)}`);
    console.log(`Markdown: ${path.relative(ROOT, MD_OUT)}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
