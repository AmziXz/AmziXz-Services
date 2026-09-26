# AmziXz Services — design system (Master)

The source of truth for how services.amzixz.id.lv looks. It sits where
[ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) looks
for a persisted design system (`design-system/<project-slug>/MASTER.md`), so a
later run of that tool finds it instead of regenerating one.

**This file was written by hand, not by `--persist`.** The tool's raw output
was checked against the product and the brand, and parts of it were wrong for
this site. What was kept and what was overridden are both recorded below, so the
next person can tell a decision from a default. Do not regenerate over it with
`--force`.

## How it was derived

Tool version: ui-ux-pro-max-skill `dcc40ff` (2026-09-21).

| Query | Result | Used? |
|---|---|---|
| `"freelance web app development agency services" --design-system` | Brutalism, pink + cyan, Inter / Playfair | **No.** "agency" routed it to Creative Agency. Wrong product. |
| `"B2B service web development studio" --design-system --variance 5 --motion 4 --density 3` | Motion-Driven, black + white, Archivo / Space Grotesk | Palette and fonts, yes. Style, no (see below). |
| `"B2B service" --domain product` | Minimalism & Swiss Style + Bento Box Grid + Micro-interactions; Feature-Rich Showcase | **Yes. This is the direction.** |
| `"feature-rich showcase" --domain landing` | Hero > feature grid (4–6) > benefits > proof > CTA; CTA in hero, after features, at the bottom | Yes |
| `"services pricing quote FAQ trust" --domain landing` | Pricing-Focused: 3 tiers, popular one highlighted, FAQ, final CTA | Yes, for Packages |
| `"trust minimal professional" --domain style` | Minimalism & Swiss Style: grid, square corners, no gradients, no soft shadows, one accent | Yes |
| `--domain ux`: sticky header, focus not obscured | `scroll-padding-top` under the sticky header; smooth scroll | Yes |

## The system

**Style:** Minimalism & Swiss Style. Left-aligned type, a visible grid (1px rules),
square corners (`--radius: 0`), no gradients, no soft shadows. The offer is a
bento grid. Motion is micro-interactions only.

**Colour:** black and white, with **one** accent: gold, taken from the logo.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#ffffff` | `#0a0a0a` | Page |
| `--surface` | `#f6f5f1` | `#141413` | Tiles, featured package |
| `--border` | `#e3e0d8` | `#2a2825` | Rules and outlines |
| `--ink` | `#0c0c0c` | `#f5f4f0` | Text |
| `--muted` | `#57534e` | `#a8a29e` | Secondary text (7.6:1 / 7.9:1) |
| `--gold` | `#b08d3c` | `#d6b25e` | Lines, borders, icons. **Never text on white** (3.1:1) |
| `--gold-ink` | `#8a6516` | `#d6b25e` | Gold you can read (5.3:1 / 9.8:1) |
| `--cta-bg` | `#0c0c0c` | `#d6b25e` | Primary button |
| `--band-*` | always dark | always dark | Hero sheet and closing CTA |

Every text pair above clears WCAG AA (4.5:1) and was measured, not eyeballed.

**Type:** Space Grotesk for headings (the brand font, shared with amzixz.id.lv),
Archivo for body. Both self-hosted as variable woff2, latin + latin-ext.

**Spacing:** density 3/10 (spacious). Sections pad 4–7.5rem. 8px base.

**Motion:** 200ms hovers, 420ms scroll reveals, `cubic-bezier(0.23, 1, 0.32, 1)`.
Only `opacity` and `transform` animate. Everything is off under
`prefers-reduced-motion`.

## Overrides, and why

- **Style: Motion-Driven → Minimalism & Swiss.** The `--design-system`
  aggregator scored a storytelling/motion pattern built for portfolios. The
  product table's own B2B Service row says Swiss + Bento, and a quote-driven
  services page needs clarity more than choreography.
- **Colour: "professional blue" → gold.** The B2B row suggests blue + grey. The
  AmziXz Services logo is gold on black, and a blue accent beside a gold logo
  looks like two brands. Kept the tool's black/white base and swapped the one
  accent for the logo's gold.
- **Gold split into two tokens.** Bright gold on white is 3.1:1, which fails
  for text. `--gold-ink` is a darker bronze for anything you have to read.
- **Heading/body order.** The `--design-system` output put Archivo on headings;
  the pairing's own notes and its Tailwind config put Space Grotesk on
  headings. Went with the notes: that also keeps headings in the brand font.
- **No GSAP.** `--motion 4` attached a GSAP stagger snippet. This site ships no
  dependencies, so the same stagger is done with IntersectionObserver and
  `data-reveal-delay` (`assets/reveal.js`).
- **No social-proof section.** The Feature-Rich pattern asks for one. There are
  no client testimonials or case studies yet, and inventing them is worse than
  leaving the slot out. **Add this section the moment there is real proof** —
  it is the biggest gap on the page.

## Anti-patterns for this site

- Emoji as icons (use inline SVG, `aria-hidden`).
- Gold (`--gold`) for text on a light background.
- A second accent colour.
- Rounded "friendly SaaS" cards and soft drop shadows.
- Prices on one package but not the others (see README, Pricing).
- Hover-only affordances: hover styles are gated behind
  `@media (hover: hover) and (pointer: fine)`.
