# Pitstop Cherries — Landing Page + Demo Shop: Design

Date: 2026-10-14
Status: Draft for review

## Goal

Turn the existing floating-bananas React Three Fiber scene into a production-ready,
single-page marketing site for an invented dried-cherry snack brand, **Pitstop**.
Visitors should be impressed by the 3D hero and be able to browse products, add them
to a cart and complete a demo checkout.

### What the user asked for
- Product/brand landing page (not portfolio, not showpiece).
- Invented "cherry" product; switch the 3D objects from bananas to cherries.
- Cherry snack + shop.
- Working cart with fake checkout (no backend, no payments).
- Hosted on GitHub Pages.
- Single scrolling page (approach A).

### Assumptions (user may correct)
- Brand name "Pitstop", product names, prices and copy are invented placeholders,
  all editable in one file.
- Currency: USD.
- English only.
- User will supply `public/cherry.glb` later; a procedural cherry is used until then.

### Success criteria
- `npm run build` produces a static `dist/` that works when served from any sub-path
  (e.g. `https://<user>.github.io/<repo>/`).
- Add to cart → change quantity → checkout → confirmation works with keyboard and mouse.
- Cart survives a page reload.
- Lighthouse (Chrome, mobile preset): Accessibility ≥ 90, Best Practices ≥ 90, SEO ≥ 90.
  Performance reported as measured; text content must render before the 3D chunk loads.
- No console errors when `cherry.glb` is present; only the expected load error when absent.
- All unit tests and the e2e test pass.

## Out of scope

Real payments, user accounts, backend/API, CMS, i18n, multiple routes/pages,
analytics, cookie banner.

## Page structure

Single page, sections in order:

1. **Header** (sticky) — wordmark logo, anchor links (Shop, Story, FAQ), cart button
   with item-count badge.
2. **Hero** — headline, tagline, "Shop cherries" button (scrolls to products).
   3D cherries visible behind it.
3. **Products** (`#shop`) — 4 product cards: Classic Dried, Sour Punch,
   Dark Choc-Dipped, Mixed Bag. Each: SVG illustration, name, short description,
   price, "Add to cart" button.
4. **Story** (`#story`) — 3 blocks: orchard-grown, no added sugar, compostable bag.
5. **FAQ** (`#faq`) — native `<details>/<summary>` accordion, 4–5 entries.
6. **Footer** — small print, social links, "This is a demo store — no real orders" notice.

## 3D background

- Fixed full-viewport `<Canvas>` behind all content (`position: fixed; z-index: 0`),
  `aria-hidden="true"`, `pointer-events: none`.
- Reuses the existing Banana logic renamed to `Cherry`: upward drift with wrap-around,
  per-second rotation, depth-of-field blur, background colour moved to CSS.
- Model: `cherry.glb` loaded via `import.meta.env.BASE_URL + "cherry.glb"`; first mesh
  used regardless of name. If missing or failing, an error boundary renders a
  **procedural cherry**: two red spheres joined by a curved green stem plus a leaf.
- Colours: deep red cherries over a warm pink→orange background.
- The cherries are visible only behind the hero. Every section after the hero has an
  opaque cream background that scrolls up over the fixed canvas, so pausing the scene
  once the hero leaves the viewport is never visible.

### Performance rules
- `Scene` is loaded with `React.lazy` + `Suspense` so HTML paints first; three.js and
  R3F land in a separate chunk (`manualChunks`).
- Count: 100 on wide screens, 40 when viewport width < 768px or
  `navigator.hardwareConcurrency <= 4`.
- Depth of field disabled on the mobile/low-end tier.
- `dpr={[1, 1.75]}`.
- `frameloop` switches to `"never"` when the tab is hidden (`visibilitychange`) or the
  hero is scrolled out of view (`IntersectionObserver` on the hero section).
- `prefers-reduced-motion: reduce` → render a single still frame (`frameloop="demand"`).
- WebGL unavailable → skip the Canvas entirely; CSS gradient background remains.
- One shared geometry/material for all cherries.

## Shop / cart

### Data
`src/content.js` exports `brand` (name, tagline, copy, social links, site URL) and
`products`: `{ id, name, description, priceCents, image }`. Prices stored in integer
cents; formatted with `Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })`.

### State
`src/cart/` contains:
- `cartReducer.js` — pure reducer: `add(id)`, `setQty(id, qty)` (qty ≤ 0 removes,
  capped at 99), `remove(id)`, `clear()`. State shape: `{ items: { [id]: qty } }`.
- `selectors.js` — `itemCount`, `lineItems(products)`, `subtotalCents`.
- `CartContext.jsx` — provider using `useReducer`; persists to `localStorage` key
  `pitstop-cart-v1` (read/write wrapped in try/catch; unknown product ids dropped on load).
- `CartDrawer.jsx` — right-side drawer: line items with −/+ and remove, subtotal,
  "Checkout" button, empty state with "Browse cherries" button.
- `CheckoutDialog.jsx` — modal: order summary + "Place demo order" → success view with
  fake order number; clears the cart.

### Interaction details
- Add to cart shows the badge count update and announces "Added <name> to cart" via an
  `aria-live="polite"` region; drawer does not auto-open.
- Drawer and checkout use the native `<dialog>` element (`showModal()`) for focus
  trapping, Esc to close and backdrop; focus returns to the opener on close.

## Accessibility
- Semantic landmarks (`header`, `main`, `section` with headings, `footer`),
  skip-to-content link, one `h1`.
- Visible `:focus-visible` outlines; all controls reachable by keyboard.
- Colour contrast WCAG AA for text and controls.
- Product SVGs have `alt`/`role="img"` + `aria-label`.
- Respects `prefers-reduced-motion` (scene still, smooth-scroll disabled).

## SEO / sharing
- `index.html`: `<title>`, meta description, canonical, Open Graph + Twitter card tags,
  theme-color, SVG favicon + PNG fallback, `lang="en"`.
- Open Graph image: static 1200×630 PNG in `public/og.png` (generated once from an SVG).
- JSON-LD `Product` entries (name, description, price, currency) injected in `index.html`
  at build from `content.js` via a small Vite plugin, so crawlers see them without JS.
- `public/robots.txt`.
- Absolute URLs (canonical, og:url, og:image) use `brand.siteUrl` from `content.js`;
  user sets it once the GitHub repo exists.

## Build & deploy
- `vite.config.js`: `base: "./"`, `manualChunks` for three/R3F, keep Chrome `BROWSER`
  default for dev.
- `.github/workflows/deploy.yml`: on push to `main` → `npm ci`, `npm run lint`,
  `npm test`, `npm run build`, upload `dist/` with `actions/upload-pages-artifact`,
  deploy with `actions/deploy-pages`.
- `git init` in the project folder with `.gitignore` (node_modules, dist, test output);
  user creates the GitHub repo, pushes, and enables Pages → "GitHub Actions".

## File layout

```
index.html
vite.config.js
public/  favicon.svg, og.png, robots.txt, (cherry.glb — user-supplied)
src/
  main.jsx, App.jsx, content.js
  styles/  global.css (tokens, reset, layout), sections.css
  scene/   Background.jsx (lazy entry, tiering, pause logic),
           Cherry.jsx, CherryModel.jsx, ProceduralCherry.jsx, useSceneTier.js
  components/ Header.jsx, Hero.jsx, Products.jsx, ProductCard.jsx,
              Story.jsx, Faq.jsx, Footer.jsx, LiveAnnouncer.jsx
  cart/    cartReducer.js, selectors.js, CartContext.jsx,
           CartDrawer.jsx, CheckoutDialog.jsx, format.js
  assets/products/  *.svg
tests/
  unit/  cartReducer.test.js, selectors.test.js, CartContext.test.jsx
  e2e/   checkout.spec.js
```

The old `src/Banana.jsx` is removed; its logic moves to `scene/Cherry.jsx`.
README/SETUP_GUIDE are rewritten for the new site; R3F-CHEATSHEET stays.

## Error handling
- Model load failure → procedural cherry (per-instance error boundary, one shared load).
- WebGL context creation failure → Canvas not mounted; gradient shown.
- Corrupt/unknown `localStorage` data → ignored, empty cart.
- `localStorage` unavailable (private mode) → cart works for the session only.

## Testing
- **Unit (Vitest + Testing Library, jsdom):** reducer actions and edge cases
  (qty cap, qty 0 removes, unknown id), selectors (count, subtotal), context persistence
  (write on change, restore on mount, corrupt data ignored).
- **E2E (Playwright, Chrome channel):** load page → add two products → open drawer →
  increment qty → checkout → confirmation visible → badge shows 0 → reload → cart empty.
- **Lint:** ESLint (react, react-hooks, jsx-a11y) + Prettier check.
- **Manual:** Lighthouse mobile run in Chrome; visual check of hero on desktop and
  375px width.
