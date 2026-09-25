# Deployment checklist

Everything is pre-wired; each step is one command or one click.

## GitHub Pages (recommended — zero cost, zero accounts)

1. Push this repo to `github.com/sharonbasovich/preflight` (public).
2. **One manual step:** repo Settings → Pages → *Build and deployment → Source*
   → select **GitHub Actions**. (`actions/deploy-pages` cannot flip this itself
   on a repo where Pages was never configured.)
3. `.github/workflows/pages.yml` builds `dist/` and publishes on every push to
   `main`. Live URL will be
   `https://sharonbasovich.github.io/preflight/`.

Alternative without Actions: Settings → Pages → Source: *Deploy from a branch*
→ branch `main`, folder `/docs`, then move `dist/` output — not recommended;
the Actions path is already configured.

## Vercel / Netlify / Render (if Pages is undesirable)

- `npm run build` → static `dist/`. Framework preset: **Vite**; build command
  `npm run build`; output `dist`. No env vars needed.
- Vercel CLI one-shot: `npx vercel deploy --prod dist` (needs Sharon's login).

## After deploy

- Update the "Live demo" line in `README.md` and the Application URL field on
  the lablab submission form.
- Sanity check: load the URL → click **Risky sample** → expect grade F.
