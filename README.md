# services.amzixz.id.lv

The AmziXz Services site: a single-page, dependency-free static site served by
GitHub Pages at **<https://services.amzixz.id.lv>**.

It sells two things:

- **Developer Services**: websites and applications built to a brief, quoted per
  project.
- **Our Discord bot**: a bot we build, host and run. We do **not** take on custom
  Discord bot development, and the page says so explicitly. Keep it that way; the
  FAQ answers the question directly so nobody arrives with the wrong expectation.

## Why this is a separate repository

GitHub Pages allows exactly **one custom domain per repository**; the `CNAME`
file holds a single hostname. The main site's repo (`AmziXz/amzixz.github.io`)
already spends its `CNAME` on `amzixz.id.lv`, so the subdomain needs a repo of its
own. There is no way around that on Pages.

DNS, at nic.lv:

```
amzixz.id.lv           A      185.199.108.153   (and .109 / .110 / .111)
services.amzixz.id.lv  CNAME  amzixz.github.io
```

The subdomain's CNAME points at the **user** Pages host, `amzixz.github.io`,
not at anything with "services" in it. Pages routes by hostname; this repo's
`CNAME` file is what claims `services.amzixz.id.lv`.

**Never delete `CNAME`.** Removing it releases the subdomain while DNS still
points at GitHub, and anyone could then claim it. Keep `amzixz.id.lv` verified
under GitHub Settings -> Pages -> Verified domains so that cannot happen.

## Structure

```
index.html      The whole site. One page, English only.
404.html        Not-found page
CNAME           services.amzixz.id.lv — deleting it drops the subdomain
robots.txt      Allows everything, points at the sitemap
sitemap.xml     One URL
_config.yml     Keeps the notes and tooling below off the public site
serve.js        Local preview server (mimics Pages URL handling)
package.json    Local tooling only — never served, no build step
design-system/  Design decisions and where they came from (not served)
assets/
  style.css     Tokens, both palettes, @font-face, components
  theme.js      Light/dark persistence — must stay a synchronous <head> script
  reveal.js     Scroll reveals
  menu.js       Phone navigation menu
  fonts/        Space Grotesk (headings) + Archivo (body), woff2, latin + latin-ext
  logo-full.jpg      Brand master. Every icon below is cut from this.
  logo-mark.png      512px monogram, used in structured data
  logo-mark-192.png  Header, favicon, apple-touch-icon
  logo-mark-32.png   Favicon
  og-image.jpg       1200x630 social card
```

No build step. Edit and push to `main`; Pages redeploys.

## Local preview

```bash
node serve.js 8001    # or: npm start
```

Port 8001, so it runs beside the main site on 8000. Do not open `index.html`
directly: under `file://` the root-absolute `/assets/...` paths resolve against
your drive root, so nothing loads.

## Design

The design system is in
[`design-system/amzixz-services/MASTER.md`](design-system/amzixz-services/MASTER.md):
the ui-ux-pro-max queries it came from, the tokens, and which of the tool's
suggestions were overridden and why. Read it before changing a colour.

Short version: Swiss minimalism, black and white, **one** accent (gold, from the
logo), square corners, 1px rules, a bento grid for the offer. `--gold` is for
lines and icons only; text that needs to be gold uses `--gold-ink`.

## Cache busting

Every `/assets` reference carries `?v=N`. GitHub Pages caches assets, and
browsers hold stylesheets and images longer still, so an edited `style.css`
without a new number leaves returning visitors on the old copy.

**After changing anything in `/assets`, bump every reference in both pages:**

```bash
node --input-type=module -e "
import {readFile,writeFile} from 'node:fs/promises';
const V=2;
for (const f of ['index.html','404.html'])
  await writeFile(f,(await readFile(f,'utf8')).replace(/\?v=\d+/g,'?v='+V),'utf8');
"
grep -ho '?v=[0-9]*' *.html | sort -u   # should print one line
```

Currently `?v=1`.

## Conventions

Mostly the same as the main site, for the same reasons:

- **Design tokens** are CSS custom properties in `:root`. Change colours there.
- **The palette is declared three times**: light on bare `:root`, dark under
  `prefers-color-scheme` guarded with `:not([data-theme="light"])`, and dark
  again under `[data-theme="dark"]`. Drop any one and the toggle stops working
  in one direction.
- **`theme.js` must stay synchronous in `<head>`.** Deferred, it runs after
  first paint and the wrong palette flashes.
- **Accessibility**: skip link, `:focus-visible` ring, 44px minimum touch
  targets, decorative SVGs `aria-hidden`, one `h1`, sections labelled by their
  headings. Keep them.
- **Motion** uses the `--ease-out` / `--dur-*` variables, only animates
  `opacity` and `transform`, and is disabled under `prefers-reduced-motion`.
  Hover effects are gated behind `@media (hover: hover) and (pointer: fine)` so
  they don't stick on touch.
- **The phone menu breakpoint (820px) lives in two places**: `style.css` and
  `assets/menu.js`. Change both. Each page also has a `<noscript>` style that
  shows the links inline when the menu button cannot work.
- **Links to the main site are absolute** (`https://amzixz.id.lv/...`). It is a
  different origin; `/ventures` would resolve to this site and 404.

## Shared with the main site, copied not linked

`theme.js`, `reveal.js`, `menu.js`, `serve.js` and the Space Grotesk files are
copies of the main site's. Loading them cross-origin would add a connection to
first paint and break this site whenever the other one moved a file. The cost is
drift: if you fix a bug in one, fix it in the other.

The theme choice is stored in `localStorage`, which is per-origin, so a
visitor's light/dark choice on amzixz.id.lv does not carry over here. That is a
browser rule, not a bug.

## Pricing

There are deliberately **no numbers on the page**. Packages show "Custom quote"
and route to Discord or email. A price without a scope is a guess, and the FAQ
explains that to the visitor rather than leaving it unsaid.

If fixed prices are added later, add them to all three packages at once. One
priced tier beside two unpriced ones reads as a mistake.
