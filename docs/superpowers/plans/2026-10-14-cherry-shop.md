# Pitstop Cherries Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the floating-bananas R3F demo into a production-ready single-page landing site with a working demo cart for an invented dried-cherry brand, Pitstop, deployed to GitHub Pages.

**Architecture:** One Vite + React page. HTML sections (header, hero, products, story, FAQ, footer) render first; the three.js background loads as a lazy chunk and sits fixed behind the transparent hero, covered by an opaque "sheet" for the later sections. Cart state is a pure reducer in a React context persisted to `localStorage`; the drawer and checkout use native `<dialog>`. A tiny Vite plugin injects SEO meta tags and JSON-LD from `src/content.js` at build time.

**Tech Stack:** React 18.3, Vite 5.4, three 0.160, @react-three/fiber 8.18, @react-three/drei 9.122, @react-three/postprocessing 2.19, Vitest 2 + Testing Library + jsdom 25, Playwright 1.x (Chrome channel), ESLint 9 (flat config) + Prettier 3, GitHub Actions → GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-10-14-cherry-shop-design.md`

## Global Constraints

- Brand name "Pitstop"; all copy, products and prices live in `src/content.js` (pure data, no imports — it is also imported by `vite.config.js` in Node).
- Prices are integer cents, displayed as USD via `Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })`.
- Cart `localStorage` key: `pitstop-cart-v1`; state shape `{ items: { [productId]: qty } }`; qty capped at 99; qty ≤ 0 removes the item.
- `vite.config.js` uses `base: "./"`; every runtime asset URL is built from `import.meta.env.BASE_URL` (never a leading `/` at runtime).
- Site URL: `https://bigk-out.github.io/pitstop/` (GitHub user `BigK-Out`, assumed repo name `pitstop`).
- 3D tiers: 100 cherries + depth of field normally; 40 cherries and no depth of field when `innerWidth < 768` or `hardwareConcurrency <= 4`; `dpr={[1, 1.75]}`.
- Scene paused (`frameloop="never"`) when tab hidden or hero (`#top`) out of view; `prefers-reduced-motion: reduce` → `frameloop="demand"`; no WebGL → no Canvas, CSS gradient only.
- Canvas: `aria-hidden="true"`, `pointer-events: none`, `gl={{ alpha: false }}` (depth of field needs an opaque buffer) with solid background `#ffc9b0`.
- Dev server opens Google Chrome (`process.env.BROWSER ??= "google-chrome"`); `vite preview` must NOT open a browser.
- Accessibility: WCAG AA contrast, visible `:focus-visible`, one `h1`, skip link, visible button text included in accessible names.
- Lighthouse (mobile) targets: Accessibility ≥ 90, Best Practices ≥ 90, SEO ≥ 90.
- Out of scope: real payments, accounts, backend, CMS, i18n, routing, analytics.

## Review Focus

1. **Tampered or stale `localStorage`** (non-JSON, `items` not an object, negative/huge/fractional qty, ids of products that no longer exist) → cart loads sanitized or empty, never crashes. Test: Task 3 `CartContext.test.jsx` "sanitizes corrupt storage".
2. **Storage that throws** (Safari private mode, quota exceeded) → cart still works for the session. Test: Task 3 "works when storage throws".
3. **Same site open in two tabs** → a change in one tab shows in the other. Test: Task 3 "syncs from storage events".
4. **Removing the last unit with "−" in the drawer** → keyboard focus moves to the drawer heading instead of being lost to `<body>`. Test: Task 5 "decreasing the last unit removes the line and keeps focus in the drawer".
5. **Hammering "+"** → quantity stops at 99 and the button disables. Tests: Task 2 "caps quantity at 99", Task 5 "disables increase at 99".

---

## File Map

```
index.html                      SEO placeholders, favicon links, root div      (Task 7)
vite.config.js                  base, plugins, preview.open=false, vitest cfg  (Tasks 1, 7)
eslint.config.js, .prettierrc.json, .prettierignore                            (Task 1)
playwright.config.js                                                          (Task 8)
build/seo.js                    renderSeo/productJsonLd/seoPlugin (Node)       (Task 7)
scripts/og.html, scripts/touch-icon.html   sources for generated PNGs          (Task 7)
public/ favicon.svg, og.png, apple-touch-icon.png, robots.txt                  (Task 7)
.github/workflows/deploy.yml                                                  (Task 9)
src/
  main.jsx                      mounts App, imports styles                     (Task 4)
  App.jsx                       layout, dialogs, lazy Background               (Tasks 4, 5, 6)
  content.js                    brand + products data                          (Task 1)
  styles/global.css             tokens, reset, buttons, utilities              (Task 4)
  styles/sections.css           header, hero, sections, footer, dialogs        (Tasks 4, 5)
  components/ Header, Hero, Products, ProductCard, CherryArt, Story, Faq,
              Footer, Announcer, Modal                                         (Tasks 4, 5)
  cart/ format.js, cartReducer.js, selectors.js, CartContext.jsx,
        CartDrawer.jsx, CheckoutDialog.jsx                                     (Tasks 1, 2, 3, 5)
  scene/ webgl.js, sceneTier.js, cherryGeometry.js, ProceduralCherry.jsx,
         CherryModel.jsx, Cherry.jsx, Background.jsx                           (Task 6)
tests/setup.js                                                                (Task 1)
tests/unit/*.test.js(x)                                                       (Tasks 1–7)
tests/e2e/checkout.spec.js                                                    (Task 8)
```

Deviation from spec (intentional): product images are one parametrised `CherryArt` SVG component instead of four `.svg` files, and `manualChunks` is dropped because `React.lazy` already splits three.js into its own chunk (verified in Task 6).

Deleted: `src/Banana.jsx`, `src/App.css`, `src/index.css` (Task 4).

---

### Task 1: Tooling, content data and price formatting

**Files:**
- Modify: `package.json`, `vite.config.js`, `.gitignore`
- Create: `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `tests/setup.js`, `src/content.js`, `src/cart/format.js`
- Test: `tests/unit/format.test.js`

**Interfaces:**
- Produces: `brand` and `products` from `src/content.js` (shapes below); `formatPrice(cents: number): string` from `src/cart/format.js`; scripts `lint`, `format`, `test`, `test:e2e`.

- [ ] **Step 1: Install dev dependencies**

```bash
npm install -D eslint@9 @eslint/js@9 globals@15 eslint-plugin-react@7 eslint-plugin-react-hooks@5 eslint-plugin-jsx-a11y@6 prettier@3 vitest@2 jsdom@25 @testing-library/react@16 @testing-library/dom@10 @testing-library/jest-dom@6 @testing-library/user-event@14 @playwright/test@1
```

- [ ] **Step 2: Set scripts in `package.json`**

Replace the `"scripts"` block with:

```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . && prettier --check .",
    "format": "prettier --write .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
```

Also change `"name": "bananas"` to `"name": "pitstop"`.

- [ ] **Step 3: Write `vite.config.js`**

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Open the dev server in Chrome instead of the system default browser.
// Override with e.g. `BROWSER=firefox npm run dev`.
process.env.BROWSER ??= "google-chrome";

export default defineConfig({
  base: "./",
  plugins: [react()],
  server: { open: true },
  preview: { open: false },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.js"],
    include: ["tests/unit/**/*.test.{js,jsx}"],
    restoreMocks: true,
  },
});
```

- [ ] **Step 4: Write lint/format config**

`eslint.config.js`:

```js
import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  { ignores: ["dist", "node_modules", "playwright-report", "test-results"] },
  js.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  jsxA11y.flatConfigs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: "18.3" } },
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react/prop-types": "off",
      // React Three Fiber uses props like `args`, `attach`, `position` on lowercase elements.
      "react/no-unknown-property": "off",
    },
  },
];
```

`.prettierrc.json`:

```json
{ "printWidth": 100 }
```

`.prettierignore`:

```
dist
node_modules
playwright-report
test-results
docs
public
*.md
*.zip
package-lock.json
```

Append to `.gitignore`:

```
.lighthouse/
```

- [ ] **Step 5: Write `tests/setup.js`**

```js
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom has <dialog> but not showModal()/close().
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close() {
    if (!this.hasAttribute("open")) return;
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
}

afterEach(() => {
  cleanup();
  localStorage.clear();
});
```

- [ ] **Step 6: Write `src/content.js`**

```js
// All site copy, products and prices. Pure data: also imported by vite.config.js in Node.

export const brand = {
  name: "Pitstop",
  tagline: "Sun-dried cherries, nothing added.",
  description:
    "Pitstop makes small-batch dried cherry snacks from orchard-grown fruit. Shop Classic, Sour Punch, Dark Choc-Dipped and Mixed Bag.",
  // Public URL of the deployed site, with trailing slash. Used for canonical and share tags.
  siteUrl: "https://bigk-out.github.io/pitstop/",
  hero: {
    eyebrow: "Small-batch dried cherries",
    headline: "Cherries, slowed down.",
    lead: "We pick ripe orchard cherries, pit them by hand and dry them slowly in the sun. Chewy, tart-sweet, and nothing else in the bag.",
    cta: "Shop cherries",
  },
  shop: {
    title: "Pick your pouch",
    intro: "Four ways to snack on a cherry. Every pouch is 150 g unless it says otherwise.",
  },
  story: {
    title: "From orchard to pouch",
    items: [
      {
        title: "Orchard grown",
        body: "Our cherries come from family orchards and are picked at peak ripeness, never early.",
      },
      {
        title: "No added sugar",
        body: "Our Classic pouch has one ingredient: cherries. Dried slowly so their own sugar does the work.",
      },
      {
        title: "Compostable pouch",
        body: "Every pouch is home-compostable, so the only leftover is the pit, and we already took that out.",
      },
    ],
  },
  faq: {
    title: "Questions",
    items: [
      {
        q: "Is this a real shop?",
        a: "No. Pitstop is a demo store. You can fill a cart and place a demo order, but nothing is charged and nothing ships.",
      },
      {
        q: "Are there pits in the cherries?",
        a: "Every cherry is pitted by machine and checked by hand, but the occasional pit fragment can slip through. Chew with care.",
      },
      {
        q: "How should I store them?",
        a: "Keep the pouch sealed in a cool, dry place. Once open, they are best within four weeks.",
      },
      {
        q: "Are they vegan?",
        a: "Yes, all four. The chocolate on Dark Choc-Dipped is dairy-free.",
      },
      {
        q: "Do you ship internationally?",
        a: "In this demo we ship everywhere and nowhere at once. A real store would list its shipping zones here.",
      },
    ],
  },
  social: [
    { label: "Instagram", href: "https://www.instagram.com/" },
    { label: "TikTok", href: "https://www.tiktok.com/" },
  ],
};

export const products = [
  {
    id: "classic",
    name: "Classic Dried",
    description: "Plump, chewy sun-dried cherries. Our original, and just fruit.",
    priceCents: 899,
    art: "classic",
    artLabel: "Two deep red cherries joined at the stem",
  },
  {
    id: "sour",
    name: "Sour Punch",
    description: "Tart Montmorency cherries with a dusting of sour citrus. Pucker up.",
    priceCents: 949,
    art: "sour",
    artLabel: "Two bright red cherries dusted with sour sugar",
  },
  {
    id: "choc",
    name: "Dark Choc-Dipped",
    description: "Dried cherries half-dipped in 70% dark chocolate.",
    priceCents: 1199,
    art: "choc",
    artLabel: "Two cherries half-dipped in dark chocolate",
  },
  {
    id: "mixed",
    name: "Mixed Bag",
    description: "Classic, sour and choc-dipped together in one 300 g pouch.",
    priceCents: 1499,
    art: "mixed",
    artLabel: "Three cherries in different shades of red",
  },
];
```

- [ ] **Step 7: Write the failing test `tests/unit/format.test.js`**

```js
import { describe, expect, it } from "vitest";
import { formatPrice } from "../../src/cart/format";

describe("formatPrice", () => {
  it("formats cents as US dollars", () => {
    expect(formatPrice(899)).toBe("$8.99");
    expect(formatPrice(0)).toBe("$0.00");
    expect(formatPrice(123456)).toBe("$1,234.56");
  });
});
```

- [ ] **Step 8: Run it to verify it fails**

Run: `npx vitest run tests/unit/format.test.js`
Expected: FAIL — cannot resolve `../../src/cart/format`.

- [ ] **Step 9: Write `src/cart/format.js`**

```js
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export const formatPrice = (cents) => usd.format(cents / 100);
```

- [ ] **Step 10: Run tests and lint**

Run: `npx vitest run tests/unit/format.test.js` → PASS.
Run: `npm run format && npx eslint src/content.js src/cart tests eslint.config.js vite.config.js` → no errors. (Full `npm run lint` is not expected to pass until Task 4 removes the old banana files.)

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore: add lint, format and test tooling plus site content"
```

---

### Task 2: Cart reducer and selectors

**Files:**
- Create: `src/cart/cartReducer.js`, `src/cart/selectors.js`
- Test: `tests/unit/cartReducer.test.js`, `tests/unit/selectors.test.js`

**Interfaces:**
- Produces:
  - `MAX_QTY = 99`, `initialCart = { items: {} }`
  - `cartReducer(state, action)` with actions `{type:"add", id}`, `{type:"setQty", id, qty}`, `{type:"remove", id}`, `{type:"clear"}`, `{type:"replace", cart}`
  - `itemCount(cart): number`, `lineItems(cart, products): Array<{ product, qty, totalCents }>` (in `products` order), `subtotalCents(cart, products): number`

- [ ] **Step 1: Write failing tests**

`tests/unit/cartReducer.test.js`:

```js
import { describe, expect, it } from "vitest";
import { MAX_QTY, cartReducer, initialCart } from "../../src/cart/cartReducer";

const run = (...actions) => actions.reduce(cartReducer, initialCart);

describe("cartReducer", () => {
  it("adds items and increments quantity", () => {
    expect(run({ type: "add", id: "classic" }, { type: "add", id: "classic" })).toEqual({
      items: { classic: 2 },
    });
  });

  it("sets quantity, and removes the item at 0 or below", () => {
    expect(run({ type: "add", id: "sour" }, { type: "setQty", id: "sour", qty: 5 })).toEqual({
      items: { sour: 5 },
    });
    expect(run({ type: "add", id: "sour" }, { type: "setQty", id: "sour", qty: 0 })).toEqual({
      items: {},
    });
    expect(run({ type: "add", id: "sour" }, { type: "setQty", id: "sour", qty: -3 })).toEqual({
      items: {},
    });
  });

  it("caps quantity at 99", () => {
    expect(MAX_QTY).toBe(99);
    expect(run({ type: "setQty", id: "choc", qty: 500 })).toEqual({ items: { choc: 99 } });
    const atMax = run({ type: "setQty", id: "choc", qty: 99 });
    expect(cartReducer(atMax, { type: "add", id: "choc" })).toEqual({ items: { choc: 99 } });
  });

  it("floors fractional quantities and ignores non-numeric ones", () => {
    expect(run({ type: "setQty", id: "mixed", qty: 2.7 })).toEqual({ items: { mixed: 2 } });
    const state = run({ type: "add", id: "mixed" });
    expect(cartReducer(state, { type: "setQty", id: "mixed", qty: "lots" })).toBe(state);
  });

  it("removes, clears and replaces", () => {
    const state = run({ type: "add", id: "classic" }, { type: "add", id: "sour" });
    expect(cartReducer(state, { type: "remove", id: "classic" })).toEqual({ items: { sour: 1 } });
    expect(cartReducer(state, { type: "clear" })).toEqual({ items: {} });
    const other = { items: { choc: 3 } };
    expect(cartReducer(state, { type: "replace", cart: other })).toBe(other);
  });

  it("does not mutate the previous state", () => {
    const state = run({ type: "add", id: "classic" });
    cartReducer(state, { type: "add", id: "classic" });
    expect(state).toEqual({ items: { classic: 1 } });
  });

  it("returns the same state for unknown actions", () => {
    expect(cartReducer(initialCart, { type: "nope" })).toBe(initialCart);
  });
});
```

`tests/unit/selectors.test.js`:

```js
import { describe, expect, it } from "vitest";
import { itemCount, lineItems, subtotalCents } from "../../src/cart/selectors";

const products = [
  { id: "a", name: "A", priceCents: 100 },
  { id: "b", name: "B", priceCents: 250 },
];

describe("cart selectors", () => {
  const cart = { items: { b: 2, a: 1 } };

  it("counts all units", () => {
    expect(itemCount(cart)).toBe(3);
    expect(itemCount({ items: {} })).toBe(0);
  });

  it("builds line items in product order and skips unknown ids", () => {
    const lines = lineItems({ items: { ...cart.items, ghost: 4 } }, products);
    expect(lines).toEqual([
      { product: products[0], qty: 1, totalCents: 100 },
      { product: products[1], qty: 2, totalCents: 500 },
    ]);
  });

  it("sums the subtotal", () => {
    expect(subtotalCents(cart, products)).toBe(600);
  });
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run tests/unit/cartReducer.test.js tests/unit/selectors.test.js`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement `src/cart/cartReducer.js`**

```js
export const MAX_QTY = 99;
export const initialCart = { items: {} };

function withQty(state, id, qty) {
  const n = Math.floor(Number(qty));
  if (Number.isNaN(n)) return state;
  const items = { ...state.items };
  if (n <= 0) delete items[id];
  else items[id] = Math.min(n, MAX_QTY);
  return { items };
}

export function cartReducer(state, action) {
  switch (action.type) {
    case "add":
      return withQty(state, action.id, (state.items[action.id] ?? 0) + 1);
    case "setQty":
      return withQty(state, action.id, action.qty);
    case "remove":
      return withQty(state, action.id, 0);
    case "clear":
      return initialCart;
    case "replace":
      return action.cart;
    default:
      return state;
  }
}
```

- [ ] **Step 4: Implement `src/cart/selectors.js`**

```js
export const itemCount = (cart) => Object.values(cart.items).reduce((sum, qty) => sum + qty, 0);

export function lineItems(cart, products) {
  return products
    .filter((product) => cart.items[product.id])
    .map((product) => {
      const qty = cart.items[product.id];
      return { product, qty, totalCents: product.priceCents * qty };
    });
}

export const subtotalCents = (cart, products) =>
  lineItems(cart, products).reduce((sum, line) => sum + line.totalCents, 0);
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run tests/unit/cartReducer.test.js tests/unit/selectors.test.js`
Expected: PASS (10 tests).

- [ ] **Step 6: Commit**

```bash
npm run format
git add -A
git commit -m "feat(cart): add cart reducer and selectors"
```

---

### Task 3: Cart context with persistence

**Files:**
- Create: `src/cart/CartContext.jsx`
- Test: `tests/unit/CartContext.test.jsx`

**Interfaces:**
- Consumes: `cartReducer`, `initialCart` (Task 2); `itemCount`, `lineItems`, `subtotalCents` (Task 2).
- Produces:
  - `STORAGE_KEY = "pitstop-cart-v1"`
  - `parseCart(raw: string | null, products): cart` — sanitizes; never throws
  - `<CartProvider products={products}>`
  - `useCart()` → `{ cart, products, count, lines, subtotalCents, add(id), setQty(id, qty), remove(id), clear() }`

- [ ] **Step 1: Write failing tests `tests/unit/CartContext.test.jsx`**

```jsx
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CartProvider, STORAGE_KEY, parseCart, useCart } from "../../src/cart/CartContext";

const products = [
  { id: "classic", name: "Classic", priceCents: 899 },
  { id: "sour", name: "Sour", priceCents: 949 },
];

const wrapper = ({ children }) => <CartProvider products={products}>{children}</CartProvider>;
const renderCart = () => renderHook(() => useCart(), { wrapper });

describe("CartContext", () => {
  it("exposes count, lines and subtotal", () => {
    const { result } = renderCart();
    act(() => result.current.add("classic"));
    act(() => result.current.setQty("sour", 2));
    expect(result.current.count).toBe(3);
    expect(result.current.lines.map((l) => l.product.id)).toEqual(["classic", "sour"]);
    expect(result.current.subtotalCents).toBe(899 + 2 * 949);
  });

  it("persists changes to localStorage", () => {
    const { result } = renderCart();
    act(() => result.current.add("classic"));
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual({ items: { classic: 1 } });
  });

  it("restores the cart on mount", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: { sour: 4 } }));
    const { result } = renderCart();
    expect(result.current.count).toBe(4);
  });

  it("sanitizes corrupt storage", () => {
    expect(parseCart("not json", products)).toEqual({ items: {} });
    expect(parseCart(null, products)).toEqual({ items: {} });
    expect(parseCart(JSON.stringify({ items: "abc" }), products)).toEqual({ items: {} });
    expect(parseCart(JSON.stringify(null), products)).toEqual({ items: {} });
    expect(
      parseCart(
        JSON.stringify({ items: { classic: -5, ghost: 3, sour: 1000, x: "y" } }),
        products,
      ),
    ).toEqual({ items: { sour: 99 } });
  });

  it("works when storage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    const { result } = renderCart();
    act(() => result.current.add("classic"));
    expect(result.current.count).toBe(1);
  });

  it("syncs from storage events (another tab)", () => {
    const { result } = renderCart();
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: STORAGE_KEY,
          newValue: JSON.stringify({ items: { classic: 2 } }),
        }),
      );
    });
    expect(result.current.count).toBe(2);
  });

  it("throws a clear error outside the provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useCart())).toThrow("useCart must be used inside <CartProvider>");
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/unit/CartContext.test.jsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/cart/CartContext.jsx`**

```jsx
import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { cartReducer, initialCart } from "./cartReducer";
import { itemCount, lineItems, subtotalCents } from "./selectors";

export const STORAGE_KEY = "pitstop-cart-v1";

const CartContext = createContext(null);

// Turn whatever is stored into a valid cart; unknown ids and bad quantities are dropped.
export function parseCart(raw, products) {
  try {
    const items = JSON.parse(raw)?.items;
    if (!items || typeof items !== "object" || Array.isArray(items)) return initialCart;
    const known = new Set(products.map((p) => p.id));
    return Object.entries(items).reduce(
      (cart, [id, qty]) =>
        known.has(id) ? cartReducer(cart, { type: "setQty", id, qty }) : cart,
      initialCart,
    );
  } catch {
    return initialCart;
  }
}

function readStorage() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStorage(cart) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // Storage unavailable (private mode, quota): the cart still works for this session.
  }
}

export function CartProvider({ products, children }) {
  const [cart, dispatch] = useReducer(cartReducer, undefined, () =>
    parseCart(readStorage(), products),
  );

  useEffect(() => writeStorage(cart), [cart]);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== STORAGE_KEY) return;
      dispatch({ type: "replace", cart: parseCart(event.newValue, products) });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [products]);

  const value = useMemo(
    () => ({
      cart,
      products,
      count: itemCount(cart),
      lines: lineItems(cart, products),
      subtotalCents: subtotalCents(cart, products),
      add: (id) => dispatch({ type: "add", id }),
      setQty: (id, qty) => dispatch({ type: "setQty", id, qty }),
      remove: (id) => dispatch({ type: "remove", id }),
      clear: () => dispatch({ type: "clear" }),
    }),
    [cart, products],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run tests/unit/CartContext.test.jsx`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
npm run format
git add -A
git commit -m "feat(cart): add persisted cart context with cross-tab sync"
```

---

### Task 4: Page sections, styles and app shell

**Files:**
- Create: `src/styles/global.css`, `src/styles/sections.css`, `src/components/Announcer.jsx`, `src/components/Header.jsx`, `src/components/Hero.jsx`, `src/components/CherryArt.jsx`, `src/components/ProductCard.jsx`, `src/components/Products.jsx`, `src/components/Story.jsx`, `src/components/Faq.jsx`, `src/components/Footer.jsx`
- Modify: `src/main.jsx`, `src/App.jsx` (full rewrite)
- Delete: `src/Banana.jsx`, `src/App.css`, `src/index.css`
- Test: `tests/unit/App.test.jsx`

**Interfaces:**
- Consumes: `brand`, `products` (Task 1); `formatPrice` (Task 1); `CartProvider`, `useCart` (Task 3).
- Produces:
  - `AnnouncerProvider`, `useAnnounce(): (text: string) => void`
  - `Header({ onOpenCart })` — cart button accessible name `Cart, N item(s)`
  - Add buttons named `Add to cart: <product name>`
  - Hero section has `id="top"` (Task 6 observes it); sections `#shop`, `#story`, `#faq`; `<main id="main">`
  - `App` default export; Task 5 adds dialogs, Task 6 adds the background.

- [ ] **Step 1: Write failing test `tests/unit/App.test.jsx`**

```jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "../../src/App";

describe("App", () => {
  it("renders the page structure", () => {
    render(<App />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#main");
    expect(screen.getByRole("heading", { name: "Pick your pouch" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "From orchard to pouch" })).toBeInTheDocument();
    expect(screen.getByText("Is this a real shop?")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^Add to cart: / })).toHaveLength(4);
  });

  it("adding a product updates the badge and announces it", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole("button", { name: "Cart, 0 items" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add to cart: Classic Dried" }));
    expect(screen.getByRole("button", { name: "Cart, 1 item" })).toBeInTheDocument();
    expect(await screen.findByText("Added Classic Dried to cart")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/unit/App.test.jsx`
Expected: FAIL (old App imports `./Banana` / three; no skip link).

- [ ] **Step 3: Delete old files**

```bash
git rm src/Banana.jsx src/App.css src/index.css
```

- [ ] **Step 4: Write `src/styles/global.css`**

```css
:root {
  --cream: #fff7f0;
  --cream-2: #ffeee2;
  --ink: #2a0b12;
  --muted: #6b3f48;
  --cherry: #a3102a;
  --cherry-dark: #7a0b1f;
  --leaf: #3f7d20;
  --radius: 18px;
  --shadow: 0 10px 30px rgb(122 11 31 / 0.12);
  --font-display: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
  --font-body: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  color-scheme: light;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}

body {
  margin: 0;
  font-family: var(--font-body);
  line-height: 1.6;
  color: var(--ink);
  /* Shown when WebGL is unavailable; the canvas covers it otherwise. */
  background: linear-gradient(160deg, #ffd6c2, #ffb38a) fixed;
  -webkit-font-smoothing: antialiased;
}

h1,
h2,
h3 {
  margin: 0 0 0.5em;
  font-family: var(--font-display);
  line-height: 1.1;
}

svg {
  display: block;
  max-width: 100%;
}

a {
  color: var(--cherry);
}

:focus-visible {
  outline: 3px solid var(--cherry);
  outline-offset: 3px;
  border-radius: 4px;
}

.visually-hidden {
  position: absolute !important;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

.skip-link {
  position: absolute;
  top: -100px;
  left: 1rem;
  z-index: 100;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  background: var(--ink);
  color: #fff;
}

.skip-link:focus {
  top: 1rem;
}

.container {
  width: min(1100px, 100% - 2rem);
  margin-inline: auto;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 44px;
  padding: 0.6rem 1.2rem;
  border: 2px solid var(--cherry);
  border-radius: 999px;
  background: var(--cherry);
  color: #fff;
  font: 600 1rem/1 var(--font-body);
  text-decoration: none;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
}

.button:hover {
  border-color: var(--cherry-dark);
  background: var(--cherry-dark);
}

.button-ghost {
  background: transparent;
  color: var(--cherry);
}

.button-ghost:hover {
  background: var(--cream-2);
  color: var(--cherry-dark);
}

.button-block {
  width: 100%;
}

.icon-button {
  display: inline-grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--ink);
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
}

.icon-button:hover {
  background: var(--cream-2);
}

.link-button {
  padding: 0;
  border: 0;
  background: none;
  color: var(--muted);
  font: inherit;
  font-size: 0.875rem;
  text-decoration: underline;
  cursor: pointer;
}

[id] {
  scroll-margin-top: 80px;
}
```

- [ ] **Step 5: Write `src/styles/sections.css`**

```css
/* 3D background */
.scene {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

/* Header */
.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.6rem max(1rem, (100% - 1100px) / 2);
  border-bottom: 1px solid rgb(122 11 31 / 0.08);
  background: rgb(255 247 240 / 0.88);
  backdrop-filter: blur(10px);
}

.wordmark {
  font: 700 1.6rem var(--font-display);
  color: var(--cherry);
  text-decoration: none;
}

.site-nav ul {
  display: flex;
  gap: 1.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.site-nav a {
  color: var(--ink);
  font-weight: 500;
  text-decoration: none;
}

.site-nav a:hover {
  color: var(--cherry);
}

.badge {
  display: inline-grid;
  place-items: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.35rem;
  border-radius: 999px;
  background: var(--cherry);
  color: #fff;
  font-size: 0.8rem;
}

@media (max-width: 640px) {
  .site-nav {
    display: none;
  }
}

/* Layout layers above the fixed canvas */
main,
.site-footer {
  position: relative;
  z-index: 1;
}

/* Hero */
.hero {
  display: grid;
  place-items: center;
  min-height: calc(100svh - 64px);
  padding: 3rem 1rem;
}

.hero-card {
  max-width: 40rem;
  padding: 2.5rem 2rem;
  border-radius: 28px;
  background: rgb(255 247 240 / 0.85);
  box-shadow: var(--shadow);
  text-align: center;
  backdrop-filter: blur(6px);
}

.eyebrow {
  margin: 0 0 0.75rem;
  color: var(--cherry);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero h1 {
  font-size: clamp(2.6rem, 7vw, 4.8rem);
}

.lead {
  max-width: 32rem;
  margin: 0 auto 1.75rem;
  color: var(--muted);
  font-size: 1.15rem;
}

/* Opaque sheet that scrolls over the canvas */
.sheet {
  padding-block: 3rem;
  border-radius: 32px 32px 0 0;
  background: var(--cream);
  box-shadow: 0 -10px 40px rgb(122 11 31 / 0.1);
}

.section {
  padding-block: 3rem;
}

.section-head {
  max-width: 36rem;
  margin: 0 auto 2.5rem;
  text-align: center;
}

.section-head p {
  margin: 0;
  color: var(--muted);
}

.section h2 {
  font-size: clamp(2rem, 4vw, 2.8rem);
}

/* Products */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 1.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--radius);
  background: #fff;
  box-shadow: var(--shadow);
}

.cherry-art {
  width: 100%;
  height: auto;
}

.card-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.25rem;
}

.card-body h3 {
  margin: 0;
  font-size: 1.35rem;
}

.card-body p {
  flex: 1;
  margin: 0;
  color: var(--muted);
}

.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.price {
  font-size: 1.15rem;
  font-weight: 700;
}

/* Story */
.story-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.story-item {
  padding: 1.75rem;
  border-radius: var(--radius);
  background: var(--cream-2);
}

.story-item h3 {
  font-size: 1.3rem;
}

.story-item p {
  margin: 0;
  color: var(--muted);
}

/* FAQ */
.faq-list {
  display: grid;
  gap: 0.75rem;
  max-width: 44rem;
  margin: 0 auto;
}

.faq-list details {
  padding: 1rem 1.25rem;
  border-radius: 14px;
  background: #fff;
  box-shadow: var(--shadow);
}

.faq-list summary {
  font-weight: 600;
  cursor: pointer;
}

.faq-list details p {
  margin: 0.75rem 0 0;
  color: var(--muted);
}

/* Footer */
.site-footer {
  padding: 2.5rem 0;
  background: var(--ink);
  color: #f6dfe3;
  font-size: 0.95rem;
}

.site-footer a {
  color: #fff;
}

.footer-inner {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
}

.footer-inner p {
  margin: 0;
}

.footer-links {
  display: flex;
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
```

- [ ] **Step 6: Write `src/components/Announcer.jsx`**

```jsx
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const AnnounceContext = createContext(() => {});

// Polite live region for status messages such as "Added X to cart".
export function AnnouncerProvider({ children }) {
  const [message, setMessage] = useState("");
  const timer = useRef();

  const announce = useCallback((text) => {
    // Clear first so repeating the same message is announced again.
    setMessage("");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(text), 50);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <AnnounceContext.Provider value={announce}>
      {children}
      <div className="visually-hidden" role="status" aria-live="polite">
        {message}
      </div>
    </AnnounceContext.Provider>
  );
}

export const useAnnounce = () => useContext(AnnounceContext);
```

- [ ] **Step 7: Write `src/components/Header.jsx`**

```jsx
import { brand } from "../content";
import { useCart } from "../cart/CartContext";

export default function Header({ onOpenCart }) {
  const { count } = useCart();

  return (
    <header className="site-header">
      <a className="wordmark" href="#top">
        {brand.name}
      </a>
      <nav className="site-nav" aria-label="Main">
        <ul>
          <li>
            <a href="#shop">Shop</a>
          </li>
          <li>
            <a href="#story">Story</a>
          </li>
          <li>
            <a href="#faq">FAQ</a>
          </li>
        </ul>
      </nav>
      <button
        type="button"
        className="button button-ghost"
        onClick={onOpenCart}
        aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
      >
        Cart
        <span className="badge" aria-hidden="true">
          {count}
        </span>
      </button>
    </header>
  );
}
```

- [ ] **Step 8: Write `src/components/Hero.jsx`**

```jsx
import { brand } from "../content";

export default function Hero() {
  const { eyebrow, headline, lead, cta } = brand.hero;

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero-card">
        <p className="eyebrow">{eyebrow}</p>
        <h1 id="hero-title">{headline}</h1>
        <p className="lead">{lead}</p>
        <a className="button" href="#shop">
          {cta}
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 9: Write `src/components/CherryArt.jsx`**

```jsx
const BACKGROUNDS = {
  classic: "#ffe3d6",
  sour: "#fff1c9",
  choc: "#f3dfd2",
  mixed: "#ffd9e0",
};

const STEMS = "M80 98 C 86 62, 104 38, 120 26 M130 102 C 128 70, 123 46, 120 26";

function Cherry({ cx, cy, r, fill }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={fill} />
      <circle cx={cx - r * 0.35} cy={cy - r * 0.35} r={r * 0.22} fill="#fff" opacity="0.4" />
    </g>
  );
}

// Product illustration: two (or three) cherries on a stem, varied per product.
export default function CherryArt({ variant, label }) {
  return (
    <svg className="cherry-art" viewBox="0 0 200 150" role="img" aria-label={label}>
      <rect width="200" height="150" fill={BACKGROUNDS[variant]} />
      <path d={STEMS} stroke="#3f7d20" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M120 26 C 138 10, 160 14, 166 24 C 150 34, 134 34, 120 26 Z" fill="#5aa12e" />
      {variant === "mixed" && <Cherry cx={104} cy={128} r={17} fill="#e0485f" />}
      <Cherry cx={80} cy={108} r={26} fill={variant === "sour" ? "#d81e3a" : "#a3102a"} />
      <Cherry cx={130} cy={112} r={24} fill={variant === "mixed" ? "#7a0b1f" : "#b3132b"} />
      {variant === "choc" && (
        <g fill="#4a2617">
          <path d="M54 108 a26 26 0 0 0 52 0 Z" />
          <path d="M106 112 a24 24 0 0 0 48 0 Z" />
        </g>
      )}
      {variant === "sour" && (
        <g fill="#fff" opacity="0.85">
          <circle cx="70" cy="118" r="2" />
          <circle cx="88" cy="96" r="1.6" />
          <circle cx="94" cy="120" r="2" />
          <circle cx="122" cy="104" r="1.8" />
          <circle cx="140" cy="122" r="2" />
          <circle cx="134" cy="98" r="1.5" />
        </g>
      )}
    </svg>
  );
}
```

- [ ] **Step 10: Write `src/components/ProductCard.jsx` and `src/components/Products.jsx`**

`ProductCard.jsx`:

```jsx
import { useCart } from "../cart/CartContext";
import { formatPrice } from "../cart/format";
import { useAnnounce } from "./Announcer";
import CherryArt from "./CherryArt";

export default function ProductCard({ product }) {
  const { add } = useCart();
  const announce = useAnnounce();

  const handleAdd = () => {
    add(product.id);
    announce(`Added ${product.name} to cart`);
  };

  return (
    <li className="card">
      <CherryArt variant={product.art} label={product.artLabel} />
      <div className="card-body">
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="card-foot">
          <span className="price">{formatPrice(product.priceCents)}</span>
          <button type="button" className="button" onClick={handleAdd}>
            Add to cart<span className="visually-hidden">: {product.name}</span>
          </button>
        </div>
      </div>
    </li>
  );
}
```

`Products.jsx`:

```jsx
import { brand, products } from "../content";
import ProductCard from "./ProductCard";

export default function Products() {
  return (
    <section className="section container" id="shop" aria-labelledby="shop-title">
      <div className="section-head">
        <h2 id="shop-title">{brand.shop.title}</h2>
        <p>{brand.shop.intro}</p>
      </div>
      <ul className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 11: Write `src/components/Story.jsx`, `Faq.jsx`, `Footer.jsx`**

`Story.jsx`:

```jsx
import { brand } from "../content";

export default function Story() {
  return (
    <section className="section container" id="story" aria-labelledby="story-title">
      <div className="section-head">
        <h2 id="story-title">{brand.story.title}</h2>
      </div>
      <div className="story-grid">
        {brand.story.items.map((item) => (
          <article className="story-item" key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
```

`Faq.jsx`:

```jsx
import { brand } from "../content";

export default function Faq() {
  return (
    <section className="section container" id="faq" aria-labelledby="faq-title">
      <div className="section-head">
        <h2 id="faq-title">{brand.faq.title}</h2>
      </div>
      <div className="faq-list">
        {brand.faq.items.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
```

`Footer.jsx`:

```jsx
import { brand } from "../content";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p>
          © {new Date().getFullYear()} {brand.name} Cherries. This is a demo store: no real orders.
        </p>
        <ul className="footer-links">
          {brand.social.map((link) => (
            <li key={link.label}>
              <a href={link.href} rel="noopener noreferrer" target="_blank">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
```

- [ ] **Step 12: Rewrite `src/App.jsx` and `src/main.jsx`**

`src/App.jsx`:

```jsx
import { useState } from "react";
import { CartProvider } from "./cart/CartContext";
import { AnnouncerProvider } from "./components/Announcer";
import Faq from "./components/Faq";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Products from "./components/Products";
import Story from "./components/Story";
import { products } from "./content";

export default function App() {
  const [, setCartOpen] = useState(false);

  return (
    <AnnouncerProvider>
      <CartProvider products={products}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header onOpenCart={() => setCartOpen(true)} />
        <main id="main">
          <Hero />
          <div className="sheet">
            <Products />
            <Story />
            <Faq />
          </div>
        </main>
        <Footer />
      </CartProvider>
    </AnnouncerProvider>
  );
}
```

`src/main.jsx`:

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";
import "./styles/sections.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 13: Run tests and lint**

Run: `npm test` → all PASS.
Run: `npm run format && npm run lint` → no errors.

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "feat: build landing page sections and app shell"
```

---

### Task 5: Cart drawer and demo checkout

**Files:**
- Create: `src/components/Modal.jsx`, `src/cart/CartDrawer.jsx`, `src/cart/CheckoutDialog.jsx`
- Modify: `src/App.jsx`, `src/styles/sections.css` (append)
- Test: `tests/unit/CartDrawer.test.jsx`

**Interfaces:**
- Consumes: `useCart` (Task 3), `MAX_QTY` (Task 2), `formatPrice` (Task 1), `Header({ onOpenCart })` (Task 4).
- Produces:
  - `Modal({ open, onClose, className, labelledBy, children })` — native `<dialog>` wrapper
  - `CartDrawer({ open, onClose, onCheckout })` — dialog named "Your cart"
  - `CheckoutDialog({ open, onClose })`; `makeOrderNumber(rand = Math.random): string` → `PIT-` + 6 digits
  - Button names: `Close cart`, `Decrease <name>`, `Increase <name>`, `Remove <name>`, `Checkout`, `Place demo order`, `Back to the shop`

- [ ] **Step 1: Write failing tests `tests/unit/CartDrawer.test.jsx`**

```jsx
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "../../src/App";
import { STORAGE_KEY } from "../../src/cart/CartContext";
import { makeOrderNumber } from "../../src/cart/CheckoutDialog";

async function openCartWith(user, ...names) {
  for (const name of names) {
    await user.click(screen.getByRole("button", { name: `Add to cart: ${name}` }));
  }
  await user.click(screen.getByRole("button", { name: /^Cart, / }));
  return screen.getByRole("dialog", { name: "Your cart" });
}

describe("cart drawer", () => {
  it("shows lines and updates totals", async () => {
    const user = userEvent.setup();
    render(<App />);
    const drawer = await openCartWith(user, "Classic Dried", "Sour Punch");
    expect(drawer).toHaveAttribute("open");
    await user.click(within(drawer).getByRole("button", { name: "Increase Classic Dried" }));
    expect(within(drawer).getByText("$17.98")).toBeInTheDocument();
    expect(within(drawer).getByText("$27.47")).toBeInTheDocument();
  });

  it("decreasing the last unit removes the line and keeps focus in the drawer", async () => {
    const user = userEvent.setup();
    render(<App />);
    const drawer = await openCartWith(user, "Classic Dried");
    await user.click(within(drawer).getByRole("button", { name: "Decrease Classic Dried" }));
    expect(within(drawer).getByText("Your cart is empty.")).toBeInTheDocument();
    expect(within(drawer).getByRole("heading", { name: "Your cart" })).toHaveFocus();
  });

  it("removes a line with the remove button", async () => {
    const user = userEvent.setup();
    render(<App />);
    const drawer = await openCartWith(user, "Classic Dried", "Sour Punch");
    await user.click(within(drawer).getByRole("button", { name: "Remove Sour Punch" }));
    expect(within(drawer).queryByText("Sour Punch")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cart, 1 item" })).toBeInTheDocument();
  });

  it("disables increase at 99", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: { classic: 99 } }));
    const user = userEvent.setup();
    render(<App />);
    const drawer = await openCartWith(user);
    expect(within(drawer).getByRole("button", { name: "Increase Classic Dried" })).toBeDisabled();
  });

  it("closes with the close button", async () => {
    const user = userEvent.setup();
    render(<App />);
    const drawer = await openCartWith(user, "Classic Dried");
    await user.click(within(drawer).getByRole("button", { name: "Close cart" }));
    expect(drawer).not.toHaveAttribute("open");
  });
});

describe("checkout", () => {
  it("places a demo order and empties the cart", async () => {
    const user = userEvent.setup();
    render(<App />);
    const drawer = await openCartWith(user, "Dark Choc-Dipped");
    await user.click(within(drawer).getByRole("button", { name: "Checkout" }));
    const checkout = screen.getByRole("dialog", { name: "Checkout" });
    expect(within(checkout).getByText("1 × Dark Choc-Dipped")).toBeInTheDocument();
    await user.click(within(checkout).getByRole("button", { name: "Place demo order" }));
    expect(within(checkout).getByRole("heading", { name: /order placed/ })).toBeInTheDocument();
    expect(within(checkout).getByText(/^PIT-\d{6}$/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cart, 0 items" })).toBeInTheDocument();
    await user.click(within(checkout).getByRole("button", { name: "Back to the shop" }));
    expect(checkout).not.toHaveAttribute("open");
  });

  it("makes six-digit order numbers", () => {
    expect(makeOrderNumber(() => 0)).toBe("PIT-100000");
    expect(makeOrderNumber(() => 0.999999)).toBe("PIT-999999");
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/unit/CartDrawer.test.jsx`
Expected: FAIL — `CheckoutDialog` module not found.

- [ ] **Step 3: Write `src/components/Modal.jsx`**

```jsx
import { useEffect, useRef } from "react";

// Native <dialog> as a modal: browser handles focus trapping, Esc and focus return.
export default function Modal({ open, onClose, className, labelledBy, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const isOpen = dialog.hasAttribute("open");
    if (open && !isOpen) dialog.showModal();
    if (!open && isOpen) dialog.close();
  }, [open]);

  return (
    // Backdrop clicks land on the <dialog> itself; keyboard users close with Esc.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={ref}
      className={className}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      {children}
    </dialog>
  );
}
```

- [ ] **Step 4: Write `src/cart/CartDrawer.jsx`**

```jsx
import { useRef } from "react";
import Modal from "../components/Modal";
import { MAX_QTY } from "./cartReducer";
import { useCart } from "./CartContext";
import { formatPrice } from "./format";

export default function CartDrawer({ open, onClose, onCheckout }) {
  const { lines, subtotalCents, setQty, remove } = useCart();
  const headingRef = useRef(null);

  // When a line disappears its buttons go with it; keep focus inside the drawer.
  const focusHeading = () => headingRef.current?.focus();

  const changeQty = (id, qty) => {
    if (qty <= 0) focusHeading();
    setQty(id, qty);
  };

  const removeLine = (id) => {
    focusHeading();
    remove(id);
  };

  return (
    <Modal open={open} onClose={onClose} className="drawer" labelledBy="cart-title">
      <div className="drawer-inner">
        <div className="drawer-head">
          <h2 id="cart-title" ref={headingRef} tabIndex={-1}>
            Your cart
          </h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close cart">
            ×
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="empty">
            <p>Your cart is empty.</p>
            <a className="button" href="#shop" onClick={onClose}>
              Browse cherries
            </a>
          </div>
        ) : (
          <>
            <ul className="lines">
              {lines.map(({ product, qty, totalCents }) => (
                <li key={product.id} className="line">
                  <span className="line-name">{product.name}</span>
                  <span className="line-total">{formatPrice(totalCents)}</span>
                  <div className="stepper" role="group" aria-label={`${product.name} quantity`}>
                    <button
                      type="button"
                      onClick={() => changeQty(product.id, qty - 1)}
                      aria-label={`Decrease ${product.name}`}
                    >
                      −
                    </button>
                    <span>{qty}</span>
                    <button
                      type="button"
                      onClick={() => changeQty(product.id, qty + 1)}
                      aria-label={`Increase ${product.name}`}
                      disabled={qty >= MAX_QTY}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => removeLine(product.id)}
                  >
                    Remove<span className="visually-hidden"> {product.name}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="drawer-foot">
              <p className="subtotal">
                <span>Subtotal</span>
                <span>{formatPrice(subtotalCents)}</span>
              </p>
              <button type="button" className="button button-block" onClick={onCheckout}>
                Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
```

- [ ] **Step 5: Write `src/cart/CheckoutDialog.jsx`**

```jsx
import { useState } from "react";
import Modal from "../components/Modal";
import { useCart } from "./CartContext";
import { formatPrice } from "./format";

export function makeOrderNumber(rand = Math.random) {
  return `PIT-${Math.floor(rand() * 900000) + 100000}`;
}

export default function CheckoutDialog({ open, onClose }) {
  const { lines, subtotalCents, clear } = useCart();
  const [orderNumber, setOrderNumber] = useState(null);

  const close = () => {
    setOrderNumber(null);
    onClose();
  };

  const placeOrder = () => {
    setOrderNumber(makeOrderNumber());
    clear();
  };

  let content;
  if (orderNumber) {
    content = (
      <>
        <h2 id="checkout-title">Thanks, order placed!</h2>
        <p>Your demo order number is</p>
        <p className="order-number">{orderNumber}</p>
        <p className="note">No payment was taken and nothing will ship: this is a demo store.</p>
        <div className="actions">
          <button type="button" className="button" onClick={close}>
            Back to the shop
          </button>
        </div>
      </>
    );
  } else if (lines.length === 0) {
    content = (
      <>
        <h2 id="checkout-title">Nothing to check out</h2>
        <div className="actions">
          <button type="button" className="button" onClick={close}>
            Close
          </button>
        </div>
      </>
    );
  } else {
    content = (
      <>
        <h2 id="checkout-title">Checkout</h2>
        <ul className="summary">
          {lines.map(({ product, qty, totalCents }) => (
            <li key={product.id}>
              <span>
                {qty} × {product.name}
              </span>
              <span>{formatPrice(totalCents)}</span>
            </li>
          ))}
        </ul>
        <p className="subtotal">
          <span>Total</span>
          <span>{formatPrice(subtotalCents)}</span>
        </p>
        <p className="note">Demo store: no payment details needed and nothing will be charged.</p>
        <div className="actions">
          <button type="button" className="button button-ghost" onClick={close}>
            Back
          </button>
          <button type="button" className="button" onClick={placeOrder}>
            Place demo order
          </button>
        </div>
      </>
    );
  }

  return (
    <Modal open={open} onClose={close} className="checkout" labelledBy="checkout-title">
      <div className="checkout-inner">{content}</div>
    </Modal>
  );
}
```

- [ ] **Step 6: Wire dialogs into `src/App.jsx`**

Replace the file with:

```jsx
import { useState } from "react";
import CartDrawer from "./cart/CartDrawer";
import { CartProvider } from "./cart/CartContext";
import CheckoutDialog from "./cart/CheckoutDialog";
import { AnnouncerProvider } from "./components/Announcer";
import Faq from "./components/Faq";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Products from "./components/Products";
import Story from "./components/Story";
import { products } from "./content";

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <AnnouncerProvider>
      <CartProvider products={products}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header onOpenCart={() => setCartOpen(true)} />
        <main id="main">
          <Hero />
          <div className="sheet">
            <Products />
            <Story />
            <Faq />
          </div>
        </main>
        <Footer />
        <CartDrawer
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          onCheckout={() => {
            setCartOpen(false);
            setCheckoutOpen(true);
          }}
        />
        <CheckoutDialog open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      </CartProvider>
    </AnnouncerProvider>
  );
}
```

- [ ] **Step 7: Append dialog styles to `src/styles/sections.css`**

```css
/* Dialogs */
dialog {
  padding: 0;
  border: 0;
  background: var(--cream);
  color: var(--ink);
}

dialog::backdrop {
  background: rgb(42 11 18 / 0.45);
}

.drawer {
  width: min(420px, 100%);
  max-width: 100%;
  height: 100dvh;
  max-height: none;
  margin: 0 0 0 auto;
  border-radius: 24px 0 0 24px;
}

.drawer-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1.25rem;
}

.drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.drawer-head h2 {
  margin: 0;
  font-size: 1.6rem;
}

.lines {
  display: grid;
  flex: 1;
  align-content: start;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
}

.line {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 0.4rem 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: 14px;
  background: #fff;
}

.line-name,
.line-total {
  font-weight: 600;
}

.line-total {
  text-align: right;
}

.line .link-button {
  justify-self: end;
}

.stepper {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
}

.stepper button {
  width: 36px;
  height: 36px;
  border: 2px solid var(--cherry);
  border-radius: 50%;
  background: #fff;
  color: var(--cherry);
  font-size: 1.1rem;
  cursor: pointer;
}

.stepper button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.drawer-foot {
  display: grid;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgb(122 11 31 / 0.12);
}

.subtotal {
  display: flex;
  justify-content: space-between;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.empty {
  display: grid;
  flex: 1;
  place-content: center;
  justify-items: center;
  gap: 1rem;
  color: var(--muted);
  text-align: center;
}

.checkout {
  width: min(460px, 100% - 2rem);
  border-radius: 24px;
}

.checkout-inner {
  display: grid;
  gap: 1rem;
  padding: 1.75rem;
}

.checkout h2 {
  margin: 0;
  font-size: 1.8rem;
}

.checkout p {
  margin: 0;
}

.summary {
  display: grid;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.summary li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.order-number {
  font: 700 1.6rem var(--font-display);
  color: var(--cherry);
}

.note {
  color: var(--muted);
  font-size: 0.9rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem;
}
```

- [ ] **Step 8: Run tests and lint**

Run: `npm test` → all PASS.
Run: `npm run format && npm run lint` → no errors.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(cart): add cart drawer and demo checkout dialogs"
```

---

### Task 6: 3D cherry background

**Files:**
- Create: `src/scene/webgl.js`, `src/scene/sceneTier.js`, `src/scene/cherryGeometry.js`, `src/scene/ProceduralCherry.jsx`, `src/scene/CherryModel.jsx`, `src/scene/Cherry.jsx`, `src/scene/Background.jsx`
- Modify: `src/App.jsx`, `tests/unit/App.test.jsx`, `tests/unit/CartDrawer.test.jsx`
- Test: `tests/unit/scene.test.js`

**Interfaces:**
- Consumes: hero element `#top` (Task 4); `.scene` CSS class (Task 4).
- Produces: `hasWebGL(): boolean`; `pickTier({ width, cores, reducedMotion }) → { count, depthOfField, animate }`; `useSceneTier()`; `createCherryGeometry(): THREE.BufferGeometry` (with `color` attribute, centred); default export `Background` (lazy-loaded).

- [ ] **Step 1: Write failing test `tests/unit/scene.test.js`**

```js
import { describe, expect, it } from "vitest";
import { createCherryGeometry } from "../../src/scene/cherryGeometry";
import { pickTier } from "../../src/scene/sceneTier";

describe("pickTier", () => {
  it("uses the full scene on capable desktops", () => {
    expect(pickTier({ width: 1440, cores: 8, reducedMotion: false })).toEqual({
      count: 100,
      depthOfField: true,
      animate: true,
    });
  });

  it("uses the light scene on narrow screens or few cores", () => {
    const light = { count: 40, depthOfField: false, animate: true };
    expect(pickTier({ width: 375, cores: 8, reducedMotion: false })).toEqual(light);
    expect(pickTier({ width: 1440, cores: 4, reducedMotion: false })).toEqual(light);
  });

  it("assumes a capable device when core count is unknown", () => {
    expect(pickTier({ width: 1440, cores: undefined, reducedMotion: false }).count).toBe(100);
  });

  it("stops animation for reduced motion", () => {
    expect(pickTier({ width: 1440, cores: 8, reducedMotion: true }).animate).toBe(false);
  });
});

describe("createCherryGeometry", () => {
  it("builds one centred geometry with vertex colours", () => {
    const geometry = createCherryGeometry();
    expect(geometry).not.toBeNull();
    expect(geometry.getAttribute("position").count).toBeGreaterThan(0);
    expect(geometry.getAttribute("color").count).toBe(geometry.getAttribute("position").count);
    geometry.computeBoundingBox();
    const center = geometry.boundingBox.getCenter(geometry.boundingBox.min.clone());
    expect(center.length()).toBeLessThan(1e-6);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/unit/scene.test.js`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write `src/scene/webgl.js` and `src/scene/sceneTier.js`**

`webgl.js` (must not import three, so it stays in the main bundle cheaply):

```js
export function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}
```

`sceneTier.js`:

```js
import { useState } from "react";

export function pickTier({ width, cores, reducedMotion }) {
  const light = width < 768 || (cores ?? 8) <= 4;
  return { count: light ? 40 : 100, depthOfField: !light, animate: !reducedMotion };
}

// Chosen once on mount; resizing does not rebuild the scene.
export function useSceneTier() {
  const [tier] = useState(() =>
    pickTier({
      width: window.innerWidth,
      cores: navigator.hardwareConcurrency,
      reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    }),
  );
  return tier;
}
```

- [ ] **Step 4: Write `src/scene/cherryGeometry.js`**

```js
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const RED = new THREE.Color("#b3132b");
const STEM = new THREE.Color("#3f7d20");
const LEAF = new THREE.Color("#5aa12e");

function paint(geometry, color) {
  const count = geometry.getAttribute("position").count;
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) color.toArray(colors, i * 3);
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

const v = (x, y, z) => new THREE.Vector3(x, y, z);

// Two cherries, two stems and a leaf merged into one geometry: one draw call per cherry.
export function createCherryGeometry() {
  const parts = [
    paint(new THREE.SphereGeometry(0.5, 24, 16).translate(-0.45, -0.6, 0), RED),
    paint(new THREE.SphereGeometry(0.46, 24, 16).translate(0.5, -0.7, 0.1), RED),
    paint(
      new THREE.TubeGeometry(
        new THREE.QuadraticBezierCurve3(v(-0.45, -0.15, 0), v(-0.3, 0.6, 0), v(0.1, 1, 0)),
        16,
        0.04,
        6,
      ),
      STEM,
    ),
    paint(
      new THREE.TubeGeometry(
        new THREE.QuadraticBezierCurve3(v(0.5, -0.28, 0.1), v(0.45, 0.5, 0.05), v(0.1, 1, 0)),
        16,
        0.04,
        6,
      ),
      STEM,
    ),
    paint(
      new THREE.SphereGeometry(0.3, 12, 8).scale(1, 0.15, 0.5).rotateZ(-0.5).translate(0.4, 1.05, 0),
      LEAF,
    ),
  ];
  const merged = mergeGeometries(parts);
  parts.forEach((part) => part.dispose());
  merged.center();
  return merged;
}
```

- [ ] **Step 5: Run the scene test**

Run: `npx vitest run tests/unit/scene.test.js`
Expected: PASS (5 tests).

- [ ] **Step 6: Write `src/scene/ProceduralCherry.jsx` and `src/scene/CherryModel.jsx`**

`ProceduralCherry.jsx`:

```jsx
import * as THREE from "three";
import { createCherryGeometry } from "./cherryGeometry";

let shared;
function getShared() {
  shared ??= {
    geometry: createCherryGeometry(),
    material: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.35 }),
  };
  return shared;
}

// Built-in cherry used until public/cherry.glb exists (or if it fails to load).
export default function ProceduralCherry(props) {
  const { geometry, material } = getShared();
  return <mesh {...props} geometry={geometry} material={material} dispose={null} />;
}
```

`CherryModel.jsx`:

```jsx
import { Clone, useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

export const MODEL_URL = `${import.meta.env.BASE_URL}cherry.glb`;
const TARGET_SIZE = 2;

// Renders the user's cherry.glb, scaled so its largest side is TARGET_SIZE and centred,
// whatever units or pivot the file was exported with. Geometry/materials are shared.
export default function CherryModel(props) {
  const { scene } = useGLTF(MODEL_URL);

  const { scale, offset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    return {
      scale: TARGET_SIZE / Math.max(size.x, size.y, size.z, 1e-6),
      offset: center.multiplyScalar(-1),
    };
  }, [scene]);

  return (
    <group {...props} scale={scale}>
      <Clone object={scene} position={offset} />
    </group>
  );
}
```

- [ ] **Step 7: Write `src/scene/Cherry.jsx`**

```jsx
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

// One floating cherry: drifts upward, wraps from top to bottom, spins slowly.
export default function Cherry({ index, count, depth, nearZ, children }) {
  const ref = useRef();
  const { viewport, camera } = useThree();
  const z = nearZ - (index / count) * depth;

  // Visible area at this cherry's depth; recomputed when the window resizes.
  const vp = useMemo(
    () => viewport.getCurrentViewport(camera, new THREE.Vector3(0, 0, z)),
    [viewport, camera, z],
  );

  const [data] = useState(() => ({
    x: THREE.MathUtils.randFloatSpread(vp.width),
    y: THREE.MathUtils.randFloatSpread(vp.height),
    rx: Math.random() * Math.PI * 2,
    ry: Math.random() * Math.PI * 2,
    rz: Math.random() * Math.PI * 2,
    s: Math.random() * 0.5 + 0.35,
    // Radians per second
    spinX: (Math.random() - 0.5) * 1.2,
    spinY: (Math.random() - 0.5) * 1.2,
    spinZ: (Math.random() - 0.5) * 1.2,
  }));

  useFrame(({ clock }, delta) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * 0.8;
    const h = vp.height / 1.5;
    ref.current.position.y = THREE.MathUtils.euclideanModulo(data.y + t + h, 2 * h) - h;
    ref.current.rotation.x += data.spinX * delta;
    ref.current.rotation.y += data.spinY * delta;
    ref.current.rotation.z += data.spinZ * delta;
  });

  return (
    <group
      ref={ref}
      position={[data.x, data.y, z]}
      rotation={[data.rx, data.ry, data.rz]}
      scale={data.s}
    >
      {children}
    </group>
  );
}
```

- [ ] **Step 8: Write `src/scene/Background.jsx`**

```jsx
import { Canvas } from "@react-three/fiber";
import { DepthOfField, EffectComposer } from "@react-three/postprocessing";
import { Component, Suspense, useEffect, useState } from "react";
import Cherry from "./Cherry";
import CherryModel from "./CherryModel";
import ProceduralCherry from "./ProceduralCherry";
import { useSceneTier } from "./sceneTier";

const DEPTH = 80;
// Camera sits at z = 20 looking down -z; cherries span NEAR_Z to NEAR_Z - DEPTH.
const NEAR_Z = 10;
const SCENE_BG = "#ffc9b0";

class ModelBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function Cherries({ count, children }) {
  return Array.from({ length: count }, (_, i) => (
    <Cherry key={i} index={i} count={count} depth={DEPTH} nearZ={NEAR_Z}>
      {children}
    </Cherry>
  ));
}

// True while the tab is visible and the hero is on screen.
function useSceneVisible() {
  const [tabVisible, setTabVisible] = useState(() => !document.hidden);
  const [heroVisible, setHeroVisible] = useState(true);

  useEffect(() => {
    const onChange = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);

  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting));
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return tabVisible && heroVisible;
}

export default function Background() {
  const tier = useSceneTier();
  const visible = useSceneVisible();
  const frameloop = !tier.animate ? "demand" : visible ? "always" : "never";

  return (
    <div className="scene" aria-hidden="true">
      <Canvas
        frameloop={frameloop}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 20], fov: 30, near: 0.1, far: 110 }}
        gl={{ alpha: false }}
      >
        <color attach="background" args={[SCENE_BG]} />
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 10]} intensity={2.5} />

        <ModelBoundary
          fallback={
            <Cherries count={tier.count}>
              <ProceduralCherry />
            </Cherries>
          }
        >
          <Suspense fallback={null}>
            <Cherries count={tier.count}>
              <CherryModel />
            </Cherries>
          </Suspense>
        </ModelBoundary>

        {tier.depthOfField && (
          <EffectComposer>
            <DepthOfField
              target={[0, 0, NEAR_Z - DEPTH / 2]}
              focalLength={0.5}
              bokehScale={11}
              height={700}
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
```

- [ ] **Step 9: Mount the background lazily in `src/App.jsx`**

Change the imports at the top of `src/App.jsx` to add:

```jsx
import { Suspense, lazy, useState } from "react";
import { hasWebGL } from "./scene/webgl";
```

(and remove the old `import { useState } from "react";` line). Below the imports add:

```jsx
// Loaded after the page renders so text and layout never wait on three.js.
const Background = lazy(() => import("./scene/Background"));
```

Inside `App`, after the `checkoutOpen` state, add:

```jsx
  const [showScene] = useState(hasWebGL);
```

and directly after the skip link add:

```jsx
        {showScene && (
          <Suspense fallback={null}>
            <Background />
          </Suspense>
        )}
```

- [ ] **Step 10: Keep jsdom tests away from WebGL**

At the top of both `tests/unit/App.test.jsx` and `tests/unit/CartDrawer.test.jsx`, after the existing imports, add:

```js
vi.mock("../../src/scene/webgl", () => ({ hasWebGL: () => false }));
```

and add `vi` to the `vitest` import in each file (`import { describe, expect, it, vi } from "vitest";`).

- [ ] **Step 11: Run tests, lint and build**

Run: `npm test` → all PASS.
Run: `npm run format && npm run lint` → no errors.
Run: `npm run build` → succeeds. In the output, the entry `index-*.js` chunk must be under 250 kB and a separate `Background-*.js` chunk must contain three.js (roughly 800 kB+). If three.js lands in the entry chunk, find and remove the eager import.

- [ ] **Step 12: Visual check in Chrome**

```bash
S=/tmp/pitstop-check && mkdir -p $S
(setsid npx vite preview --port 4178 --strictPort >$S/preview.log 2>&1 &) ; sleep 3
for w in 1280x800 375x812; do
  timeout 40 google-chrome --headless=new --use-angle=swiftshader --enable-unsafe-swiftshader \
    --user-data-dir=$S/chrome --hide-scrollbars --window-size=${w/x/,} \
    --virtual-time-budget=8000 --screenshot=$S/hero-$w.png http://localhost:4178/
done
fuser -k 4178/tcp
```

Open both PNGs. Expected: procedural cherries (red pairs with green stems) float behind a readable hero card on desktop; fewer cherries and no blur at 375 px; header fits on one line at 375 px.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "feat(scene): add lazy-loaded 3D cherry background with procedural fallback"
```

---

### Task 7: SEO, icons and share image

**Files:**
- Create: `build/seo.js`, `public/favicon.svg`, `public/robots.txt`, `scripts/og.html`, `scripts/touch-icon.html`, `public/og.png` (generated), `public/apple-touch-icon.png` (generated)
- Modify: `index.html`, `vite.config.js`
- Test: `tests/unit/seo.test.js`

**Interfaces:**
- Consumes: `brand`, `products` (Task 1).
- Produces: `productJsonLd(brand, products)`, `renderSeo(html, brand, products)`, `seoPlugin(brand, products)`; placeholders `%PITSTOP_TITLE%`, `%PITSTOP_DESCRIPTION%`, `%PITSTOP_SITE_URL%`, `%PITSTOP_BRAND_NAME%`.

- [ ] **Step 1: Write failing test `tests/unit/seo.test.js`**

```js
import { describe, expect, it } from "vitest";
import { productJsonLd, renderSeo } from "../../build/seo";

const brand = {
  name: "Pitstop",
  tagline: "Tag & line",
  description: 'Say "hi" <b>',
  siteUrl: "https://example.com/pitstop/",
};
const products = [{ id: "a", name: "A</script>", description: "d", priceCents: 899 }];

describe("seo", () => {
  it("builds Product JSON-LD", () => {
    const data = productJsonLd(brand, products);
    expect(data["@graph"][0]).toMatchObject({
      "@type": "Product",
      name: "Pitstop A</script>",
      offers: { "@type": "Offer", price: "8.99", priceCurrency: "USD" },
    });
  });

  it("fills escaped placeholders and injects JSON-LD before </head>", () => {
    const html =
      "<head><title>%PITSTOP_TITLE%</title><meta content=\"%PITSTOP_DESCRIPTION%\"><link href=\"%PITSTOP_SITE_URL%og.png\"><x>%PITSTOP_UNKNOWN%</x></head>";
    const out = renderSeo(html, brand, products);
    expect(out).toContain("<title>Pitstop — Tag &amp; line</title>");
    expect(out).toContain('content="Say &quot;hi&quot; &lt;b&gt;"');
    expect(out).toContain('href="https://example.com/pitstop/og.png"');
    expect(out).toContain("%PITSTOP_UNKNOWN%");
    expect(out).toMatch(/<script type="application\/ld\+json">.*<\/script>\s*<\/head>/s);
    // "</script>" inside data must not close the tag early
    expect(out).toContain("A\\u003c/script>");
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/unit/seo.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `build/seo.js`**

```js
// Build-time SEO: fills %PITSTOP_*% placeholders in index.html and adds Product JSON-LD.

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function productJsonLd(brand, products) {
  return {
    "@context": "https://schema.org",
    "@graph": products.map((product) => ({
      "@type": "Product",
      name: `${brand.name} ${product.name}`,
      description: product.description,
      brand: { "@type": "Brand", name: brand.name },
      offers: {
        "@type": "Offer",
        price: (product.priceCents / 100).toFixed(2),
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: brand.siteUrl,
      },
    })),
  };
}

export function renderSeo(html, brand, products) {
  const values = {
    TITLE: `${brand.name} — ${brand.tagline}`,
    DESCRIPTION: brand.description,
    SITE_URL: brand.siteUrl,
    BRAND_NAME: brand.name,
  };
  const filled = html.replace(/%PITSTOP_(\w+)%/g, (match, key) =>
    key in values ? escapeHtml(values[key]) : match,
  );
  const json = JSON.stringify(productJsonLd(brand, products)).replace(/</g, "\\u003c");
  return filled.replace(
    "</head>",
    `  <script type="application/ld+json">${json}</script>\n  </head>`,
  );
}

export function seoPlugin(brand, products) {
  return {
    name: "pitstop-seo",
    transformIndexHtml: (html) => renderSeo(html, brand, products),
  };
}
```

- [ ] **Step 4: Run the test**

Run: `npx vitest run tests/unit/seo.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: Register the plugin in `vite.config.js`**

Add imports:

```js
import { seoPlugin } from "./build/seo.js";
import { brand, products } from "./src/content.js";
```

and change `plugins: [react()],` to:

```js
  plugins: [react(), seoPlugin(brand, products)],
```

- [ ] **Step 6: Rewrite `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>%PITSTOP_TITLE%</title>
    <meta name="description" content="%PITSTOP_DESCRIPTION%" />
    <link rel="canonical" href="%PITSTOP_SITE_URL%" />
    <meta name="theme-color" content="#a3102a" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="%PITSTOP_BRAND_NAME%" />
    <meta property="og:title" content="%PITSTOP_TITLE%" />
    <meta property="og:description" content="%PITSTOP_DESCRIPTION%" />
    <meta property="og:url" content="%PITSTOP_SITE_URL%" />
    <meta property="og:image" content="%PITSTOP_SITE_URL%og.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
  </head>
  <body>
    <div id="root"></div>
    <noscript>Pitstop needs JavaScript to show the shop.</noscript>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Write icons, robots and share-image sources**

`public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M22 40C24 24 34 14 44 8M42 42C42 28 42 18 44 8" stroke="#3f7d20" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M44 8C52 2 60 4 62 10 54 14 48 13 44 8Z" fill="#5aa12e"/><circle cx="21" cy="45" r="13" fill="#a3102a"/><circle cx="43" cy="47" r="12" fill="#c81a3a"/><circle cx="17" cy="40" r="3.5" fill="#fff" opacity=".45"/></svg>
```

`public/robots.txt`:

```
User-agent: *
Allow: /
```

`scripts/og.html` (source for `public/og.png`):

```html
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
      body {
        display: flex; align-items: center; gap: 64px; padding: 0 96px; box-sizing: border-box;
        background: linear-gradient(160deg, #ffd6c2, #ffb38a);
        font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif; color: #2a0b12;
      }
      img { width: 320px; height: 320px; }
      h1 { margin: 0; font-size: 120px; color: #a3102a; line-height: 1; }
      p { margin: 16px 0 0; font-size: 44px; }
    </style>
  </head>
  <body>
    <img src="../public/favicon.svg" alt="" />
    <div>
      <h1>Pitstop</h1>
      <p>Sun-dried cherries, nothing added.</p>
    </div>
  </body>
</html>
```

`scripts/touch-icon.html` (source for `public/apple-touch-icon.png`):

```html
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      html, body { margin: 0; width: 180px; height: 180px; overflow: hidden; background: #fff7f0; }
      img { display: block; width: 140px; height: 140px; margin: 20px; }
    </style>
  </head>
  <body><img src="../public/favicon.svg" alt="" /></body>
</html>
```

- [ ] **Step 8: Generate the PNGs with Chrome**

```bash
google-chrome --headless=new --hide-scrollbars --window-size=1200,630 \
  --screenshot="$PWD/public/og.png" "file://$PWD/scripts/og.html"
google-chrome --headless=new --hide-scrollbars --window-size=180,180 \
  --screenshot="$PWD/public/apple-touch-icon.png" "file://$PWD/scripts/touch-icon.html"
file public/og.png public/apple-touch-icon.png
```

Expected: `1200 x 630` and `180 x 180`. Open `public/og.png` and check it shows the cherry, "Pitstop" and the tagline. If Chrome's window size gives a different viewport, adjust `--window-size` until `file` reports the exact sizes.

- [ ] **Step 9: Verify the built HTML**

Run: `npm run build && grep -c "PITSTOP_" dist/index.html; grep -o '<script type="application/ld+json">' dist/index.html; grep -o 'href="./favicon.svg"' dist/index.html`
Expected: `0` placeholders left, one JSON-LD tag, favicon path rewritten relative.

- [ ] **Step 10: Run all tests and lint, then commit**

```bash
npm test && npm run format && npm run lint
git add -A
git commit -m "feat(seo): add meta tags, JSON-LD, icons and share image"
```

---

### Task 8: End-to-end checkout test

**Files:**
- Create: `playwright.config.js`, `tests/e2e/checkout.spec.js`

**Interfaces:**
- Consumes: the built site; button/dialog names from Tasks 4–5.

- [ ] **Step 1: Write `playwright.config.js`**

```js
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  use: {
    ...devices["Desktop Chrome"],
    channel: "chrome",
    baseURL: "http://localhost:4173/",
  },
  webServer: {
    command: "npm run build && npm run preview -- --port 4173 --strictPort",
    url: "http://localhost:4173/",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
```

- [ ] **Step 2: Write `tests/e2e/checkout.spec.js`**

```js
import { expect, test } from "@playwright/test";

test("add to cart, change quantity, check out", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Add to cart: Classic Dried" }).click();
  await page.getByRole("button", { name: "Add to cart: Sour Punch" }).click();
  await page.getByRole("button", { name: "Cart, 2 items" }).click();

  const drawer = page.getByRole("dialog", { name: "Your cart" });
  await drawer.getByRole("button", { name: "Increase Classic Dried" }).click();
  await expect(drawer.getByText("$27.47")).toBeVisible();
  await drawer.getByRole("button", { name: "Checkout" }).click();

  const checkout = page.getByRole("dialog", { name: "Checkout" });
  await checkout.getByRole("button", { name: "Place demo order" }).click();
  await expect(page.getByRole("heading", { name: "Thanks, order placed!" })).toBeVisible();
  await expect(page.getByText(/^PIT-\d{6}$/)).toBeVisible();
  await page.getByRole("button", { name: "Back to the shop" }).click();
  await expect(page.getByRole("button", { name: "Cart, 0 items" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("button", { name: "Cart, 0 items" })).toBeVisible();
});

test("cart survives a reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Add to cart: Mixed Bag" }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Cart, 1 item" })).toBeVisible();
});

test("Esc closes the cart and returns focus to the cart button", async ({ page }) => {
  await page.goto("/");
  const cartButton = page.getByRole("button", { name: "Cart, 0 items" });
  await cartButton.click();
  await expect(page.getByRole("dialog", { name: "Your cart" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Your cart" })).toBeHidden();
  await expect(cartButton).toBeFocused();
});

test("page works without cherry.glb and logs no unexpected errors", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.waitForTimeout(1500);
  expect(errors.filter((message) => !message.includes("cherry.glb"))).toEqual([]);
});
```

- [ ] **Step 3: Run the e2e tests**

Run: `npm run test:e2e`
Expected: 4 passed. If the focus-return assertion fails in this Chrome version, add explicit focus return in `Modal.jsx`: store `document.activeElement` before `showModal()` and call `.focus()` on it in the `close` handler, then re-run.

- [ ] **Step 4: Commit**

```bash
npm run format
git add -A
git commit -m "test: add end-to-end checkout tests"
```

---

### Task 9: GitHub Pages deploy and docs

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `README.md` (rewrite), `SETUP_GUIDE.md` (rewrite)

- [ ] **Step 1: Write `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Rewrite `README.md`**

```markdown
# Pitstop Cherries

Landing page and demo shop for Pitstop, an invented dried-cherry snack brand. 3D cherries
float behind the hero (React Three Fiber); the cart works and is saved in the browser, and
checkout places a demo order. No payments, no backend.

## Run it

    npm install
    npm run dev        # http://localhost:5173, opens in Chrome

## Scripts

| Command            | What it does                                   |
| ------------------ | ---------------------------------------------- |
| `npm run dev`      | Dev server with hot reload                     |
| `npm run build`    | Production build into `dist/`                  |
| `npm run preview`  | Serve the production build locally             |
| `npm test`         | Unit tests (Vitest)                            |
| `npm run test:e2e` | End-to-end tests in Chrome (Playwright)        |
| `npm run lint`     | ESLint + Prettier check                        |
| `npm run format`   | Format all files with Prettier                 |

## Editing the site

- **Text, products, prices, links:** `src/content.js`. Prices are in cents.
- **Colours and fonts:** variables at the top of `src/styles/global.css`.
- **Site URL** (used for search and share previews): `brand.siteUrl` in `src/content.js`.

## 3D model

Put a cherry model at `public/cherry.glb`. Any size or pivot works: it is scaled and centred
automatically. Keep it under ~300 KB; up to 100 copies are drawn. Without the file, a
built-in cherry shape is used.

To change how the scene behaves, see `src/scene/`: `Background.jsx` (camera, lights, blur,
when it pauses), `Cherry.jsx` (motion), `sceneTier.js` (how many cherries per device).

## Deploying

See `SETUP_GUIDE.md`.
```

- [ ] **Step 3: Rewrite `SETUP_GUIDE.md`**

```markdown
# Deploying to GitHub Pages

The site deploys automatically from `main` using `.github/workflows/deploy.yml`.

## First time

1. Create an empty GitHub repository named `pitstop` (no README).
2. Push this project:

       git remote add origin git@github.com:BigK-Out/pitstop.git
       git push -u origin main

3. In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Open the **Actions** tab and wait for "Deploy to GitHub Pages" to finish (it runs lint,
   tests and the build first). The site is then at https://bigk-out.github.io/pitstop/.

If you use a different repository name or a custom domain, update `brand.siteUrl` in
`src/content.js` so share previews and the canonical link point to the right place.
Asset paths are relative, so the site itself works at any path.

## Every update after that

    git add -A
    git commit -m "describe the change"
    git push

## Checking before you push

    npm run lint && npm test && npm run test:e2e

## Troubleshooting

- **Blank page on GitHub Pages:** make sure Pages source is "GitHub Actions", not a branch.
- **Share preview shows the wrong URL or image:** `brand.siteUrl` must end with `/`.
- **No 3D cherries:** the browser has WebGL disabled; the page falls back to a gradient.
  In Brave, check Shields → fingerprinting protection, which can block WebGL.
```

- [ ] **Step 4: Validate and commit**

Run: `npm run lint && npm test` → pass.

```bash
git add -A
git commit -m "ci: deploy to GitHub Pages; docs: rewrite README and setup guide"
```

---

### Task 10: Final verification

**Files:** none created (fixes go in the files that cause a failure).

- [ ] **Step 1: Full checks**

Run: `npm run lint && npm test && npm run test:e2e`
Expected: all pass.

- [ ] **Step 2: Lighthouse (mobile)**

```bash
mkdir -p .lighthouse
(setsid npx vite preview --port 4179 --strictPort >.lighthouse/preview.log 2>&1 &) ; sleep 3
npx -y lighthouse@12 http://localhost:4179/ --quiet --chrome-flags="--headless=new" \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=json --output-path=.lighthouse/report.json
fuser -k 4179/tcp
node -e 'const r=require("./.lighthouse/report.json");for(const[k,c]of Object.entries(r.categories))console.log(k,Math.round(c.score*100));for(const a of Object.values(r.audits))if(a.score!==null&&a.score<0.9&&a.scoreDisplayMode==="binary")console.log("FAIL",a.id)'
```

Expected: accessibility, best-practices, seo ≥ 90. Fix every failed binary audit in those three categories, rebuild, re-run. Record the performance score as measured.

- [ ] **Step 3: Visual check**

Repeat the Task 6 Step 12 screenshots (1280×800 and 375×812). Then run `npm run dev` and check by hand in Chrome: hero, products, story, FAQ and footer render; drawer and checkout open and look right at desktop and 375 px width (DevTools device mode); Tab order follows the page; Esc closes both dialogs.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: address final verification findings"
```

(Skip if nothing changed.)
