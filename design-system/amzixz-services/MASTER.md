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

## Version 2: premium (2026-09-26)

Version 1 was Swiss minimalism in light and dark. The brief for version 2 was
"more premium and luxurious". Version 1's reasoning is in git history.

## How it was derived

Tool version: ui-ux-pro-max-skill `dcc40ff` (2026-09-21).

| Query | Result | Used? |
|---|---|---|
| `"luxury premium" --domain style` | Skeuomorphism, **Exaggerated Minimalism**, Aurora UI | Exaggerated Minimalism: its "best for" list includes luxury brands and agency landing pages. Skeuomorphism (leather, 8–12-stop gradients) and Aurora (neon mesh) are both off-brand for gold on black. |
| `"luxury premium editorial" --domain typography` | Classic Elegant (Playfair/Inter), Luxury Minimalist (Bodoni Moda/Jost), **Luxury Serif (Cormorant/Montserrat)** | Luxury Serif: the only one listed for "high-end services", and Cormorant's high contrast matches the serif lettering in the logo. |
| `"luxury black gold" --domain color` | Luxury/Premium Brand: `#1C1917` + gold `#A16207` | Direction yes; exact values replaced to match the logo (below). |
| Version 1's `B2B service` profile | Feature-Rich Showcase, pricing-page structure | Section order and the three packages carried over. |

## The system

**Style:** Exaggerated Minimalism. Oversized light-weight serif display type,
a lot of negative space (sections pad 6–11rem), hairline rules, square corners,
one accent. Nothing decorative that isn't gold or a rule.

**One theme.** The brand is gold on black. `--bg` is `#11100e`, the logo's own
background colour, sampled from its edge pixels. There is no light palette.

**Colour**

| Token | Value | Use | Contrast on `--bg` |
|---|---|---|---|
| `--bg` | `#11100e` | Page. Must stay equal to the logo background | — |
| `--bg-2` | `#161512` | Alternate sections | — |
| `--surface` | `#1b1916` | Cards, featured tier | — |
| `--ink` | `#f2ede3` | Headings, body emphasis | 16.3:1 |
| `--muted` | `#a8a196` | Body text | 7.4:1 |
| `--faint` | `#8a8378` | Labels, footnotes | 5.1:1 |
| `--gold` | `#d4b36a` | Labels, rules, button edges, focus | 9.5:1 |
| `--gold-grad` | `#f3dea0 → #d4b36a → #a8802f → #e7c982` | Display type and filled buttons only | darkest stop 5.3:1 |
| `--hairline`, `--hairline-gold` | `#2e2920`, `#4a3f29` | Decorative rules only | — |

Filled gold buttons carry `--bg` text: 5.3:1 on the gradient's darkest stop.
Anything you must see to use a control (edges, focus ring) is `--gold`, never
a hairline.

**Type:** Cormorant (display: weight 300–400, italic for the gold accent words)
and Montserrat (body at 16px, labels in letter-spaced capitals at 0.3em,
echoing the "S E R V I C E S" line in the logo). Both self-hosted, variable,
latin + latin-ext.

**Motion:** slow to arrive, quick to respond. Reveals take 1000ms, hovers
320ms, on `cubic-bezier(0.16, 1, 0.3, 1)`. Buttons fill with gold from the
left on hover; index rows draw a gold rule. Only `opacity` and `transform`
animate. All of it is off under `prefers-reduced-motion`.

**Texture:** a static SVG film grain at 4.5% opacity over the page. It keeps
large areas of near-black from looking like flat plastic. It never
intercepts clicks.

## The logo trick

`logo-mark.png` has a square a shade lighter than its padding, and the letters
run right to that square's edges, so a feathered mask would clip them. Instead
every logo image gets `filter: contrast(1.3)` (which pushes the near-blacks to
pure black) and `mix-blend-mode: lighten` (which makes pure black disappear).
Only the gold is left. **This needs an opaque backdrop**, which is why the
header is solid rather than translucent. Put the mark on a translucent
background and the square comes back as a faint box.

## Content rule: Recent work

Only work that is **live, confirmed and defensible** goes in Recent work:

- **live:** a visitor can open it;
- **confirmed:** every fact on the card is true, and the name is final;
- **defensible:** if a client asks how it was built, the answer matches the card.

As of 2026-09-26 that is only amzixz.id.lv. Two projects were considered and
held back:

- **Sable** (Discord bot): not live, name not final, no confirmed feature set.
  The bot is also off the offer entirely until it launches. The previous
  version of this page called it "Live", which was false.
- **Risku Matrica** (client project): name unconfirmed (the codebase is
  `riska-matrica-v0`), the client is unknown, and so is whether they can be
  named. Who wrote it is also unconfirmed. Add it when those are answered.

## Overrides, and why

- **Colour values:** the tool's `#1C1917` / `#A16207` became the logo's own
  `#11100e` and golds sampled to match the logo's metal. Using the tool's black
  would put a visible box around every logo.
- **One theme instead of two:** a luxury brand commits to one look, and the
  logo only works on black. Agreed with the owner on 2026-09-26.
- **No GSAP:** the site ships no dependencies. The staggered reveal is
  IntersectionObserver plus `data-reveal-delay` (`assets/reveal.js`).
- **No testimonials section:** the pattern asks for social proof. There are no
  client testimonials yet, and inventing them is worse than leaving the slot
  out.

## Height, not just width (2026-09-26)

Display sizes use `min()` of a width-based and a height-based value:

```css
--t-hero: clamp(2.75rem, min(1.3rem + 7vw, 1rem + 10.5vh), 8rem);
```

Width-only sizing put the hero call to action below the fold on every common
laptop: 1536x700 (1920x1080 at 125% Windows scaling), 1366x625 and 1280x590.
It only fit on a 1920x1080 screen at 100%. Test the fold at those sizes, in
both languages; Latvian runs longer.

## Anti-patterns for this site

- A second accent colour, or a light theme.
- Gold gradient on body-size text (use `--gold`).
- Rounded "friendly SaaS" cards or soft drop shadows on cards.
- Emoji as icons.
- Any claim about a project that the owner has not confirmed.
- Prices on one engagement but not the others (see README, Pricing).
- Hover-only affordances: hover styles are gated behind
  `@media (hover: hover) and (pointer: fine)`.
