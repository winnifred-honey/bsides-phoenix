# BSides Phoenix website

Single-page site for BSides Phoenix 2027 (Saturday, October 16, 2027 · Mesa, Arizona).

## Files

- `index.html`: the whole page
- `assets/css/site.css`: all page styles (colors, spacing, buttons, sections)
- `assets/logo/`: logos used on the site; `assets/logo/source/` holds the original exports
- `assets/og-image.png`: 1200×630 link-preview image for social sites
- `favicon-32.png`, `apple-touch-icon.png`: icon fallbacks (the SVG icon is `assets/logo/bsides-phoenix-icon.svg`)
- `.github/workflows/pages.yml`: publishes the site (see Hosting)

## Hosting (GitHub Pages)

Every push to `main` runs `.github/workflows/pages.yml`, which copies only the site files
(`index.html`, the two icon PNGs and `assets/`, minus `assets/logo/source/`) and publishes them.
This README is not published.

Repo **Settings → Pages → Source** must be set to **GitHub Actions**.

The site is at `https://winnifred-honey.github.io/bsides-phoenix/`.
If you add a new top-level file the site needs, add it to the "Collect site files" step.

### Custom domain (bsidesphoenix.org)

Only do this when you are ready to move the domain off its current host.

1. **Settings → Pages → Custom domain:** `bsidesphoenix.org`, then Save (with Actions deploys GitHub stores this setting; no `CNAME` file is needed)
2. At the DNS provider, point the apex `bsidesphoenix.org` at GitHub Pages with `A` records
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   (and `AAAA` `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`),
   and add a `CNAME` record for `www` pointing to `winnifred-honey.github.io`
3. Leave `MX` and `TXT` records alone so email keeps working
4. Once the certificate is issued, tick **Enforce HTTPS**

The link-preview tags in `index.html` use `https://bsidesphoenix.org/...`, so social previews only work once the domain points here.
