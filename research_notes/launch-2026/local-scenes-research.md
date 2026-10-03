# Local hero scenes: location, privacy, landmarks and road signs

*Checked 3 October 2026 by the research agent, for the website hero driving scene (SVG road behind the phone in a car mount) on milesprout.app.*

**How it was checked:** developers.cloudflare.com, cntower.ca, sydneyoperahouse.com, arp.nsw.gov.au, gov.uk, ico.org.uk, legislation.gov.uk and other primary sites refused direct fetches from this environment (egress blocked). Cloudflare's own documentation was read from its published source on GitHub (`cloudflare/cloudflare-docs`, branch `production`), which is the text of developers.cloudflare.com. The IANA time zone data was read from `eggert/tz` on GitHub. The incognito-detection library was read from its GitHub source. Everything else comes from web search results quoting the primary site; those lines are marked with lower confidence. **This is research, not legal advice.** Two items (Opera House, CN Tower) touch on brand-owner permission; follow the rule given rather than asking them.

## Answers first

1. **Location: use both signals, server first.** A tiny Pages Function (`/api/scene`) reads `request.cf.country`, `regionCode` and `city` and returns only a coarse **scene key** (for example `au-outback`, `uk-scotland-country`, `ca-city`). It never logs, stores or returns the city. The browser time zone (already read by `season.js`) is the cross-check and the fallback when the Function fails. That needs **no consent banner** in the UK, Canada, Australia or the US: a privacy-policy line is enough (wording in §1.5). It stays true to "your trips stay on your phone": the app is untouched, and the site is already on Cloudflare, which already sees the IP address.
2. **Incognito: don't try to detect it.** It can still be done with storage and timing tricks (one maintained library claims Safari ≤26.5, Chromium 83–150 and Firefox 44–153), but browser makers treat detection as a bug to fix. It gives false positives and needs writes to the visitor's device, which is the very storage PECR covers. It also isn't needed: private mode doesn't hide the IP address, so it isn't a privacy signal for this. **Show the standard scene whenever the location is unknown, outside the four countries, in the EU, or doubtful** (the server and browser time zones disagree, which is a VPN-like sign, or the browser reports `UTC`).
3. **Landmarks: copyright is fine everywhere; the risk is trade marks on two buildings.**
   - **Safe to draw:** Big Ben/Elizabeth Tower, the Sydney Harbour Bridge, the Golden Gate Bridge, the Statue of Liberty and the Edinburgh skyline (castle, Scott Monument, Arthur's Seat).
   - **Only as a small part of a skyline:** the **Sydney Opera House** is a registered trade mark, including its 3D shape. The Trust's guideline allows it when it is incidental to a harbour or skyline scene, under a third of the image, and no more prominent than other landmarks. The **CN Tower** is protected by official marks and trade marks; there is implied permission only when it is part of the Toronto skyline, in good taste, and not the focal point.
   - Never put our logo, phone or text on any landmark, and never imply an endorsement.
4. **Road signs: draw them simplified and decorative.**
   - UK sign images are Crown copyright and may be reproduced free, provided they are accurate and not misleading.
   - US MUTCD designs are federal and public domain. The **Interstate shield is a registered AASHTO trade mark** (Reg. 835,635, 1967); use a simplified red-over-blue shield without the word "INTERSTATE", and never as a logo.
   - Get the details right: **Quebec signs are French-only, not bilingual.** Bilingual English/French signs are New Brunswick, Ottawa and French-designated parts of Ontario. Scotland is the same `Europe/London` time zone as England, so only the server can tell them apart.

---

## 1. Location without asking

### 1.1 What `request.cf` gives on Pages (free plan)

Cloudflare's `IncomingRequestCfProperties` reference says **"All plans have access to"** the following fields. Pages Functions receive the same Workers `Request`, so `context.request.cf` has them on the free plan.

| Field | Example in the docs | Notes |
|---|---|---|
| `country` | `"US"` | Same value as the `CF-IPCountry` header. Can be `null`; `T1` is Tor. |
| `isEUCountry` | `"1"` | Omitted or false outside the EU. The UK is not in the EU. |
| `continent` | `"NA"` | |
| `region` | `"Texas"` | "If known": the ISO 3166-2 first-level region. |
| `regionCode` | `"TX"` | "If known". |
| `city` | `"Austin"` | Can be `null`. |
| `postalCode`, `metroCode` | `"78701"`, `"635"` | **Don't read these.** |
| `latitude`, `longitude` | `"30.27130"` | **Don't read these.** They're approximate, but they look precise and aren't needed. |
| `timezone` | `"America/Chicago"` | Time zone of the IP location, used for the VPN cross-check. |
| `asn`, `asOrganization` | `395747`, `"Google Cloud"` | Could flag hosting/VPN networks. Optional; the time zone cross-check is simpler. |

- Source: [cloudflare-docs `workers/runtime-apis/request.mdx`](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/workers/runtime-apis/request.mdx) (= developers.cloudflare.com/workers/runtime-apis/request/). It also notes that `request.cf` is **not** present in the dashboard or Playground preview editor, so test it on a real deployment such as website-preview. Confidence: **high**.
- **Cost:** once a `functions/` folder exists, Pages invokes Functions on every route unless `_routes.json` excludes them. Static requests are free and unlimited, and Function requests count towards the Workers Free plan's **100,000 a day** ([cloudflare-docs `pages/functions/pricing.mdx`](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/pages/functions/pricing.mdx), [`routing.mdx`](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/pages/functions/routing.mdx)). The site already has `functions/api/waitlist.js`, so `_routes.json` (auto-generated) should already only include `/api/*`. A `/api/scene` call per home-page view is far inside the free limit. Confidence: **high**.
- **Logs:** Pages Functions logs are a live stream only: "Logs are not stored" ([`pages/functions/debugging-and-logging.mdx`](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/pages/functions/debugging-and-logging.mdx)). Don't `console.log` the cf values anyway. Confidence: **high**.

### 1.2 How accurate is it at city level?

- **Cloudflare promises nothing:** "IP geolocation is an estimate, not an exact science… Cloudflare does not provide SLAs for IP geolocation accuracy". On mobile or CGNAT networks the address "may change again" before a correction lands ([cloudflare-docs `network/ip-geolocation.mdx`](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/network/ip-geolocation.mdx), reviewed 2026-08-27). Confidence: **high**.
- **Provider:** IPinfo is now Cloudflare's geolocation provider ([IPinfo community announcement](https://community.ipinfo.io/t/ipinfo-is-the-ip-geolocation-data-provider-of-cloudflare/6841)). Confidence: **medium** (a vendor post, not Cloudflare docs).
- **Practical accuracy** (secondary sources only, no Cloudflare figure):
  - Country: about 99%.
  - Region/state: usually right.
  - City: roughly **50–80%**, about 66% for US IPs.
  - **Mobile data puts people at the carrier's gateway city**, so a phone in a country town often shows as the nearest big city ([Cloudflare Community thread](https://community.cloudflare.com/t/geolocation-accuracy/21756), [dev.to on the cf object](https://dev.to/koraykoylu/ip-geolocation-with-zero-external-apis-the-cloudflare-workers-cf-object-16e)). Confidence: **medium**.
  - **Design consequence:** most visitors are on iPhones, often on mobile data. "City" will be over-reported and "countryside" under-reported. That's harmless for a decorative scene, but don't count on `cf.city` to find the outback. Use region instead: NT, or WA outside Perth → outback.
- **iCloud Private Relay** (Safari on iPhone with iCloud+): with "Maintain general location" the relay IP maps to "a roughly city-level area"; with "Use country and time zone" it maps only to the country and time zone ([Apple, Private Relay overview PDF](https://www.apple.com/icloud/docs/iCloud_Private_Relay_Overview_Dec2021.pdf)). So `cf.country` and `cf.timezone` stay right, but the city may be a different nearby city. Confidence: **medium-high**.
- **UK region values:** to be checked on a preview deploy. I expect `cf.region` to read "England", "Scotland", "Wales" or "Northern Ireland" for GB IPs (the IPinfo convention), but couldn't confirm the exact `regionCode` strings. Log one request by hand on `website-preview` (not in code) before relying on it.

### 1.3 Is it lawful without consent?

The scene choice uses an approximate location, derived in memory from an IP address the host already receives, to pick one of a few pictures. Nothing is stored, logged, returned or shared, and only a scene key goes back.

| Law | Verdict | Why | Confidence |
|---|---|---|---|
| **UK GDPR** | Lawful on **legitimate interests**; needs a **privacy-policy line**, not consent. | IP addresses are "online identifiers" and may be personal data case by case, so treat the derived location as personal data ([ICO: identifiers](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/personal-information-what-is-it/what-is-personal-data/what-are-identifiers-and-related-factors/)). The processing is transient, low-risk and expected; Art. 13 transparency is met by the privacy policy. The policy already uses legitimate interests for site security logs. | Medium-high |
| **UK PECR reg. 6** (storage/access on the device) | **Server side: not engaged.** Reading the request's IP on the server neither stores nor reads anything on the device. **Browser side (time zone):** reading `Intl` time zone in JavaScript is arguably "access" to device information. Since **5 Feb 2026** the Data (Use and Access) Act 2025 adds a PECR exception for adapting a website's **appearance or functionality**, provided visitors get **clear information and a simple, free way to object** ([PolicyPros on DUAA cookie exemptions](https://www.policypros.co.uk/cookie-consent-changes-duaa-guide/), [Bratby Law on commencement](https://bratby.law/data-use-and-access-act-2025-commencement/)). | No consent needed. Add a small **"Show the standard scene"** control (it can be the same as `?scene=none`) as the way to object. | Medium (secondary sources; the exception's exact wording wasn't fetched) |
| **EU GDPR + ePrivacy Art. 5(3)** | **Don't localise EU visitors; show the standard scene** (`cf.isEUCountry === "1"`). | The EDPB's Guidelines 2/2023 read Art. 5(3) broadly: JavaScript reading device information and "certain instances of IP tracking" are covered ([EDPB Guidelines 2/2023 v2, Oct 2024](https://www.edpb.europa.eu/system/files/documents/2024-10/edpb_guidelines_202302_technical_scope_art_53_eprivacydirective_v2_en_0.pdf)). The EU has no "appearance" exemption, and a decorative scene isn't "strictly necessary". The EU isn't a target market, so skipping it costs nothing. Note: `season.js` already reads the time zone for everyone; that's low risk, but it is the same question. | Medium |
| **Canada (PIPEDA)** | **Notice in the privacy policy is enough** (implied consent). | Express consent is needed only when information is sensitive, unexpected or risky ([OPC: form of consent](https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/pipeda-compliance-help/pipeda-interpretation-bulletins/interpretations_07_consent/)). An approximate city used only for a picture is none of those. | Medium-high |
| **Australia (Privacy Act 1988)** | **Probably not covered**: the **$3m turnover small-business exemption still stands** in Oct 2026 (no bill to remove it yet). Follow APP 1/5-style transparency anyway with the same line. | [CoterieLabs, 2026](https://coterielabs.com.au/field-notes/privacy-act-small-business-exemption-not-removed-2026) (secondary; the OAIC was not fetched). | Medium |
| **US** | **No consent; the policy line is enough.** | The CCPA applies only above **$26,625,000** revenue (2026), 100,000+ Californians, or 50%+ revenue from selling data ([Jackson Lewis CCPA FAQ](https://www.jacksonlewis.com/insights/navigating-california-consumer-privacy-act-30-essential-faqs-covered-businesses-including-clarifying-regulations-effective-1126)). Even where it applies, "precise geolocation" means within a **1,850 ft radius**, and city-level IP location isn't precise ([KMT on CPRA sensitive data](https://kleinmoynihan.com/the-cpra-sensitive-personal-information-data-category/)). Other state laws have similar thresholds. | Medium-high |

**Conditions that keep it this simple** (all of them):
- Read only `country`, `regionCode` (or `region`), `city` and `timezone`.
- Turn them into a scene key inside the Function. Return only the key, with `Cache-Control: private, no-store`.
- No `console.log`, no D1/KV write, no analytics.
- Never show the city name or say "Hello, Leeds" on screen. That would feel like being watched and breaks the brand tone.
- Don't save the result in `localStorage`, `sessionStorage` or a cookie (that would be storage under PECR). Just ask again on the next page view.
- Visitors can switch it off ("Show the standard scene").

### 1.4 Is it consistent with "your trips stay on your phone; MileSprout never sees your data"?

- **Yes, if worded honestly.** The promise is about the **app**: trips, places and location from the phone. The scene runs on the **website**, uses no app data, and the website policy already says Cloudflare processes the IP address to deliver pages.
- **What would break it:** storing or logging the location, showing the visitor their city, or using the word "track". The founder's wording rules ban "tracking" and "we keep".
- **Wording to avoid in marketing:** "we know where you are". Say nothing in the hero itself; the scene just looks local.

### 1.5 Privacy-policy wording (add to the website section, after "Hosting")

> **Local scenery.** To make the picture of the road look like where you are, the site asks Cloudflare for your rough area (country and region, and sometimes the nearest city) from your IP address while the page loads, and uses it to pick a picture. It isn't saved, logged or sent anywhere else, and we never see your exact location. Your browser's time zone is used the same way. Visitors from the EU, or whose area we can't tell, see the standard scene. Prefer the standard scene? [Show the standard scene](?scene=standard).

(Marketing can polish the tone. Keep "isn't saved, logged or sent anywhere else". Translator: the policy page needs this in all 10 languages, like the rest of it.)

### 1.6 Browser time zone only: what it gives and loses

Source: [IANA tz `zone1970.tab` and `backward`](https://github.com/eggert/tz). Confidence: **high**.

| Country | What the time zone can tell | What it can't tell |
|---|---|---|
| UK | Only `Europe/London` (Belfast is a link to it). | **London vs rural England vs Scotland vs Wales: nothing.** It's also shared with Guernsey, Jersey and the Isle of Man. |
| Australia | **State-level:** `Sydney` (NSW; Canberra/ACT are links to it), `Melbourne` (VIC), `Brisbane` (QLD), `Adelaide` (SA), `Perth` (WA), `Darwin` (NT → good outback hint), `Hobart` (TAS), `Broken_Hill` (far-west NSW, outback). | City vs country town within a state. |
| Canada | Rough province: `Vancouver` (BC), `Edmonton` (AB), `Regina` (SK), `Winnipeg` (MB), `Toronto` (ON **and Quebec**: `America/Montreal` is only a link to `America/Toronto`), `Halifax` (NS/PEI), `Moncton` (NB), `St_Johns` (NL). | **Quebec vs Ontario**, so it can't pick French-only signs. City vs rural. |
| US | Time-zone band (`New_York`, `Chicago`, `Denver`, `Phoenix`, `Los_Angeles`, `Anchorage`, `Honolulu`…). | State and city: New York City and rural Vermont are both `America/New_York`; San Francisco and LA are both `Los_Angeles`. |

- **Gains:** no server call, works offline/preview, and it's already in `season.js`. It reflects the device setting, so it's unaffected by VPNs.
- **Losses:** everything at city level, England vs Scotland, and Quebec. Firefox "resist fingerprinting" and Tor report `UTC`.
- **Watch out:** `season.js` `country()` **defaults to `GB`** when it can't tell. The scene picker must default to **standard**, not GB.

### 1.7 Recommendation (combination)

1. Paint the **standard scene** first. It's static and instant, so there's no layout shift.
2. Call `/api/scene`. It returns a key from `cf.country`, `cf.regionCode` and `cf.city`, matched against a short list of big metros. Examples:
   - London, Manchester, Birmingham, Glasgow and Edinburgh → city;
   - Sydney/Melbourne → city with landmark;
   - NT, or WA outside Perth → outback;
   - other AU → country town;
   - Scotland non-metro → Scottish countryside;
   - England non-metro → English countryside;
   - QC → French signs.
3. In the browser, **accept the key only if** the server `cf.timezone` matches the browser time zone, at least to the same country. Otherwise keep standard: it's VPN-like.
4. If the Function fails, use the **time-zone-only** country/state mapping (AU states and Canada provinces still work), otherwise standard.
5. Cross-fade to the local scene. Swap instantly under Reduce Motion.

---

## 2. Incognito and private mode

- **Feasible? Partly, unreliably.**
  - `detectIncognito.js` (MIT, updated 2026) lists Safari ≤26.5, Chromium 83–150 and Firefox 44–153 ([GitHub README](https://github.com/Joe12387/detectIncognito)). It works by:
    - probing storage: Safari `navigator.storage.getDirectory()` and IndexedDB;
    - a Chrome **timing heuristic** on IndexedDB commits, because incognito IndexedDB is in-memory;
    - Firefox OPFS/IndexedDB errors.
  - It admits **false positives**, for example in Chrome Guest mode, and misses Firefox containers. Confidence: **high** (read from source).
  - Google calls incognito detection a loophole it will close. It patched the FileSystem API trick in Chrome 76, and the quota trick that followed ([Google blog: Protecting private browsing in Chrome](https://blog.google/outreach-initiatives/google-news-initiative/protecting-private-browsing-chrome/), [BleepingComputer](https://www.bleepingcomputer.com/news/google/google-chrome-incognito-mode-can-still-be-detected-by-these-methods/)). Every method is a bug that can vanish in any browser release. Confidence: **high**.
- **Should we try? No.**
  - It needs **writing to the visitor's device** (IndexedDB/OPFS) just to probe them. That's PECR/ePrivacy storage with no exemption, the opposite of the brand.
  - It adds a script for no user benefit, and it would read as surveillance if anyone noticed.
  - Private mode **doesn't hide the IP address**, so the location signal still works there.
- **What to do instead:** show the **standard scene** when any of these is true:
  - `cf.country` is missing, `T1` (Tor) or `XX`, or not GB/AU/CA/US;
  - `cf.isEUCountry`;
  - the server and browser time zones disagree (VPN-like);
  - the browser time zone is `UTC`/`Etc/*` (resist-fingerprinting, Tor);
  - the Function fails or takes over ~1.5 s;
  - the visitor chose "Show the standard scene".
- **Tell the founder plainly:** "standard in incognito" isn't achievable reliably and we shouldn't try. "Standard whenever we can't tell, or the visitor uses a VPN or privacy tools" is achievable, and it's the honest version.

---

## 3. Landmarks in illustrations

**Copyright:** a drawing of a building permanently in a public place is allowed in all four countries:
- **UK:** CDPA s.62 covers "making a graphic work representing" a building.
- **Australia:** Copyright Act s.66 allows a painting, drawing or photograph of a building.
- **Canada:** Copyright Act s.32.2(1)(b) allows a drawing of an architectural work.
- **US:** 17 USC s.120(a) allows pictorial representations of buildings visible from a public place.

Sources: [Fieldfisher: London skyline, an IP view](https://www.fieldfisher.com/en/services/financial-markets-and-products/real-estate-finance/real-estate-finance-blog/the-london-skyline-an-ip-view), [CITMA: how landmarks are protected](https://www.citma.org.uk/resources/how-are-landmarks-protected-by-intellectual-property-rights-blog.html), [Wikimedia Commons: FoP Oceania](https://commons.wikimedia.org/wiki/Commons:Freedom_of_panorama/Oceania), [Commons: Canada](https://commons.wikimedia.org/wiki/Commons:Copyright_rules_by_territory/Canada/en). Most of these landmarks are long out of copyright anyway. Confidence: **medium-high** (secondary summaries of the statutes).

**The real risk is trade marks and owner brand programmes**, which matter when the image is used "in trade" (advertising for us). Also: **draw from our own sketches or public-domain references, never by tracing a stock photo**, because the photo has its own copyright.

| Landmark | Verdict | Why / source | Confidence |
|---|---|---|---|
| **Big Ben / Elizabeth Tower** | **Safe.** Draw it freely. | Built 1859, no copyright. No registered mark found on the tower's image. Parliament restricts its **portcullis emblem** and use of the building itself, e.g. projections ([UK Parliament: "Big Ben is not a billboard"](https://www.parliament.uk/business/news/news-by-year/2016/march/big-ben-is-not-a-billboard/)). Don't add the portcullis, and don't write "Parliament". | Medium-high |
| **Edinburgh skyline** (castle on its rock, Scott Monument, Arthur's Seat) | **Safe.** | Historic, covered by FoP; no known image marks. Avoid Historic Environment Scotland or Edinburgh Castle logos. | Medium-high |
| **Sydney Harbour Bridge** | **Safe** as scenery. | Opened 1932. The only TfNSW mark found is **BridgeClimb®**, so don't draw climbers or the word. ([BridgeClimb T&Cs](https://www.bridgeclimb.com/terms-conditions)) | Medium |
| **Statue of Liberty** | **Safe, if you draw the original.** | Public domain (1886). The US Postal Service paid **$3.5m** for using the **Las Vegas replica** by mistake; the replica's face is copyrighted (*Davidson v. United States*, 2018) ([CNN](https://www.cnn.com/style/article/statue-of-liberty-stamp-lawsuit/index.html), [Loeb & Loeb](https://www.loeb.com/en/insights/publications/2018/07/davidson-v-the-united-states)). Use NPS / original-statue references only. | High |
| **Golden Gate Bridge** | **Safe** as generic scenery. Don't copy the District's logo view, and don't add the words "Golden Gate Bridge". | Built 1937, no copyright. The Golden Gate Bridge, Highway & Transportation District holds ~12 US marks, including a bridge-image logo for transport services ([Justia Reg. 3695453](https://trademarks.justia.com/776/98/golden-gate-bridge-highway-transportation-77698065.html), [Trademarkia owner list](https://www.trademarkia.com/owners/golden-gate-bridge-highway-and-transportation-district)). | Medium |
| **Sydney Opera House** | **Simplify and keep it small, or leave it out.** Only in a harbour scene, **under ⅓ of the picture and no more prominent than the Harbour Bridge/skyline**. Never as the hero subject, never alone, never altered or branded. | It's a registered trade mark, including its 3D shape. "Any proposed commercial use must first be authorised by the Sydney Opera House Trust". The incidental-use guideline is the ⅓ and no-more-prominent rule above ([SOH brand use requests](https://www.sydneyoperahouse.com/brand-use-requests), [SOH third-party brand guidelines PDF](https://www.besydney.com.au/media/h1kp5lkp/soh-third-party-brand-guidelines.pdf), [Lexology: 3D trade mark](https://www.lexology.com/library/detail.aspx?g=3c88743a-6133-44ed-9c75-f7216b408132), [NSW Premier & Cabinet memo M2025-05](https://arp.nsw.gov.au/m2025-05-sydney-opera-house-use-of-sydney-opera-house-site-image-or-brand)). **Recommendation:** make the Harbour Bridge the Sydney landmark; show the Opera House only as a small sail shape beyond it. | Medium-high |
| **CN Tower** | **Only within a Toronto skyline**, not the focal point, unaltered, in good taste. | Owned by Canada Lands Company. Its designs are "official marks and trademarks". "Implied permission" exists for the CN Tower as part of the Toronto skyline. Other commercial uses, **including advertising**, need a licence, and permission may be needed if the tower is the focal point, ornamented or altered ([cntower.ca: commercial use](https://www.cntower.ca/media-and-commercial-use/commercial-use); the 2019 book-cover dispute: [Dezeen](https://www.dezeen.com/2019/10/09/author-faces-legal-battle-for-placing-torontos-cn-tower-on-book-cover/)). | Medium-high |

**Ranking, safest first:**
1. Statue of Liberty (the original) and Big Ben;
2. Edinburgh skyline and the Harbour Bridge;
3. Golden Gate Bridge;
4. CN Tower (skyline only);
5. Sydney Opera House (small, incidental, or leave it out).

---

## 4. Road signs

**Rights:**
- **UK:** sign designs are Crown copyright, part of TSRGD. The DfT allows reproducing sign images **free, without asking**, provided they are **accurate and not in a misleading context**, with a statement that they are Crown copyright ([GOV.UK: road traffic sign images for reproduction](https://www.gov.uk/guidance/traffic-sign-images)). Our simplified drawings aren't reproductions, but add "Road sign designs: Crown copyright" to the site credits to be safe. Confidence: **medium-high**.
- **US:** MUTCD designs are US federal works, so public domain. The **Interstate shield** is a **registered trade mark of AASHTO** (USPTO Reg. 835,635, 19 Sep 1967), used mainly to stop look-alike signs near highways; mapmakers have used it for decades unchallenged ([FHWA: Shields and signs](https://highways.dot.gov/highway-history/interstate-system/50th-anniversary/shields-and-signs), [Interstate Signways](https://www.interstatesignways.com/post/what-is-the-interstate-route-marker-or-interstate-shield)). **Rule:** a simplified red-cap/blue-body shield with just a number, no "INTERSTATE" wording, decorative only, never in our logo, merchandise or app icon. Confidence: **medium**.
- **Australia and Canada:** the standards documents (AS 1742; provincial manuals and the TAC manual) are copyright as documents, but a simplified drawing of a generic warning or guide sign is fine. Don't copy the Ontario King's Highway crown shield or the Trans-Canada maple-leaf marker exactly; use a generic shield. Confidence: **medium**.
- **Typeface:** Transport (Kinneir and Calvert) has free TrueType versions at [roads.org.uk/fonts](https://www.roads.org.uk/fonts) (check their licence before shipping). New Transport is commercial ([A2-Type](https://a2-type.co.uk/new-transport)). **Simplest:** draw the few sign words as SVG paths, or use a close open font; don't load a webfont just for this.
- **Translation:** sign text is part of the drawing, not UI. Mark the SVG `aria-hidden`. Place names on real signs aren't translated, so these don't need the 10 languages.

**What makes each country recognisable** (for simplified drawings):

| Country | Recognisable cues |
|---|---|
| **UK** | **Green primary-route** direction signs: white place names, **yellow route numbers** (A1). **Blue motorway** signs: white text, route number in a box (M6). **White local** signs: black text and borders. **Brown** tourist signs. Red-bordered **triangle** warnings and **red-ring circle** limits **in mph** (no "mph" written). Mixed-case Transport lettering. Left-hand traffic. Countryside cues: stone walls, hedges, a single-track road with a "Passing Place" sign (Scotland). Scotland: Gaelic/English signs in the Highlands (Gaelic in a second colour). Wales: Welsh/English bilingual. Source: [DfT Know Your Traffic Signs](https://assets.publishing.service.gov.uk/media/656ef4271104cf0013fa74ef/know-your-traffic-signs-dft.pdf). |
| **Australia** | **Green guide signs** with white text. Alphanumeric route markers (M1, A1, B-roads). **Yellow diamond** warnings, including the **kangaroo** (W5-29: black kangaroo on a yellow diamond, AS 1742.3) ([Wikimedia: W5-29](https://commons.wikimedia.org/wiki/File:Australia_road_sign_W5-29.svg)). **Red-ring circle** speed limits **in km/h**. **Blue** service signs and **brown** tourist signs. Left-hand traffic. Outback cues: red dirt, long straight road, "Road trains" warning, distance boards. |
| **Canada** | **Green guide signs**, white text. **Yellow diamond** warnings, including the **moose** (common in NL, NB, QC, ON). Speed limits are **white rectangles in km/h** ("MAXIMUM 100" in Ontario). **Quebec: French only** (ARRÊT, sortie), with pictograms. **Bilingual** English/French in **New Brunswick** and French-designated parts of **Ontario** (and Manitoba) ([OptSigns: Quebec language laws](https://optsigns.com/road-traffic-signs-quebec-language-laws-french-english/), [OptSigns: are all Canadian signs bilingual](https://optsigns.com/are-all-canadian-traffic-signs-required-to-be-bilingual/); secondary, medium). Right-hand traffic. |
| **US** | **Green guide signs** with white Highway Gothic-style text, "EXIT 42" tabs. **Interstate shield** (red cap, blue body; see the rule above). White **US route** shield. **White rectangular "SPEED LIMIT 65"** signs **in mph**. **Yellow diamond** warnings (deer). Right-hand traffic. |

**Details to get right:**
- UK and Australia drive on the **left**, US and Canada on the **right**: lane markings and the car mount's side.
- Units: **mph** in the UK and US, **km/h** in Australia and Canada.
- Don't put a real, current speed limit on a real named road.

---

## Open items

- [ ] Coding: on `website-preview`, hand-check what `cf.region` / `cf.regionCode` return for a UK IP (expect "England"/"Scotland"), then remove any debug output.
- [ ] Coding: make the scene picker default to **standard**, not `GB` (`season.js` `country()` falls back to GB).
- [ ] Translator: the privacy-policy paragraph in §1.5 in all 10 languages.
- [ ] Re-check before launch: the Sydney Opera House brand guidelines and the CN Tower commercial-use page (both read only through search summaries; direct fetch was blocked).
