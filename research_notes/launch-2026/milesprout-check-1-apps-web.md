# Milesprout name clearance: check 1 of 3 (app stores and web)

Date: 2026-10-02. Proposed name: **Milesprout**, an automatic mileage tracker for gig couriers and self-employed drivers in the UK, US, CA and AU (Finance/Productivity).
Scope: app stores, developer and startup sites, general web, news and Reddit, and nearby "Sprout" brands. Trademark registers are **not** covered here.
Nothing was registered, bought, signed up for or contacted. No repo files were edited.

## Verdict: CAUTION (leaning clear)

- **No exact or near-exact use of Milesprout or its variants was found** in any source I could reach. That covers both app stores, GitHub, web search, social and news. This is unlike MileMint, which had both a live App Store app and a domain.
- **None of the 10 candidate domains resolve in DNS.** That suggests they are unregistered but does not prove it, because WHOIS and RDAP were blocked.
- The caution comes from three things:
  1. Several sources could not be reached: the iTunes Search API, Product Hunt, Crunchbase, LinkedIn, Indie Hackers, Reddit, and WHOIS/RDAP.
  2. "Sprout" is a busy word in money apps. There are several small "Sprout"/"Sprouts" finance apps and a UK fintech called Sprout Financial.
  3. Trademarks were not checked in this pass.
- I found no blocker.

## Sources checked

### 1. Apple App Store

| Source | Reachable? | Result |
|---|---|---|
| iTunes Search API `itunes.apple.com/search?...` (gb/us/ca/au; milesprout, mile sprout, sprout mileage and others) | **No.** Blocked by the egress proxy (curl CONNECT 403; WebFetch EGRESS_BLOCKED) | Not checked |
| `apps.apple.com/gb/search?term=milesprout` | No (404, wrong URL format) | Not checked |
| `apps.apple.com/{us,gb,ca,au}/iphone/search?term=milesprout` | Yes | No app with "sprout" in its name. Only generic mileage apps came back: MileTrack, AutoMiles, Mile Logger, Motus, DriverAI, Stride, ExtraMile, MileSnap, MileageWise, GigReal and others |
| `apps.apple.com/us/iphone/search?term=milesprouts` | Yes | No "sprout" apps; generic mileage apps only |
| `apps.apple.com/us/iphone/search?term=mile%20sprout`, `us` and `gb` `sprout%20mileage` | Yes, but **the results are unreliable** | Apple returned unrelated junk (history apps, Japanese ticketing apps). The two-word queries seem broken on the web search page. No "sprout" apps |
| `apps.apple.com/{us,gb,ca,au}/iphone/search?term=sprout` | Yes | Sprout - AI Job Search, Sprout Social, Sprout HR, Sprout at Work, Sprout & Co, baby/pregnancy trackers, Sprout ADHD tasks, Sprout Learn English, Sprouts Farmers Market (US), Sproutable, SproutAbout, SproutOS, Sprout Watering Reminder, Sprout Food Waste Tracker. **None are in finance, mileage or driving** in the top ~12 results |
| WebSearch `site:apps.apple.com sprout mileage` | Yes | No mileage app named Sprout. Hits: Sprout Run, Sprouts plant care, Smart Sprout, Sprout Fiber Internet, Sprout LevelUp, Sprout AI Job Search, Sprout Diary, Sprouty baby tracker |
| WebSearch (other) | Yes | Found "Sprout - Finance Companion" (Minuteman Apps LLC, iOS, personal budgeting/cash flow). This is the **closest App Store "Sprout" in finance**, but it does not do mileage |

Caveat: the WebFetch tool summarises each page and only sees about the top 12 results. A full API check was not possible.

### 2. Google Play, Product Hunt, GitHub, Crunchbase, LinkedIn, Indie Hackers

| Source | Reachable? | Result |
|---|---|---|
| Google Play search `milesprout` | Yes | "No results for milesprout" |
| Google Play search `mile sprout` | Yes | Only kids, baby, food and other unrelated Sprout apps (Baby Tracker by Sprout, Sprout Kids, Sprout & Co, Sprout at Work, Modern Sprout and others). No mileage or finance apps |
| Google Play search `sprout mileage` | Yes | Mileage apps (DriverAI, Everlance, Mileage Tracker) plus "Sprout: Daily Habit Tracker" and "Sprout" (Ahmed Al Shuail). No Sprout mileage app |
| Google Play (via web search) | Yes | **"Sprouts: Moneybox & Budget app" / "Sprouts - Expense Manager"** (package `melandru.lonicera`) is a finance/expense app listed in the GB store. Worth noting (see section 4) |
| GitHub user/org `github.com/milesprout` | Yes | 404, so the name does not exist |
| GitHub MCP search: repos `milesprout`; users `milesprout`; repos `"mile sprout" OR sproutmile OR mylesprout` | Yes | 0 results each |
| GitHub REST API (curl) | No (403 via proxy) | Used the MCP search instead |
| Product Hunt (`producthunt.com/search`) | **No.** Blocked | Web search with `site:` filters found nothing |
| Crunchbase | **No.** Blocked | Web search found only unrelated "Miles" (getmilesapp rewards) |
| LinkedIn `company/milesprout` | **No.** Blocked | Web search found only people named Miles Prower, Proctor, Pruitt and similar. No company |
| Indie Hackers | **No.** Blocked | Web search found nothing |

### 3. General web, news, Reddit, social and domains

| Query or source | Reachable? | Result |
|---|---|---|
| "Milesprout" | Yes | No uses. Only noise (Miles Prower music, MileSplit athletics) |
| "MileSprout" app | Yes | No uses. Generic Mile* apps |
| "Mile Sprout" | Yes | Only Cole Sprout, a US high-school miler, and Sprouts Farmers Market's "extra mile" blog. Not a brand |
| "Miles Sprout" / "Milesprouts" / "MileSprouts" / "Mylesprout" | Yes | Only "Miles", a character on PBS Kids Sprout TV. Not a commercial brand |
| "Sprout Miles" / "Sproutmile(s)" | Yes | Nothing beyond the Sprout TV character and HP Sprout |
| "Miles Prout" (sound-alike) | Yes | No person, business or podcast with that name in this space. Miles Proust is an SBS News journalist (AU), which is irrelevant |
| Reddit (`reddit.com/search.json`) | **No.** WebFetch refused it | Web search with "reddit" found nothing |
| Instagram/TikTok/X/YouTube/podcasts (via web search) | Partly; indexed results only | No "milesprout" handles found. Handles were not checked directly |
| News | Yes (via web search) | Nothing |
| "Sprout" + gig/courier/tax | Yes | No Sprout-branded gig-driver or tax product |
| Domains: milesprout .com / .app / .co.uk / .io / .co / .ca / .com.au, milesprouts.com | Yes (DNS through WebFetch) | **All NXDOMAIN (ENOTFOUND)**, so none host a site or have DNS. That suggests they are unregistered but is not proof |
| WHOIS/RDAP (rdap.verisign.com, rdap.org, whois.com) | **No.** Blocked | Registration status is not confirmed. Check at a registrar before committing |
| mile-sprout.com | Not tested separately | n/a |
| DriveSprout (rejected earlier in rename-shortlist.md) | Yes | drivesprout.io is a US lead-generation company for local businesses. drivesprout.com is for sale. Not a mileage product. Low risk |

## 4. Existing "Sprout" brands: confusion risk

| Brand | What it is | Overlap with Milesprout | Risk |
|---|---|---|---|
| Sprout Social | Large US listed company (social media management software). Owns SPROUT SOCIAL and LIFT/LANDSCAPE BY SPROUT SOCIAL marks | Different field, but it is a big, well-funded company with an iOS app. It would most likely care only if we used "Sprout" alone or a similar logo | **Low** |
| Sprout Solutions (sprout.ph) | Payroll/HR SaaS for the Philippines and Thailand, with some APAC expansion including AU. iOS app "Sprout HR". Publishes expense-management articles | HR and payroll, B2B. Not mileage or consumer | **Low** (low-medium in AU only) |
| Sprouts Farmers Market | US grocery chain with a big brand and an app | Groceries. The name is "Sprouts", not "Milesprout" | **Low** |
| Sprouts - Expense Manager / Moneybox & Budget (Google Play `melandru.lonicera`) | Consumer expense/budget app that reads bill screenshots | Same broad category (personal finance, expenses). The name is "Sprouts" alone | **Low-medium.** Nearest finance overlap; small developer |
| Sprout - Finance Companion (iOS, Minuteman Apps LLC) | Budgeting/cash-flow app | Same App Store category (Finance). The name is "Sprout" alone | **Low-medium** |
| Sprout Financial (UK, London; Pitch360 2025 winner) | Mortgage payment/wealth app | UK fintech in the same home market, but for mortgages | **Low-medium.** Watch in UK marketing; trademark check needed |
| Sprout Invoices (WordPress plugin) | Invoicing with expense/receipt tracking | Freelancer finance tooling, but not mileage or mobile | **Low** |
| Sprout Finance Co. (AU), Sprout Fund (CA VC), Sprout Financial (US lender) | Mortgage broker, VC, business loans | Finance, but a different service | **Low** |
| Baby Tracker by Sprout / Sprout Apps, Sprout Track | Baby/health trackers | Uses "tracker" wording but a different field | **Low** |
| Any "Sprout mileage" app | None found on the App Store, Google Play or the web | n/a | **None found** |

Overall: "Sprout" is a common, weak, shared word used by many unrelated companies, including several small finance apps. Nobody has combined it with "Mile". The risk is in the crowded field, not in any single clash. Keep the name as one word (Milesprout/MileSprout) and avoid using "Sprout" on its own as the brand or app icon label.

## Gaps for checks 2 and 3 to cover
1. Trademark registers: UKIPO, USPTO, CIPO, IP Australia and EUIPO for MILESPROUT and for SPROUT in classes 9, 35, 36 and 42. Look especially at Sprout Financial (UK) and any SPROUT class 36 marks.
2. Domain registration status via a registrar's WHOIS (this pass only shows that DNS does not resolve).
3. A full iTunes Search API query (blocked here) and a direct App Store search on a device in each storefront.
4. Product Hunt, Crunchbase, LinkedIn, Indie Hackers and Reddit checked directly.
5. Social handles on Instagram, TikTok and X, and Companies House / US state business registers.
