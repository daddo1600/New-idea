# milesprout.app website (`website/`)

The public website for MileSprout: plain static HTML, one CSS file and one small script of our own. No build step, no cookies, no analytics, no external fonts or scripts. Everything is served from this folder, plus one Pages Function (`../functions/api/waitlist.js`) for the waitlist.

| Path | What it is |
|---|---|
| `index.html` | Landing page: hero (the phone in a car mount), the feature deck, the sign-up form, Free vs Pro, regions, closing call to action |
| `waitlist.html` | Early-access page (also where no-JS form posts land: `?joined=1#joined`, `?error=1#error`) |
| `testers.html` | Founding testers sign-up (`/testers?g=<group>`): the offer, the form (adds "Which iPhone?"), FAQ. Group links and what gets stored: `../functions/README.md` |
| `privacy.html` | Privacy policy for the app and the site (effective 2 Oct 2026) |
| `support.html` | Support FAQ |
| `partners.html` | MileSprout Perks pitch for partners |
| `r/index.html` | Perks code-check placeholder. `_redirects` serves it for every `/r/<code>` (the QR codes in the app point there) |
| `404.html` | Not-found page (Cloudflare Pages uses it automatically) |
| `_headers` | Security headers (CSP, HSTS, Referrer-Policy, Permissions-Policy) and caching |
| `_redirects` | The `/r/*` rewrite |
| `robots.txt`, `sitemap.xml` | For search engines |
| `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` | Icons (the PNGs are made from `milemint/assets/images/icon.png`) |
| `assets/site.css` | All styles, light and dark mode, including the CSS-built iPhone frame |
| `assets/site.js` | The sprout intro, the hero scene (road and clip), the feature deck (drag, swipe, trackpad, keys, dots), the form's choice chips and the waitlist form. The page reads fine without it |
| `assets/season.js` | Home page only: the app's seasons (same date rules and greetings as `milemint/src/domain/seasons.ts`) and the intro's road signs, hats, riders and seasonal backdrops. Country from the browser's time zone, then its language; no location asked. `?season=<id>` previews a season, `?season=none` turns it off |
| `assets/intro-gate.js` | Home page only, loaded before paint (not deferred): decides whether the intro plays and puts up a green cover so the hero doesn't flash first |
| `assets/img/screens/` | Raw app captures (`milemint/assets/store/raw/`, `milemint/docs/screenshots/perks/`) as 640 px WebP, with the top and bottom rows extended to leave room for the CSS status bar and home indicator. `trip.webp` has an invented street map drawn under the route (the capture's map panel was blank); `perks.webp` has the Expo dev button painted out of the tab bar |
| `assets/img/og.jpg` | Link preview image |
| `assets/video/` | The hero clip, recorded from the app's web preview (`?demo=driving&clip&region=GB`, then `?demo=1&clip&region=GB`): `drive-logged.webm` (VP9) and `.mp4` (H.264), 390×908, 9.6 s, no audio, with posters `drive-logged-poster.webp` (first frame) and `drive-logged-saved.webp` (the saved state, for Reduce Motion and no JS). Remake with `../tools/website/clip-record.js` and `clip-encode.py`; the road's no-JS markup in `index.html` comes from `../tools/website/hero-road.js` |
| `docs/` | Preview screenshots of the home page (not linked from the site): `scroll-*.png` for the hero and deck at desktop and mobile sizes, `scene-*.png` for the hero scene (`scene-strip-*` are frames of it playing, `scene-reduced-*` is Reduce Motion), `clip-frames.png` for frames of the clip itself, `waitlist-*.png` for the form states, `testers-*.png` for `/testers?g=fb-test` (page, filled form, success) at 1440 and 390 px, `intro-*.png` for the sprout intro (frames at 0.0–3.2 s and the final hero), `signs-*.png` for the road signs, `season-<id>-*.png` for each season (plus `-drive` frames and `-reduced-hero` end states), `chips-*-hero.png` for the choice chips, `float-*.png` for the floating "Get early access" pill (none at the Pro card or the very bottom), `form-*-{rest,typed}.png` for the compact sign-up form, and `pro-*`, `countries-*`, `languages-*`, `compare-*.png` for those home sections |

Links between pages are extensionless (`/privacy`), which is how Cloudflare Pages serves `privacy.html`. To preview locally with working links, use `npx wrangler pages dev website`. A quick look also works with `python3 -m http.server 8080 -d website` and opening `/index.html`, `/privacy.html` and so on.

## How the home page moves

- **Intro (first visit in a browser session):** the app's opening, about 3.2 s. The seed wakes in the soil, the road grows up with the gold dot at its tip laying the lane dashes, the leaves unfold, the dot's white ring draws in and "MileSprout" fades up. Then the sprout flies to the header logo while the green lifts away. Click, tap, any key, scrolling or "Skip intro" ends it. It never plays with reduced motion or without JavaScript, and it's `aria-hidden` (the page is in the DOM underneath the whole time). `sessionStorage` key `ms-intro-seen` marks it as played; `?intro=1` or `?season=<id>` plays it again.
- **Road signs and seasons (`season.js`, ported from the app):** a petrol station, shops and a café pop up beside the road as the dot reaches them and shrink away before the leaves open. In a season the sprout dresses up as in the app: snow, falling leaves or petals, bats, fireworks, a sun or the outback behind it; a hat on the dot (Santa hat, beanie, witch hat, party hat, cork hat, sunglasses, blossom); orange leaves in autumn; the sleigh (which takes off) or a pumpkin instead of the dot; gifts or Halloween treats for signs; and the greeting ("Fall is here" in the US and Canada). The intro runs 0.7 s longer in a season. The hero's sprout mark wears the hat and autumn colours with the greeting under it, which is all that shows with Reduce Motion.

- **Hero scene:** the phone sits in a car mount with a stylised road going by (SVG drawn by `site.js`: kerb, centre line, posts, trees). Its screen is a 9.6 s recording of the real app (`assets/video/drive-logged.*`): driving ("Recording a drive"), parked, the new drive on Home (Meanwood Rd → Home, 2.2 mi), swiped to Work, the total up by £1.21. The road follows the clip's clock: it slows, pulls in to the kerb and stops as the drive is saved, and sets off again when it loops. It plays only while on screen (the video isn't fetched before), has Pause/Play and Replay buttons, tapping the phone replays, and on desktop the road leans a little with the pointer. On phones it's a short wide band above the headline (so the headline and "See how it works" stay in the first screen); on desktop it fills the right column. The big faint sprout drifts slower than the page.
- **Feature deck:** eight phones in a fanned stack. Hover fans it out; flick with a horizontal trackpad swipe (one swipe = one card), a mouse drag or touch swipe (throw it), the arrow keys, the dots or the buttons. The caption beside it crossfades to the matching feature, and a polite live region announces "3 of 8: …".
- **Reduced motion:** the hero scene is a still picture of the saved state (the video's `drive-logged-saved.webp` poster, the road parked, no buttons), nothing flies or rotates, the deck just crossfades.
- **No JavaScript:** the same still hero scene, the deck's top card, and every feature listed in full (a `<noscript>` style in `index.html`).
- Only `transform` and `opacity` are animated.

## Waitlist

The home page's sign-up section (after the screens), `/waitlist` and `/testers` have the same form (with JavaScript, only the email box and button show until a whole email is typed; then the rest slides in): email, optional "What do you drive for?" and country (choice chips: radio buttons styled as pills, tap a chosen one again to clear it), a consent box, and a hidden honeypot field. With JavaScript it posts JSON to `/api/waitlist` and shows "You're on the list" in place; without it, it's a normal form post and the function redirects back to `/waitlist`.

The function needs a D1 database bound as `DB`. Set-up, in short (details in [`functions/README.md`](../functions/README.md)):

1. Dashboard → **Storage & Databases → D1 → Create**, name `milesprout-waitlist` (EU location if offered).
2. In its **Console**, run:
   `CREATE TABLE IF NOT EXISTS waitlist (email TEXT PRIMARY KEY, segment TEXT, country TEXT, consent_at TEXT, source TEXT, created_at TEXT);`
3. Pages project → **Settings → Bindings → Add → D1 database**, variable name **`DB`**, then redeploy.
4. To export: D1 Console, `SELECT * FROM waitlist ORDER BY created_at;` → **Download** CSV.

Functions run only on Cloudflare Pages deploys (not the Workers flow in `wrangler.jsonc`). Until the binding exists, sign-ups get a friendly "didn't go through" message (the function answers 503).

## Before launch

- `index.html`: the App Store button is a placeholder (`href="#"`, "Coming to the App Store"). When the app is live, put in `https://apps.apple.com/app/id<APP_ID>` and use Apple's official "Download on the App Store" badge (saved locally, not hot-linked). There's a `TODO` comment next to it.
- `privacy.html`: replace `[address]` with the postal address.
- Set up the waitlist database and binding (above), and test a sign-up on the live site.
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

## Updating site.css, site.js or intro-gate.js

Browsers cache `site.css`, `site.js`, `intro-gate.js` and `season.js` for a day, so pages link them with a version
(`/assets/site.css?v=…`). After changing any of them, refresh the versions so visitors get the
new one straight away:

```sh
cd website
for name in site.css site.js intro-gate.js season.js; do
  v=$(sha1sum "assets/$name" | cut -c1-8); re=$(printf '%s' "$name" | sed 's/\./\\./g')
  for f in $(grep -rl "/assets/$name" --include=*.html .); do
    sed -i -E "s#/assets/$re(\?v=[0-9a-f]+)?\"#/assets/$name?v=$v\"#" "$f"
  done
done
```
