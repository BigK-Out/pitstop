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
- **Colours and fonts:** tokens at the top of `src/styles/global.css` (Fraunces + Inter, self-hosted).
- **Site URL** (used for search and share previews): `brand.siteUrl` in `src/content.js`.

## The Pit Stop hero

The hero is pinned for three screens of scrolling while a 3D cherry splits and its pit
lifts out. Everything is built in code (no model files):

- `src/pitstop/timeline.js` — one function maps scroll progress (0–1) to every animated
  value; change timings there.
- `src/scene/heroGeometry.js` / `HeroCherry.jsx` — the cherry's shape, colours and motion.
- `src/scene/Floaters.jsx` — the small background cherries; `sceneTier.js` sets how many.
- `src/components/SplitCherryArt.jsx` — static image used for reduced motion, browsers
  without WebGL, and while the 3D code loads.

The 3D scene mounts once the browser is idle, so static art shows first and first paint is
never blocked. Software WebGL renderers (detected in `webgl.js`) get a lighter tier from
`sceneTier.js` that renders on scroll instead of continuously.

## Deploying

See `SETUP_GUIDE.md`.
