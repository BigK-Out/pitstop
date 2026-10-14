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
