# services.amzixz.id.lv

The AmziXz Services site: a one-page static site in English and Latvian,
served by GitHub Pages at **<https://services.amzixz.id.lv>**.

It sells websites and applications built to a brief, each at a fixed price
agreed before work starts, with the source handed over.

**The Discord bot is deliberately not on the page.** It is in development,
its name isn't final, and its features aren't confirmed. It goes back on
when it is live. The same rule covers the "Recent work" section: see
`design-system/amzixz-services/MASTER.md`, "Content rule".

## Changing the wording

Every word on the site lives in two files:

| Language | File | Page |
|---|---|---|
| English | [`_data/lang/en.yml`](_data/lang/en.yml) | `/` |
| Latvian | [`_data/lang/lv.yml`](_data/lang/lv.yml) | `/lv/` |

They are laid out in the same order as the page, top to bottom, with notes.

**On GitHub, no tools needed:**

1. Open the file above on github.com and click the pencil (Edit).
2. Change the text **between the double quotes**. Leave the part before the
   colon alone: that is the key the page looks for.
3. Click **Commit changes**. The site rebuilds in about a minute.

Rules that keep it working:

- Every text stays in double quotes: `title: "Like this"`.
- Inside a text, use curly quotes (“English”, „latviešu”), not `"`.
- Keep the indentation (the spaces at the start of the line) exactly as it is.
- Both files have the same keys. Add or remove a line in one, do the same in
  the other.
- `_accent` texts are the gold italic end of a heading.

**If you break it**, the site does not break. The build refuses the change,
the previous version stays live, and GitHub emails you that the Pages build
failed. Undo your edit, or fix the quote or indentation it names, and commit
again.

**Contact details** (WhatsApp number, email, Discord) are in
[`_data/contact.yml`](_data/contact.yml), once for both languages. Change the
number there and it changes everywhere, including the brief builder.

## How the pages are built

GitHub Pages runs Jekyll on every push. `index.html` and `lv/index.html` are
only a few lines of front matter; Jekyll builds each one from:

```
_layouts/home.html      the page itself, with no wording in it
_data/lang/<code>.yml   the wording for that language
_data/languages.yml     the language list: menu order, paths, locale
_data/contact.yml       contact details, shared by every language
_config.yml             strict mode, the cache version, what not to publish
```

`_config.yml` turns on strict variables: a key missing from a translation, or
a misspelled one, **fails the build** instead of publishing a blank. That
was tested: deleting one line from `lv.yml` stops the build with
`undefined variable text_help`, and a broken quote stops it with the file
name and line number.

Every text goes through Liquid's `escape` filter, so a quote, `&` or `<` in a
translation can never break the HTML.

## Local preview

```bash
npm install    # once per machine: liquidjs + js-yaml, local tooling only
npm start      # http://localhost:8001
npm run check  # checks the translation files (see below)
```

`serve.js` renders the templated pages with liquidjs (a JavaScript port of
Jekyll's template language) in the same strict mode, so the preview matches
what GitHub publishes. That was verified element by element against a real
Jekyll 3.10 build of the same files: zero differences. A broken translation
fails here too, with the key and line.

Port 8001, so it runs beside the main site on 8000. Do not open the HTML
files directly: they are templates, and under `file://` nothing loads.

`npm run check` compares every translation against English: missing or extra
keys, lists of different lengths (a missing FAQ answer), empty texts, and a
preselected brief answer that points past its list. It says what is wrong in
plain words.

## Languages

English at `/`, Latvian at `/lv/`. One template, so the two can never drift
apart in structure.

- **The language menu** is a native `<details>` dropdown built from
  `_data/languages.yml`. It opens and closes from the keyboard and works with
  JavaScript off. `assets/menu.js` adds Escape (focus returns to the button)
  and click-outside.
- **Returning visitors:** each page declares every language as an `hreflang`
  alternate plus `x-default`. `assets/lang.js` reads those to send a visitor
  to the language they last picked. It never builds a URL itself.
- **Voice:** the Latvian page addresses the reader as "Jūs" (polite plural).
  The main site's Latvian pages use the informal "tu"; a services site
  talking to clients should not.
- **Links:** Latvian pages link to the Latvian main site
  (`amzixz.id.lv/lv/...`), set in `lv.yml`.
- **404:** Pages serves one `404.html` for the whole site. It speaks the first
  language, with a line and a link for each of the others.

**Adding a language** (Russian, say):

1. Copy `_data/lang/en.yml` to `_data/lang/ru.yml` and translate it.
2. Add `ru` to `_data/languages.yml`.
3. Copy `lv/index.html` to `ru/index.html` and change `lang: lv` to `lang: ru`.
4. `npm run check`.

The menu, `hreflang` tags, sitemap and 404 pick it up on their own.

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
index.html            English page: front matter only (layout: home, lang: en)
lv/index.html         Latvian page: front matter only (lang: lv)
404.html              Not-found page, templated
sitemap.xml           Templated from the language list
_layouts/home.html    The page template
_data/                Wording, languages, contact details (see above)
_config.yml           Jekyll: strict mode, origin, asset_version, excludes
CNAME                 services.amzixz.id.lv — deleting it drops the subdomain
robots.txt            Allows everything, points at the sitemap
serve.js              Local preview (renders templates like Jekyll)
check.js              Translation checker (npm run check)
package.json          Local tooling only: never served
design-system/        Design decisions and where they came from (not served)
assets/
  style.css           Tokens, @font-face, components. One theme: black and gold
  reveal.js           Scroll reveals
  menu.js             Phone navigation menu and the language menu
  lang.js             Remembers the language; copy of the main site's. Synchronous in <head>
  brief.js            The project brief builder (see Enquiries)
  fonts/              Cormorant (display, roman + italic) + Montserrat (body), latin + latin-ext
  work-amzixz.webp    Screenshot of amzixz.id.lv for Recent work (EN)
  work-amzixz-lv.webp The same for amzixz.id.lv/lv/ (LV)
  logo-full.jpg       Brand master. Every icon below is cut from this.
  logo-mark.webp      512px monogram, hero (13 KB; the PNG is 90 KB)
  logo-mark-192.webp  Header and footer mark
  logo-mark.png       512px monogram, used in structured data
  logo-mark-192.png   Favicon and apple-touch-icon
  logo-mark-32.png    Favicon
  og-image.jpg        1200x630 social card
```

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

Every `/assets` reference carries `?v=N`, and N is one setting:
`asset_version` in `_config.yml`. GitHub Pages caches assets, and browsers hold
stylesheets and images longer still, so an edited `style.css` without a new
number leaves returning visitors on the old copy.

**After changing anything in `/assets`, add one to `asset_version`.** Every
page follows. Currently `4`.

## Conventions

Mostly the same as the main site, for the same reasons:

- **Design tokens** are CSS custom properties in `:root`. Change colours there.
- **One theme.** There is no light palette and no toggle. Every text colour
  was measured against `--bg`, `--bg-2` and `--surface`; measure any new one.
- **Accessibility**: skip link, `:focus-visible` ring, touch targets of at
  least 44px (48px where a reveal animation could round one down), decorative
  SVGs `aria-hidden`, one `h1`, sections labelled by their headings.
- **Motion** uses the `--ease` / `--dur-*` variables, only animates
  `opacity` and `transform`, and is disabled under `prefers-reduced-motion`.
  Hover effects are gated behind `@media (hover: hover) and (pointer: fine)` so
  they don't stick on touch.
- **The phone menu breakpoint (900px) lives in two places**: `style.css` and
  `assets/menu.js`. Change both. The template also has a `<noscript>` style
  that shows the links inline when the menu button cannot work.
- **Links to the main site are absolute** (`https://amzixz.id.lv/...`). It is a
  different origin; `/ventures` would resolve to this site and 404.

## Shared with the main site, copied not linked

`reveal.js`, `lang.js` and the core of `menu.js` and `serve.js` are copies of
the main site's. Loading them cross-origin would add a connection to first
paint and break this site whenever the other one moved a file. The cost is
drift: if you fix a bug in one, fix it in the other.

## Enquiries

The closing section is a brief builder (`assets/brief.js`): project type,
timeline, optional name and a description, sent as a ready-written message.

- **WhatsApp** opens `wa.me/<number>` with the message prefilled.
  **Email** opens a `mailto:` with subject and body. Nothing goes through a
  server or a third party.
- All wording comes from `data-` attributes on the `<form>`, filled from the
  translation files, so a translation never touches the script.
- Without JavaScript it still works: the form is a GET to `wa.me` with the
  textarea named `text` (the parameter WhatsApp prefills). Never name a field
  `type`, because wa.me uses that itself.
- Do not pass `"noopener"` to `window.open` there. With it the call always
  returns `null`, and the fallback then navigates the visitor away from their
  brief. The comment in the script explains the pattern that works.

## Pricing

There are deliberately **no numbers on the page**. Engagements show "Price on
request" and route to the brief. A price without a scope is a guess, and the
FAQ explains that to the visitor rather than leaving it unsaid.

If fixed prices are added later, add them to all three engagements at once. One
priced tier beside two unpriced ones reads as a mistake.
