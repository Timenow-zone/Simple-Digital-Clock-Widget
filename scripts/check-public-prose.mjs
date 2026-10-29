#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const cyrillic = /\p{Script=Cyrillic}/u;

export function cyrillicProseLines(text) {
  const findings = [];
  let fence;

  for (const [index, line] of text.split(/\r?\n/).entries()) {
    const trimmed = line.trimStart();
    const marker = trimmed.match(/^(`{3,}|~{3,})/);
    if (fence) {
      if (marker && marker[1][0] === fence.character &&
          marker[1].length >= fence.length && trimmed.slice(marker[1].length).trim() === "") {
        fence = undefined;
      }
      continue;
    }
    if (marker) {
      fence = { character: marker[1][0], length: marker[1].length };
      continue;
    }

    const withoutCode = line
      .replace(/<!--(.*?)-->/g, "$1")
      .replace(/(`+).*?\1/g, "")
      .replace(/\]\((?:\\.|[^)])*\)/g, "]()");
    const descriptions = [...withoutCode.matchAll(/\b(?:alt|title)\s*=\s*(["'])(.*?)\1/gi)]
      .map((match) => match[2]).join(" ");
    const prose = withoutCode.replace(/<[^>]*>/g, "") + " " + descriptions;
    if (cyrillic.test(prose)) findings.push(index + 1);
  }
  return findings;
}

export function pullRequestProseFindings(event) {
  if (!event.pull_request) return [];
  const { title, body } = event.pull_request;
  if (typeof title !== "string" || !title.trim() ||
      (body != null && typeof body !== "string")) {
    throw new Error("Invalid pull request title or description in the event payload.");
  }
  const findings = cyrillic.test(title) ? [{ source: "pull request title", line: 1 }] : [];
  for (const line of cyrillicProseLines(body ?? "")) {
    findings.push({ source: "pull request description", line });
  }
  return findings;
}

async function main() {
  const files = execFileSync("git", ["ls-files", "-z", "--", "*.md"], { encoding: "utf8" })
    .split("\0").filter(Boolean);
  const findings = [];
  for (const file of files) {
    for (const line of cyrillicProseLines(await readFile(file, "utf8"))) {
      findings.push({ source: file, line });
    }
  }
  let metadataFields = 0;
  if (process.env.GITHUB_EVENT_PATH) {
    const event = JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, "utf8"));
    findings.push(...pullRequestProseFindings(event));
    metadataFields = event.pull_request ? 2 : 0;
  }
  console.log(`Public prose: checked ${files.length} Markdown files and ${metadataFields} PR metadata fields; ${findings.length} Cyrillic prose findings.`);
  for (const finding of findings) console.error(JSON.stringify(finding));
  if (findings.length) {
    throw new Error("Write public prose in English. Keep exact localized data inside code or recorded evidence.");
  }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
