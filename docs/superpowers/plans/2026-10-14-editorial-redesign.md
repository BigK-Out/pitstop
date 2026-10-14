# Pitstop Editorial Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the Pitstop site in the "Editorial Orchard" direction and replace the full-page floating-cherry background with a pinned, scroll-scrubbed "Pit Stop" hero (a glossy cherry splits and the pit lifts out).

**Architecture:** A pure timeline function (`pitStopTimeline(p)`) turns hero scroll progress (0–1, from a sticky 300vh section) into every animated value. A hook measures progress without re-rendering React, keeps it in a ref for the R3F scene, and writes CSS custom properties for the HTML layers. The 3D scene (procedural hero cherry + fogged floaters, no post-processing) lives only inside the hero and is lazy-loaded; a static SVG of the final frame covers no-WebGL, errors, loading and reduced motion.

**Tech Stack:** React 18.3, Vite 5.4, three 0.160, @react-three/fiber 8.18 (drei and postprocessing removed), @fontsource-variable Fraunces + Inter, Vitest 2 + Testing Library, Playwright (Chrome channel).

**Spec:** `docs/superpowers/specs/2026-10-14-editorial-redesign-design.md` (base spec: `docs/superpowers/specs/2026-10-14-cherry-shop-design.md`)

## Global Constraints

- Colour tokens exactly: `--paper #f4ede3`, `--paper-2 #ebe1d3`, `--ink #2b0d12`, `--cherry #8c1c2b`, `--cherry-bright #c3142f`, `--muted #5a3a40`, `--plate-classic #8c1c2b`, `--plate-sour #d9a441`, `--plate-choc #4a2617`, `--plate-mixed #c46a7a`.
- Fonts: Fraunces (display, italics in `--cherry`) and Inter (body), self-hosted via `@fontsource-variable/*`; no Google Fonts requests.
- Type scale: hero h1 `clamp(3.5rem, 9vw, 8.5rem)`; section h2 `clamp(2.25rem, 5vw, 4rem)`; statement `clamp(2.5rem, 7vw, 6rem)`; footer wordmark `clamp(6rem, 24vw, 22rem)`.
- Max content width 1280px; gutters 24px (16px below 768px); thin 1px rules; no drop shadows.
- Hero section `#top`: height `300vh`, sticky stage `100svh`; reduced motion or no WebGL → not pinned, final frame static, reveal visible.
- Timeline breakpoints: intro fade 0.08–0.28 (shift 40px); approach/turn/scale 0–0.3 (turn 0.6 rad → 0, scale 1 → 1.15); split 0.30–0.65 (±1.1 X, ∓0.45 Z); pitLift 0.45–0.75 (+1.5 Y, π spin); reveal 0.70–0.85; revealVisible at p ≥ 0.7; easing easeInOutCubic.
- Scene: camera fov 30 at `[0, 0, 12]`; 24 floaters (12 light tier); fog to `--paper`; `dpr [1, 1.75]` (light `[1, 1.5]`); frameloop always/never/demand as in spec; no depth of field; no GLB loading.
- Copy lives in `src/content.js`; emphasis as `{ text }` / `{ em }` segments, never raw HTML.
- Naming (plan ruling, see below): the shopping container is a **bag** everywhere — header "Bag n items", buttons "Add to bag: <name>", drawer "Your bag", "Close bag", "Your bag is empty.", announcer "Added <name> to bag".
- Lighthouse mobile: Accessibility, Best Practices, SEO ≥ 90; Performance target ≥ 80.
- Dev server on port 5173 belongs to the user; tests use 4173; never kill 5173.

Plan rulings beyond the spec (reviewers: these are intentional):
1. "Bag" naming everywhere (spec only named the header) — mixing "Bag" with "Add to cart" reads unprofessional.
2. `pitStopTimeline` also returns `travel` (0→1 over 0–0.3, eased) to move the hero cherry from the right column to centre; halves also open toward the camera by rotating `∓0.7 * split` on Y so the cut faces are visible (the spec's ±X/∓Z alone would show the faces edge-on).
3. The 3D scene renders with `flat` (no tone mapping) so fog and background match `--paper` exactly; glossy reflections come from three's `RoomEnvironment`.

## Review Focus

1. **Deep link or reload mid-page** (e.g. `#faq`) → the hero measures on mount and is already at its final state when scrolled back to. Test: Task 1 "measures on mount".
2. **Window resize / phone rotation mid-scroll** → progress is recomputed. Test: Task 1 "updates on scroll and resize".
3. **Reduced-motion visitors** → hero not pinned, final frame and reveal line visible without scrolling. Tests: Task 2 "reduced motion shows the final frame", Task 4 e2e "reduced motion".
4. **WebGL creation or scene chunk fails** → the static split-cherry art stays and the shop works. Test: Task 3 `HeroSceneFailure.test.jsx`.
5. **Keyboard users tabbing at the top of the page** → the hidden reveal button is skipped (not focusable until revealed). Test: Task 4 e2e "hidden reveal button is not tabbable".

---

## File Map

```
src/pitstop/progress.js            progressFor()                                   (Task 1)
src/pitstop/timeline.js            seg, easeInOutCubic, pitStopTimeline            (Task 1)
src/pitstop/useScrollProgress.js   hook: ref progress + CSS vars + data-revealed   (Task 1)
src/pitstop/useReducedMotion.js    hook                                            (Task 1)
src/main.jsx                       font imports                                    (Task 2)
src/content.js                     new copy structure                              (Task 2)
src/styles/global.css              rewrite: tokens, type, buttons                  (Task 2)
src/styles/sections.css            rewrite: all sections + dialogs                 (Task 2)
src/components/Emph.jsx            renders {text}/{em} segments                    (Task 2)
src/components/SplitCherryArt.jsx  static final-frame SVG                          (Task 2)
src/components/CherryArt.jsx       rewrite: line art in currentColor               (Task 2)
src/components/Header.jsx, Hero.jsx, Statement.jsx, Products.jsx,
  ProductCard.jsx, Orchard.jsx, Faq.jsx, Footer.jsx                                (Task 2; Hero again in Task 3)
src/cart/CartDrawer.jsx            "bag" strings                                   (Task 2)
src/App.jsx                        new section order, no Background                (Task 2)
src/scene/sceneTier.js             new tier shape                                  (Task 3)
src/scene/heroGeometry.js          createHeroCherryParts()                         (Task 3)
src/scene/HeroCherry.jsx, Floaters.jsx, PitStopScene.jsx                           (Task 3)
src/scene/ProceduralCherry.jsx      comment update only                             (Task 3)
tests/unit/pitstop.test.js, useScrollProgress.test.jsx                             (Task 1)
tests/unit/App.test.jsx, CartDrawer.test.jsx, HeroMotion.test.jsx, Emph.test.jsx   (Task 2)
tests/unit/scene.test.js, HeroSceneFailure.test.jsx                                (Task 3)
tests/e2e/checkout.spec.js, tests/e2e/pitstop.spec.js                              (Tasks 2, 4)
README.md                                                                          (Task 4)
```

Deleted: `src/components/Story.jsx`, `tests/unit/AppBackgroundFailure.test.jsx` (Task 2); `src/scene/Background.jsx`, `src/scene/Cherry.jsx`, `src/scene/CherryModel.jsx`, `src/scene/modelExists.js` (Task 3).

---

### Task 1: Pit Stop scroll logic

**Files:**
- Create: `src/pitstop/progress.js`, `src/pitstop/timeline.js`, `src/pitstop/useScrollProgress.js`, `src/pitstop/useReducedMotion.js`
- Test: `tests/unit/pitstop.test.js`, `tests/unit/useScrollProgress.test.jsx`

**Interfaces:**
- Produces:
  - `progressFor(rectTop: number, sectionHeight: number, viewportHeight: number): number` (0–1)
  - `seg(p, a, b)`, `easeInOutCubic(x)`, `pitStopTimeline(p) → { introOpacity, introShift, travel, turn, scale, split, pitLift, revealOpacity, revealVisible }`
  - `useScrollProgress(ref, enabled: boolean) → React ref whose .current is progress 0–1`; side effects on `ref.current`: CSS vars `--intro-opacity`, `--intro-shift` (px), `--reveal-opacity`; boolean attribute `data-revealed`
  - `useReducedMotion(): boolean`

- [ ] **Step 1: Write failing tests `tests/unit/pitstop.test.js`**

```js
import { describe, expect, it } from "vitest";
import { progressFor } from "../../src/pitstop/progress";
import { easeInOutCubic, pitStopTimeline, seg } from "../../src/pitstop/timeline";

describe("progressFor", () => {
  it("maps the section's scroll range to 0..1", () => {
    expect(progressFor(0, 3000, 1000)).toBe(0);
    expect(progressFor(-1000, 3000, 1000)).toBe(0.5);
    expect(progressFor(-2000, 3000, 1000)).toBe(1);
  });

  it("clamps before and after the section", () => {
    expect(progressFor(400, 3000, 1000)).toBe(0);
    expect(progressFor(-9000, 3000, 1000)).toBe(1);
  });

  it("returns 0 when the section is not taller than the viewport", () => {
    expect(progressFor(-50, 800, 1000)).toBe(0);
    expect(progressFor(0, 1000, 1000)).toBe(0);
  });
});

describe("seg and easing", () => {
  it("normalises and clamps a segment", () => {
    expect(seg(0.2, 0.3, 0.5)).toBe(0);
    expect(seg(0.4, 0.3, 0.5)).toBeCloseTo(0.5);
    expect(seg(0.9, 0.3, 0.5)).toBe(1);
  });

  it("eases in and out symmetrically", () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(0.5)).toBe(0.5);
    expect(easeInOutCubic(1)).toBe(1);
    expect(easeInOutCubic(0.25)).toBeCloseTo(1 - easeInOutCubic(0.75));
  });
});

describe("pitStopTimeline", () => {
  it("starts with the intro visible and the cherry whole", () => {
    expect(pitStopTimeline(0)).toEqual({
      introOpacity: 1,
      introShift: 0,
      travel: 0,
      turn: 0.6,
      scale: 1,
      split: 0,
      pitLift: 0,
      revealOpacity: 0,
      revealVisible: false,
    });
  });

  it("has finished the approach at 0.3", () => {
    const t = pitStopTimeline(0.3);
    expect(t.introOpacity).toBe(0);
    expect(t.introShift).toBe(40);
    expect(t.travel).toBe(1);
    expect(t.turn).toBe(0);
    expect(t.scale).toBeCloseTo(1.15);
    expect(t.split).toBe(0);
  });

  it("is half split at 0.475 and fully open with the pit out at 0.75", () => {
    expect(pitStopTimeline(0.475).split).toBeCloseTo(0.5);
    const t = pitStopTimeline(0.75);
    expect(t.split).toBe(1);
    expect(t.pitLift).toBe(1);
    expect(t.revealVisible).toBe(true);
    expect(t.revealOpacity).toBeCloseTo(1 / 3);
  });

  it("reveals the line from 0.7 and fully by 0.85", () => {
    expect(pitStopTimeline(0.69).revealVisible).toBe(false);
    expect(pitStopTimeline(0.7).revealVisible).toBe(true);
    expect(pitStopTimeline(1).revealOpacity).toBe(1);
  });

  it("never runs split or pitLift backwards as p increases", () => {
    let prev = pitStopTimeline(0);
    for (let i = 1; i <= 100; i++) {
      const next = pitStopTimeline(i / 100);
      expect(next.split).toBeGreaterThanOrEqual(prev.split);
      expect(next.pitLift).toBeGreaterThanOrEqual(prev.pitLift);
      prev = next;
    }
  });
});
```

- [ ] **Step 2: Write failing tests `tests/unit/useScrollProgress.test.jsx`**

```jsx
import { render, screen, waitFor } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useScrollProgress } from "../../src/pitstop/useScrollProgress";

function Probe({ enabled, out }) {
  const ref = useRef(null);
  const progress = useScrollProgress(ref, enabled);
  if (out) out.current = progress;
  return <section ref={ref} data-testid="hero" />;
}

const mockRect = (top, height) =>
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ top, height });

afterEach(() => vi.unstubAllGlobals());

describe("useScrollProgress", () => {
  it("measures on mount (deep link mid-page)", () => {
    vi.stubGlobal("innerHeight", 1000);
    mockRect(-2000, 3000);
    const out = { current: null };
    render(<Probe enabled out={out} />);
    const hero = screen.getByTestId("hero");
    expect(out.current.current).toBe(1);
    expect(hero).toHaveAttribute("data-revealed");
    expect(hero.style.getPropertyValue("--reveal-opacity")).toBe("1");
    expect(hero.style.getPropertyValue("--intro-opacity")).toBe("0");
    expect(hero.style.getPropertyValue("--intro-shift")).toBe("40px");
  });

  it("updates on scroll and resize", async () => {
    vi.stubGlobal("innerHeight", 1000);
    const rect = mockRect(0, 3000);
    render(<Probe enabled />);
    const hero = screen.getByTestId("hero");
    expect(hero.style.getPropertyValue("--intro-opacity")).toBe("1");
    expect(hero).not.toHaveAttribute("data-revealed");

    rect.mockReturnValue({ top: -1500, height: 3000 }); // p = 0.75
    window.dispatchEvent(new Event("scroll"));
    await waitFor(() => expect(hero).toHaveAttribute("data-revealed"));

    rect.mockReturnValue({ top: -200, height: 3000 }); // p = 0.1
    window.dispatchEvent(new Event("resize"));
    await waitFor(() => expect(hero).not.toHaveAttribute("data-revealed"));
  });

  it("pins to the final frame when disabled", () => {
    mockRect(0, 3000);
    const out = { current: null };
    render(<Probe enabled={false} out={out} />);
    const hero = screen.getByTestId("hero");
    expect(out.current.current).toBe(1);
    expect(hero).toHaveAttribute("data-revealed");
    expect(hero.style.getPropertyValue("--reveal-opacity")).toBe("1");
  });
});
```

- [ ] **Step 3: Run to verify failure**

Run: `npx vitest run tests/unit/pitstop.test.js tests/unit/useScrollProgress.test.jsx`
Expected: FAIL — modules not found.

- [ ] **Step 4: Implement `src/pitstop/progress.js` and `src/pitstop/timeline.js`**

`progress.js`:

```js
// How far the page has scrolled through a pinned section: 0 at its top, 1 when its end
// reaches the bottom of the viewport.
export function progressFor(rectTop, sectionHeight, viewportHeight) {
  const range = sectionHeight - viewportHeight;
  if (range <= 0) return 0;
  return Math.min(1, Math.max(0, -rectTop / range));
}
```

`timeline.js`:

```js
const clamp01 = (value) => Math.min(1, Math.max(0, value));

// Position of p inside [a, b], clamped to 0..1.
export const seg = (p, a, b) => clamp01((p - a) / (b - a));

export const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

// Every animated value of the Pit Stop hero for scroll progress p (0..1).
// Single source of truth for both the 3D scene and the HTML layers.
export function pitStopTimeline(p) {
  const intro = seg(p, 0.08, 0.28);
  const approach = easeInOutCubic(seg(p, 0, 0.3));
  return {
    introOpacity: 1 - intro,
    introShift: 40 * intro,
    travel: approach,
    turn: 0.6 * (1 - approach),
    scale: 1 + 0.15 * approach,
    split: easeInOutCubic(seg(p, 0.3, 0.65)),
    pitLift: easeInOutCubic(seg(p, 0.45, 0.75)),
    revealOpacity: seg(p, 0.7, 0.85),
    revealVisible: p >= 0.7,
  };
}
```

- [ ] **Step 5: Implement the hooks**

`src/pitstop/useScrollProgress.js`:

```js
import { useEffect, useRef } from "react";
import { progressFor } from "./progress";
import { pitStopTimeline } from "./timeline";

// Tracks scroll progress through the section in `ref` without re-rendering React.
// The returned ref feeds the 3D scene; CSS custom properties feed the HTML layers.
// When `enabled` is false the section is pinned to its final frame (p = 1).
export function useScrollProgress(ref, enabled) {
  const progress = useRef(enabled ? 0 : 1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const apply = (p) => {
      progress.current = p;
      const t = pitStopTimeline(p);
      el.style.setProperty("--intro-opacity", String(t.introOpacity));
      el.style.setProperty("--intro-shift", `${t.introShift}px`);
      el.style.setProperty("--reveal-opacity", String(t.revealOpacity));
      el.toggleAttribute("data-revealed", t.revealVisible);
    };

    if (!enabled) {
      apply(1);
      return;
    }

    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      apply(progressFor(rect.top, rect.height, window.innerHeight));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ref, enabled]);

  return progress;
}
```

`src/pitstop/useReducedMotion.js`:

```js
import { useState } from "react";

// Read once on mount, like the scene tier.
export function useReducedMotion() {
  const [reduced] = useState(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
  );
  return reduced;
}
```

- [ ] **Step 6: Run tests**

Run: `npx vitest run tests/unit/pitstop.test.js tests/unit/useScrollProgress.test.jsx`
Expected: PASS (13 tests). Then `npm test` (all pass) and `npm run format && npm run lint` (clean).

- [ ] **Step 7: Commit**

```bash
git add src/pitstop tests/unit/pitstop.test.js tests/unit/useScrollProgress.test.jsx
git commit -m "feat(pitstop): add scroll progress, timeline and hooks"
```

---

### Task 2: Editorial page redesign

**Files:**
- Modify: `package.json` (fonts), `src/main.jsx`, `src/content.js`, `src/styles/global.css` (rewrite), `src/styles/sections.css` (rewrite), `src/components/CherryArt.jsx` (rewrite), `src/components/Header.jsx`, `src/components/Hero.jsx` (rewrite), `src/components/Products.jsx`, `src/components/ProductCard.jsx`, `src/components/Faq.jsx`, `src/components/Footer.jsx`, `src/cart/CartDrawer.jsx`, `src/App.jsx`, `tests/unit/App.test.jsx`, `tests/unit/CartDrawer.test.jsx`, `tests/e2e/checkout.spec.js`
- Create: `src/components/Emph.jsx`, `src/components/SplitCherryArt.jsx`, `src/components/Statement.jsx`, `src/components/Orchard.jsx`
- Delete: `src/components/Story.jsx`, `tests/unit/AppBackgroundFailure.test.jsx`
- Test: `tests/unit/Emph.test.jsx`, `tests/unit/HeroMotion.test.jsx`, updated `App.test.jsx`, `CartDrawer.test.jsx`, `checkout.spec.js`

**Interfaces:**
- Consumes: `useScrollProgress`, `useReducedMotion` (Task 1); `hasWebGL` from `src/scene/webgl.js`; cart/announcer APIs unchanged.
- Produces:
  - `Emph({ parts: Array<{text: string} | {em: string}> })`
  - `SplitCherryArt({ className })` — SVG `role="img"` labelled "A cherry split in half with its pit lifted out"
  - `Hero` renders `<section id="top" class="pitstop[ pitstop--static]">` → `.pitstop-stage` → `.pitstop-canvas[aria-hidden]` (holds art; Task 3 adds the scene here), `.pitstop-intro`, `.pitstop-reveal`
  - `brand.hero.{label, headline, primaryCta, secondaryCta, reveal}`, `brand.statement.{label, parts}`, `brand.shop.{label, title}`, `brand.orchard.{label, title, steps}`, `brand.faq.{label, heading, items}`
  - Section ids: `#top`, `#shop`, `#orchard`, `#faq`

- [ ] **Step 1: Install fonts and remove the obsolete background test**

```bash
npm install @fontsource-variable/fraunces@5 @fontsource-variable/inter@5
git rm src/components/Story.jsx tests/unit/AppBackgroundFailure.test.jsx
ls node_modules/@fontsource-variable/fraunces/*.css node_modules/@fontsource-variable/inter/*.css
```

The imports in Step 6 use `wght.css` and `wght-italic.css`; if the listing shows different names for the weight-axis files, use those.

- [ ] **Step 2: Rename "cart" to "bag" in tests (they will fail until the UI changes)**

```bash
sed -i -e 's/Add to cart: /Add to bag: /g' -e 's/\^Cart /^Bag /g' -e 's/Cart \([0-9]\)/Bag \1/g' \
  -e 's/Your cart/Your bag/g' -e 's/Close cart/Close bag/g' -e 's/ to cart"/ to bag"/g' \
  tests/unit/App.test.jsx tests/unit/CartDrawer.test.jsx tests/e2e/checkout.spec.js
grep -n "cart" tests/unit/App.test.jsx tests/unit/CartDrawer.test.jsx tests/e2e/checkout.spec.js
```

Expected: the only remaining "cart" hits are imports/identifiers (`CartContext`, `openCartWith`, `cartButton`), not user-visible strings.

- [ ] **Step 3: Write failing tests**

Replace `tests/unit/App.test.jsx` with:

```jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "../../src/App";

vi.mock("../../src/scene/webgl", () => ({ hasWebGL: () => false }));

describe("App", () => {
  it("renders the editorial page structure", () => {
    const { container } = render(<App />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Cherries, slowly sun-dried." }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#main");
    expect(screen.getByText("We took the pit out.")).toBeInTheDocument();
    expect(screen.getByText("Cherries. That's the list.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pick your pouch" })).toBeInTheDocument();
    expect(screen.getByText("4 pouches · from $8.99")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "From orchard to pouch" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Good to know." })).toBeInTheDocument();
    expect(screen.getByText("Is this a real shop?")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^Add to bag: / })).toHaveLength(4);
    expect(screen.getByText("Fig. 03")).toBeInTheDocument();
    for (const id of ["top", "shop", "orchard", "faq"]) {
      expect(container.querySelector(`#${id}`)).not.toBeNull();
    }
  });

  it("shows the static split-cherry art when WebGL is unavailable", () => {
    const { container } = render(<App />);
    const hero = container.querySelector("#top");
    expect(hero).toHaveClass("pitstop--static");
    expect(hero).toHaveAttribute("data-revealed");
    const art = hero.querySelector(".pitstop-canvas svg.pitstop-art");
    expect(art).not.toBeNull();
    expect(art).toHaveAttribute("aria-label", "A cherry split in half with its pit lifted out");
  });

  it("adding a product updates the bag and announces it", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole("button", { name: "Bag 0 items" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add to bag: Classic Dried" }));
    expect(screen.getByRole("button", { name: "Bag 1 item" })).toBeInTheDocument();
    expect(await screen.findByText("Added Classic Dried to bag")).toBeInTheDocument();
  });
});
```

Create `tests/unit/HeroMotion.test.jsx`:

```jsx
import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../../src/App";

vi.mock("../../src/scene/webgl", () => ({ hasWebGL: () => true }));

const mockMatchMedia = (reduce) =>
  vi.stubGlobal("matchMedia", (query) => ({
    matches: reduce && query.includes("reduce"),
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }));

afterEach(() => vi.unstubAllGlobals());

describe("Hero motion modes", () => {
  it("pins and scrubs when motion is allowed", () => {
    mockMatchMedia(false);
    const { container } = render(<App />);
    const hero = container.querySelector("#top");
    expect(hero).not.toHaveClass("pitstop--static");
    expect(hero).not.toHaveAttribute("data-revealed");
  });

  it("reduced motion shows the final frame without pinning", () => {
    mockMatchMedia(true);
    const { container } = render(<App />);
    const hero = container.querySelector("#top");
    expect(hero).toHaveClass("pitstop--static");
    expect(hero).toHaveAttribute("data-revealed");
  });
});
```

Create `tests/unit/Emph.test.jsx`:

```jsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Emph from "../../src/components/Emph";

describe("Emph", () => {
  it("renders text and emphasised segments in order", () => {
    const { container } = render(
      <p>
        <Emph parts={[{ text: "We took the " }, { em: "pit" }, { text: " out." }]} />
      </p>,
    );
    expect(container.textContent).toBe("We took the pit out.");
    expect(container.querySelector("em").textContent).toBe("pit");
  });
});
```

- [ ] **Step 4: Run to verify failure**

Run: `npx vitest run tests/unit/App.test.jsx tests/unit/HeroMotion.test.jsx tests/unit/Emph.test.jsx tests/unit/CartDrawer.test.jsx`
Expected: FAIL (old headline, "Add to cart" names, missing Emph module).

- [ ] **Step 5: Replace `src/content.js`**

```js
// All site copy, products and prices. Pure data: also imported by vite.config.js in Node.
// Emphasis is written as segments: { text } for plain words, { em } for italic cherry words.

export const brand = {
  name: "Pitstop",
  tagline: "Sun-dried cherries, nothing added.",
  description:
    "Pitstop makes small-batch dried cherry snacks from orchard-grown fruit. Shop Classic, Sour Punch, Dark Choc-Dipped and Mixed Bag.",
  // Public URL of the deployed site, with trailing slash. Used for canonical and share tags.
  siteUrl: "https://bigk-out.github.io/pitstop/",
  hero: {
    label: "Batch Nº 07 — Montmorency, 2026",
    headline: [{ text: "Cherries, " }, { em: "slowly" }, { text: " sun-dried." }],
    primaryCta: "Shop the harvest",
    secondaryCta: "Our orchard",
    reveal: [{ text: "We took the " }, { em: "pit" }, { text: " out." }],
  },
  statement: {
    label: "Ingredients",
    parts: [{ text: "Cherries. " }, { em: "That's the list." }],
  },
  shop: {
    label: "The harvest",
    title: "Pick your pouch",
  },
  orchard: {
    label: "The orchard",
    title: "From orchard to pouch",
    steps: [
      {
        title: "Picked ripe",
        body: "Family orchards, picked at peak ripeness and never early.",
      },
      {
        title: "Pitted by hand",
        body: "Checked one by one. The pit is the only thing we take out.",
      },
      {
        title: "Sun-dried slow",
        body: "Their own sugar does the work, then into a home-compostable pouch.",
      },
    ],
  },
  faq: {
    label: "Questions",
    heading: [{ text: "Good to " }, { em: "know." }],
    items: [
      {
        q: "Is this a real shop?",
        a: "No. Pitstop is a demo store. You can fill a bag and place a demo order, but nothing is charged and nothing ships.",
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
    artLabel: "Line drawing of two cherries joined at the stem",
  },
  {
    id: "sour",
    name: "Sour Punch",
    description: "Tart Montmorency cherries with a dusting of sour citrus. Pucker up.",
    priceCents: 949,
    art: "sour",
    artLabel: "Line drawing of two cherries dusted with sour sugar",
  },
  {
    id: "choc",
    name: "Dark Choc-Dipped",
    description: "Dried cherries half-dipped in 70% dark chocolate.",
    priceCents: 1199,
    art: "choc",
    artLabel: "Line drawing of two cherries half-dipped in chocolate",
  },
  {
    id: "mixed",
    name: "Mixed Bag",
    description: "Classic, sour and choc-dipped together in one 300 g pouch.",
    priceCents: 1499,
    art: "mixed",
    artLabel: "Line drawing of three cherries on one stem",
  },
];
```

- [ ] **Step 6: Fonts in `src/main.jsx`**

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource-variable/fraunces/wght.css";
import "@fontsource-variable/fraunces/wght-italic.css";
import "@fontsource-variable/inter/wght.css";
import App from "./App";
import "./styles/global.css";
import "./styles/sections.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 7: Replace `src/styles/global.css`**

```css
:root {
  --paper: #f4ede3;
  --paper-2: #ebe1d3;
  --ink: #2b0d12;
  --cherry: #8c1c2b;
  --cherry-bright: #c3142f;
  --muted: #5a3a40;
  --plate-classic: #8c1c2b;
  --plate-sour: #d9a441;
  --plate-choc: #4a2617;
  --plate-mixed: #c46a7a;
  --rule: rgb(43 13 18 / 0.15);
  --font-display: "Fraunces Variable", Georgia, serif;
  --font-body: "Inter Variable", system-ui, -apple-system, "Segoe UI", sans-serif;
  --max: 1280px;
  --gutter: 24px;
  --edge: max(var(--gutter), (100% - var(--max)) / 2);
  --header-h: 64px;
  color-scheme: light;
}

@media (max-width: 767px) {
  :root {
    --gutter: 16px;
  }
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
  background: var(--paper);
  color: var(--ink);
  font: 400 1rem/1.6 var(--font-body);
  -webkit-font-smoothing: antialiased;
}

h1,
h2,
h3 {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 340;
  line-height: 1;
  letter-spacing: -0.02em;
}

h1 em,
h2 em,
.statement-text em,
.pitstop-reveal-line em {
  font-style: italic;
  color: var(--cherry);
}

svg {
  display: block;
  max-width: 100%;
}

a {
  color: inherit;
}

:focus-visible {
  outline: 2px solid var(--cherry);
  outline-offset: 3px;
}

[id] {
  scroll-margin-top: calc(var(--header-h) + 16px);
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
  background: var(--ink);
  color: var(--paper);
}

.skip-link:focus {
  top: 1rem;
}

.container {
  width: min(var(--max), 100% - 2 * var(--gutter));
  margin-inline: auto;
}

.label {
  margin: 0 0 1rem;
  color: var(--cherry);
  font: 600 0.7rem/1.2 var(--font-body);
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 44px;
  padding: 0.75rem 1.4rem;
  border: 1px solid var(--ink);
  border-radius: 999px;
  background: var(--ink);
  color: var(--paper);
  font: 500 0.95rem/1 var(--font-body);
  text-decoration: none;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s,
    border-color 0.2s;
}

.button:hover {
  border-color: var(--cherry);
  background: var(--cherry);
}

.button-outline,
.button-ghost {
  background: transparent;
  color: var(--ink);
}

.button-outline:hover,
.button-ghost:hover {
  border-color: var(--ink);
  background: var(--ink);
  color: var(--paper);
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
  background: var(--paper-2);
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
```

- [ ] **Step 8: Replace `src/styles/sections.css`**

```css
/* Header */
.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  height: var(--header-h);
  padding: 0 var(--edge);
  border-bottom: 1px solid var(--rule);
  background: rgb(244 237 227 / 0.92);
  backdrop-filter: blur(8px);
}

.wordmark {
  justify-self: start;
  font: 500 1.6rem/1 var(--font-display);
  letter-spacing: -0.02em;
  text-decoration: none;
}

.site-nav ul {
  display: flex;
  gap: 2rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.site-nav a,
.bag-button {
  font: 600 0.72rem/1 var(--font-body);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  text-decoration: none;
}

.site-nav a:hover,
.bag-button:hover {
  color: var(--cherry);
}

.bag-button {
  justify-self: end;
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 0.25rem;
  border: 0;
  background: none;
  color: var(--ink);
  cursor: pointer;
}

.bag-count {
  display: inline-grid;
  place-items: center;
  min-width: 1.5rem;
  height: 1.5rem;
  margin-left: 0.5rem;
  padding: 0 0.3rem;
  border: 1px solid currentColor;
  border-radius: 999px;
  letter-spacing: 0;
}

@media (max-width: 640px) {
  .site-header {
    grid-template-columns: 1fr 1fr;
  }

  .site-nav {
    display: none;
  }
}

/* Pit Stop hero */
.pitstop {
  position: relative;
  height: 300vh;
}

.pitstop-stage {
  position: sticky;
  top: 0;
  height: 100svh;
  overflow: hidden;
}

.pitstop-canvas {
  position: absolute;
  inset: 0;
}

.pitstop-canvas canvas {
  display: block;
}

.pitstop-art {
  position: absolute;
  top: 50%;
  right: var(--edge);
  width: min(44vw, 560px);
  height: auto;
  transform: translateY(-50%);
}

.pitstop-intro {
  position: absolute;
  top: 50%;
  left: var(--edge);
  max-width: min(40rem, 50vw);
  opacity: var(--intro-opacity, 1);
  transform: translateY(calc(-50% - var(--intro-shift, 0px)));
}

.pitstop-intro h1 {
  margin-bottom: 2rem;
  font-size: clamp(3.5rem, 9vw, 8.5rem);
  line-height: 0.9;
}

.pitstop-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.pitstop-reveal {
  position: absolute;
  right: 0;
  bottom: 9svh;
  left: 0;
  display: grid;
  justify-items: center;
  gap: 1.5rem;
  padding: 0 var(--gutter);
  text-align: center;
  opacity: var(--reveal-opacity, 0);
  visibility: hidden;
}

.pitstop[data-revealed] .pitstop-reveal {
  visibility: visible;
}

.pitstop-reveal-line {
  margin: 0;
  font: 340 clamp(2.25rem, 5vw, 4.5rem) / 1 var(--font-display);
  letter-spacing: -0.02em;
}

.pitstop--static {
  height: auto;
}

.pitstop--static .pitstop-stage {
  position: relative;
  min-height: max(100svh, 720px);
}

.pitstop--static .pitstop-intro {
  top: calc(var(--header-h) + 8svh);
  opacity: 1;
  transform: none;
}

.pitstop--static .pitstop-reveal {
  opacity: 1;
  visibility: visible;
}

@media (max-width: 767px) {
  .pitstop-intro,
  .pitstop--static .pitstop-intro {
    top: calc(var(--header-h) + 5svh);
    right: var(--gutter);
    max-width: none;
    transform: translateY(calc(-1 * var(--intro-shift, 0px)));
  }

  .pitstop--static .pitstop-intro {
    transform: none;
  }

  .pitstop-art {
    top: auto;
    right: 50%;
    bottom: 20svh;
    width: 72vw;
    transform: translateX(50%);
  }

  .pitstop-reveal {
    bottom: 6svh;
  }
}

/* Statement band */
.statement {
  padding: clamp(5rem, 14vw, 11rem) var(--gutter);
  border-top: 1px solid var(--rule);
  text-align: center;
}

.statement-text {
  margin: 0;
  font: 340 clamp(2.5rem, 7vw, 6rem) / 1 var(--font-display);
  letter-spacing: -0.03em;
}

/* Shared section layout */
.section {
  padding-block: clamp(4rem, 10vw, 8rem);
  border-top: 1px solid var(--rule);
}

.section-head {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.section h2 {
  font-size: clamp(2.25rem, 5vw, 4rem);
}

.section-note {
  margin: 0;
  color: var(--muted);
  font-size: 0.95rem;
}

/* Shop */
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--gutter);
  margin: 0;
  padding: 0;
  list-style: none;
}

@media (max-width: 1023px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 559px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
}

.product {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.plate {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  border-radius: 4px;
  color: var(--paper);
}

.plate--classic {
  background: var(--plate-classic);
}

.plate--sour {
  background: var(--plate-sour);
  color: var(--ink);
}

.plate--choc {
  background: var(--plate-choc);
}

.plate--mixed {
  background: var(--plate-mixed);
  color: var(--ink);
}

.plate-fig {
  position: absolute;
  top: 1rem;
  left: 1rem;
  font: 600 0.7rem/1 var(--font-body);
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.cherry-art {
  width: 72%;
  height: auto;
}

.product-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.5rem;
}

.product-head h3 {
  font-size: 1.6rem;
}

.price {
  font-variant-numeric: tabular-nums;
  font-weight: 500;
}

.product-desc {
  flex: 1;
  margin: 0;
  color: var(--muted);
  font-size: 0.95rem;
}

.product .button {
  align-self: flex-start;
}

/* Orchard */
.steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--gutter);
  margin: 0;
  padding: 0;
  list-style: none;
}

.step {
  padding-top: 1.5rem;
  border-top: 1px solid var(--ink);
}

.step-num {
  display: block;
  margin-bottom: 1rem;
  color: var(--cherry);
  font: 300 clamp(3rem, 6vw, 5rem) / 1 var(--font-display);
}

.step h3 {
  margin-bottom: 0.5rem;
  font: 600 1.05rem/1.3 var(--font-body);
  letter-spacing: 0;
}

.step p {
  margin: 0;
  color: var(--muted);
}

@media (max-width: 767px) {
  .steps {
    grid-template-columns: 1fr;
  }
}

/* FAQ */
.faq-layout {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: clamp(2rem, 6vw, 6rem);
}

.faq-list {
  border-top: 1px solid var(--rule);
}

.faq-list details {
  border-bottom: 1px solid var(--rule);
}

.faq-list summary {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 0;
  font-size: 1.05rem;
  font-weight: 500;
  list-style: none;
  cursor: pointer;
}

.faq-list summary::-webkit-details-marker {
  display: none;
}

.faq-list summary::after {
  content: "+";
  color: var(--cherry);
  font: 300 1.6rem/1 var(--font-display);
}

.faq-list details[open] summary::after {
  content: "−";
}

.faq-list details p {
  max-width: 38rem;
  margin: 0 0 1.25rem;
  color: var(--muted);
}

@media (max-width: 767px) {
  .faq-layout {
    grid-template-columns: 1fr;
  }
}

/* Footer */
.site-footer {
  overflow: hidden;
  padding-top: 2rem;
  background: var(--ink);
  color: var(--paper);
}

.site-footer a {
  color: var(--paper);
}

.site-footer :focus-visible {
  outline-color: var(--paper);
}

.footer-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
  font: 600 0.7rem/1.4 var(--font-body);
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.footer-row p {
  margin: 0;
}

.footer-links {
  display: flex;
  gap: 1.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.footer-wordmark {
  margin: 2rem 0 0;
  font: 340 clamp(6rem, 24vw, 22rem) / 0.78 var(--font-display);
  letter-spacing: -0.05em;
  text-align: center;
  transform: translateY(12%);
}

/* Dialogs */
dialog {
  padding: 0;
  border: 0;
  background: var(--paper);
  color: var(--ink);
}

dialog::backdrop {
  background: rgb(43 13 18 / 0.5);
}

.drawer {
  width: min(440px, 100%);
  max-width: 100%;
  height: 100dvh;
  max-height: none;
  margin: 0 0 0 auto;
  border-left: 1px solid var(--rule);
}

.drawer-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1.5rem;
}

.drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--rule);
}

.drawer-head h2 {
  font-size: 2rem;
}

.lines {
  display: grid;
  flex: 1;
  align-content: start;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
}

.line {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 0.5rem 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--rule);
}

.line-name {
  font: 400 1.2rem/1.2 var(--font-display);
}

.line-total {
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.line .link-button {
  justify-self: end;
}

.stepper {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.stepper button {
  width: 32px;
  height: 32px;
  border: 1px solid var(--ink);
  border-radius: 50%;
  background: transparent;
  color: var(--ink);
  font-size: 1rem;
  cursor: pointer;
}

.stepper button:hover:not(:disabled) {
  background: var(--ink);
  color: var(--paper);
}

.stepper button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.drawer-foot {
  display: grid;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--ink);
}

.subtotal {
  display: flex;
  justify-content: space-between;
  margin: 0;
  font-weight: 600;
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
  width: min(480px, 100% - 2rem);
  border-radius: 4px;
}

.checkout-inner {
  display: grid;
  gap: 1.25rem;
  padding: 2rem;
}

.checkout h2 {
  font-size: 2.25rem;
}

.checkout p {
  margin: 0;
}

.summary {
  display: grid;
  gap: 0.5rem;
  margin: 0;
  padding: 1rem 0;
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
  list-style: none;
}

.summary li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.order-number {
  color: var(--cherry);
  font: 400 2rem/1 var(--font-display);
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

- [ ] **Step 9: Create `Emph`, `SplitCherryArt`, rewrite `CherryArt`**

`src/components/Emph.jsx`:

```jsx
import { Fragment } from "react";

// Renders copy segments from content.js: { text } as plain text, { em } as <em>.
export default function Emph({ parts }) {
  return parts.map((part, i) =>
    part.em ? <em key={i}>{part.em}</em> : <Fragment key={i}>{part.text}</Fragment>,
  );
}
```

`src/components/SplitCherryArt.jsx`:

```jsx
// Static final frame of the Pit Stop: shown before the 3D scene loads, without WebGL,
// if the scene fails, and as the 3D fallback for reduced motion.
export default function SplitCherryArt({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 400"
      role="img"
      aria-label="A cherry split in half with its pit lifted out"
    >
      <g transform="rotate(-14 130 250)">
        <path d="M130 150 A100 100 0 0 0 130 350 Z" fill="#c3142f" />
        <ellipse cx="130" cy="250" rx="34" ry="100" fill="#7a0b1f" />
        <ellipse cx="130" cy="250" rx="16" ry="44" fill="#4a0a14" />
        <path
          d="M70 210 A70 70 0 0 1 100 178"
          stroke="#fff"
          strokeOpacity="0.35"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M120 152 C 124 100, 150 70, 180 52"
          stroke="#6b8f3a"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M180 52 C 200 30, 236 34, 244 50 C 222 64, 198 64, 180 52 Z" fill="#7cb553" />
      </g>
      <g transform="rotate(14 270 250)">
        <path d="M270 150 A100 100 0 0 1 270 350 Z" fill="#c3142f" />
        <ellipse cx="270" cy="250" rx="34" ry="100" fill="#7a0b1f" />
        <ellipse cx="270" cy="250" rx="16" ry="44" fill="#4a0a14" />
      </g>
      <ellipse cx="200" cy="112" rx="24" ry="32" fill="#c9a777" />
      <ellipse cx="192" cy="102" rx="6" ry="9" fill="#fff" opacity="0.3" />
    </svg>
  );
}
```

`src/components/CherryArt.jsx` (replace):

```jsx
const SUGAR = [
  [64, 146],
  [86, 120],
  [92, 152],
  [124, 128],
  [146, 154],
  [140, 122],
  [110, 162],
];

// Product line illustration. Drawn in currentColor so each plate sets its own ink.
export default function CherryArt({ variant, label }) {
  return (
    <svg
      className="cherry-art"
      viewBox="0 0 200 200"
      role="img"
      aria-label={label}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M78 108 C 84 72, 104 48, 124 34 M134 114 C 132 82, 128 58, 124 34" />
      <path d="M124 34 C 140 18, 164 22, 172 34 C 156 46, 136 44, 124 34 Z" />
      <path d="M128 34 C 144 31, 158 31, 168 34" opacity="0.6" />
      {variant === "mixed" && <circle cx="104" cy="156" r="18" />}
      <circle cx="78" cy="136" r="28" />
      <circle cx="134" cy="140" r="26" />
      <path d="M64 128 a 15 15 0 0 1 11 -9" opacity="0.7" />
      <path d="M121 132 a 14 14 0 0 1 10 -8" opacity="0.7" />
      {variant === "choc" && (
        <g fill="currentColor" stroke="none" opacity="0.85">
          <path d="M50 136 a28 28 0 0 0 56 0 Z" />
          <path d="M108 140 a26 26 0 0 0 52 0 Z" />
        </g>
      )}
      {variant === "sour" && (
        <g fill="currentColor" stroke="none">
          {SUGAR.map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="2.2" />
          ))}
        </g>
      )}
    </svg>
  );
}
```

- [ ] **Step 10: Rewrite section components**

`src/components/Header.jsx`:

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
            <a href="#orchard">Orchard</a>
          </li>
          <li>
            <a href="#faq">FAQ</a>
          </li>
        </ul>
      </nav>
      <button type="button" className="bag-button" onClick={onOpenCart}>
        Bag <span className="bag-count">{count}</span>
        <span className="visually-hidden"> {count === 1 ? "item" : "items"}</span>
      </button>
    </header>
  );
}
```

`src/components/Hero.jsx` (Task 3 adds the 3D scene inside `.pitstop-canvas`):

```jsx
import { useRef, useState } from "react";
import { brand } from "../content";
import { useReducedMotion } from "../pitstop/useReducedMotion";
import { useScrollProgress } from "../pitstop/useScrollProgress";
import { hasWebGL } from "../scene/webgl";
import Emph from "./Emph";
import SplitCherryArt from "./SplitCherryArt";

export default function Hero() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [webgl] = useState(hasWebGL);
  const isStatic = reduced || !webgl;
  useScrollProgress(ref, !isStatic);
  const { hero } = brand;

  return (
    <section
      id="top"
      ref={ref}
      className={isStatic ? "pitstop pitstop--static" : "pitstop"}
      aria-labelledby="hero-title"
    >
      <div className="pitstop-stage">
        <div className="pitstop-canvas" aria-hidden="true">
          <SplitCherryArt className="pitstop-art" />
        </div>
        <div className="pitstop-intro">
          <p className="label">{hero.label}</p>
          <h1 id="hero-title">
            <Emph parts={hero.headline} />
          </h1>
          <div className="pitstop-ctas">
            <a className="button" href="#shop">
              {hero.primaryCta} <span aria-hidden="true">→</span>
            </a>
            <a className="button button-outline" href="#orchard">
              {hero.secondaryCta}
            </a>
          </div>
        </div>
        <div className="pitstop-reveal">
          <p className="pitstop-reveal-line">
            <Emph parts={hero.reveal} />
          </p>
          <a className="button" href="#shop">
            {hero.primaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}
```

`src/components/Statement.jsx`:

```jsx
import { brand } from "../content";
import Emph from "./Emph";

export default function Statement() {
  const { label, parts } = brand.statement;
  return (
    <section className="statement" aria-label={label}>
      <p className="label">{label}</p>
      <p className="statement-text">
        <Emph parts={parts} />
      </p>
    </section>
  );
}
```

`src/components/Products.jsx`:

```jsx
import { formatPrice } from "../cart/format";
import { brand, products } from "../content";
import ProductCard from "./ProductCard";

export default function Products() {
  const from = Math.min(...products.map((product) => product.priceCents));

  return (
    <section className="section" id="shop" aria-labelledby="shop-title">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="label">{brand.shop.label}</p>
            <h2 id="shop-title">{brand.shop.title}</h2>
          </div>
          <p className="section-note">
            {products.length} pouches · from {formatPrice(from)}
          </p>
        </div>
        <ul className="product-grid">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </ul>
      </div>
    </section>
  );
}
```

`src/components/ProductCard.jsx`:

```jsx
import { useCart } from "../cart/CartContext";
import { formatPrice } from "../cart/format";
import { useAnnounce } from "./Announcer";
import CherryArt from "./CherryArt";

export default function ProductCard({ product, index }) {
  const { add } = useCart();
  const announce = useAnnounce();

  const handleAdd = () => {
    add(product.id);
    announce(`Added ${product.name} to bag`);
  };

  return (
    <li className="product">
      <div className={`plate plate--${product.art}`}>
        <span className="plate-fig">Fig. {String(index + 1).padStart(2, "0")}</span>
        <CherryArt variant={product.art} label={product.artLabel} />
      </div>
      <div className="product-head">
        <h3>{product.name}</h3>
        <span className="price">{formatPrice(product.priceCents)}</span>
      </div>
      <p className="product-desc">{product.description}</p>
      <button
        type="button"
        className="button button-outline"
        onClick={handleAdd}
        aria-label={`Add to bag: ${product.name}`}
      >
        Add to bag <span aria-hidden="true">+</span>
      </button>
    </li>
  );
}
```

`src/components/Orchard.jsx`:

```jsx
import { brand } from "../content";

export default function Orchard() {
  const { label, title, steps } = brand.orchard;

  return (
    <section className="section" id="orchard" aria-labelledby="orchard-title">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="label">{label}</p>
            <h2 id="orchard-title">{title}</h2>
          </div>
        </div>
        <ol className="steps">
          {steps.map((step, i) => (
            <li className="step" key={step.title}>
              <span className="step-num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
```

`src/components/Faq.jsx`:

```jsx
import { brand } from "../content";
import Emph from "./Emph";

export default function Faq() {
  const { label, heading, items } = brand.faq;

  return (
    <section className="section" id="faq" aria-labelledby="faq-title">
      <div className="container faq-layout">
        <div>
          <p className="label">{label}</p>
          <h2 id="faq-title">
            <Emph parts={heading} />
          </h2>
        </div>
        <div className="faq-list">
          {items.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
```

`src/components/Footer.jsx`:

```jsx
import { brand } from "../content";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-row">
        <ul className="footer-links">
          {brand.social.map((link) => (
            <li key={link.label}>
              <a href={link.href} rel="noopener noreferrer" target="_blank">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <p>This is a demo store: no real orders.</p>
        <p>
          © {new Date().getFullYear()} {brand.name}
        </p>
      </div>
      <p className="footer-wordmark" aria-hidden="true">
        {brand.name}
      </p>
    </footer>
  );
}
```

- [ ] **Step 11: Bag wording in `src/cart/CartDrawer.jsx`**

Change exactly these strings: `Your cart` → `Your bag` (heading), `aria-label="Close cart"` → `aria-label="Close bag"`, `Your cart is empty.` → `Your bag is empty.`. No other changes.

- [ ] **Step 12: Rewrite `src/App.jsx`**

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
import Orchard from "./components/Orchard";
import Products from "./components/Products";
import Statement from "./components/Statement";
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
          <Statement />
          <Products />
          <Orchard />
          <Faq />
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

(`src/scene/Background.jsx` and friends are now unused; Task 3 deletes them. Leave them in place.)

- [ ] **Step 13: Run tests, lint, build and e2e**

Run: `npm test` → all pass.
Run: `npm run format && npm run lint` → clean.
Run: `npm run test:e2e` → 4 pass (names updated in Step 2; the "no unexpected errors" test still allows `cherry.glb` messages, which no longer occur).

- [ ] **Step 14: Visual check**

```bash
S=/tmp/pitstop-redesign && mkdir -p $S
npm run build && (setsid npx vite preview --port 4178 --strictPort >$S/preview.log 2>&1 &) ; sleep 3
for w in 1280x800 375x812; do
  timeout 40 google-chrome --headless=new --no-sandbox --hide-scrollbars --window-size=${w/x/,} \
    --virtual-time-budget=4000 --screenshot=$S/top-$w.png http://localhost:4178/
done
pkill -f "vite preview --port 4178"
```

Read both PNGs. Expected: paper background, Fraunces headline with italic cherry-red "slowly", the static split-cherry SVG (the 3D scene is not wired until Task 3, so the SVG shows even when WebGL works), header on one line, nothing overlapping at 375px. Fix layout problems in `sections.css` before committing.

- [ ] **Step 15: Commit**

```bash
git add -A
git commit -m "feat: editorial redesign of all sections with static Pit Stop hero"
```

---

### Task 3: Pit Stop 3D scene

**Files:**
- Modify: `src/scene/sceneTier.js`, `src/scene/ProceduralCherry.jsx` (comment only), `src/components/Hero.jsx`, `tests/unit/scene.test.js` (rewrite), `tests/unit/HeroMotion.test.jsx`, `package.json`
- Create: `src/scene/heroGeometry.js`, `src/scene/HeroCherry.jsx`, `src/scene/Floaters.jsx`, `src/scene/PitStopScene.jsx`, `tests/unit/HeroSceneFailure.test.jsx`
- Delete: `src/scene/Background.jsx`, `src/scene/Cherry.jsx`, `src/scene/CherryModel.jsx`, `src/scene/modelExists.js`

**Interfaces:**
- Consumes: `pitStopTimeline` (Task 1); `Hero` structure and `SplitCherryArt` (Task 2); `createCherryGeometry` (existing `src/scene/cherryGeometry.js`); `ErrorBoundary` (existing).
- Produces:
  - `pickTier({ width, cores, reducedMotion }) → { floaters: 24 | 12, dpr: [1, 1.75] | [1, 1.5], animate }`
  - `createHeroCherryParts() → { leftSkin, rightSkin, leftFace, rightFace, leftHollow, rightHollow, pit, stem, leaf, skin, flesh, hollow, pitMat, stemMat, leafMat }`
  - `PitStopScene({ progressRef })` default export (lazy chunk)

- [ ] **Step 1: Delete the old scene files and dependencies**

```bash
git rm src/scene/Background.jsx src/scene/Cherry.jsx src/scene/CherryModel.jsx src/scene/modelExists.js
npm uninstall @react-three/postprocessing @react-three/drei
```

- [ ] **Step 2: Write failing tests**

Replace `tests/unit/scene.test.js` with:

```js
import { describe, expect, it } from "vitest";
import { createCherryGeometry } from "../../src/scene/cherryGeometry";
import { createHeroCherryParts } from "../../src/scene/heroGeometry";
import { pickTier } from "../../src/scene/sceneTier";

describe("pickTier", () => {
  it("uses the full scene on capable desktops", () => {
    expect(pickTier({ width: 1440, cores: 8, reducedMotion: false })).toEqual({
      floaters: 24,
      dpr: [1, 1.75],
      animate: true,
    });
  });

  it("uses the light scene on narrow screens or few cores", () => {
    const light = { floaters: 12, dpr: [1, 1.5], animate: true };
    expect(pickTier({ width: 375, cores: 8, reducedMotion: false })).toEqual(light);
    expect(pickTier({ width: 1440, cores: 4, reducedMotion: false })).toEqual(light);
  });

  it("assumes a capable device when core count is unknown", () => {
    expect(pickTier({ width: 1440, cores: undefined, reducedMotion: false }).floaters).toBe(24);
  });

  it("stops animation for reduced motion", () => {
    expect(pickTier({ width: 1440, cores: 8, reducedMotion: true }).animate).toBe(false);
  });
});

describe("createCherryGeometry", () => {
  it("builds one centred geometry with vertex colours", () => {
    const geometry = createCherryGeometry();
    expect(geometry.getAttribute("color").count).toBe(geometry.getAttribute("position").count);
    geometry.computeBoundingBox();
    const center = geometry.boundingBox.getCenter(geometry.boundingBox.min.clone());
    expect(center.length()).toBeLessThan(1e-6);
  });
});

describe("createHeroCherryParts", () => {
  const parts = createHeroCherryParts();

  it("builds every geometry and material", () => {
    for (const key of [
      "leftSkin",
      "rightSkin",
      "leftFace",
      "rightFace",
      "leftHollow",
      "rightHollow",
      "pit",
      "stem",
      "leaf",
    ]) {
      expect(parts[key].getAttribute("position").count, key).toBeGreaterThan(0);
    }
    for (const key of ["skin", "flesh", "hollow", "pitMat", "stemMat", "leafMat"]) {
      expect(parts[key].isMaterial, key).toBe(true);
    }
  });

  it("splits the skin on the vertical plane: left half x ≤ 0, right half x ≥ 0", () => {
    parts.leftSkin.computeBoundingBox();
    parts.rightSkin.computeBoundingBox();
    expect(parts.leftSkin.boundingBox.max.x).toBeLessThan(1e-6);
    expect(parts.rightSkin.boundingBox.min.x).toBeGreaterThan(-1e-6);
  });

  it("faces the cut surfaces outward along x", () => {
    const leftNormal = parts.leftFace.getAttribute("normal");
    const rightNormal = parts.rightFace.getAttribute("normal");
    expect(leftNormal.getX(0)).toBeCloseTo(1);
    expect(rightNormal.getX(0)).toBeCloseTo(-1);
  });
});
```

Create `tests/unit/HeroSceneFailure.test.jsx`:

```jsx
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "../../src/App";

vi.mock("../../src/scene/webgl", () => ({ hasWebGL: () => true }));
vi.mock("../../src/scene/PitStopScene", () => ({
  default: () => {
    throw new Error("WebGL context lost");
  },
}));

describe("Hero when the 3D scene fails", () => {
  it("keeps the static art and the shop", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(<App />);
    await waitFor(() => expect(logged).toHaveBeenCalled());
    expect(container.querySelector(".pitstop-canvas svg.pitstop-art")).not.toBeNull();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add to bag: Classic Dried" })).toBeInTheDocument();
  });
});
```

In `tests/unit/HeroMotion.test.jsx`, add after the existing `vi.mock(...)` line:

```js
vi.mock("../../src/scene/PitStopScene", () => ({ default: () => null }));
```

- [ ] **Step 3: Run to verify failure**

Run: `npx vitest run tests/unit/scene.test.js tests/unit/HeroSceneFailure.test.jsx`
Expected: FAIL — `heroGeometry` / `PitStopScene` not found, tier shape differs.

- [ ] **Step 4: Update `src/scene/sceneTier.js`**

```js
import { useState } from "react";

export function pickTier({ width, cores, reducedMotion }) {
  const light = width < 768 || (cores ?? 8) <= 4;
  return {
    floaters: light ? 12 : 24,
    dpr: light ? [1, 1.5] : [1, 1.75],
    animate: !reducedMotion,
  };
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

In `src/scene/ProceduralCherry.jsx`, change the comment above the component to `// Small floating cherry: one merged geometry and material shared by every instance.`

- [ ] **Step 5: Create `src/scene/heroGeometry.js`**

```js
import * as THREE from "three";

const v = (x, y, z) => new THREE.Vector3(x, y, z);
const SQUASH = 0.92;

// SphereGeometry's phi runs around Y with x = -cos(phi): phi in [-π/2, π/2] is the x ≤ 0 half.
const skinHalf = (phiStart) =>
  new THREE.SphereGeometry(1, 64, 48, phiStart, Math.PI).scale(1, SQUASH, 1);

// A disc in the YZ plane; rotateY(+π/2) faces +x, rotateY(-π/2) faces -x.
const disc = (radius, yScale, angle, offsetX) =>
  new THREE.CircleGeometry(radius, 64).scale(1, yScale, 1).rotateY(angle).translate(offsetX, 0, 0);

// Geometries and materials for the splitting hero cherry. Built once per scene.
export function createHeroCherryParts() {
  return {
    leftSkin: skinHalf(-Math.PI / 2),
    rightSkin: skinHalf(Math.PI / 2),
    leftFace: disc(1, SQUASH, Math.PI / 2, 0),
    rightFace: disc(1, SQUASH, -Math.PI / 2, 0),
    leftHollow: disc(0.42, 1.3, Math.PI / 2, 0.004),
    rightHollow: disc(0.42, 1.3, -Math.PI / 2, -0.004),
    pit: new THREE.SphereGeometry(1, 32, 24).scale(0.42, 0.55, 0.42),
    stem: new THREE.TubeGeometry(
      new THREE.QuadraticBezierCurve3(v(0, 0.8, 0), v(0.05, 1.5, 0), v(0.3, 2.05, 0)),
      24,
      0.04,
      8,
    ),
    leaf: new THREE.SphereGeometry(0.32, 16, 12)
      .scale(1, 0.14, 0.5)
      .rotateZ(-0.5)
      .translate(0.62, 2.05, 0),
    skin: new THREE.MeshPhysicalMaterial({
      color: "#c3142f",
      roughness: 0.28,
      clearcoat: 1,
      clearcoatRoughness: 0.15,
    }),
    flesh: new THREE.MeshStandardMaterial({
      color: "#7a0b1f",
      roughness: 0.7,
      side: THREE.DoubleSide,
    }),
    hollow: new THREE.MeshStandardMaterial({
      color: "#4a0a14",
      roughness: 0.9,
      side: THREE.DoubleSide,
    }),
    pitMat: new THREE.MeshStandardMaterial({ color: "#c9a777", roughness: 0.6 }),
    stemMat: new THREE.MeshStandardMaterial({ color: "#6b8f3a", roughness: 0.7 }),
    leafMat: new THREE.MeshStandardMaterial({
      color: "#7cb553",
      roughness: 0.6,
      side: THREE.DoubleSide,
    }),
  };
}
```

- [ ] **Step 6: Run the scene test**

Run: `npx vitest run tests/unit/scene.test.js`
Expected: PASS (8 tests). If the normal assertion for the faces fails, the disc rotation signs are swapped: fix `disc` angles (not the test) so the left face points +x.

- [ ] **Step 7: Create `src/scene/HeroCherry.jsx`**

```jsx
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { pitStopTimeline } from "../pitstop/timeline";
import { createHeroCherryParts } from "./heroGeometry";

const { lerp } = THREE.MathUtils;
// Halves open toward the camera by this much at full split so the cut faces are visible.
const OPEN = 0.7;

export default function HeroCherry({ progressRef, animate }) {
  const root = useRef();
  const left = useRef();
  const right = useRef();
  const pit = useRef();
  const parts = useMemo(createHeroCherryParts, []);
  const wide = useThree((state) => state.size.width >= 768);

  useFrame(({ clock }) => {
    const t = pitStopTimeline(progressRef.current);
    const sway = animate ? Math.sin(clock.elapsedTime * 0.6) * 0.08 : 0;

    root.current.position.set(
      wide ? lerp(2.4, 0, t.travel) : 0,
      wide ? 0 : lerp(-1.3, -0.5, t.travel),
      0,
    );
    root.current.rotation.y = t.turn + sway;
    root.current.scale.setScalar(t.scale * (wide ? 1 : 0.8));

    left.current.position.x = -1.1 * t.split;
    left.current.rotation.set(0, -OPEN * t.split, 0.45 * t.split);
    right.current.position.x = 1.1 * t.split;
    right.current.rotation.set(0, OPEN * t.split, -0.45 * t.split);

    pit.current.position.y = 1.5 * t.pitLift;
    pit.current.rotation.y = Math.PI * t.pitLift;
  });

  return (
    <group ref={root}>
      <group ref={left}>
        <mesh geometry={parts.leftSkin} material={parts.skin} />
        <mesh geometry={parts.leftFace} material={parts.flesh} />
        <mesh geometry={parts.leftHollow} material={parts.hollow} />
        <mesh geometry={parts.stem} material={parts.stemMat} />
        <mesh geometry={parts.leaf} material={parts.leafMat} />
      </group>
      <group ref={right}>
        <mesh geometry={parts.rightSkin} material={parts.skin} />
        <mesh geometry={parts.rightFace} material={parts.flesh} />
        <mesh geometry={parts.rightHollow} material={parts.hollow} />
      </group>
      <mesh ref={pit} geometry={parts.pit} material={parts.pitMat} />
    </group>
  );
}
```

- [ ] **Step 8: Create `src/scene/Floaters.jsx`**

```jsx
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import ProceduralCherry from "./ProceduralCherry";

const rand = (min, max) => min + Math.random() * (max - min);

// Small cherries drifting upward behind the hero cherry; fog fades the distant ones.
export default function Floaters({ count, animate }) {
  const refs = useRef([]);
  const items = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: rand(-7, 7),
        y: rand(-4.5, 4.5),
        z: rand(-14, -2),
        scale: rand(0.22, 0.42),
        rotation: [rand(0, Math.PI * 2), rand(0, Math.PI * 2), rand(0, Math.PI * 2)],
        spin: [rand(-0.3, 0.3), rand(-0.3, 0.3), rand(-0.3, 0.3)],
        drift: rand(0.08, 0.2),
      })),
    [count],
  );

  useFrame(({ clock }, delta) => {
    if (!animate) return;
    items.forEach((item, i) => {
      const group = refs.current[i];
      if (!group) return;
      group.position.y =
        THREE.MathUtils.euclideanModulo(item.y + clock.elapsedTime * item.drift + 5, 10) - 5;
      group.rotation.x += item.spin[0] * delta;
      group.rotation.y += item.spin[1] * delta;
      group.rotation.z += item.spin[2] * delta;
    });
  });

  return items.map((item, i) => (
    <group
      key={i}
      ref={(el) => (refs.current[i] = el)}
      position={[item.x, item.y, item.z]}
      rotation={item.rotation}
      scale={item.scale}
    >
      <ProceduralCherry />
    </group>
  ));
}
```

- [ ] **Step 9: Create `src/scene/PitStopScene.jsx`**

```jsx
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import Floaters from "./Floaters";
import HeroCherry from "./HeroCherry";
import { useSceneTier } from "./sceneTier";

const PAPER = "#f4ede3";

// Soft studio reflections for the glossy skin, without loading an HDR file.
function StudioEnvironment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = texture;
    return () => {
      scene.environment = null;
      texture.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

// True while the tab is visible and the hero is on screen.
function useStageVisible() {
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

export default function PitStopScene({ progressRef }) {
  const tier = useSceneTier();
  const visible = useStageVisible();
  const frameloop = !tier.animate ? "demand" : visible ? "always" : "never";

  return (
    <Canvas
      flat
      frameloop={frameloop}
      dpr={tier.dpr}
      camera={{ position: [0, 0, 12], fov: 30, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={[PAPER]} />
      <fog attach="fog" args={[PAPER, 10, 30]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[-4, 6, 6]} intensity={2.2} color="#fff1e0" />
      <directionalLight position={[5, -2, -6]} intensity={1.2} color="#ffd6e0" />
      <StudioEnvironment />
      <HeroCherry progressRef={progressRef} animate={tier.animate} />
      <Floaters count={tier.floaters} animate={tier.animate} />
    </Canvas>
  );
}
```

- [ ] **Step 10: Wire the scene into `src/components/Hero.jsx`**

Replace the import block and the `.pitstop-canvas` contents. Final file:

```jsx
import { Suspense, lazy, useRef, useState } from "react";
import { brand } from "../content";
import { useReducedMotion } from "../pitstop/useReducedMotion";
import { useScrollProgress } from "../pitstop/useScrollProgress";
import { hasWebGL } from "../scene/webgl";
import Emph from "./Emph";
import ErrorBoundary from "./ErrorBoundary";
import SplitCherryArt from "./SplitCherryArt";

// three.js loads after the page renders; the static art covers loading and failures.
const PitStopScene = lazy(() => import("../scene/PitStopScene"));

export default function Hero() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [webgl] = useState(hasWebGL);
  const isStatic = reduced || !webgl;
  const progressRef = useScrollProgress(ref, !isStatic);
  const { hero } = brand;
  const art = <SplitCherryArt className="pitstop-art" />;

  return (
    <section
      id="top"
      ref={ref}
      className={isStatic ? "pitstop pitstop--static" : "pitstop"}
      aria-labelledby="hero-title"
    >
      <div className="pitstop-stage">
        <div className="pitstop-canvas" aria-hidden="true">
          {webgl ? (
            <ErrorBoundary fallback={art}>
              <Suspense fallback={art}>
                <PitStopScene progressRef={progressRef} />
              </Suspense>
            </ErrorBoundary>
          ) : (
            art
          )}
        </div>
        <div className="pitstop-intro">
          <p className="label">{hero.label}</p>
          <h1 id="hero-title">
            <Emph parts={hero.headline} />
          </h1>
          <div className="pitstop-ctas">
            <a className="button" href="#shop">
              {hero.primaryCta} <span aria-hidden="true">→</span>
            </a>
            <a className="button button-outline" href="#orchard">
              {hero.secondaryCta}
            </a>
          </div>
        </div>
        <div className="pitstop-reveal">
          <p className="pitstop-reveal-line">
            <Emph parts={hero.reveal} />
          </p>
          <a className="button" href="#shop">
            {hero.primaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 11: Run tests, lint, build**

Run: `npm test` → all pass (output pristine).
Run: `npm run format && npm run lint` → clean.
Run: `npm run build` → the entry chunk must not contain three.js (expect entry < 200 kB, a separate `PitStopScene-*.js` chunk with three). `grep -c postprocessing dist/assets/*.js` → 0.

- [ ] **Step 12: Visual check at three scroll positions**

Write `/tmp/pitstop-redesign/shots.mjs` (not committed):

```js
import { chromium } from "@playwright/test";

const out = process.argv[2];
const browser = await chromium.launch({
  channel: "chrome",
  args: ["--no-sandbox", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
for (const [w, h] of [
  [1280, 800],
  [375, 812],
]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto("http://localhost:4178/");
  await page.waitForTimeout(2500);
  const range = await page.evaluate(() => {
    const el = document.getElementById("top");
    return el.offsetHeight - window.innerHeight;
  });
  for (const p of [0, 0.5, 1]) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(range * p));
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${out}/hero-${w}-p${p}.png` });
  }
  await page.close();
}
await browser.close();
```

Run:

```bash
S=/tmp/pitstop-redesign && mkdir -p $S
npm run build && (setsid npx vite preview --port 4178 --strictPort >$S/preview.log 2>&1 &) ; sleep 3
node $S/shots.mjs $S
pkill -f "vite preview --port 4178"
```

(Run `node` from the project root so `@playwright/test` resolves.) Read all six PNGs. Expected: p0 — whole glossy cherry right of the headline (centred low on mobile), floaters faint behind; p0.5 — headline gone, cherry centred and half split, cut faces visible; p1 — halves apart showing deep red faces, tan pit above, "We took the pit out." and the button visible at the bottom. No halo rings. If faces are invisible or the pit is hidden, adjust `OPEN`, light positions or the pit lift in `HeroCherry.jsx` / `PitStopScene.jsx` and re-shoot.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "feat(scene): pinned Pit Stop hero scene; remove full-page background and DoF"
```

---

### Task 4: End-to-end coverage, docs and final verification

**Files:**
- Create: `tests/e2e/pitstop.spec.js`
- Modify: `tests/e2e/checkout.spec.js` (error test), `README.md`

**Interfaces:**
- Consumes: hero DOM from Tasks 2–3 (`#top`, `.pitstop-reveal`, `data-revealed`), "Bag"/"Add to bag" names.

- [ ] **Step 1: Write `tests/e2e/pitstop.spec.js`**

```js
import { expect, test } from "@playwright/test";

const revealLine = (page) => page.getByText("We took the pit out.");

test("scrolling through the hero reveals the Pit Stop line", async ({ page }) => {
  await page.goto("/");
  await expect(revealLine(page)).toBeHidden();
  await page.evaluate(() => {
    const hero = document.getElementById("top");
    window.scrollTo(0, hero.offsetHeight - window.innerHeight);
  });
  await expect(revealLine(page)).toBeVisible();
  await expect(page.locator("#top")).toHaveAttribute("data-revealed", "");
});

test("scrolling back up hides it again", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const hero = document.getElementById("top");
    window.scrollTo(0, hero.offsetHeight - window.innerHeight);
  });
  await expect(revealLine(page)).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(revealLine(page)).toBeHidden();
});

test("reduced motion shows the final frame without scrolling", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  await expect(revealLine(page)).toBeVisible();
  await expect(page.locator("#top")).toHaveClass(/pitstop--static/);
  await context.close();
});

test("hidden reveal button is not tabbable", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Our orchard" }).focus();
  await page.keyboard.press("Tab");
  // Next stop after the hero CTAs is the first product button, not the hidden reveal link.
  await expect(page.getByRole("button", { name: "Add to bag: Classic Dried" })).toBeFocused();
});
```

- [ ] **Step 2: Tighten the error test in `tests/e2e/checkout.spec.js`**

Replace the last test with:

```js
test("page logs no console errors", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 4));
  await page.waitForTimeout(1500);
  expect(errors).toEqual([]);
});
```

- [ ] **Step 3: Run e2e**

Run: `npm run test:e2e`
Expected: 8 passed. If "hidden reveal button is not tabbable" fails because the statement section has no focusable elements and focus goes elsewhere, check where focus landed (`page.evaluate(() => document.activeElement.outerHTML)`): the requirement is only that it is not the reveal link — adjust the assertion to `expect(page.locator(".pitstop-reveal a")).not.toBeFocused()` plus the first product button check if focus is genuinely there.

- [ ] **Step 4: Update `README.md`**

Replace the "## 3D model" section with:

```markdown
## The Pit Stop hero

The hero is pinned for three screens of scrolling while a 3D cherry splits and its pit
lifts out. Everything is built in code (no model files):

- `src/pitstop/timeline.js` — one function maps scroll progress (0–1) to every animated
  value; change timings there.
- `src/scene/heroGeometry.js` / `HeroCherry.jsx` — the cherry's shape, colours and motion.
- `src/scene/Floaters.jsx` — the small background cherries; `sceneTier.js` sets how many.
- `src/components/SplitCherryArt.jsx` — static image used for reduced motion, browsers
  without WebGL, and while the 3D code loads.
```

and in "## Editing the site" change the colours line to `- **Colours and fonts:** tokens at the top of `src/styles/global.css` (Fraunces + Inter, self-hosted).`

- [ ] **Step 5: Lighthouse**

```bash
mkdir -p .lighthouse
npm run build && (setsid npx vite preview --port 4179 --strictPort >.lighthouse/preview.log 2>&1 &) ; sleep 3
npx -y lighthouse@12 http://localhost:4179/ --quiet --chrome-flags="--headless=new --no-sandbox" \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=json --output-path=.lighthouse/report.json
pkill -f "vite preview --port 4179"
node -e 'const r=require("./.lighthouse/report.json");for(const[k,c]of Object.entries(r.categories))console.log(k,Math.round(c.score*100));for(const a of Object.values(r.audits))if(a.score!==null&&a.score<0.9&&a.scoreDisplayMode==="binary")console.log("FAIL",a.id)'
```

Expected: accessibility, best-practices, seo ≥ 90 with no failing binary audits; performance reported (target ≥ 80). Fix failing binary audits in the files that cause them, rebuild, re-run.

- [ ] **Step 6: Full checks and commit**

Run: `npm run format && npm run lint && npm test && npm run test:e2e` → all pass.

```bash
git add -A
git commit -m "test: e2e coverage for the Pit Stop hero; docs: README for the redesign"
```
