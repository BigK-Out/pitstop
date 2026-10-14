# Pitstop Editorial Redesign + "Pit Stop" Scroll Moment: Design

Date: 2026-10-14
Status: Draft for review
Builds on: `docs/superpowers/specs/2026-10-14-cherry-shop-design.md` (cart, checkout, SEO, deploy and testing setup stay as specified there unless this document says otherwise).

## Goal

The first version reads as generic and AI-made. Redesign the page so it looks like a funded premium food brand, with one signature scroll moment in the hero.

### What the user chose
- Bar: premium real-brand polish throughout, plus one "wow" moment.
- Art direction: **A · Editorial Orchard** — warm paper, big expressive serif with italics, deep cherry red, asymmetric magazine grid, small-caps labels (Graza / Aesop feel).
- Wow moment: **The Pit Stop** — one glossy hero cherry splits open as you scroll, the pit lifts out, and the line "We took the pit out." appears.
- Scroll technique: pinned (sticky) hero + a small scroll-progress hook. No animation library.
- Page structure: hero → statement band → shop plates → orchard steps → FAQ → oversized footer wordmark (wireframe approved).
- 3D: fully procedural; `cherry.glb` support is removed.

### Success criteria
- Scrolling through the hero plays the Pit Stop forward; scrolling up rewinds it. No jank on a mid-range laptop.
- With `prefers-reduced-motion: reduce`, the hero is not pinned and shows the final split frame, static.
- Without WebGL, the hero shows a static split-cherry illustration and the page is fully usable.
- All existing cart/checkout behaviour and tests keep working (updated for new copy where needed).
- Lighthouse mobile: Accessibility ≥ 90, Best Practices ≥ 90, SEO ≥ 90; Performance improves over the current 65 (target ≥ 80).
- The blur halo artefact is gone (depth of field removed).

## Out of scope
Smooth-scroll hijacking (Lenis etc.), page transitions, new products, real photography, newsletter signup, any backend. Cart/checkout logic unchanged.

## Visual system

### Colour tokens (`src/styles/global.css`)
| Token | Value | Use |
|---|---|---|
| `--paper` | `#f4ede3` | page background, canvas background |
| `--paper-2` | `#ebe1d3` | subtle panels, dividers |
| `--ink` | `#2b0d12` | text, primary buttons, footer background |
| `--cherry` | `#8c1c2b` | accents, italics, labels, links |
| `--cherry-bright` | `#c3142f` | 3D cherry skin, hover states |
| `--muted` | `#5a3a40` | secondary text |
| `--plate-classic` | `#8c1c2b` | product plate 01 |
| `--plate-sour` | `#d9a441` | product plate 02 |
| `--plate-choc` | `#4a2617` | product plate 03 |
| `--plate-mixed` | `#c46a7a` | product plate 04 |

All text/background pairs used must meet WCAG AA (muted on paper ≈ 9:1, cherry on paper ≈ 7.5:1).

### Type
- Display: **Fraunces** (variable, with italics), weights ~300–400, tight tracking (`-0.02em`), italics in `--cherry` for emphasis.
- Body/UI: **Inter** (variable).
- Labels: Inter 0.7rem, uppercase, `letter-spacing: 0.16em`, `--cherry`.
- Self-hosted via `@fontsource-variable/fraunces` and `@fontsource-variable/inter` (no Google Fonts requests).
- Scale (clamp-based): hero h1 `clamp(3.5rem, 9vw, 8.5rem)`; section h2 `clamp(2.25rem, 5vw, 4rem)`; statement `clamp(2.5rem, 7vw, 6rem)`; footer wordmark `clamp(6rem, 24vw, 22rem)`.

### Layout
- Max content width 1280px, 12-column CSS grid with 24px gutters (16px on mobile), generous whitespace.
- Thin 1px rules (`rgb(43 13 18 / 0.15)`) between sections instead of cards/shadows.
- Buttons: pill, ink-filled primary; outlined secondary. No drop shadows anywhere.

## Page structure

1. **Header** (sticky, paper background with bottom rule): Fraunces wordmark left; small-caps nav centre (Shop · Orchard · FAQ); "Bag" button right: visible text "Bag n", accessible name "Bag n items" (same pattern as today's "Cart n items").
2. **Hero / Pit Stop** (`#top`): see next section.
3. **Statement band**: label "Ingredients", then "Cherries. *That's the list.*" centred, huge serif.
4. **Shop** (`#shop`): label "The harvest", h2 "Pick your pouch", note "4 pouches · from $8.99". Four product **plates**: coloured plate (plate token) with "Fig. 0N" label and a cream line illustration of the product (redesigned `CherryArt`), then name (Fraunces), short description, price and an outlined "Add +" button (accessible name "Add to cart: <name>").
5. **Orchard** (`#orchard`, replaces `#story`): label "From orchard to pouch", three numbered steps 01/02/03 (big Fraunces numerals in `--cherry`, bold title, one-line body).
6. **FAQ** (`#faq`): two columns on desktop — left: label + "Good to *know.*"; right: native `<details>` accordion with rule separators and a +/− marker. Single column on mobile.
7. **Footer**: ink background; top row (social links · demo-store notice · ©year) in small caps; oversized "Pitstop" wordmark beneath, cropped at the bottom edge.

Cart drawer and checkout dialog keep their structure and behaviour; restyle to paper/ink, Fraunces headings, rule separators, no shadows.

## The Pit Stop hero

### Structure
- `<section id="top" class="pitstop">` with height `300vh` (`100svh` when reduced motion).
- Inside: `.pitstop-stage` — `position: sticky; top: 0; height: 100svh` — containing:
  - the canvas layer (`aria-hidden="true"`, `pointer-events: none`),
  - the **intro copy** (left column on desktop, top on mobile): label "Batch Nº 07 — Montmorency, 2026", h1 "Cherries, *slowly* sun-dried.", primary "Shop the harvest →" (links `#shop`), secondary "Our orchard" (links `#orchard`),
  - the **reveal copy** (centred low): h2-styled line "We took the *pit* out." + "Shop the harvest" button. Always in the DOM; hidden visually until revealed (opacity + `visibility` so it is not focusable while hidden at progress < 0.7; when reduced motion or no WebGL, always visible).

### Progress
`progressFor(rectTop, sectionHeight, viewportHeight) = clamp(-rectTop / (sectionHeight - viewportHeight), 0, 1)` (0 when `sectionHeight <= viewportHeight`).

`useScrollProgress(ref)` measures on scroll/resize (passive listeners, rAF-throttled), stores the value in a ref (no React re-render per frame), and writes it to the CSS custom property `--p` on the section for the HTML layers.

### Timeline
`pitStopTimeline(p)` is a pure function returning every animated value. `seg(p, a, b) = clamp((p - a) / (b - a), 0, 1)`; `ease = easeInOutCubic`.

| Value | Rule |
|---|---|
| `introOpacity` | `1 - seg(p, 0.08, 0.28)` |
| `introShift` (px, upward) | `40 * seg(p, 0.08, 0.28)` |
| `turn` (radians, cherry Y rotation) | `0.6 * (1 - ease(seg(p, 0, 0.3)))` |
| `scale` | `1 + 0.15 * ease(seg(p, 0, 0.3))` |
| `split` (0–1) | `ease(seg(p, 0.3, 0.65))` → halves move `±1.1` units on X and rotate `∓0.45` rad on Z |
| `pitLift` (0–1) | `ease(seg(p, 0.45, 0.75))` → pit rises `+1.5` units on Y and spins `π` on Y |
| `revealOpacity` | `seg(p, 0.7, 0.85)` |
| `revealVisible` | `p >= 0.7` |

The canvas reads the timeline in `useFrame`; HTML layers derive opacity/transform from `--p` in CSS via the same breakpoints (the JS timeline is the source of truth; the CSS uses the same numbers, copied as custom properties set from JS each frame: `--intro-opacity`, `--intro-shift`, `--reveal-opacity`).

### 3D content
- Camera: perspective, fov 30, position `[0, 0, 12]`.
- Lighting: soft ambient + warm key light from upper left + cool rim light from behind right; no shadows.
- **Hero cherry** (`HeroCherry`), built from procedural geometry:
  - two skin halves: `SphereGeometry` hemispheres split on the vertical plane, `MeshPhysicalMaterial` (`--cherry-bright`, clearcoat 1, roughness 0.3);
  - a flat cut face on each half: `CircleGeometry` in deep flesh red `#7a0b1f` with a pit-shaped hollow (darker ellipse);
  - pit: ellipsoid (`SphereGeometry` scaled `0.42, 0.55, 0.42`), warm tan `#c9a777`, roughness 0.6;
  - stem (tube) + leaf attached to the left half.
  - Idle: very slow Y sway (±0.08 rad) layered on the timeline when motion is allowed.
- **Floaters**: 24 small cherries (12 on the light tier), reusing the merged procedural geometry from `cherryGeometry.js`, placed in a loose shell around and behind the hero cherry, slow drift + spin; scene fog to `--paper` so distant ones fade (replaces depth of field).
- Canvas: `gl={{ antialias: true, alpha: false }}`, background `--paper`, `dpr={[1, 1.75]}` (light tier `[1, 1.5]`).
- `frameloop`: `"always"` while the hero is on screen and the tab visible; `"never"` otherwise; `"demand"` for reduced motion (renders the final frame, `p = 1`).
- `@react-three/postprocessing`, `CherryModel.jsx`, `modelExists.js` and the GLB path are removed.

### Fallbacks
- **Reduced motion**: section height `100svh`, no sticky pinning, timeline fixed at `p = 1` (split cherry, pit lifted), intro copy and reveal copy both visible (stacked: intro top-left, reveal bottom).
- **No WebGL / scene error**: no canvas; a static `SplitCherryArt` SVG (same composition as the final frame) in its place; copy layout as reduced motion.
- Lazy loading as today: the scene chunk loads after first render inside the existing `ErrorBoundary`; until it loads, `SplitCherryArt` shows.

## Content (`src/content.js`)
Add: `hero.label` ("Batch Nº 07 — Montmorency, 2026"), `hero.headline` parts (with the italic word marked), `hero.primaryCta`, `hero.secondaryCta`, `hero.reveal` ("We took the pit out." with italic "pit"), `statement` (label + text + italic part), `shop.label`, `shop.note`, `orchard` (label, title, steps[3] {title, body}), `faq.heading` parts. Represent italic emphasis as `{ text, em }` pairs or explicit segments, not raw HTML. Existing products, prices and FAQ items unchanged.

## Accessibility
- One `h1` (hero headline). The reveal line is a styled `<p>` (not a heading, not a live region), so the shop `h2` stays the next heading in the outline.
- Hidden reveal copy uses `visibility: hidden` so its button is not tabbable before reveal.
- All motion respects `prefers-reduced-motion`.
- Focus outlines visible on paper and ink backgrounds.

## Testing
- **Unit**: `progressFor` (top of section, middle, end, short section), `pitStopTimeline` (values at p = 0, 0.3, 0.5, 0.75, 1; monotonic split/pitLift; revealVisible threshold), procedural hero geometry builders return non-null geometries with expected attributes, `SplitCherryArt` renders with an accessible label. Existing App/Cart tests updated for new copy ("Bag n items", section names).
- **E2E**: existing four flows (updated names); new: scroll to the bottom of `#top` → "We took the pit out." visible; with `reducedMotion: "reduce"` emulation the reveal line is visible without scrolling.
- **Visual**: headless Chrome screenshots at 1280×800 and 375×812 for p = 0, 0.5, 1 (scroll positions), read and checked.
- **Lighthouse**: mobile run, report all four scores.

## Error handling
Unchanged from the base spec, minus model loading (no network fetch for 3D assets any more).
