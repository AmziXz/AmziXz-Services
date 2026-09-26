# services.amzixz.id.lv

The AmziXz Services site: a single-page, dependency-free static site served by
GitHub Pages at **<https://services.amzixz.id.lv>**.

It sells websites and applications built to a brief, each at a fixed price
agreed before work starts, with the source handed over.

**The Discord bot is deliberately not on the page.** It is in development,
its name isn't final, and its features aren't confirmed. It goes back on
when it is live. The same rule covers the "Recent work" section: see
`design-system/amzixz-services/MASTER.md`, "Content rule".

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
index.html      The whole site, in English. One page.
lv/index.html   The same page in Latvian. Keep the two in step (see Languages)
404.html        Not-found page
CNAME           services.amzixz.id.lv — deleting it drops the subdomain
robots.txt      Allows everything, points at the sitemap
sitemap.xml     Both languages, with hreflang pairs
_config.yml     Keeps the notes and tooling below off the public site
serve.js        Local preview server (mimics Pages URL handling)
package.json    Local tooling only — never served, no build step
design-system/  Design decisions and where they came from (not served)
assets/
  style.css     Tokens, @font-face, components. One theme: black and gold
  reveal.js     Scroll reveals
  menu.js       Phone navigation menu
  lang.js       Remembers EN/LV; copy of the main site's. Synchronous in <head>
  brief.js      The project brief builder (see Enquiries)
  fonts/        Cormorant (display, roman + italic) + Montserrat (body), woff2,
                latin + latin-ext
  work-amzixz.webp     Screenshot of amzixz.id.lv for Recent work (EN page)
  work-amzixz-lv.webp  The same for amzixz.id.lv/lv/ (LV page)
  logo-full.jpg      Brand master. Every icon below is cut from this.
  logo-mark.webp     512px monogram, hero (13 KB; the PNG is 90 KB)
  logo-mark-192.webp Header and footer mark
  logo-mark.png      512px monogram, used in structured data
  logo-mark-192.png  Favicon and apple-touch-icon
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

Short version: exaggerated minimalism in black and gold. Oversized Cormorant
display type, Montserrat body text, hairline rules, square corners, a lot of
space. The page background is the logo's own black (`#11100e`), and the logo
images are blended so only the gold shows. Don't change `--bg`, and don't
put a logo on a translucent background (MASTER.md, "The logo trick").

## Cache busting

Every `/assets` reference carries `?v=N`. GitHub Pages caches assets, and
browsers hold stylesheets and images longer still, so an edited `style.css`
without a new number leaves returning visitors on the old copy.

**After changing anything in `/assets`, bump every reference in all three pages:**

```bash
node --input-type=module -e "
import {readFile,writeFile} from 'node:fs/promises';
const V=4;
for (const f of ['index.html','lv/index.html','404.html'])
  await writeFile(f,(await readFile(f,'utf8')).replace(/\?v=\d+/g,'?v='+V),'utf8');
"
grep -ho '?v=[0-9]*' *.html lv/*.html | sort -u   # should print one line
```

Currently `?v=3`.

## Conventions

Mostly the same as the main site, for the same reasons:

- **Design tokens** are CSS custom properties in `:root`. Change colours there.
- **One theme.** There is no light palette and no toggle. Every text colour
  was measured against `--bg`, `--bg-2` and `--surface`; measure any new one.
- **Accessibility**: skip link, `:focus-visible` ring, 44px minimum touch
  targets, decorative SVGs `aria-hidden`, one `h1`, sections labelled by their
  headings. Keep them.
- **Motion** uses the `--ease-out` / `--dur-*` variables, only animates
  `opacity` and `transform`, and is disabled under `prefers-reduced-motion`.
  Hover effects are gated behind `@media (hover: hover) and (pointer: fine)` so
  they don't stick on touch.
- **The phone menu breakpoint (900px) lives in two places**: `style.css` and
  `assets/menu.js`. Change both. Each page also has a `<noscript>` style that
  shows the links inline when the menu button cannot work.
- **Links to the main site are absolute** (`https://amzixz.id.lv/...`). It is a
  different origin; `/ventures` would resolve to this site and 404.

## Shared with the main site, copied not linked

`reveal.js`, `menu.js` and `serve.js` are copies of the main site's. Loading them cross-origin would add a connection to
first paint and break this site whenever the other one moved a file. The cost is
drift: if you fix a bug in one, fix it in the other.

## Languages

English at `/`, Latvian at `/lv/`. The two pages are the same page in two
languages: same sections, same order, same `id`s, so an anchor like `#faq`
works in both. **Change one, change the other.**

- Each page declares both `hreflang` alternates plus `x-default` (English).
  `assets/lang.js` reads those to send a returning visitor to the language
  they last chose. It never builds a URL itself.
- The Latvian page addresses the reader as "Jūs" (polite plural). The main
  site's Latvian pages use the informal "tu"; a services site talking to
  clients should not.
- Links from Latvian pages go to the Latvian main site (`amzixz.id.lv/lv/...`).
- Pages serves one `404.html` for the whole site, so it carries a Latvian line.

## Enquiries

The closing section is a brief builder (`assets/brief.js`): project type,
timeline, optional name and a description, sent as a ready-written message.

- **WhatsApp** opens `wa.me/37129351853` with the message prefilled.
  **Email** opens a `mailto:` with subject and body. Nothing goes through a
  server or a third party.
- All wording comes from `data-` attributes on the `<form>`, so a translation
  never touches the script.
- Without JavaScript it still works: the form is a GET to `wa.me` with the
  textarea named `text` (the parameter WhatsApp prefills). Never name a field
  `type`, because wa.me uses that itself.
- Do not pass `"noopener"` to `window.open` there. With it the call always
  returns `null`, and the fallback then navigates the visitor away from their
  brief. The comment in the script explains the pattern that works.

## Pricing

There are deliberately **no numbers on the page**. Engagements show "Price on request"
and route to Discord or email. A price without a scope is a guess, and the FAQ
explains that to the visitor rather than leaving it unsaid.

If fixed prices are added later, add them to all three engagements at once. One
priced tier beside two unpriced ones reads as a mistake.
