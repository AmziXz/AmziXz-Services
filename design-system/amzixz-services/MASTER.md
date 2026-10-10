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

## Version 3: "made to measure", as a developer's tool (2026-10-10)

The brief from the owner: redesign the site to look "more professional and
developer like", with four references. Their favourites were two of them:

- **Noomo** (noomoagency.com): a light periwinkle page, one huge, light,
  expanded headline across the whole width, glass objects floating among the
  letters, a short paragraph in a corner, "Scroll" at the bottom.
- **Citrix / Red Bull Racing** (thenewmobileworkforce): the subject (the car)
  moves with the mouse, and each scroll arrives at the next full-screen page.

The other two were GitHub's Mona Sans page (the typeface used here) and
Pangram Pangram.

A first pass kept version 2's black and gold and its layout and only changed
type and motion. The owner's verdict was "same design 1:1", and they were
right. Version 3 changes the whole look.

### What it is

- **Chapters.** Every section is a full-screen page, alternating light and
  dark: hero (light), standard (dark), services (light), work (dark), process
  (light), engagements (dark), FAQ (light), enquiries (dark), footer (light).
  On a wide screen the next page slides up over the last, which sinks back,
  shrinks and dims (`assets/stage.js`). This is the Citrix "next page" feel
  without taking over the scroll wheel (see Overrides).
- **The hero** is the one bold place. A light room (periwinkle with three soft
  pools of light that drift with the pointer), one headline in expanded
  capitals fitted to the full width, each line justified edge to edge ("You
  ask, / we deliver.", the owner's wording of 2026-10-10), and the gold AX
  monogram in the open space between the words (measured by `stage.js`, so
  it follows any wording or language) as a solid object: twelve stacked copies
  of a transparent cut-out, so it has thickness when it turns. It turns and
  drifts towards the mouse with some weight (eased, not snapped), and a
  highlight slides across its face. On touch screens it turns slowly by
  itself.
- **Developer details, all literal:** rulers on the hero's top and left edges
  with a gold tick at the pointer and an x/y readout in pixels ("made to
  measure"); section labels written as `// code comments`; the enquiry form
  with a live preview of the exact message, in a terminal-like pane with a
  caret.

### Tokens

Set per theme with `data-theme` on each chapter; every component uses tokens,
so it works on either.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#d4d9e9` | `#0f0f12` | Page |
| `--surface` | `#e4e7f2` | `#1a1a20` | Cards, the form |
| `--ink` | `#0e0f13` (13.6:1) | `#eef0f6` (16.8:1) | Headings, body emphasis |
| `--muted` | `#3f4453` (6.9:1) | `#a4a8b6` (8.1:1) | Body text |
| `--faint` | `#525767` (5.1:1) | `#8a8e9c` (5.9:1) | Labels, footnotes |
| `--accent` | `#6f5219` bronze (5.1:1) | `#d4b36a` gold (9.5:1) | Comment slashes, edges, focus |
| `--gilt` | bronze gradient (weakest 3.7:1) | gold gradient (weakest 5.3:1) | The `_accent` end of headings: display sizes only |
| `--edge` | `#525767` | `#8a8e9c` | Form field edges (must be seen to be used) |
| `--line`, `--rule` | translucent | translucent | Decorative rules only |

Contrast is measured against each theme's `--bg` (and `--surface`, where it
is higher). Gold text is never used on the light theme: there it is bronze.

**Buttons are pills** (after the owner's Pangram reference, 2026-10-10: the
square, gold-edged buttons were the most visible leftover of version 2). The
main action is solid: ink on a light page, paper on a dark one. The other is
an outline in the text colour, not gold. On hover a fill swells from the
middle: gold for the main action, ink for the outline. Gold appears when you
reach for it. Chips, the language button and the "Most requested" flag are
pills too; the menu button is round. Cards stay square: controls are round,
surfaces are not.

**Type:** Mona Sans (GitHub, OFL), variable in weight (200–900) and width
(75–125%). Headlines: 125% width, weight 300, capitals. Reading text: 100%
width, 17px, line height 1.65. Small UI (buttons, nav): 125% width capitals,
as in both references. JetBrains Mono (OFL) only where the content is
code-like: the `//` labels, the readout, tags, the message preview. Both
self-hosted, latin + latin-ext (Latvian diacritics checked glyph by glyph).

**Motion:** one choreographed load moment (the monogram's layers come together
from depth; the headline rises), then motion only in answer to the visitor:
scroll (chapters, the work frame tipping up, the process rule filling) and
pointer (monogram, light, rulers). Only `opacity` and `transform` animate.
Under `prefers-reduced-motion` all of it is off and the page is a still
document.

**The monogram:** `assets/mark.webp` is the AX cut out of `logo-full.jpg` with
real transparency (alpha from brightness, colour un-premultiplied from the
black). It sits on any background. Version 2's blend-mode trick (`contrast` +
`mix-blend-mode: lighten` on an exact `#11100e`) is gone, and with it the
rule that the page must be the logo's black.

### How it was derived

ui-ux-pro-max (`50d8a7d`, data files read directly):

| Query | Result | Used? |
|---|---|---|
| Product: creative / marketing agency | Motion-Driven, Storytelling-Driven, "wow-factor necessary" | Yes: one wow moment (the hero), storytelling as chapters. |
| Style: `parallax storytelling` | Full-screen chapters, 3–5 depth layers, sticky sections, reduced-motion fallback | Chapters and layered depth, yes. Scroll-jacking, no (below). |
| Style: `kinetic typography` | Text as the main visual, variable fonts | Headline as the visual, fitted to the width. No per-letter animation. |
| Typography: `developer` | Developer Mono (JetBrains Mono + IBM Plex Sans), Modern Dark Cinema (Inter) | JetBrains Mono kept for code-like text. Body/display went to Mona Sans instead: it is GitHub's own face and it was one of the owner's references. |
| UX: motion sensitivity | "Parallax/scroll-jacking causes nausea; honor prefers-reduced-motion" | Followed. |

Anthropic's frontend-design guidance was applied as a check against generic
output: no numbering where there is no sequence (only the process steps are
numbered), no fade-up on every section, sentence-case labels instead of
tracked capitals, one bold place.

## Overrides, and why

- **No scroll-jacking.** The Citrix site turns one wheel tick into one page.
  Here the wheel scrolls normally and the pages slide over each other instead.
  Hijacked scrolling breaks the brief form, find-in-page, keyboard scrolling
  and menu jumps, and the ui-ux-pro-max UX data flags it as a motion-sickness
  trigger. If the owner wants hard page snapping later, it is one CSS line
  (`scroll-snap-type: y proximity` on `html`, `scroll-snap-align: start` on
  `.chapter`), but test the form chapter first: it is taller than a screen.
- **The headline is one colour.** The `_accent` end is gold on every other
  heading. In the hero the gold monogram sits behind the words, and bronze
  letters over gold metal did not read, so the hero keeps the gold for the
  object alone.
- **No GSAP, no three.js:** the site still ships no dependencies. The 3D
  monogram is CSS 3D transforms on stacked images; the chapters are one small
  script.
- **No testimonials section:** the pattern asks for social proof. There are no
  client testimonials yet, and inventing them is worse than leaving the slot
  out.

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

## Height, not just width (2026-09-26, still true)

Display sizes use `min()` of a width-based and a height-based value, and the
hero headline is capped at 20% of the window height when it is fitted. Width
alone put the hero call to action below the fold on every common laptop:
1536x700 (1920x1080 at 125% Windows scaling), 1366x625 and 1280x590. Test the
fold at those sizes, in both languages; Latvian runs longer.

- **Menu targets sit on each chapter's `.wrap`**, not on the `<section>`, so a
  menu jump lands on the label, not on padding.
- **Chapters centre their content below the fixed header**, and only begin to
  sink once the next chapter covers their bottom quarter, so a menu jump finds
  the chapter still.
- **The Work screenshot crops from the bottom** on a short window and shows
  whole on a tall one.

Measured on 2026-10-10 (version 3): no horizontal scroll at 360, 390, 768,
1280, 1366, 1536 and 1920 wide in either language; the hero's call to action
is on the first screen at 1280x590, 1366x625, 1536x700 and 1920x950 in both.
The enquiry chapter (about 900px) cannot fit any of these; it lands with the
heading and the first question visible.

## Version 2: premium (2026-09-26), for the record

Exaggerated minimalism in black and gold: Cormorant + Montserrat (ui-ux-pro-max
"Luxury Serif"), the page background fixed to the logo's own `#11100e`, one
theme. Replaced by version 3 at the owner's request. Its full reasoning is in
git history.

## Anti-patterns for this site

- Gold text on a light page (use `--accent`, which is bronze there).
- `--gilt` on body-size text.
- Rounded "friendly SaaS" cards or soft drop shadows on cards (controls are
  pills; surfaces stay square).
- Gold outlines on buttons (the version 2 look).
- Emoji as icons.
- Scroll-jacking, or motion that ignores `prefers-reduced-motion`.
- Any claim about a project that the owner has not confirmed.
- Prices on one engagement but not the others (see README, Pricing).
- Hover-only affordances: hover styles are gated behind
  `@media (hover: hover) and (pointer: fine)`.
