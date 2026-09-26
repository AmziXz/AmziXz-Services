# Working notes for this repo

Read `README.md` first. For anything visual, also read
`design-system/amzixz-services/MASTER.md`: it is the design system, and it says
which ui-ux-pro-max suggestions were deliberately overridden. Do not regenerate
it with `--persist --force`.

## Two repos, one brand

This is a **separate repository on purpose**: GitHub Pages allows one custom
domain per repo, and the main repo's `CNAME` is already spent on `amzixz.id.lv`.

- **Never delete `CNAME`.** It claims the subdomain.
- The main site is `AmziXz/amzixz.github.io`. Its header and footer link here
  with absolute URLs; links from here back are absolute too.
- `AmziXz/amzixz-sites` was an attempt at one repo that force-pushed to both.
  It never deployed and is not used. Do not revive it: it overwrites this repo
  on every run.

## If this repo lives on the external drive

Like the main site, the work moves between computers, and the drive records no
ownership. Git needs this once per machine, with your actual path:

```bash
git config --global --add safe.directory "F:/- Projects/Majaslapas/AmziXz-Services"
```

Without it every git command fails with "detected dubious ownership". **Push
before switching machines.**

## The pages are templates

`index.html` and `lv/index.html` are front matter only. The page is
`_layouts/home.html`; **every word** is in `_data/lang/en.yml` and
`_data/lang/lv.yml`. GitHub Pages builds them with Jekyll in strict mode, so a
missing translation key fails the build instead of publishing a blank.

- Never put wording in the template. Add a key to **both** language files.
- The owner edits the `.yml` files directly on github.com. Keep their comments,
  their order (top to bottom = the page), and the "keep the quotes" rules.
- Every output in the template goes through `| escape` (or `| jsonify` inside
  JSON-LD).

## Running it

Python is not installed on every machine here, so use Node:

```bash
npm install     # once per machine: liquidjs + js-yaml for the preview
npm start       # http://localhost:8001, renders the templates like Jekyll
npm run check   # translation files: same keys, same list lengths
```

## Before you commit

- Anything committed here is **public**. `.claude/` and `node_modules/` are
  gitignored for that reason. `_config.yml` keeps the notes and local tooling
  (`package.json`, `serve.js`, `check.js`) from being published; add any new
  tooling file to its `exclude` list.
- After changing anything in `/assets`, add one to `asset_version` in
  `_config.yml`. Every page follows. Currently `5`.
- Run `npm run check`, and build once with real Jekyll if you changed the
  template: the preview matches it, but GitHub is the one that publishes.
- New text colours: measure contrast against `--bg`, `--bg-2` and `--surface`.
  The gold gradient is for display-size type only.
- **Nothing goes on the page that the owner hasn't confirmed.** Recent work is
  live, confirmed and defensible, or it is not there. See MASTER.md, "Content
  rule", for what is being held back and why.
