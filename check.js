#!/usr/bin/env node
/**
 * Checks the translation files before you commit them.
 *
 *     npm run check
 *
 * Every file in _data/lang/ must have exactly the same keys as the first
 * language in _data/languages.yml, and the same number of items in each list
 * (a missing FAQ answer is a mistake, not a choice). It also catches YAML
 * that will not parse, a preselected answer that points past the end of its
 * list, and a language listed in languages.yml without a file or a page.
 *
 * GitHub Pages refuses to build a broken translation anyway (strict mode in
 * _config.yml); this just tells you what is wrong in plain words, before you
 * push.
 */

import { readFile, readdir, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import * as yaml from "js-yaml";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const problems = [];

async function load(file) {
  try {
    return yaml.load(await readFile(file, "utf8"), { filename: file });
  } catch (error) {
    problems.push(`${path.relative(ROOT, file)} does not parse: ${error.message.split("\n")[0]}`);
    return null;
  }
}

/** Compare the shape of `other` against `ref`: same keys, same list lengths. */
function compare(ref, other, where, name) {
  if (Array.isArray(ref)) {
    if (!Array.isArray(other)) return problems.push(`${name}: ${where} should be a list`);
    if (ref.length !== other.length) {
      problems.push(`${name}: ${where} has ${other.length} items, the reference has ${ref.length}`);
    }
    ref.forEach((item, i) => i < other.length && compare(item, other[i], `${where}[${i + 1}]`, name));
    return;
  }
  if (ref && typeof ref === "object") {
    if (!other || typeof other !== "object") return problems.push(`${name}: ${where} should be a section`);
    for (const key of Object.keys(ref)) {
      if (!(key in other)) problems.push(`${name}: missing ${where ? where + "." : ""}${key}`);
      else compare(ref[key], other[key], where ? `${where}.${key}` : key, name);
    }
    for (const key of Object.keys(other)) {
      if (!(key in ref)) problems.push(`${name}: extra key ${where ? where + "." : ""}${key} (not in the reference)`);
    }
    return;
  }
  if (typeof other === "string" && other.trim() === "" && typeof ref === "string" && ref.trim() !== "") {
    problems.push(`${name}: ${where} is empty`);
  }
}

const languages = await load(path.join(ROOT, "_data", "languages.yml"));
if (languages) {
  const files = (await readdir(path.join(ROOT, "_data", "lang"))).filter((f) => f.endsWith(".yml"));
  const codes = languages.map((l) => l.code);

  for (const f of files) {
    const code = f.replace(/\.yml$/, "");
    if (!codes.includes(code)) problems.push(`_data/lang/${f} exists but "${code}" is not in _data/languages.yml`);
  }

  const reference = await load(path.join(ROOT, "_data", "lang", `${codes[0]}.yml`));
  for (const lang of languages) {
    const file = path.join(ROOT, "_data", "lang", `${lang.code}.yml`);
    const page = path.join(ROOT, ...lang.path.split("/").filter(Boolean), "index.html");
    try {
      await access(file);
    } catch {
      problems.push(`${lang.code}: _data/lang/${lang.code}.yml is missing`);
      continue;
    }
    try {
      await access(page);
    } catch {
      problems.push(`${lang.code}: no page at ${path.relative(ROOT, page)}`);
    }
    const data = await load(file);
    if (!data || !reference) continue;
    if (lang.code !== codes[0]) compare(reference, data, "", `${lang.code}.yml`);

    const c = data.contact || {};
    for (const [list, pick] of [["kinds", "kind_preselected"], ["whens", "when_preselected"]]) {
      const n = (c[list] || []).length;
      if (!(Number.isInteger(c[pick]) && c[pick] >= 1 && c[pick] <= n)) {
        problems.push(`${lang.code}.yml: contact.${pick} must be a number from 1 to ${n}`);
      }
    }
  }
}

if (problems.length) {
  console.error(`✗ ${problems.length} problem(s):\n  - ` + problems.join("\n  - "));
  process.exit(1);
}
console.log("✓ Translations are complete and consistent.");
