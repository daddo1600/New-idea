# MileMint website (`site/`)

The marketing site for https://milemint.app: plain static HTML, CSS and a little JavaScript. No build step, no server code, no cookies, no analytics, no third-party scripts or fonts (Inter is self-hosted in `assets/fonts`). Styling follows `BRAND.md` at the repo root.

| Page | What it is |
|---|---|
| `index.html` | Landing page with the waitlist form, screenshots, "Built for", FAQ |
| `join.html` | Founding 1,000 waitlist with the places-taken counter |
| `calculator.html` | "How much could you claim?" (HMRC, IRS, CRA, ATO) |
| `privacy.html` | App + website/email-list privacy policy |
| `support.html` | Support FAQ and contact |
| `404.html` | Not-found page |

Files you'll edit by hand: `assets/config.js` (form endpoint, App Store switch), `data/founders.json` (counter), and the HTML for wording. All links are root-relative (`/assets/...`), so the site must be served from the domain root. Opening the files straight from disk won't load styles; to preview, run `python3 -m http.server 8087 -d site` and open http://localhost:8087.

## Deploy

### Cloudflare Pages (recommended)
1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**, pick this repository and branch.
2. Framework preset **None**. Build command: *(leave empty)*. Build output directory: **`site`**.
3. Deploy, then **Custom domains → Set up a domain → `milemint.app`** (and `www.milemint.app`, redirecting to the apex).
4. `_headers` sets a strict Content-Security-Policy and caching on Cloudflare. Leave Cloudflare Web Analytics **off** so the "no trackers" promise stays true.

### GitHub Pages
1. Repo **Settings → Pages → Build and deployment → GitHub Actions**, and use the "Static HTML" workflow with `path: site` (Pages' branch mode can only publish the repo root or `/docs`).
2. Custom domain `milemint.app`; add the DNS records GitHub shows; tick **Enforce HTTPS**.
3. `CNAME` (containing `milemint.app`) is **only used by GitHub Pages**. Cloudflare ignores it, and `_headers` is ignored by GitHub.

## Set up the waitlist form
Until an endpoint is set, both forms say "Sign-ups open soon" and send nothing.

1. Create the list. MailerLite's free plan (up to 1,000 subscribers) is enough: add text fields `country` and `work`, create an **embedded form** with Email, country and work, and turn on **double opt-in**.
2. Copy the form's `action` URL (like `https://assets.mailerlite.com/jsonp/1234567/forms/9876.../subscribe`).
3. In `assets/config.js` set `FORM_ENDPOINT` to that URL and `FORM_PROVIDER = 'mailerlite'`.
4. For visitors with JavaScript off, also add `action="that URL"` to the `<form data-waitlist ...>` tag in `index.html` and `join.html` (there's a comment above each form).
5. Fields sent: `email`, `fields[country]`, `fields[work]`, `consent=yes`. Kit and Buttondown are covered in the comments in `config.js` (use `FORM_PROVIDER = 'generic'` and rename fields in `FIELD_NAMES`).
6. Fill in the placeholders in `privacy.html`: `[Your name or company]`, `[Postal address]`, the host, and the email provider. Make sure `hello@milemint.app` receives mail.
7. Test: sign up with your own address, confirm, and check it appears in MailerLite with country and work.

## Update the Founding 1,000 counter
Edit `data/founders.json` and commit:
```json
{ "taken": 312 }
```
The page reads it on load (the bar and "312 of 1,000 founding places taken"). The total (1,000) is `FOUNDING_TOTAL` in `config.js`.

## Switch the App Store button live
In `assets/config.js`:
```js
const APP_STORE_LIVE = true;
const APP_STORE_URL = 'https://apps.apple.com/app/id6817748981';
```
Every App Store button then links to the store and reads "Download on the App Store". The button is our own design, not Apple's badge; if you switch to Apple's official badge artwork after launch, follow Apple's marketing guidelines.

## Keep the facts current
- Rates live in the page copy and in `assets/calc.js` (UK 55p/25p from 6 Apr 2026; US 72.5¢ Jan–Jun 2026, 76¢ from Jul; CRA 73¢/67¢ 2026; ATO 91c/km 2026–27, 5,000 km cap). Check each new tax year.
- Prices are deliberately not on the site ("Free to track. Pro for reports.").
- Update `sitemap.xml` `lastmod` dates when pages change.

## Images
- `assets/img/shot-*.webp`: App Store screenshots resized to 540×1170 (35–48 KB each), lazy-loaded.
- `assets/img/og.png`: 1200×630 share image. `favicon.ico`, `favicon-32.png`, `apple-touch-icon.png` from `milemint/assets/images/icon.png`; `assets/img/leaf.png` from `splash-icon.png`.
