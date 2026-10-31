# BSides Phoenix website

Single-page site for BSides Phoenix 2027 (Saturday, October 16, 2027 · Mesa, Arizona).

## Files

- `index.html`: the whole page (styles are inline)
- `assets/logo/`: logos used on the site; `assets/logo/source/` holds the original exports
- `assets/og-image.png`: 1200×630 link-preview image for social sites
- `favicon-32.png`, `apple-touch-icon.png`: icon fallbacks (the SVG icon is `assets/logo/bsides-phoenix-icon.svg`)
- `.nojekyll`: tells GitHub Pages to serve files as-is, without Jekyll

## Hosting (GitHub Pages)

The site is served straight from the `main` branch; there is no build step.

1. Repo **Settings → Pages**
2. **Source:** Deploy from a branch
3. **Branch:** `main`, folder `/ (root)`, then **Save**

The site appears at `https://winnifred-honey.github.io/bsides-phoenix/` a minute or two later,
and every push to `main` republishes it.

### Custom domain (bsidesphoenix.org)

Only do this when you are ready to move the domain off its current host.

1. **Settings → Pages → Custom domain:** `bsidesphoenix.org`, then Save (GitHub adds a `CNAME` file to `main`)
2. At the DNS provider, point the apex `bsidesphoenix.org` at GitHub Pages with `A` records
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   (and `AAAA` `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`),
   and add a `CNAME` record for `www` pointing to `winnifred-honey.github.io`
3. Leave `MX` and `TXT` records alone so email keeps working
4. Once the certificate is issued, tick **Enforce HTTPS**

The link-preview tags in `index.html` use `https://bsidesphoenix.org/...`, so social previews only work once the domain points here.
