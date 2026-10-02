# Milesprout: clearance check 3 of 3 (domains, social, companies, language)

Date: 2026-10-02. Done from a sandbox whose network proxy blocks most lookup sites. Nothing was registered, bought, signed up for or contacted.

## Verdict: CAUTION

- **Domains:** none of the 13 names returned a DNS answer. That is a good sign but not proof, because every registry and whois site was blocked, so registration could not be confirmed.
- **Social handles and Companies House:** these could not be checked directly because every site was blocked. Web search found no "Milesprout" or "Mile Sprout" brand, app or company anywhere.
- **New language problem:** **"prout" is the everyday French word for "fart"** (Wiktionary, PONS, bab.la). "Milesprout" ends in the letters *-prout*, and French is an app language. Quebec (Canada) is a target market. "Miles Prout" is also the most natural way to split the word by eye. This was not in the shortlist notes.
- **Recommended spelling if you go ahead:** **MileSprout** (CamelCase) everywhere the name is shown. Use lowercase `milesprout` in domains and handles.

## 1. Domains

`getent hosts` was run on 2026-10-02. The resolver works: google.com and mileiq.com both answered.

| Domain | DNS answer |
|---|---|
| milesprout.com | none |
| milesprout.app | none |
| milesprout.co.uk | none |
| milesprout.uk | none |
| milesprout.ca | none |
| milesprout.com.au | none |
| milesprout.io | none |
| milesprout.co | none |
| milesprout.net | none |
| milesprout.org | none |
| getmilesprout.com | none |
| milesproutapp.com | none |
| trymilesprout.com | none |

**These lookups were blocked by the proxy** (both curl and WebFetch got EGRESS_BLOCKED or 403):
- rdap.org and rdap.verisign.com
- pubapi.registry.google, rdap.nominet.uk and the PIR, Identity Digital, .co, CIRA and auDA RDAP servers
- who.is, whois.com, lookup.icann.org and instantdomainsearch.com

So the table only shows that no DNS records exist. A domain can be registered and parked with no DNS, which is how MileMint was lost. **Treat every row as unconfirmed.**

### Steps to confirm before buying (do not skip)
1. Open https://lookup.icann.org/en/lookup and look up `milesprout.com`, then `milesprout.app`. "No match" or "not found" means unregistered. Any registrar, creation date or status line means it is taken.
2. For .co.uk and .uk, use https://www.nominet.uk/whois/ (or Nominet's lookup). A .uk domain can be held back for the owner of the matching .co.uk, so check both.
3. For .ca, use https://www.cira.ca/ (WHOIS lookup). You need to meet the Canadian Presence Requirements to register one.
4. For .com.au, use https://whois.auda.org.au/. You need an ABN or ACN to register one.
5. Then search the same names on one registrar, for example Cloudflare Registrar, Porkbun or Namecheap.
   - "Available" at a **standard price** means free.
   - A "premium" or "make offer" price, or a link to Sedo, Afternic or Dan.com, means someone already holds it.
6. Buy .com, .app and .co.uk together in one sitting, preferably the same day you confirm them. Searching on some registrar sites can cause front-running.
7. Must-haves are **milesprout.com, milesprout.app and milesprout.co.uk**. Nice-to-haves are .ca, .com.au and getmilesprout.com.

## 2. Social handles

Direct checks were **blocked** for all of these:
- Instagram, TikTok, X, YouTube, Facebook and LinkedIn: EGRESS_BLOCKED
- Bluesky (bsky.app and public.api.bsky.app): EGRESS_BLOCKED
- Threads and Reddit (www and old): the fetch tool refused them

Web searches for "milesprout" with each platform name found **no accounts**. Search engines index these sites poorly, so **this proves nothing**.

**To confirm by hand** (logged out or in a private window, then the platform's own sign-up name check, without finishing sign-up):
- instagram.com/milesprout
- tiktok.com/@milesprout
- x.com/milesprout
- facebook.com/milesprout
- youtube.com/@milesprout
- threads.net/@milesprout
- reddit.com/r/milesprout and reddit.com/user/milesprout
- linkedin.com/company/milesprout
- bsky.app/profile/milesprout.bsky.social

Repeat for `milesproutapp` and `getmilesprout`.

## 3. Company names

- **UK Companies House** search was **blocked**.
  - Check https://find-and-update.company-information.service.gov.uk/search/companies?q=MILESPROUT and `?q=MILE+SPROUT`.
  - Also look at the "same as" names rule, which ignores spaces and "LTD".
- **Web search** for "MileSprout"/"Mile Sprout" with Ltd, Inc or LLC found **no entity**. Nearby names found:
  - Sprout Financial Ltd
  - Sprouting Seeds Nursery Ltd
  - Square Mile Farms Ltd
  - Sprouts Farmers Market Inc.
  - Sprout Landscaping LLC
- **OpenCorporates** (US and Canadian registries) was **blocked**.
- **Busy "Sprout" marks nearby:**
  - Sprout Social
  - Sprouts Farmers Market
  - Sprout baby-tracker apps (sprout-apps.com)
  - "Sprout – AI Job Search" on the App Store

  None of these is in mileage or tax, but a trademark search (UKIPO class 9/42, USPTO, CIPO, IP Australia) is still needed.
- **Name collision:** "DriveSprout" (lead generation) is already on the rejected list.

## 4. Language and sound

The app's actual languages (from `src/i18n/locales/index.ts`) are en, es, pt-BR, fr, ro, pl, hi, pa, bn and zh-Hans. This **differs from the brief**: there is no German, Italian or Urdu, and Bengali and Simplified Chinese are included. All of them are covered below, plus the brief's extra three.

| Language | Reading or meaning | Risk |
|---|---|---|
| English (UK/US/AU/CA) | "mile" + "sprout". Fine. Sprout = growth, Brussels sprouts (a love-or-hate UK Christmas veg) and "young sprout" (a kid). "Sprog" is a different word, a UK/AU word for a child, and is not triggered. | Low |
| **French (FR + Quebec)** | **"prout" = fart** (informal and very common, kids' word). The name visually ends in *-prout*, and French speakers will not recognise "sprout", so they will likely read "Miles-prout" = "miles fart". | **Medium–high**: jokes in reviews and ridicule on social media in a target market (Quebec) |
| Spanish | "mile" ≈ "mil" (thousand), "sprout" has no meaning. Said as "mi-les-praut". The cluster is fine. | Low |
| Portuguese (BR) | No meaning. Brazilians may add a vowel: "mile-ispraut". | Low |
| Romanian | "mile" = the plural of "milă", which means both the unit "mile" and "pity/alms". It reads neutral to mild. | Low |
| Polish | No meaning. Said as "majl-sprałt". | Low |
| Hindi / Urdu | "मिले / ملے (mile)" = "got/received" ("paise mile" = got money), which is a positive accident. The "spr" cluster gets a vowel added ("saprout"/"isprout"), so it is harder to spell after hearing. | Low (pronunciation only) |
| Punjabi | Same as Hindi: "mile" = got/met, and "spr" gets a vowel added. | Low |
| Bengali | The "spr" cluster gets a vowel added ("ishpraut"). No bad meaning found. | Low |
| Chinese (Simplified) | The English brand is used as is. Any transliteration would need checking separately. | Low |
| German / Italian (in the brief, not in the repo) | German "Meile", no meaning for sprout or prout. Italian has no meaning. | Low |

- **"Miles Prout" mishearing:** Prout is a real English surname (Cornwall/Devon, the Prout School in RI), so the name can sound like a person. It also echoes "Miles Prower", Tails from Sonic. Customers may write "Miles Prout" or "MilesProut" when searching or recommending.
- **Autocorrect:** "Milesprout" is not a dictionary word, so iOS and Android will likely split it or change it to "Mile sprout", "Miles prout" or "Milestone". Adding it to the keyboard dictionary fixes this only for the user's own phone. CamelCase helps people type it correctly; it does not stop autocorrect.
- **Spell-after-hearing:** English speakers will mostly get it right. Non-native speakers will drift to "Milesprut", "Mile Sprout" or "Milespraut".

## 4b. App Store title fit (30-character limit)

| Title | Characters |
|---|---|
| Milesprout: Mileage Tracker | 27 |
| MileSprout: Mileage Tracker | 27 |
| Milesprout - Mileage Tracker | 28 |
| Milesprout: Mileage & Tax Log | 29 |
| Milesprout: Courier Mileage | 27 |
| Milesprout: Mileage Log | 23 |

- All of these fit within 30 characters.
- The home-screen label "Milesprout" is 10 characters, so it fits under the icon in full without truncation (about 11–12 characters show).

## 5. App Store search and casing

- App Store search ignores capital letters, so **casing does not change ranking or matching**. "MileSprout" is not split into "mile" + "sprout" for search; both spellings are one token.
- Typing "mile…" or "milesp…" brings up a prefix suggestion, but discovery for "mileage tracker" comes from the title after the colon, the subtitle and the keyword field, not from the brand.
- To catch people who type it split, put `sprout` (and possibly `mile`) in the keyword field. Apple combines words across title and keywords, so "mile sprout" will then match.
- **Recommendation: write it "MileSprout"** in the store title, icon label, wordmark and marketing.
  - The capital S shows where the split is ("Mile | Sprout"). This guards against the "Miles Prout" reading and slightly against the French "-prout" reading.
  - It matches how the wordmark already splits ink "Mile" from a green second half.
  - Keep `milesprout` all lowercase in domains, handles and the bundle ID.

## Sources
- [prout – Wiktionary](https://en.wiktionary.org/wiki/prout), [PONS prout](https://en.pons.com/translate/french-english/prout), [bab.la prout](https://en.bab.la/dictionary/french-english/prout)
- [Sprout baby tracker apps](https://sprout-apps.com/), [Sprout – AI Job Search (App Store)](https://apps.apple.com/us/app/sprout-ai-job-search/id6740011494)
- [Prout (surname) – Wikipedia](https://en.wikipedia.org/wiki/Prout)
- Web searches for "milesprout", "Mile Sprout" Ltd/Inc/LLC and "Miles Prout" (no matching brand found)
