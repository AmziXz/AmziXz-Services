#!/usr/bin/env node
/**
 * Local preview server that behaves like GitHub Pages.
 *
 * Pages serves /about from about.html, /dir/ from dir/index.html, and falls back
 * to 404.html for anything missing. Nothing built into Node does that, so
 * navigation would 404 locally even though it works once deployed.
 *
 *     node serve.js [port]        # default 8000; `npm start` uses 8001
 *
 * A copy of the main site's serve.js (AmziXz/amzixz.github.io). Node rather
 * than Python because Python is not installed on every machine this is edited
 * from. If you fix a bug in one copy, fix it in the other.
 *
 * Use this rather than opening the files directly: the site uses root-absolute
 * paths (/assets/style.css), which resolve against your drive root under
 * file:// and so load nothing.
 */

import { createServer } from "node:http";
import { readFile, readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.argv[2]) || 8000;

/** @type {Record<string, string>} */
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

/** @param {string} p */
async function isFile(p) {
  try {
    return (await stat(p)).isFile();
  } catch {
    return false;
  }
}

/** @param {string} p */
async function isDir(p) {
  try {
    return (await stat(p)).isDirectory();
  } catch {
    return false;
  }
}

/* ---------- Jekyll-style rendering ----------

   On GitHub, Pages runs Jekyll: index.html and lv/index.html are only front
   matter, built from _layouts/home.html and the wording in _data/lang/*.yml.
   This does the same locally with liquidjs (a JavaScript port of Jekyll's
   template language), in the same strict mode as _config.yml, so a missing
   translation key fails here exactly as it would fail the real build.

   Needs `npm install` once. Everything else is served as plain files. */

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/** Load _data/**\/*.yml into one nested object, like Jekyll's site.data. */
async function loadData(yaml, dir = path.join(ROOT, "_data")) {
  /** @type {Record<string, any>} */
  const out = {};
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out[entry.name] = await loadData(yaml, full);
    else if (/\.ya?ml$/.test(entry.name)) {
      out[entry.name.replace(/\.ya?ml$/, "")] = yaml.load(await readFile(full, "utf8"), { filename: full });
    }
  }
  return out;
}

/** @param {string} source */
async function render(source) {
  const [{ Liquid }, yaml] = await Promise.all([import("liquidjs"), import("js-yaml")]);
  const match = source.match(FRONT_MATTER);
  const page = (match && yaml.load(match[1])) || {};
  const body = match ? source.slice(match[0].length) : source;

  const config = yaml.load(await readFile(path.join(ROOT, "_config.yml"), "utf8"));
  const site = { ...config, data: await loadData(yaml), time: new Date() };

  const engine = new Liquid({ strictVariables: true, strictFilters: true, jsTruthy: false });
  engine.registerFilter("jsonify", (value) => JSON.stringify(value));

  const template = page.layout
    ? await readFile(path.join(ROOT, "_layouts", page.layout + ".html"), "utf8")
    : body;
  return engine.parseAndRender(template, { site, page, content: body });
}

/**
 * Map a request path to a file on disk, mirroring Pages' resolution order:
 * exact file, then directory index, then the extensionless .html form.
 * Returns null when nothing matches, so the caller can serve 404.html.
 *
 * @param {string} urlPath
 * @returns {Promise<string | null>}
 */
async function resolve(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  // Resolve against ROOT and confirm the result stayed inside it: without this
  // a request for /../../secrets would escape the repo.
  const local = path.resolve(ROOT, "." + path.posix.normalize(decoded));
  if (local !== ROOT && !local.startsWith(ROOT + path.sep)) return null;

  if (await isFile(local)) return local;
  if (await isDir(local)) {
    const index = path.join(local, "index.html");
    if (await isFile(index)) return index;
  }
  if (await isFile(local + ".html")) return local + ".html";
  return null;
}

const server = createServer(async (req, res) => {
  const head = req.method === "HEAD";
  if (req.method !== "GET" && !head) {
    res.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }

  const file = await resolve(req.url ?? "/");
  const target = file ?? path.join(ROOT, "404.html");
  const status = file ? 200 : 404;

  let body;
  try {
    body = await readFile(target);
  } catch {
    res.writeHead(404, { "Content-Type": TYPES[".txt"] }).end("404 Not Found");
    return;
  }

  // Pages with front matter are templates: render them the way Jekyll will.
  if (/\.(html|xml)$/.test(target) && FRONT_MATTER.test(body.toString("utf8", 0, 4096))) {
    try {
      body = Buffer.from(await render(body.toString("utf8")));
    } catch (error) {
      const missing = /Cannot find (package|module)/.test(String(error));
      const message = missing
        ? "This page is a template. Run `npm install` once, then restart the server."
        : "Template error (GitHub Pages would refuse to publish this too):\n\n" + String(error);
      console.error(message);
      res.writeHead(500, { "Content-Type": TYPES[".txt"] }).end(message);
      return;
    }
  }

  res.writeHead(status, {
    "Content-Type": TYPES[path.extname(target).toLowerCase()] ?? "application/octet-stream",
    "Content-Length": body.length,
    // The deployed site is cached by Pages; locally that only ever hides edits.
    "Cache-Control": "no-store",
  });
  res.end(head ? undefined : body);
});

server.listen(PORT, () => {
  console.log(`Serving http://localhost:${PORT}  (Ctrl+C to stop)`);
});
