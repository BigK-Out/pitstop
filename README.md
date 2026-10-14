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
