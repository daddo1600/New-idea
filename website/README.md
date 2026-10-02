# milesprout.app website (`website/`)

The public website for MileSprout: plain static HTML and one CSS file. No build step, no JavaScript, no cookies, no analytics, no external fonts or scripts. Everything is served from this folder.

| Path | What it is |
|---|---|
| `index.html` | Landing page: hero, features (from the App Store screenshots), Free vs Pro, regions |
| `privacy.html` | Privacy policy for the app and the site (effective 2 Oct 2026) |
| `support.html` | Support FAQ |
| `partners.html` | MileSprout Perks pitch for partners |
| `r/index.html` | Perks code-check placeholder. `_redirects` serves it for every `/r/<code>` (the QR codes in the app point there) |
| `404.html` | Not-found page (Cloudflare Pages uses it automatically) |
| `_headers` | Security headers (CSP, HSTS, Referrer-Policy, Permissions-Policy) and caching |
| `_redirects` | The `/r/*` rewrite |
| `robots.txt`, `sitemap.xml` | For search engines |
| `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` | Icons (the PNGs are made from `milemint/assets/images/icon.png`) |
| `assets/site.css` | All styles, light and dark mode |
| `assets/img/` | Store screenshots resized to WebP (400 and 800 px wide), `og.jpg` for link previews |
| `docs/` | Preview screenshots of the home page (not linked from the site) |

Links between pages are extensionless (`/privacy`), which is how Cloudflare Pages serves `privacy.html`. To preview locally with working links, use `npx wrangler pages dev website`. A quick look also works with `python3 -m http.server 8080 -d website` and opening `/index.html`, `/privacy.html` and so on.

## Before launch

- `index.html`: the App Store button is a placeholder (`href="#"`, "Coming to the App Store"). When the app is live, put in `https://apps.apple.com/app/id<APP_ID>` and use Apple's official "Download on the App Store" badge (saved locally, not hot-linked). There's a `TODO` comment next to it.
- `privacy.html`: replace `[address]` with the postal address.
- The app's `PRIVACY_URL` in `milemint/src/app/pro.tsx` still points at a GitHub file, and `SUPPORT_EMAIL` in `milemint/src/app/(tabs)/settings.tsx` is the old Gmail address. Point them at `https://milesprout.app/privacy` and `hello@milesprout.app`. Use the same privacy URL in App Store Connect.

## Deploy on Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**. Pick this GitHub repository and the production branch (e.g. `main`).
2. Build settings: Framework preset **None**, Build command **empty**, Build output directory **`website`**. (Leave Root directory empty, or set it to `website` and the output directory to `/`. Either works.)
3. **Save and Deploy**. Every push to the branch redeploys; other branches get preview URLs.
4. Leave Cloudflare **Web Analytics off** for this project, so the "no trackers" promise stays true.

### Custom domain

1. Add `milesprout.app` to Cloudflare as a zone (if it isn't already) and switch the registrar's nameservers to Cloudflare's.
2. In the Pages project: **Custom domains → Set up a custom domain → `milesprout.app`**. Cloudflare adds the DNS record and the certificate.
3. Also add `www.milesprout.app`, then make it redirect to the apex: **Rules → Redirect Rules** on the `milesprout.app` zone, "Redirect from WWW to root" template (301, preserve path and query).
4. `.app` domains are on the HSTS preload list, so HTTPS is required anyway. `_headers` sends HSTS for a year with subdomains (no `preload` flag, add it only if you want to submit the domain).

## Redirect getmilesprout.com and milesprout.co.uk

Those domains only redirect; they don't serve this folder.

1. Add each domain to Cloudflare as its own zone and point its nameservers at Cloudflare.
2. In each zone, add proxied DNS records so Cloudflare receives the traffic: `A @ 192.0.2.1` and `A www 192.0.2.1` (a placeholder address, orange cloud on; the redirect fires before anything is contacted).
3. Then either:
   - **Bulk Redirects** (account level, good for several domains): **Bulk Redirects → Create list** with entries
     - `getmilesprout.com` → `https://milesprout.app`
     - `milesprout.co.uk` → `https://milesprout.app`

     For each: status **301**, tick **Include subdomains**, **Subpath matching**, **Preserve path suffix** and **Preserve query string**. Then **Create Bulk Redirect Rule** using the list.
   - or a **Redirect Rule** in each zone: "All incoming requests" → Dynamic, expression `concat("https://milesprout.app", http.request.uri.path)`, status 301, **Preserve query string** on.
4. Check: `curl -sI https://getmilesprout.com/privacy` should show `301` and `location: https://milesprout.app/privacy`.

## Email: hello@, partners@, privacy@

Use **Cloudflare Email Routing** on the `milesprout.app` zone (free, forward-only):

1. Zone → **Email → Email Routing → Get started**. Let it add the MX and SPF (TXT) records.
2. **Destination addresses**: add the inbox the mail should go to and click the verification link Cloudflare emails.
3. **Routing rules → Create address**: `hello@milesprout.app`, `partners@milesprout.app` and `privacy@milesprout.app`, each forwarding to that inbox (or different ones).
4. Send a test to each address.

Email Routing only receives. To reply *from* @milesprout.app, set up sending separately (e.g. your mail provider's "send mail as" with an SMTP service), and add its SPF and DKIM records alongside Cloudflare's. If you use a different provider for mail, name it in section 8 of `privacy.html`.

## Content rules

- Brand: **MileSprout** (wordmark "Mile" ink + "Sprout" green). Colours, the sprout mark and fonts follow the app and `research_notes/launch-2026/milesprout-brand-brief.md`.
- User copy says **Work** and **Personal**, never "Business". No statistics or "save £X" claims.
- The privacy policy must match the app. If the app starts sending data anywhere (for example iCloud invite checking, or Perks redemption through a server), update `privacy.html` before that version ships.
