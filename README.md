# BSides Phoenix website

Single-page site for BSides Phoenix 2027 (Saturday, October 16, 2027 · Mesa, Arizona).

## Files

- `index.html`: the public landing page (email signup only) while the full site is in preview
- `preview/index.html`: the full site, marked `noindex` so search engines don't list it yet
- `code-of-conduct/index.html`: the Code of Conduct (public); every Code of Conduct link on the site points here
- `cfp/`, `communities/`, `about/`, `events/`, `sponsor/`, `volunteer/`: pages of the full site, marked `noindex` like `preview/`
- `sponsors/`, `partners/`, `supporters/`: full lists of sponsors, community partners and Supporters (also `noindex`)

**Keep these in sync:** the home page's Sponsors, Community partners and Supporters sections are shortened versions of `sponsors/`, `partners/` and `supporters/`. When you add a sponsor, partner or Supporter, update the home page section and the full page together (each spot has a KEEP IN SYNC comment).
- `404.html`: the "page not found" page GitHub Pages shows for any missing address (marked `noindex`)
- `assets/bsides-phoenix-2027.ics`: the "Add to calendar" file on the preview page's Key dates
- `assets/js/nav.js`: the phone Menu button and the About / Events dropdowns (the menu still works without it)

The site menu and footer links are copied into `preview/`, `cfp/`, `communities/`, `about/`, `events/`, `sponsor/`, `volunteer/`, `sponsors/`, `partners/` and `supporters/`. When you change them, change them in all ten.
- `assets/css/site.css`: all page styles (colors, spacing, buttons, sections)
- `assets/logo/`: logos used on the site; `assets/logo/source/` holds the original exports
- `assets/og-image.png`: 1200×630 link-preview image for social sites
- `favicon-32.png`, `apple-touch-icon.png`: icon fallbacks (the SVG icon is `assets/logo/bsides-phoenix-icon.svg`)
- `.github/workflows/pages.yml`: publishes the site (see Hosting)

## Hosting (GitHub Pages)

Every push to `main` runs `.github/workflows/pages.yml`, which copies only the site files
(`index.html`, `404.html`, `preview/`, `code-of-conduct/`, `cfp/`, `communities/`, `about/`, `events/`, `sponsor/`, `volunteer/`, `sponsors/`, `partners/`, `supporters/`, the two icon PNGs and `assets/`, minus `assets/logo/source/`) and publishes them.
This README is not published.

Repo **Settings → Pages → Source** must be set to **GitHub Actions**.

The site is at `https://winnifred-honey.github.io/bsides-phoenix/`.
If you add a new top-level file the site needs, add it to the "Collect site files" step.

### Going official (swap the landing page for the full site)

Right now the main address shows a signup-only landing page, and the full site lives at
`/preview/` with `<meta name="robots" content="noindex, nofollow">` so search engines skip it.
The preview link isn't private: anyone you send it to can open it.

To make the full site the main page:

1. Replace `index.html` with `preview/index.html`
2. In it, change the `<title>` from "Full site preview · BSides Phoenix 2027" to the event title, remove the `noindex` meta tag and change every `../` path back to plain paths (`../assets/` → `assets/`, `../favicon-32.png` → `favicon-32.png`, `../apple-touch-icon.png` → `apple-touch-icon.png`)
3. Delete `preview/` (and its line in the workflow), plus the `.landing` styles at the end of `assets/css/site.css`
4. In `cfp/`, `communities/`, `about/`, `events/`, `sponsor/`, `volunteer/`, `sponsors/`, `partners/` and `supporters/`: remove the `noindex` meta tag and change `../preview/` to `../` in their links
5. On the new main page, change the menu's `../cfp/`-style links to `cfp/` (they no longer need `../`)

### Custom domain (bsidesphoenix.org)

Only do this when you are ready to move the domain off its current host.

1. **Settings → Pages → Custom domain:** `bsidesphoenix.org`, then Save (with Actions deploys GitHub stores this setting; no `CNAME` file is needed)
2. At the DNS provider, point the apex `bsidesphoenix.org` at GitHub Pages with `A` records
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   (and `AAAA` `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`),
   and add a `CNAME` record for `www` pointing to `winnifred-honey.github.io`
3. Leave `MX` and `TXT` records alone so email keeps working
4. Once the certificate is issued, tick **Enforce HTTPS**

`404.html` uses absolute `/bsides-phoenix/` paths because GitHub Pages serves it at any missing address. Once the domain points here, change `/bsides-phoenix/` to `/` throughout it.

The link-preview tags in `index.html` use `https://bsidesphoenix.org/...`, so social previews only work once the domain points here.
