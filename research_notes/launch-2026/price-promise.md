# Pro price promise: wording, display lines, legal check and placement

Drafted 3 Oct 2026 by the marketing agent, for the decision of 3 Oct 2026, "Pro price set, with a price promise" (`decisions.md`). It builds on `pricing-case.md` and `pro-price-display.md`. Sources were checked on 3 Oct 2026 unless marked otherwise. This is a draft. Nothing here is live, and no website or app code has been changed.

Confidence: **H** high, **M** medium, **L** low.

## Short version

- **Headline (approved wording, unchanged):** "Subscribe in our first year and keep your price for as long as you stay subscribed."
- **Chip:** "Join in year one, keep your price"
- **One-line terms (UK and Australia):** "Price promise: subscribe to Pro between {LAUNCH_DATE} and {PROMISE_END} and keep the price you joined at, on the same plan (monthly or yearly), for as long as it keeps renewing. If you cancel and it runs out, the promise ends and re-joining is at the price at that time."
  - **US:** "keep the price you joined at, before sales tax, …"
  - **Canada:** "keep the price you joined at, before tax, …"
- **Can we keep it on Apple?** Yes. We can always keep it, because the worst case is that we never raise the price for existing subscribers, and Apple lets us do exactly that (**H**). Two things would over-promise if left unsaid:
  - In the US and Canada, sales tax is added on top of our price, so the total can change. The terms therefore say "before sales tax".
  - Changing plan, or changing App Store country, means a different price.
- **Two calls for the founder** (both are promises to customers):
  1. Founding testers get 12 months of Pro free. They would mostly reach a paid plan *after* the first year, so as written they miss the promise. Should they be included?
  2. Apple can't tell first-year subscribers apart from later ones on the same price. At the first rise, everyone already subscribed keeps their price, whenever they joined. That is more generous than the promise, so it's legal. It does cost money.

Placeholders:
- `{LAUNCH_DATE}` is the day Pro is first on sale in the App Store.
- `{PROMISE_END}` is launch plus 12 months, minus one day. For example, a launch on 1 Dec 2026 gives 30 Nov 2027.
- Use real dates in every public place, so the deadline is clear and stays true even if old copy lingers.

---

## 1. The promise

### 1.1 Headline (website Pro card, app paywall)

> **Subscribe in our first year and keep your price for as long as you stay subscribed.**

This is the founder's approved wording, word for word. It is short, warm and money-first, and it avoids the risky words (see 3.4).

### 1.2 Chip (small gold pill, where space is tight)

> **Join in year one, keep your price**

- This is 34 characters, so it fits a pill at phone width.
- It carries the main condition (year one). The ASA wants significant conditions next to the claim, not hidden (see 3.1). The full terms are linked from it.
- Fallback if it is too long in some languages: "First-year price promise".

### 1.3 One-line terms

It covers the three things the brief asked for: the window, what "stay subscribed" means, and same plan only.

| Country | Terms |
|---|---|
| UK | Price promise: subscribe to Pro between {LAUNCH_DATE} and {PROMISE_END} and keep the price you joined at, on the same plan (monthly or yearly), for as long as it keeps renewing. If you cancel and it runs out, the promise ends and re-joining is at the price at that time. |
| US | Price promise: subscribe to Pro between {LAUNCH_DATE} and {PROMISE_END} and keep the price you joined at, before sales tax, on the same plan (monthly or yearly), for as long as it keeps renewing. If you cancel and it runs out, the promise ends and re-joining is at the price at that time. |
| Canada | Price promise: subscribe to Pro between {LAUNCH_DATE} and {PROMISE_END} and keep the price you joined at, before tax, on the same plan (monthly or yearly), for as long as it keeps renewing. If you cancel and it runs out, the promise ends and re-joining is at the price at that time. |
| Australia | Same as the UK. The A$ price includes GST, and Apple holds it even if GST changes (see 3.5). |

### 1.4 Full fine print (website only, under the offer terms)

Use this to settle the edge cases. The one-liner stays the version that is shown everywhere.

> **Our price promise.** Subscribe to MileSprout Pro between {LAUNCH_DATE} and {PROMISE_END} and you keep the price you joined at for as long as your subscription keeps renewing.
> - **What counts as joining:** starting the yearly plan's free month counts.
> - **Same plan:** the promise is for the plan you chose, monthly or yearly. Switching plans takes the other plan's price at the time you switch.
> - **Same App Store country:** the promise is for the App Store country you joined in. In the US and Canada, it covers our price before sales tax, which Apple adds at checkout.
> - **Staying subscribed:** turning off auto-renew is fine as long as you turn it back on before your current period ends. If you cancel and the subscription runs out, the promise ends, and re-joining is at the price at that time. (Apple sometimes lets people back on their old price within 60 days. That's Apple's extra, not part of our promise.)
> - **If we lower the price,** you pay the lower one.
> - **Free logging stays free** either way.

---

## 2. Price display line, per country

The base is research's compliant lines in `pro-price-display.md` §2.1. The order is: price first, then the auto-renew note, then the promise.

| Country | Display line |
|---|---|
| UK | £3.99 a month or £29.99 a year. Renews automatically until you cancel in your Apple Account. Subscribe in our first year and keep your price for as long as you stay subscribed. |
| US | US$3.99 a month or US$29.99 a year, plus sales tax. Renews automatically until you cancel in your Apple Account. Subscribe in our first year and keep your price for as long as you stay subscribed. |
| Canada | CA$4.99 a month or CA$37.99 a year, plus tax. Renews automatically until you cancel in your Apple Account. Subscribe in our first year and keep your price for as long as you stay subscribed. |
| Australia | A$5.99 a month or A$44.99 a year, including GST. Renews automatically until you cancel in your Apple Account. Subscribe in our first year and keep your price for as long as you stay subscribed. |

Notes:
- **"Your price" in the US and Canada.** The line has just said "plus sales tax" or "plus tax", so "your price" reads as the pre-tax price. The terms say so outright. **M**: no regulator speaks to this exact case, but it follows the "general impression" test (Competition Act s52(4)) and FTC deception practice.
- **The free month.** Per `decisions.md`, the yearly plan keeps it. The chip line leaves it out, as `pro-price-display.md` advises. If it is mentioned, it must read in full: "Yearly starts with a free month, then £29.99 a year." (US: "…then US$29.99 a year, plus sales tax.")
- **No "launch" or "introductory" price.** That wording needs an end date and a real rise afterwards (`pricing-case.md`). The promise does not need either, because it never says the price *will* rise.
- **Only show prices once App Store Connect matches them.** App Store Connect still holds £5.99 / £49.99 (`pro-price-display.md` §1.1). Apple guideline 2.3.1(a) and DMCC Sch 20 para 5 / ACL s35 bar showing a price we can't sell at. The promise goes live together with the price, never before.
- **All 10 languages:** the headline, chip, one-liner and fine print go to the translator. French must also suit Quebec (Bill 96, see `pro-price-display.md`).

---

## 3. Legal sanity check

This is not legal advice. It checks the wording against each regulator's published rules, as far as we could reach them from this session. gov.uk, accc.gov.au, legislation.gov.au, ecfr.gov, law.cornell.edu and canada.ca are blocked here. Where a row relies on search summaries or law-firm pages, it says so.

### 3.1 Can we keep it on Apple?

| Question | Answer | Source | Sure? |
|---|---|---|---|
| Can we raise the price for new subscribers only? | Yes. When scheduling an increase, option A is "Keep the current price for existing subscribers. Anyone who subscribed before the start date of this price change won't be affected." | [Apple: Manage pricing for auto-renewable subscriptions](https://developer.apple.com/help/app-store-connect/manage-subscriptions/manage-pricing-for-auto-renewable-subscriptions/), read 3 Oct 2026 | H |
| What about lapsed subscribers? | "Subscribers whose subscription expires can resubscribe at the preserved price within 60 days of expiration." That is more generous than our terms, so the fine print mentions it as Apple's extra, not as our promise. | Same page | H |
| Payment failures | "If a subscription recovers during billing retry or the grace period, it renews at the existing price." A failed card that Apple recovers counts as still subscribed. | Same page | H |
| Does Apple change our price for tax or exchange rates? | No. "Apple will not make price adjustments on your auto-renewable subscription products. Retail price changes initiated by Apple due to tax changes and significant foreign exchange rate movements will exclude auto-renewable subscriptions." | Same page | H |
| If we lower the price | Existing subscribers move to the lower price automatically. That fits "you pay the lower one". | Same page, via `pricing-case.md` | H |
| Can Apple target first-year subscribers only? | No. Option A covers *everyone* subscribed before the change date. Option B only reaches people paying "the price … currently displayed". So if the price hasn't changed before {PROMISE_END}, the first rise either preserves everyone (keeping the promise, generously) or raises everyone (breaking it). **We must choose option A.** | Same page | H |
| Later rises | "If you have customer groups that have had their prices preserved … consent will be required based on the conditions of the customer at the time of the increase." That only matters if we ever move preserved subscribers up, which the promise rules out. | Same page | H |
| Changing country, or switching plans | Apple's page doesn't cover them. A new storefront or a different product is billed at that product's current price there, so the terms limit the promise to the same plan and the same country. | Not documented | L to M |

**Verdict:** we can keep it, as long as **every** future price increase, in **every** storefront, is set to option A ("Keep the current price for existing subscribers"). Add this to the release agent's checklist for any App Store Connect price change. If Apple ever withdrew option A, the promise could still be kept by not raising the price for existing subscribers at all.

### 3.2 United Kingdom (ASA / CAP Code, CMA / DMCC Act, Consumer Rights Act)

| Rule | What it means for us | Source | Sure? |
|---|---|---|---|
| DMCC Act 2024 Part 4 Ch 1 (misleading actions; CMA enforces directly since 6 Apr 2025) | A promise we can't or don't keep is a misleading action. We can keep this one (3.1), and the conditions are stated. | CMA209, via `pro-price-display.md` | M |
| CAP Code 3.1 and 3.9–3.10 (qualifications) | Qualifications must be clear and must not contradict the claim. The chip carries "year one"; the terms are linked and sit beside the price. | [ASA: subscription offers and free trials](https://www.asa.org.uk/advice-online/promotional-marketing-subscription-traps.html), via `pro-price-display.md` | M-H |
| Urgency and deadlines (CMA guidance on pressure selling and false urgency) | The deadline is real and dated, so it is fine. **Don't add** countdowns, "hurry" or "before prices go up". Those suggest a rise we haven't committed to. | CMA209 covers urgency and after-promotion prices ([PDF](https://assets.publishing.service.gov.uk/media/698f4e3e7da91680ad7f4417/CMA209_Unfair_commercial_practices__price_transparency_13.2.26.pdf)), search summary | M |
| Consumer Rights Act 2015 s50 (services) | What a trader says, and the consumer relies on, becomes a contract term. Treat the promise as **binding**, not as marketing. | CRA 2015 s50 (from knowledge; legislation.gov.uk is blocked) | M |
| DMCC Part 4 Ch 2 (subscription contracts) | Not in force. Expected Jan or spring 2027. It doesn't stop the promise, but re-check before the first price rise. | `pro-price-display.md` | M |

### 3.3 United States (FTC)

| Rule | What it means for us | Source | Sure? |
|---|---|---|---|
| FTC Act s5 (deception) | The net impression must be true. "Plus sales tax" in the price line, plus "before sales tax" in the terms, stops "keep your price" being read as a fixed total. | FTC Act s5, via `pro-price-display.md` | M-H |
| FTC Guides for the Advertising of Warranties and Guarantees (16 CFR 239) | These are about product guarantees, but the logic carries over. Material conditions must be disclosed clearly and prominently (§239.3). "Lifetime" claims must say whose life they mean (§239.4). Our wording names the life: "for as long as you stay subscribed". **Don't** say "guaranteed" or "lifetime price". | [govinfo, 16 CFR 239.3](https://www.govinfo.gov/content/pkg/CFR-2024-title16-vol1/pdf/CFR-2024-title16-vol1-sec239-3.pdf), search summary | M |
| ROSCA and the state auto-renewal laws | They govern checkout, which Apple handles and our paywall's renewal text covers. Unchanged by the promise. | `pro-price-display.md` | M-H |

### 3.4 Canada

| Rule | What it means for us | Source | Sure? |
|---|---|---|---|
| Competition Act s52 and s74.01 ("general impression" test) | Same as the US: the pre-tax wording keeps the impression true. | Competition Bureau, via `pro-price-display.md` | M |
| Quebec Consumer Protection Act and Bill 96 | Advertising aimed at Quebec must be in French of equal quality, so the promise and its terms need a French version. | `pro-price-display.md` | M |

### 3.5 Australia (ACL)

| Rule | What it means for us | Source | Sure? |
|---|---|---|---|
| ACL s4 (future matters) | A promise about the future is taken to be misleading unless we had reasonable grounds when we made it. Our grounds: Apple's option A (3.1), plus this note and the release checklist as a record from the time. Keep this file. | [australiancontractlaw.info: ACL s4](https://www.australiancontractlaw.info/legislation/acl/s4); [Allens](https://www.allens.com.au/insights-news/insights/2019/08/the-accc-looking-to-the-future---what-is-a-representation-with-respect-to-a-future-matter/) | H on the rule |
| ACL s18, s29(1)(i) and s48 | Price statements must be true, and the single price must include GST. "A$5.99 … including GST" does both. | ACL, via `pro-price-display.md` | H |
| Unfair Trading Practices Act 2026 (from 1 Jul 2027) | It targets subscription traps and drip pricing. The promise is neither. Re-check before 1 Jul 2027. | `pro-price-display.md` | M |

### 3.6 Tax: does "keep your price" cover tax changes?

| Country | How the price works | Effect on the promise | Sure? |
|---|---|---|---|
| UK | The price includes VAT. If VAT changes, Apple doesn't change the price; our proceeds change instead. | The customer's price stays the same, so "keep your price" holds fully. **We** absorb any VAT rise. | H (Apple's statement); H (VAT-inclusive, from proceeds maths in `pro-price-display.md`) |
| Australia | The price includes GST. Same as the UK. | Holds fully. We absorb any GST rise. | H |
| US | Apple adds sales tax at checkout. The rate depends on where the buyer is, and can change. | The total can change, so the promise must say "before sales tax". It does. | H on the mechanism; M on how state rates apply |
| Canada | Apple adds GST/HST/PST at checkout. | Same: "before tax". It does. | H on the mechanism; M |

Apple's own regional tax changes (it sometimes updates App Store prices when tax rates change) **exclude auto-renewable subscriptions** (3.1). So Apple will never move a subscriber's price for us.

### 3.7 Wording that would over-promise (avoid)

| Avoid | Why |
|---|---|
| "Locked forever", "lifetime price", "guaranteed price" | "Lifetime" and "guarantee" bring the FTC guarantee guides and their extra disclosures into play, and ignore the lapse and plan conditions. |
| "Keep this price" or "£3.99 for life" | If we lower the price, they pay less. If they switch plans, the price differs. "Your price" is accurate. |
| "Before prices go up", "launch price", countdown timers | They imply a rise we haven't committed to, and bring in the introductory-pricing rules (`pricing-case.md`). |
| "Never pay more" | Untrue in the US and Canada if sales tax rises, and untrue after a lapse. |
| An undated "first year" left online after {PROMISE_END} | Once the window closes it is false. Use real dates, and gate the app copy by date (section 4). |
| "Join the waitlist and keep your price" | A free Pro code doesn't renew (`#offer-terms`), so on its own it isn't "staying subscribed". The promise applies once someone is on a paid, renewing plan within the window. |

---

## 4. Placement

### 4.1 Website (`website/index.html`, `website-preview` first)

| Piece | Exactly where | Notes |
|---|---|---|
| **Price chip + display line** | In `.card.plan-pro`, directly after `<h3 class="pro-title">` (about line 340) and before `<p class="sub">Everything in Free, plus:</p>`. Gold price chip ("£3.99 a month · £29.99 a year"), then the country's display line from §2 as `<p class="fine">`. | It switches with the country flags, like the calculator. |
| **Promise chip** | Right under the display line in the same card. A tappable pill with the text "Join in year one, keep your price", linking to `#price-promise`. A small sparkle on reveal; none with Reduce Motion. | Marketing wants it gold-outlined, not filled, so it doesn't compete with the price chip. |
| **Fine print under the plans** | Replace line 363 ("Pro is a subscription through the App Store, with prices shown in the app…") with the country's one-line terms (§1.3). | It sits next to the price, as the ASA wants. |
| **Full fine print** | A new `<p class="fine wl-terms" id="price-promise">`, straight after `<p … id="offer-terms">` (line 311), holding §1.4. | It sits with the offer terms, as the brief asks. Add `<a href="#price-promise">Price promise terms</a>` beside the chip. |
| **Comparison footnote cmp-4** (line 479) | Price only: "Pro is £3.99 a month or £29.99 a year (country prices above)." No promise needed here. | |

### 4.2 App paywall (`milemint/src/app/pro.tsx`)

| Piece | Exactly where | Notes |
|---|---|---|
| **Headline** | A new line inside `<View style={styles.terms}>` (about line 304), **above** `offerTerms(t, plan)`, styled as a small gold-outlined pill or `smallBold` line: "Subscribe in our first year and keep your price for as long as you stay subscribed." | |
| **One-line terms** | Appended to the legal `<ThemedText style={styles.legal}>` (about line 323), after `renewalTerms()` and "Manage or cancel anytime…". | The US and Canadian variants come from the storefront region. |
| **Date gate (required)** | Show both pieces only while today is on or before `PROMISE_END`, a constant set at launch. | Old app versions stay in use after the window closes. An ungated promise would then be false (DMCC / ACL s4). |
| **Strings** | New i18n keys in all 10 languages: headline, the one-liner and its US/CA variants. | Translator agent. |
| **Demo paywall** | Update `demoPlans()` (line 46) to 3.99 / 29.99 before screenshots (`pro-price-display.md` §3). | |

### 4.3 App Store listing (`milemint/store.config.json`, en-GB / en-US / en-CA / en-AU)

| Piece | Exactly where | Draft (UK; swap the currency and tax wording per country) |
|---|---|---|
| **Promotional text** (`promoText`, 170 characters max, changeable without a new version) | Replace the current promoText. | "Logging is free. Subscribe to Pro by {PROMISE_END} and keep your price for as long as you stay subscribed." (about 105 characters with a date) |
| **Description, PRO section** | Replace the price bullet (en-US: "• $5.99 a month or $49.99 a year, with a 30-day free trial…"; en-GB/CA/AU: "• Monthly or yearly subscription… Prices are shown in … in the app."). | "• £3.99 a month or £29.99 a year. The yearly plan starts with a free month.<br>• Price promise: subscribe between {LAUNCH_DATE} and {PROMISE_END} and keep the price you joined at, on the same plan, for as long as it keeps renewing. If you cancel and it runs out, the promise ends." |
| **After {PROMISE_END}** | Remove the promise from promoText that day, and from the description in the next version. | The dated wording stays true in the meantime. |

Also in the listing:
- The en-US, en-GB, en-CA and en-AU descriptions say "30-day free trial". App Store Connect has **one month**, so change it to "a free month".
- The listing still says "MileMint" and "tracking" (`pro-price-display.md` §3). Fix these in the same pass.

---

## 5. Before this goes live

1. **Founder:**
   - Include founding testers? Their 12 free months end after the window.
   - Accept that the first rise will keep *everyone* already subscribed on their price (3.1)?
2. App Store Connect is set to option A prices (release agent, with sign-off). Only then do the price and the promise appear anywhere.
3. Launch date is set: fill in `{LAUNCH_DATE}` and `{PROMISE_END}` everywhere.
4. Release checklist: "Every Pro price increase uses *Keep the current price for existing subscribers*, in every storefront."
5. Translator (10 languages), then coding (website preview and paywall, with the date gate), then qa. Marketing signs off on brand; qa signs off that it works.
