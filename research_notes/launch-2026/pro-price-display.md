# Pro price on the website: price points, wording and what already shows a price

Checked 3 Oct 2026 by the research agent. This is for the decision of 3 Oct 2026, "Pro price, testers and badge" (`decisions.md`), which says "Research must confirm the App Store price tiers for USD, CAD and AUD before go-live".

## Short answer

- **Blocker: App Store Connect still has the old prices.** Both Pro products are set to £5.99 / £49.99, US$5.99 / US$49.99, CA$7.99 / CA$69.99 and A$9.99 / A$79.99. Each has a free month on the yearly plan in all four storefronts. Until someone changes these to the approved prices, the website must not show £3.99 / £29.99. Apple's guideline 2.3.1(a) bans "promoting a false price, whether within or outside of the App Store". UK law (DMCC Act Sch 20 para 5) and the ACL (s35) also ban advertising a price you can't sell at.
- **Apple's own conversion (equalisation) from the UK prices:**
  - £3.99 becomes US$3.99, CA$4.99 and A$5.99.
  - £29.99 becomes US$29.99, CA$39.99 and A$49.99.
- **Recommended prices.** The monthly prices are Apple's. The yearly prices are kept at about 7.5 months, as in the UK, so "save over a third" is true in every country. This is a money call, so the founder needs to sign it off.

| | Monthly | Yearly | Yearly ÷ monthly | Saving vs 12 × monthly |
|---|---|---|---|---|
| UK | £3.99 | £29.99 | 7.5 | 37% |
| US | US$3.99 | US$29.99 | 7.5 | 37% |
| Canada | CA$4.99 | **CA$37.99** (Apple: CA$39.99) | 7.6 | 37% |
| Australia | A$5.99 | **A$44.99** (Apple: A$49.99) | 7.5 | 37% |

  If the founder would rather take Apple's prices unchanged, use CA$39.99 and A$49.99. The saving then drops to 33% in Canada and 30% in Australia, so "save over a third" would be false there.
- **Tax in the price:**
  - The UK price includes VAT. The Australian price includes GST, and the law requires that.
  - US and Canadian App Store prices **exclude** sales tax, which Apple adds at checkout. Both countries allow advertising prices before tax.
  - **Correction to the brief:** Australia is *not* shown without tax. Its App Store price already includes GST.
- **The shortest compliant line in each country:**
  - **UK:** "£3.99 a month or £29.99 a year. Renews automatically until you cancel in your Apple Account."
  - **US:** "US$3.99 a month or US$29.99 a year, plus sales tax. Renews automatically until you cancel in your Apple Account."
  - **Canada:** "CA$4.99 a month or CA$37.99 a year, plus tax. Renews automatically until you cancel in your Apple Account."
  - **Australia:** "A$5.99 a month or A$44.99 a year, including GST. Renews automatically until you cancel in your Apple Account."
- **Where the price shows today:**
  - The app's paywall reads its prices live from the App Store, so it will match whatever App Store Connect is set to. Only the web demo uses made-up figures (5.99 / 49.99).
  - The App Store listing (`store.config.json`) is out of date:
    - en-US says "$5.99 a month or $49.99 a year, with a 30-day free trial on the yearly plan".
    - en-GB, en-CA and en-AU say "Prices are shown in the app".
    - The listing still uses the name MileMint and the word "tracking".
  - The website says "prices shown in the app" (index.html, lines 363 and 479).

## 1. Price points

### 1.1 What App Store Connect holds now

I checked this through the App Store Connect API, using GET requests only. Nothing was changed. App 6817748981 has the subscription group "MileMint Pro" (22428251) with two products, both in the state `READY_TO_SUBMIT`, so there are no subscribers yet.

| Product | GBR | USA | CAN | AUS |
|---|---|---|---|---|
| `com.milemint.app.pro.monthly` (6817794212) | £5.99 | $5.99 | $7.99 | $9.99 |
| `com.milemint.app.pro.yearly` (6817794272) | £49.99 | $49.99 | $69.99 | $79.99 |
| Introductory offer (yearly) | 1 month free | 1 month free | 1 month free | 1 month free |

The introductory offer was set from 30 Sep 2026 with no end date (`FREE_TRIAL`, `ONE_MONTH`).

Confidence: **high**. This comes straight from Apple's API.

**Flags:**
- These figures match the old en-US listing and the demo paywall. They do not match `decisions.md` (£3.99 / £29.99).
- `pricing-simulation.md` suggested a 14-day trial on the yearly plan. App Store Connect and the listing both say one month. If the website mentions a trial, check with the founder which one is right first.
- Lowering the price causes no problem for existing customers, because there are none. If a price is ever lowered later, Apple moves existing subscribers to it automatically ([Apple: Manage pricing for auto-renewable subscriptions](https://developer.apple.com/help/app-store-connect/manage-subscriptions/manage-pricing-for-auto-renewable-subscriptions/)).

### 1.2 What Apple's equalisation gives

I used the API's `subscriptionPricePoints/{id}/equalizations` call for the GBR price points. These are the prices App Store Connect generates when the UK is the base storefront.

| UK price point | USA | CAN | AUS |
|---|---|---|---|
| £3.99 (proceeds £2.82) | $3.99 (proceeds $3.39) | $4.99 (proceeds $4.24) | $5.99 (proceeds $4.63) |
| £29.99 (proceeds £21.18) | $29.99 (proceeds $25.49) | $39.99 (proceeds $33.99) | $49.99 (proceeds $38.63) |

Confidence: **high** (Apple's API, 3 Oct 2026). Apple's own wording: App Store Connect "provides comparable prices for all 175 App Store countries and regions, taking into account taxes and foreign exchange rates" ([Apple help](https://developer.apple.com/help/app-store-connect/manage-subscriptions/manage-pricing-for-auto-renewable-subscriptions/)).

**Nearby real price points.** Every price below exists in USD, CAD and AUD for both products:
- Monthly: 3.49, 3.99, 4.49, 4.99, 5.49, 5.99, 6.49, 6.99, 7.99.
- Yearly: 29.99, 34.99, 36.99, 37.99, 39.99, 44.99, 49.99.

Apple offers 800 points per currency. So the brief's examples (CA$5.49 / CA$39.99, A$5.99 / A$44.99) are all real price points. However, CA$5.49 is 10% above Apple's own conversion (CA$4.99), and nothing in the evidence supports charging Canada more.

**Prices stay fixed.** "Apple will not make price adjustments on your auto-renewable subscription products" for tax or exchange-rate changes ([same page](https://developer.apple.com/help/app-store-connect/manage-subscriptions/manage-pricing-for-auto-renewable-subscriptions/)). Once set, the website prices stay true until we change them ourselves.

### 1.3 Planned local prices already in the repo

| Source | US | Canada | Australia | Status |
|---|---|---|---|---|
| `pricing-simulation.md` (lines 8, 18–25, 142–149) | $4.99 / $37.99 | C$6.99 / C$51.99 | A$7.99 / A$57.99 | **Simulation, not research.** It converts the VAT-inclusive £ price at an exchange rate, rounded to .99. That ignores the 20% UK VAT that Apple strips out, so these come out 25–40% above Apple's conversion. **Superseded by this note.** |
| `pro-value-plan.md` | none (only "A$7.99" in a persona quote, line 149) | none | none | Nothing to carry over. |
| `offer-code-setup.md` (lines 16 and 23) | $24.99 (half of $49.99) | "matching" | "matching" | Built on the old £49.99 / $49.99. It needs updating to half of the new yearly price. Nearest points: £14.99, US$14.99, CA$18.99, A$22.49. |
| App: `milemint/src/purchases/pro.tsx` line 46, `src/dev/demo.ts` line 26 | 5.99 / 49.99 in the region's currency | same | same | Web demo only. Device builds use StoreKit's prices. Update this before taking screenshots, or the screenshots will show the old price. |

### 1.4 Why I recommend these yearly prices for Canada and Australia

- **Monthly:** take Apple's conversion as it is (US$3.99, CA$4.99, A$5.99). It is the neutral, tax-adjusted equivalent of £3.99.
- **Yearly:** Apple's conversion gives CA$39.99 (8.0 × monthly) and A$49.99 (8.3 × monthly). The UK and US are 7.5 ×. The pricing plan is "yearly-first" (`pricing-simulation.md`), so the yearly deal should be equally strong everywhere.
  - CA$37.99 and A$44.99 are real price points and keep the ratio at about 7.5.
  - "Save over a third with yearly" then stays true in all four countries: 37% in each.
- **Cost:** about CA$2 and A$5 less a year per yearly subscriber than Apple's conversion. This is a money decision, so the founder signs it off.

## 2. Wording rules for showing the price on a pre-launch website

The website does not take payment. Apple sells the subscription in the app and shows the legal renewal terms there; the paywall already has them (`milemint/src/app/pro.tsx` lines 103–129). The website is still **advertising** with a price, so the advertising and pricing rules below apply.

### UK

| Rule | What it requires | Source | Sure? |
|---|---|---|---|
| CAP Code 3.18 (ASA) | Prices quoted to consumers must include VAT. Saying "plus VAT" is not enough. | [ASA: Compulsory costs and charges: VAT](https://www.asa.org.uk/advice-online/compulsory-costs-and-charges-vat.html) | High (ASA guidance, via search summary) |
| ASA subscription guidance | If buying signs people up to ongoing payments, the advert must make that "explicitly clear", along with the size of the commitment. The key conditions must sit right next to the price, not in "T&Cs apply". | [ASA: subscription offers and free trials](https://www.asa.org.uk/advice-online/promotional-marketing-subscription-traps.html) | High |
| DMCC Act 2024 Part 4 Ch 1, Sch 20 (CMA enforces directly since 6 Apr 2025) | **Drip pricing:** an invitation to purchase must show the total price, including all compulsory charges. **Bait pricing (Sch 20 para 5):** don't invite people to buy at a price you can't offer. | [CMA209 price transparency guidance, 13 Feb 2026](https://assets.publishing.service.gov.uk/media/698f4e3e7da91680ad7f4417/CMA209_Unfair_commercial_practices__price_transparency_13.2.26.pdf) | Medium. gov.uk is blocked from this session, so this is from search summaries. |
| DMCC Act Part 4 Ch 2 (subscription contracts) | Not in force yet. It brings pre-contract information, reminders, easy exit and a 14-day cooling-off period. The government response (2 Apr 2026) said spring 2027; an August 2026 No 10 release says **January 2027**. It governs the contract, which Apple handles, not adverts. | [Government response, 2 Apr 2026](https://www.gov.uk/government/consultations/consultation-on-the-implementation-of-the-new-subscription-contracts-regime/outcome/government-response-to-consultation-on-the-implementation-of-the-new-subscription-contracts-regime-web-accessible-version); [PM "everyday fixes" release, Aug 2026](https://www.gov.uk/government/news/pm-starts-roll-out-of-everyday-fixes-on-the-cost-of-living-ending-rip-off-discounts-and-subscription-traps) | Medium. **Conflict:** spring vs January 2027. The later release wins. Confirm on gov.uk when the regulations are made. |

### US

| Rule | What it requires | Source | Sure? |
|---|---|---|---|
| FTC Negative Option ("click-to-cancel") Rule | Struck down by the 8th Circuit on 8 Jul 2025. The FTC restarted rulemaking (draft ANPRM sent to OIRA on 30 Jan 2026). **No federal rule is in force today.** | [Gibson Dunn](https://www.gibsondunn.com/ftc-restarts-negative-option-rulemaking-after-eighth-circuit-vacatur-enforcement-under-rosca-continues/), [Jones Day, May 2026](https://www.jonesday.com/en/insights/2026/05/ftc-revives-clicktocancel-rule-new-risks-for-subscription-businesses) | Medium. Law-firm sources; ftc.gov not checked. |
| ROSCA, 15 USC 8403 | The seller must "clearly and conspicuously disclose all material terms" before taking billing details. The seller here is Apple, at checkout. The FTC Act s5 (deception) applies to the advert itself. | [15 USC 8403](https://www.law.cornell.edu/uscode/text/15/8403) | High on the text; the website isn't the checkout. |
| California ARL (B&P Code 17600 ff., amended by AB 2863 from 1 Jul 2025), and similar state laws | The auto-renewal terms must be "clear and conspicuous" and in visual proximity to the request for consent. That is at checkout, so Apple's sheet and our paywall. | [AB 2863 text](https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240AB2863) | Medium-high |
| Sales tax | US App Store prices exclude sales tax, which Apple adds at checkout. Advertising before tax is normal and lawful. Saying "plus sales tax" is optional but honest. | Apple's API: US$3.99 has proceeds of $3.39, exactly 85%, so no tax is taken out of the price | High |

### Canada

| Rule | What it requires | Source | Sure? |
|---|---|---|---|
| Competition Act s52(1.3) and s74.01(1.1), drip pricing (2022) | A price is misleading if it can't be reached because of compulsory charges. Charges imposed by federal or provincial law (sales taxes) are **excluded**, so pre-tax prices are allowed. | [Competition Bureau: guide to the 2022 amendments](https://competition-bureau.canada.ca/en/guide-2022-amendments-competition-act) | Medium-high (search summary; canada.ca is blocked from this session) |
| Quebec Consumer Protection Act s224(c) | An advertised price must be the total, but it may exclude QST and GST. | [LégisQuébec P-40.1 s224](https://www.legisquebec.gouv.qc.ca/fr/version/lc/P-40.1?code=se%3A224&history=20170720&langCont=en) | Medium-high |
| Quebec Charter of the French Language (Bill 96) | Commercial advertising aimed at Quebec must be available in French, of equal quality. The site has `fr`, so make sure the price line is translated there too. | [Éducaloi](https://educaloi.qc.ca/en/capsules/language-laws-and-doing-business-in-quebec/) | Medium |
| Ontario Consumer Protection Act 2023 | Requires express consent to renew and easy cancelling. **Not in force; no date set.** | [Osler](https://www.osler.com/en/insights/updates/automatic-renewals-in-canadian-consumer-protection-law/) | Medium |
| Tax | Canadian App Store prices exclude GST/HST/PST, which Apple adds at checkout. | Apple's API: CA$4.99 has proceeds of CA$4.24, exactly 85%, so no tax is taken out | High |

### Australia

| Rule | What it requires | Source | Sure? |
|---|---|---|---|
| ACL s48, single price | If you show part of a price, the single total price must be shown at least as prominently, **including GST**. | [ACCC: component pricing](https://www.accc.gov.au/publications/advertising-selling/advertising-and-selling-guide/pricing/component-pricing) | High (ACCC, via search summary; accc.gov.au is blocked from this session) |
| ACL s29 and s35 | No false price claims. No advertising at a price that can't be supplied (bait advertising). | ACL, Competition and Consumer Act 2010 Sch 2 | High |
| Competition and Consumer Amendment (Unfair Trading Practices) Act 2026 | Passed on 2 Jul 2026. Bans subscription traps and adds drip-pricing disclosure. **Starts 1 Jul 2027.** | [Bird & Bird](https://www.twobirds.com/en/insights/2026/australia/the-end-of-fine-print-proposed-reform-to-australia's-unfair-trading-practices), [Ashurst](https://www.ashurstperkinscoie.com/en/insights/australia-bans-unfair-trading-practices-strengthens-laws-against-drip-pricing-and-subscription-traps/) | Medium (law firms and news; not checked on legislation.gov.au) |
| Tax | Australian App Store prices **include** GST. | Apple's API: A$5.99 has proceeds of A$4.63, which is 5.99 ÷ 1.1 × 0.85 | High |

### Apple

| Rule | What it requires | Source |
|---|---|---|
| Guideline 2.3.1(a) | Promoting "a false price, whether within or outside of the App Store" is grounds for removal. **The website price must equal App Store Connect's price.** | [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/#2.3.1) (quoted in `pro-perks-rules.md`) |
| Subscription guidance | Show the full renewal price clearly. If a free trial is mentioned, say how long it lasts and what is charged after. | [Apple: Auto-renewable subscriptions](https://developer.apple.com/app-store/subscriptions/) |

### 2.1 The line, per country

All four lines use the same pattern: price and period, the tax position, then auto-renewal and how to cancel. The cancel point is "your Apple Account", Apple's current name since 2024, which the website already uses.

| Country | Line |
|---|---|
| UK | £3.99 a month or £29.99 a year. Renews automatically until you cancel in your Apple Account. |
| US | US$3.99 a month or US$29.99 a year, plus sales tax. Renews automatically until you cancel in your Apple Account. |
| Canada | CA$4.99 a month or CA$37.99 a year, plus tax. Renews automatically until you cancel in your Apple Account. |
| Australia | A$5.99 a month or A$44.99 a year, including GST. Renews automatically until you cancel in your Apple Account. |

Notes for marketing and coding:
- **Put the line right under the gold price chip**, not only in the footer. The ASA says significant conditions must immediately follow the price.
- **Pre-launch framing.** Pro can't be bought yet, so the price should read as the launch price, e.g. a heading such as "Pro at launch". This avoids Sch 20 para 5 / ACL s35 problems if the launch slips.
- **Free month: leave it out of the chip.** If it is mentioned, it must read in full, e.g. "Yearly starts with a free month, then £29.99 a year". Settle the trial length (one month or 14 days) first.
- **Currency labels.** Use "US$", "CA$" and "A$" on the site, because visitors can switch country flags and a bare "$" is ambiguous. "plus sales tax" (US) and "plus tax" (CA) are optional by law but true. "including GST" (AU) is optional too, since the price must include it anyway, but it is clear.
- **"Cancel any time".** It is true, but the subscription runs to the end of the paid period. "Renews automatically until you cancel" avoids promising refunds.
- **The 10 languages.** All four lines need to go to the translator. French must cover Quebec.
- **"Save over a third with yearly"** is true for all four countries only with the recommended CA$37.99 and A$44.99.

## 3. Do the paywall and listing already state these prices?

| Place | What it says now | Matches the decision? | Action |
|---|---|---|---|
| App paywall (`milemint/src/app/pro.tsx`, `src/purchases/pro.tsx`) | Prices come from StoreKit (`plan.price`), with Apple's renewal terms ("…per year is charged to your Apple Account and renews automatically unless cancelled at least 24 hours before the end of the period"). | It will match once App Store Connect is changed. | No code change needed for real devices. Change `demoPlans()` (pro.tsx line 46) and the comment in demo.ts line 26 to the UK 3.99 / 29.99, so screenshots show the right price. |
| App Store Connect prices | £5.99 / £49.99 and local equivalents (see 1.1) | **No** | Founder (or the release agent, with sign-off) sets the new prices in App Store Connect: £3.99 / £29.99 base, then manual prices for USA, CAN and AUS (section 1.4). Do this **before** the website shows prices. |
| Listing en-US (`store.config.json`) | "$5.99 a month or $49.99 a year, with a 30-day free trial on the yearly plan" | **No** | Change to "$3.99 a month or $29.99 a year…", and fix the trial wording to match App Store Connect. The listing also still says "MileMint" and "tracking", which the wording rules forbid. |
| Listing en-GB / en-CA / en-AU | "Monthly or yearly subscription… Prices are shown in pounds / Canadian dollars / Australian dollars in the app." | Not wrong, just no figures | Optional: add the figures for a match with the website. |
| Website `index.html` line 363 | "Pro is a subscription through the App Store, with prices shown in the app. Cancel any time in your Apple Account settings." | No figures | Replace with the country line in 2.1. |
| Website `index.html` line 479 (comparison footnote cmp-4) | "Pro prices are shown in the app." | No figures | Replace with the price in our comparison-table row, per the decision. |

## Method and limits

- Price points, equalisations, current prices and intro offers came from the App Store Connect API (v1), using GET requests only, on 3 Oct 2026. Nothing in App Store Connect was changed.
- **The tax position is worked out from Apple's own proceeds figures.** At the 15% small-business commission:
  - US and CA proceeds are exactly 85% of the price, so the price is pre-tax.
  - UK proceeds equal price ÷ 1.2 × 0.85, so the price includes VAT.
  - AU proceeds equal price ÷ 1.1 × 0.85, so the price includes GST.

  Apple's help pages don't state the tax treatment per country outright. Schedule 2 Exhibit B, which would, couldn't be downloaded.
- gov.uk, accc.gov.au, competition-bureau.canada.ca and the US code sites are blocked from this session. Rows citing them rely on search-result summaries of those pages and are marked medium. Check the UK subscription-regime date and Australia's 1 Jul 2027 start against the primary pages before quoting them anywhere public.
- This is not legal advice. The lines above follow each regulator's published guidance for advertising a price. They do not replace the checkout disclosures Apple and our paywall already make.
