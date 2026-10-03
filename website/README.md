# milesprout.app website (`website/`)

The public website for MileSprout: plain static HTML, one CSS file and one small script of our own. No build step, no cookies, no analytics, no external fonts or scripts, except Cloudflare Turnstile (the bot check), which loads only once someone has typed a whole email into a sign-up form. Everything is served from this folder, plus one Pages Function (`../functions/api/waitlist.js`) for the waitlist.

| Path | What it is |
|---|---|
| `index.html` | Landing page: hero (the phone in a car mount), the feature deck, the sign-up form, Free vs Pro, regions, closing call to action |
| `waitlist.html` | Early-access page (also where no-JS form posts land: `?joined=1#joined`, `?error=1#error`) |
| `testers.html` | Founding testers sign-up (`/testers?g=<group>`): the offer, the form (adds "Which iPhone?"), FAQ. Group links and what gets stored: `../functions/README.md` |
| `privacy.html` | Privacy policy for the app and the site (effective 2 Oct 2026, updated 3 Oct for the waitlist reward, Turnstile and the rate limit) |
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
| `assets/video/` | The hero clip, recorded from the app's web preview (`?demo=driving&clip&region=GB`, then `?demo=1&clip&region=GB`): `drive-logged.webm` (VP9) and `.mp4` (H.264), 390×908, 9.6 s, no audio, with posters `drive-logged-poster.webp` (first frame) and `drive-logged-saved.webp` (the saved state, for Reduce Motion and no JS). Remake with `../tools/website/clip-record.js` and `clip-encode.py` (then refresh the `?v=` on the four video URLs in `index.html`: the first 8 characters of each file's SHA-1, as for the CSS and JS); the road's no-JS markup in `index.html` comes from `../tools/website/hero-road.js` |
| `docs/` | Preview screenshots of the home page (not linked from the site): `scroll-*.png` for the hero and deck at desktop and mobile sizes, `scene-*.png` for the hero scene (`scene-strip-*` are frames of it playing, `scene-reduced-*` is Reduce Motion), `clip-frames.png` for frames of the clip itself, `waitlist-*.png` for the form states, `testers-*.png` for `/testers?g=fb-test` (page, filled form, success) at 1440 and 390 px, `intro-*.png` for the sprout intro (frames at 0.0–3.2 s and the final hero), `signs-*.png` for the road signs, `season-<id>-*.png` for each season (plus `-drive` frames and `-reduced-hero` end states), `chips-*-hero.png` for the choice chips, `float-*.png` for the floating "Get early access" pill (none at the Pro card or the very bottom), `form-*-{rest,typed}.png` for the compact sign-up form, and `pro-*`, `countries-*`, `languages-*`, `compare-*.png` for those home sections; `hooks-*.png` for the money line and calculator, `flags-*.png` for the flag chips and the counting amount (`flags-midcount-390.png` mid-roll) (`hooks-calc-nojs-390.png` without JS), `fix-*.png` for the QA fixes (`fix-pill-*` before and after the sign-up), `reward-*.png` for the waitlist reward (form, confirmation, `/waitlist`, `/testers`), `turnstile-*.png` for the forms after a sign-up with the bot check |

Links between pages are extensionless (`/privacy`), which is how Cloudflare Pages serves `privacy.html`. To preview locally with working links, use `npx wrangler pages dev website`. A quick look also works with `python3 -m http.server 8080 -d website` and opening `/index.html`, `/privacy.html` and so on.

## How the home page moves

- **Intro (first visit in a browser session):** the app's opening, about 3.2 s. The seed wakes in the soil, the road grows up with the gold dot at its tip laying the lane dashes, the leaves unfold, the dot's white ring draws in and "MileSprout" fades up. Then the sprout flies to the header logo while the green lifts away. Click, tap, any key, scrolling or "Skip intro" ends it. It never plays with reduced motion or without JavaScript, and it's `aria-hidden` (the page is in the DOM underneath the whole time). `sessionStorage` key `ms-intro-seen` marks it as played; `?intro=1` or `?season=<id>` plays it again.
- **Road signs and seasons (`season.js`, ported from the app):** a petrol station, shops and a café pop up beside the road as the dot reaches them and shrink away before the leaves open. In a season the sprout dresses up as in the app: snow, falling leaves or petals, bats, fireworks, a sun or the outback behind it; a hat on the dot (Santa hat, beanie, witch hat, party hat, cork hat, sunglasses, blossom); orange leaves in autumn; the sleigh (which takes off) or a pumpkin instead of the dot; gifts or Halloween treats for signs; and the greeting ("Fall is here" in the US and Canada). The intro runs 0.7 s longer in a season. The hero's sprout mark wears the hat and autumn colours with the greeting under it, which is all that shows with Reduce Motion.

- **Hero scene:** the phone sits in a car mount with a stylised road going by (SVG drawn by `site.js`: kerb, centre line, posts, trees). Its screen is a 9.6 s recording of the real app (`assets/video/drive-logged.*`): driving ("Recording a drive"), parked, the new drive on Home (Meanwood Rd → Home, 2.2 mi), swiped to Work, the total up by £1.21. The road follows the clip's clock: it slows, pulls in to the kerb and stops as the drive is saved, and sets off again when it loops. When the car parks, the camera comes in: the phone and its mount zoom up (transform only) so the app can be read, looking at the new drive while it's swiped and then panning up to the total as it ticks over, with the road dimmed behind; it eases back out as the car pulls away (`zoom-strip-*.png` in `docs/`). It simply loops (no buttons, the founder's call) while on screen (the video isn't fetched before), waits for the sprout intro, and on desktop the road leans a little with the pointer. The road runs on its own clock and only follows the video when it plays, so if iOS refuses autoplay (Low Power Mode), the road still drives and the phone shows the two posters in step; the video is tried again on the first touch, click or scroll. On phones it's a short wide band above the headline (so the headline and "See how it works" stay in the first screen); on desktop it fills the right column. The big faint sprout drifts slower than the page.
- **Feature panels** (beside or under the deck): one card per screen, with a Free/Pro/Perks badge, one big stat that counts up when the panel comes in, three tick tiles, and small pictures for Reports (a mini PDF), Privacy (a padlock on a phone) and Your code (a receipt whose countdown ticks). Content enters from the side the deck moved; on phones the box takes the active panel's height, so there's no gap. The Money stat, the Reports tax office and the PDF total follow the visitor's country (`RATES`). At 8/8 the dot turns gold and the hint says "You've seen it all. Get early access ↓".
- **Feature deck:** eight phones in a fanned stack. Hover fans it out; flick with a horizontal trackpad swipe (one swipe = one card), a mouse drag or touch swipe (throw it), the arrow keys, the dots or the buttons. The caption beside it crossfades to the matching feature, and a polite live region announces "3 of 8: …".
- **Money line and calculator:** under the hero h1, "An example year of part-time work driving is worth £2,640 at HMRC's rate" (US $3,648, Canada $5,526 at the CRA's allowance rate, Australia $4,550; 400 mi / 650 km a month). The sign-up section opens with "What are your work miles worth?": a slider for work miles (km in Canada and Australia) a week, 10–600 mi or 15–1,000 km, default 100 mi / 160 km, and four flag chips for the country (a radio group: arrow keys move between them; the chosen flag lifts with a gold ring and a small pop). The yearly amount counts up or down to each new figure (about half a second, tabular figures) and shimmers once when it crosses a 1,000; the slider is gold, filled up to its thumb, with a bigger thumb on touch screens; its whole 52–56 px band takes the finger (tap anywhere to jump, drag sideways to slide, swipe up or down to scroll). The flags sit 2×2 under 420 px. With Reduce Motion the values just change. The yearly figure follows each country's rules (UK 55p then 25p after 10,000 miles; US 76¢; Canada 73¢ then 67¢ after 5,000 km; Australia 91c capped at 5,000 km), over 48 working weeks, with a source link per rate. Both say "worth … at the tax office's rate", never "money back". The country comes from `season.js` (time zone, then language; `?country=CA` previews one); choosing one in the calculator also ticks that country in the form. The result is read out once the slider stops. Without JS both show the UK example. Rates live in `RATES` in `site.js`: update them with `milemint/src/domain/regions.ts`.
- **Local scenes:** the road runs through a scene that matches where the visitor is. The standard scene ("the brand road": hills, a hedge, round trees, our own green signs, birds) is the inline markup, so it paints at once and is what shows without JS. `site.js` then asks `/api/scene?tz=<browser time zone>` (`../functions/api/scene.js`), which answers with only a scene key from Cloudflare's rough location, checked against the time zone; standard for the EU, VPN-like mismatches, UTC/privacy tools, other countries and anything uncertain. If it fails or takes over 1.5 s, the time zone alone decides. Nothing is stored. Built so far: `standard` and `uk-london` (Elizabeth Tower and the Palace roofline in brand greens, the Thames and Embankment lamps, plane trees, bollards, double yellow lines, UK signs, a red bus while parked); every UK key goes to London until the countryside/Scotland scenes exist, and AU, CA and US get standard until theirs are built. Scene files live in `assets/scenes/` (`<id>.js`, `glyphs-*.js` for sign lettering made by `../tools/website/sign-glyphs.py`, and `calendar.js`, the date windows for seasonal and celebration overlays, empty until one passes review). `?scene=<id>` previews one; `?scene=standard` is linked from the privacy policy. On desktop, "Scenery" chips under the scene switch between the built scenes. The scene files get one `?v=` from `data-scenes-v` on the scene figure (refresh it with the asset versions). UK signs use Liberation Sans as a stand-in for Transport until the font licence is checked; sign designs: Crown copyright.
- **Opening position:** the page always opens at the top unless the URL has a #hash (`intro-gate.js` sets `history.scrollRestoration = 'manual'`; Safari used to restore the last position, and with smooth scrolling that looked like the page driving itself to the screens). `html, body { overflow-x: clip }` is a safety net against sideways panning.
- **Reduced motion:** the hero scene is a still picture of the saved state (the video's `drive-logged-saved.webp` poster, the road parked), nothing flies or rotates, the deck just crossfades.
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

## Bot check (Cloudflare Turnstile) and the rate limit

**Turnstile is OFF until the founder supplies the site key** (team decision, 3 Oct 2026). The code is all in place: when a form has a `data-turnstile-sitekey`, `site.js` loads `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit` once a whole email is typed (the same moment the chips appear, never before) and renders the widget in managed mode with `appearance: 'interaction-only'`, so most people never see it. Its token goes in the hidden `cf-turnstile-response` field. A submit waits up to 5 s for the token; if the script can't load, it posts anyway and the server decides. With no site key on a form (as now), nothing loads and the form posts as it always has. `_headers` allows `https://challenges.cloudflare.com` (`script-src`, `frame-src`) only on `/`, `/waitlist` and `/testers`.

The function (`../functions/api/waitlist.js`) checks the token with Turnstile's siteverify (with a 5 s timeout; the answer must be for this hostname and the `waitlist` action) only when `TURNSTILE_SECRET_KEY` is set; until then it doesn't ask for a token and logs a warning. With the secret set, a form posted without JavaScript has no token and goes to `/waitlist?error=js#error-js` (or `/testers?…`), which asks to turn JavaScript on or email hello@milesprout.app. **The site key and the secret must go in together**: a secret without the key on the forms would turn every sign-up away.

Always on, with or without Turnstile: the honeypot, and at most 5 sign-ups an hour per IP. For that it keeps only a SHA-256 hash of the IP with a per-day salt (HMAC of the day with `RATE_LIMIT_SALT` when that's set; the day alone otherwise), for an hour, in a `waitlist_rate` table it creates itself, and answers 429 with a friendly message (`?error=rate#error-rate` without JS).

**Founder's set-up:**
1. Cloudflare dashboard → **Turnstile → Add widget**: hostname `milesprout.app` (add `www.milesprout.app` and the preview hostname if you want it to work there), mode **Managed**.
2. Pages project → **Settings → Variables and secrets → Add**, type **Secret** (encrypted), for Production (and Preview if wanted):
   - `RATE_LIMIT_SALT` = any long random text (e.g. `openssl rand -hex 32`). Do this now; it doesn't need Turnstile.
   - `TURNSTILE_SECRET_KEY` = the widget's secret key.
3. In the same change, put the **site key** on the three forms: add `data-turnstile-sitekey="<site key>"` to the `<form … data-waitlist>` in `index.html`, `waitlist.html` and `testers.html` (each has a TODO comment), then bump nothing (it's HTML) and push.
4. **Redeploy** (secrets apply to new deployments), then sign up once on the live site to test.

## Waitlist reward

Everyone who joins the waitlist before launch gets **3 months of Pro free** (signed off by the founder on 3 Oct 2026; terms from `research_notes/launch-2026/website-claims-check.md`, "Decisions"): a one-time, **non-renewing** App Store offer code, emailed within 3 days of launch, to redeem within 60 days; one per person and per Apple Account; founding testers get their 12 months instead. The offer line is over the form on the home page and `/waitlist`, with "Doesn't renew. Terms below the form." beside it (and in the closing section); the small print (`#offer-terms`) is always shown under the consent box. `/testers` has its own 12-month small print. When the launch date is fixed, add "by {date}" to the small print, and take the offer off the site on launch day.

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
