# Pro-only perks: App Store rules, ad law, precedents and partner deals

*Research note, checked 3 October 2026. Not legal advice.*

**The question.** Can MileSprout Pro (an App Store auto-renewing subscription, planned at £3.99 a month or £29.99 a year) include partner perks that free users don't get, or get a smaller version of? The example is 1 free drink a week for free users and 2 for Pro. Free users would see a teaser such as "Did you know? Pro members get 2 free drinks a week".

**How sources were read.**
- **Read in full (primary):** Apple's App Review Guidelines and Apple's Developer Program License Agreement (DPLA), both downloaded from developer.apple.com. The App Store listings for Strava, Gridwise, Uber, Monzo, Deliveroo and Revolut, all on apps.apple.com.
- **Search-engine snippets only:** everything else. The research environment blocked direct access to asa.org.uk, ftc.gov, legislation.gov.uk, laws-lois.justice.gc.ca, accc.gov.au, sec.gov, monzo.com, uber.com and strava.com. In those cases the URL is the page the snippet came from, and the confidence rating says so. Confirm the exact wording on the live page before quoting any of it in the app or in a contract.

---

## 1. Verdict

- **Apple allows it, if Pro stays a software subscription that also comes with partner perks.**
  - Two IAP subscriptions already do this on the App Store today:
    - **Gridwise Plus**: "Plus users get even higher discounts and offers. Unlock even more perks with Plus!"
    - **Strava**: subscriber perks from partner brands.
  - Nothing in the Guidelines bans partner-funded real-world perks inside a subscription.
- **The real limit is in the developer agreement, not the Guidelines.**
  - DPLA Attachment 2 §1.1 bars using IAP "to offer goods or services to be used exclusively outside of an Application".
  - §2.1 bars IAP creating "balances or credits that end users can redeem" for such purchases.
  - What this means for MileSprout:
    - The perk must never be *what is sold*. Don't sell perks or drink credits on their own through IAP.
    - Don't describe Pro as "£X of drinks included" or as a balance of drinks.
    - Pitch Pro on its software features, with perks as an extra that partners pay for.
    - Keep claiming inside the app, where the code is shown in MileSprout.
  - **Confidence: medium.** Apple publishes no ruling on this exact case. The Gridwise and Strava precedents are strong evidence that it is allowed.
- **Perks can't be bought outside IAP, and no perk payments may flow through MileSprout.**
  - Guideline 3.1.3(e) only matters if MileSprout *charges* for a physical item. If it did, IAP would be *banned* for that charge.
  - MileSprout charges nothing for drinks, so the only payment is the Pro IAP. That is fine.
  - Never add a "pay 50p for an extra drink" button. That would be a 3.1.3(e) external-payment flow.
- **Teasers to free users are allowed, as long as they are true where the user is.**
  - **Guideline 2.3.1(a)** removes apps that promote "content or services that it does not actually offer … or promoting a false price".
  - **Guideline 3.1.2(c)** says you must "clearly describe what the user will get for the price".
  - So show the teaser only where a participating partner is near the user and the offer is live.
  - Name the partner, and say "participating stores", "while the offer runs" and "can change".
  - Use no countdowns or fake scarcity.
- **Label partner offers as partner offers or ads, and keep promotional notifications opt-in.**
  - CAP rules 2.1 and 2.3 say marketing must be "obviously identifiable" and its commercial intent must be clear.
  - Guideline 2.5.18 says display ads belong in the main app only, not in widgets or notifications.
  - Guideline 4.5.4 says promotional push notifications need explicit opt-in and an in-app way to opt out.
  - MileSprout earns commission from partners, so say so. This is also the FTC "material connection" point.
- **Consumer and ad law in all four countries points the same way.** Disclose the significant conditions next to the claim:
  - the cap per week;
  - participating stores and locations;
  - how many drinks are available, if stock is limited;
  - the end date, or that the offer can change;
  - that a Pro subscription is needed for the second drink.
- **UK specifics:**
  - CAP 8.17 (significant conditions) and 8.14 (make a reasonable estimate of demand and be able to meet it).
  - DMCC Act 2024 Schedule 20 bans bait advertising and false scarcity outright.
  - **CAP 3.25** says don't call part of a paid package "free". So the Pro extra should read "included with Pro" or "on us with Pro", not "free with Pro". The free-tier drink can be called free.
- **US, Canada and Australia** (details in section 3):
  - **US:** FTC Act s5 plus the FTC Guide on "Free" (16 CFR 251), under which conditions go "at the outset", not in an asterisked footnote.
  - **Canada:** Competition Act s74.01 (misleading representations) and s74.04 (bait and switch, "reasonable quantities").
  - **Australia:** ACL s18, s29, s32 (gifts and prizes) and s35 (bait advertising).
- **Precedents show the model is normal.** The ones that charge outside IAP are Uber One, Monzo Perks, Revolut plans and Deliveroo Plus. The IAP-billed ones are Strava and Gridwise.
  - **No company publishes data isolating how much perks lift upgrades.**
  - The published figures are about membership as a whole:
    - Uber One members spend about 3× as much as non-members and retain about 15% better.
    - Monzo's paid-plan customers rose from about 0.9m to over 1.6m in a year.
  - Don't present any of these figures as evidence that perks drive upgrades.
- **Partners do fund member-only offers. That is the normal structure.**
  - Uber Eats offers are merchant-funded, plus a per-redemption fee.
  - Bank perks are generally merchant-funded, with the operator taking a cut.
  - None of the named programmes publishes its deal terms.
  - The O2 Priority Greggs offer shows the risk. The free weekly item became £1 a month in September 2024, and customers were angry. Perks that Pro users paid for can be withdrawn, so build that into the terms and the copy.
- **This conflicts with earlier notes, so flag it.**
  - `perks-simulation.md` recommended "Free and Pro get the same perks".
  - `rewards-partners.md` proposed "Pro free for everyone, perks unlock nothing".
  - Pro-only perks reverse both. They are compliant only under the conditions above.

### Wording that fits all four countries (draft, to check against each partner's terms)

> **Teaser shown to free users, only where the partner takes part:**
> "Pro members can claim a 2nd drink each week at [Partner], on us. Participating [UK] stores; 1 claim at a time; offers can change or end. Pro is £3.99/month or £29.99/year and renews automatically. [See offer terms]"

> **On the Pro paywall:** list the software features first. Then: "Plus partner perks, which vary by area and can change." Do not count the value of perks into a "worth £X" figure unless it is clearly labelled as depending on availability. This is also a 3.1.2(c) and ASA point.

---

## 2. Apple: Guidelines and the developer agreement

Sources:
- [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), page "Last Updated: June 8, 2026". Downloaded in full on 3 Oct 2026. **Confidence: high**, verbatim.
- [Apple Developer Program License Agreement](https://developer.apple.com/support/terms/apple-developer-program-license-agreement/), Attachment 2. Downloaded in full on 3 Oct 2026. **Confidence: high**, verbatim.

### 2.1 What the rules say

| Rule | Exact text (extract) | What it means for Pro perks |
|---|---|---|
| **3.1.1** In-App Purchase | "If you want to unlock features or functionality within your app, (by way of example: subscriptions, in-game currencies, game levels, access to premium content, or unlocking a full version), you must use in-app purchase." | Pro itself must be IAP. Already planned. |
| 3.1.1 (vouchers) | "Digital gift cards, certificates, vouchers, and coupons which can be redeemed for digital goods or services can only be sold in your app using in-app purchase. Physical gift cards that are sold within an app and then mailed to customers may use payment methods other than in-app purchase." | Covers vouchers for *digital* goods only. Drink codes are for physical goods and are not sold, so this rule doesn't bite. |
| 3.1.1 (credits) | "Any credits or in-game currencies purchased via in-app purchase may not expire…" | Don't frame the weekly allowance as purchased "credits". Frame it as a weekly offer cap. |
| **3.1.2(a)** Permissible uses | "If you offer an auto-renewable subscription, you must provide ongoing value to the customer… examples of appropriate subscriptions include: … apps that offer consistent, substantive updates; … software as a service ("SAAS"); and cloud support." | Ongoing value must come mainly from the software (auto-tracking, reports, sync). Perks add to it but shouldn't be the only reason to subscribe. |
| 3.1.2(a) | "…those offering subscriptions should allow a user to get what they've paid for without performing additional tasks, such as posting on social media, uploading contacts, checking in to the app a certain number of times, etc." | Don't make Pro *features* depend on redeeming perks. Requiring a visit to the partner to redeem a perk is fine. |
| 3.1.2(a) | "you may offer subscriptions that include access to discounted consumable goods (e.g. a platinum membership that exposes gem-packs for a reduced price)." | Apple itself accepts member pricing *as a subscription benefit*. The example is digital, but the principle matches "better perks for Pro". |
| 3.1.2(a) | "Apps that attempt to scam users will be removed… This includes apps that attempt to trick users into purchasing a subscription under false pretenses or engage in bait-and-switch…" | A teaser for an offer that isn't really available, or a perk withdrawn soon after signup, is the risk. |
| 3.1.2(a) (carrier bundles only) | "Such subscriptions cannot include access to or discounts on consumable items…" | Applies **only** to subscriptions bundled with cellular data plans. Noted so nobody misreads it as a general ban. |
| **3.1.2(c)** Subscription Information | "Before asking a customer to subscribe, you should clearly describe what the user will get for the price." | The paywall must say what perks are included, that they vary by location and that they can change. |
| **3.1.3(e)** Goods and Services Outside of the App | "If your app enables people to purchase physical goods or services that will be consumed outside of the app, you must use purchase methods other than in-app purchase to collect those payments, such as Apple Pay or traditional credit card entry." | If MileSprout ever charges for a drink, IAP is *not allowed* for that charge. Keep perks free to claim, funded by the partner. |
| 3.1.3 (intro) | "Apps in this section cannot, within the app, encourage users to use a purchasing method other than in-app purchase, except for apps on the United States storefront…" | Don't link to a web checkout for Pro outside the US. |
| **3.1.4** | "You may not, however, require users to purchase unrelated products or engage in advertising or marketing activities to unlock app functionality." | Don't make Pro or perks depend on signing up with a partner. Already flagged in `rewards-partners.md`. |
| **2.3.1(a)** | "…marketing your app in a misleading way, such as by promoting content or services that it does not actually offer … or promoting a false price, whether within or outside of the App Store, is grounds for removal…" Also: "All new features… must be described with specificity in the Notes for Review… and accessible for review." | Teasers must be true for that user. Explain perks in the Review Notes and give the reviewer a Pro demo account where a perk is visible. |
| **2.5.18** | "Display advertising should be limited to your main app binary, and should not be included in extensions, App Clips, widgets, notifications…" Interstitial ads "must clearly indicate that they are an ad". | Keep partner offers out of widgets and Live Activities. Label full-screen offer cards. |
| **3.2.1(iii)** | "…all other items and services may not expire." | Low risk. Don't present the perk as a purchased item that expires. Present it as "claim up to 2 a week". |
| **4.5.4** | "Push Notifications should not be used for promotions or direct marketing purposes unless customers have explicitly opted in… and you provide a method in your app for a user to opt out." | Perk notifications must be opt-in and able to be turned off in the app. This matches the existing plan. |
| 5.3.1 and 5.3.2 | Sweepstakes must be "sponsored by the developer" and show official rules that say Apple isn't involved. | Only relevant if perks become prize draws. Avoid them. |

### 2.2 The binding agreement: DPLA Attachment 2 (Additional Terms for Use of the In-App Purchase API)

- **§1.1:** "You may use the In-App Purchase API only to enable end users to access or receive content, functionality, or services that You make available for use within Your Application… You may not use the In-App Purchase API to offer goods or services to be used exclusively outside of an Application, whether Yours or someone else's."
- **§2.1:** "You may not use the In-App Purchase API to enable an end user to set up a pre-paid account to be used for subsequent purchases of content, functionality, or services for use exclusively outside of Your Application, or otherwise create balances or credits that end users can redeem or use to make such purchases at a later time."
- **§2.2:** bans buying "Currency" (points or credits that work as a medium of exchange for physical goods) through IAP.
- **§3.2:** "You agree not to misrepresent, falsely claim, mislead or engage in any unfair or deceptive acts or practices regarding the promotion and sale of items through Your use of the In-App Purchase API."

**How to read it.** Pro is used inside the app: auto-tracking, reports and the Perks tab itself. A partner choosing to give Pro members more is not MileSprout selling goods through IAP.

The design would fall foul of §1.1 or §2.1 if MileSprout:
- sold a "Drinks Pass" IAP;
- showed a drinks or points balance that Pro buys; or
- marketed Pro mainly as a way to get drinks.

**Confidence: medium.** This is an interpretation. Apple publishes no example of exactly this, but the Gridwise and Strava listings below show approved apps doing it.

### 2.3 App Store evidence that IAP subscriptions with partner perks get approved

Checked on apps.apple.com, 3 Oct 2026. **Confidence: high** that the text is on the listings.

- **Gridwise** ([US listing](https://apps.apple.com/us/app/gridwise-gig-driver-assistant/id1215991382)).
  - In-app purchases: "Gridwise Plus $14.99 … $107.99", and "Your payment will be charged to your iTunes account", so it is IAP.
  - The description says: "Enjoy perks: Get exclusive benefits just for being a Gridwise user… Plus users get even higher discounts and offers. Unlock even more perks with Plus!" and "our Plus members save 50% on Keeper tax preparation services!"
  - **This is almost exactly the MileSprout proposal, and it is live and approved.**
- **Strava** ([UK listing](https://apps.apple.com/gb/app/strava-run-bike-walk/id426826309)).
  - In-app purchases: "Strava Subscription £8.99 / £54.99", "Strava Family Plan £99.99" and others.
  - Strava runs a [Subscriber Perks](https://www.strava.com/subscription/perks) page of partner offers for paid subscribers, such as gear discounts, event entries, Sundays Insurance cover and a 3-month Apple Fitness+ trial. The page itself was not opened; this comes from search snippets. **Confidence: medium.**
- **For contrast, these list no in-app purchases at all, so they bill outside IAP:**
  - Uber ([listing](https://apps.apple.com/gb/app/uber-request-a-ride/id368677368));
  - Monzo ([listing](https://apps.apple.com/gb/app/monzo-mobile-banking/id1052238659));
  - Deliveroo ([listing](https://apps.apple.com/gb/app/deliveroo-food-shopping/id1001501844));
  - Revolut ([listing](https://apps.apple.com/gb/app/revolut/id932493382)).
- Their memberships are mostly physical services or financial services, so 3.1.3(e) lets or makes them charge by card. MileSprout can't copy that, because Pro's core is digital, so 3.1.1 requires IAP.

---

## 3. Consumer and advertising law for "Pro members get X" claims

### 3.1 UK

**Sources.** All ASA pages are from search snippets because asa.org.uk was blocked. **Confidence: medium.**
- CAP Code: [s.8 Promotional marketing](https://www.asa.org.uk/type/non_broadcast/code_section/08.html), [s.2 Recognition](https://www.asa.org.uk/type/non_broadcast/code_section/02.html), [CAP Code PDF](https://www.asa.org.uk/static/47eb51e7-028d-4509-ab3c0f4822c9a3c4/b721618e-3c2c-438d-8024411970aa2c75/The-Cap-code.pdf).
- ASA advice: [Promotional marketing: Availability](https://www.asa.org.uk/advice-online/promotional-marketing-availability.html), [Closing dates](https://www.asa.org.uk/advice-online/promotional-marketing-closing-dates.html), [Changing ongoing promotions](https://www.asa.org.uk/advice-online/promotional-marketing-changing-ongoing-promotions.html), [Use of "free"](https://www.asa.org.uk/advice-online/use-of-free.html), [Subscription offers and free trials](https://www.asa.org.uk/advice-online/promotional-marketing-subscription-traps.html).

**CAP rules:**
- **CAP 8.17, significant conditions.**
  - All marketing referring to a promotion must communicate "all applicable significant conditions or information where the omission of such conditions or information is likely to mislead".
  - The listed conditions include:
    - how to participate;
    - the closing date;
    - "the nature and number of prizes or gifts";
    - eligibility or availability restrictions, including geographical ones.
  - **8.17.4(e):** closing dates must not be changed except in unavoidable circumstances.
  - For MileSprout:
    - **"Pro subscription required"** is an eligibility condition.
    - **"Up to 2 per week"** is the number.
    - **"Participating stores in [area]"** is an availability restriction.
    - **An end date, or a clear statement that there is none and the offer can change,** covers the closing date. The ASA says the absence of a closing date must not disadvantage consumers.
- **CAP 8.14 and 8.2, demand.**
  - Promoters must be able to show they made "a reasonable estimate of the likely response" and could meet it.
  - If they know they can't meet it, they must tell consumers clearly beforehand.
  - The ASA says **"subject to availability" does not relieve promoters of their obligation to do everything reasonable to avoid disappointing participants.**
  - So if the partner caps total redemptions (for example 500 a week), say so ("limited to the first 500 claims each week"), and show "claimed out this week" in the app before the user travels.
- **CAP 3.25, "free".** Don't describe an element of a package as free if its cost is included in the package price, unless it was recently added at no extra cost.
  - Risk: calling Pro's second drink "free" when Pro is paid.
  - Use "included with Pro" or "on us with Pro".
  - The free-tier drink, which needs no purchase, can be called "free".
- **CAP 3.21:** if one product's price depends on buying another, make clear the extent of the commitment. Show the Pro price and that it auto-renews next to the teaser, or one tap away and clearly signposted.
- **CAP 2.1 and 2.3, recognition.**
  - Marketing must be "obviously identifiable" and make its commercial intent clear.
  - Labels such as "Ad" or "Ad feature", shown up front, are accepted.
  - A Perks tab headed "Partner offers (we may earn a commission)" meets this.

**Statute:**
- **DMCC Act 2024, Part 4 Chapter 1** (unfair commercial practices, in force 6 April 2025).
  - It covers misleading actions and omissions, and missing material information in an "invitation to purchase".
  - **Schedule 20** bans 32 practices outright. These include **bait advertising** and **false claims that something is available only for a very limited time**.
  - The CMA can now fine directly, up to 10% of global turnover.
  - Sources: [CMA guidance CMA207](https://gov.uk/government/publications/unfair-commercial-practices-cma207/unfair-commercial-practices), [Sidley summary](https://www.sidley.com/en/insights/newsupdates/2025/04/new-uk-consumer-rules-herald-stricter-enforcement-and-significant-fines).
  - **Confidence: high** on the regime, medium on the exact paragraph numbers in Schedule 20.
- **DMCC subscription-contract regime** (reminder notices, renewal cooling-off). **Conflicting dates:**
  - [Taylor Wessing, April 2026](https://www.taylorwessing.com/en/insights-and-events/insights/2026/04/subscription-contracts) says it was delayed to spring 2027.
  - A search summary claims a 9 August 2026 announcement brought it forward to January 2027. That claim is not verified.
  - Apple handles billing for IAP subscriptions, but MileSprout is still the "trader" for disclosure purposes.
  - **Flag: check gov.uk before launch.**
- **Consumer Rights Act 2015, Schedule 2 "grey list"** (paras 11–13: unilateral variation without a valid reason stated in the contract). This is from knowledge; the page was not opened.
  - The Pro terms should say *why* perks can change, for example when a partner ends or changes its offer.
  - They should also say users will be told in the app.
  - Don't make a single partner perk the headline of the annual plan.

### 3.2 US (FTC)

- **FTC Act s5** prohibits deceptive acts. The FTC's "clear and conspicuous" standard applies to material conditions.
- **FTC Guide Concerning Use of the Word "Free"** ([16 CFR 251](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-251); snippet, **confidence: high**, as it is long-standing text).
  - "All the terms, conditions and obligations upon which receipt and retention of the 'Free' item are contingent should be set forth clearly and conspicuously at the outset of the offer".
  - These must appear "in close conjunction with the offer". A footnote reached by an asterisk "is not regarded as making disclosure at the outset".
  - So the teaser must say "Pro required", the cap and "participating locations" **on the same card**, not behind an asterisk.
  - The Guide also covers "free with purchase" offers. Calling Pro's second drink "free" when Pro is paid needs care. "Included with Pro" is safer.
- **Negative Option Rule ("click to cancel"):** vacated by the Eighth Circuit on 8 July 2025, and the FTC has restarted rulemaking ([Cooley](https://www.cooley.com/news/insight/2025/2025-07-11-click-to-cancel-just-got-cancelled-eighth-circuit-vacates-entirety-of-ftcs-negative-option-rule); [Gibson Dunn](https://www.gibsondunn.com/ftc-restarts-negative-option-rulemaking-after-eighth-circuit-vacatur-enforcement-under-rosca-continues/)).
  - **ROSCA still applies** to online auto-renewals: disclose material terms before billing, get express consent, and offer a simple way to cancel.
  - Apple's IAP sheet covers consent and cancellation. MileSprout's own paywall must not misstate the perks.
  - Several states have their own auto-renewal laws, notably California's Automatic Renewal Law. Not researched here.
- **Endorsement Guides** (16 CFR 255, from knowledge): disclose material connections. MileSprout is paid by partners, so label the offers accordingly.

### 3.3 Canada

Source: [Competition Bureau](https://competition-bureau.canada.ca/en/deceptive-marketing-practices/types-deceptive-marketing-practices/misleading-representations-and-deceptive-marketing-practices); snippet. **Confidence: medium-high.**

- **Competition Act s74.01(1)(a):** a representation to the public that is "false or misleading in a material respect" is reviewable conduct. The general impression counts, including fine-print effects.
- **s74.04, bait and switch:** a product advertised at a "bargain price" must be available in **"reasonable quantities"**, having regard to the market, the size of the business and the nature of the advert.
  - A partner perk with very limited weekly stock needs that limit stated.
- **Drip pricing:** an advertised price that can't be paid because of fixed compulsory fees is misleading. Show "£3.99/month" as the real price, with no add-ons.
- **Quebec Consumer Protection Act** and French-language rules (from knowledge). Quebec has stricter rules on advertising and language. Check before running perks there.

### 3.4 Australia (ACL)

Sources: [ACL Schedule 2 on AustLII](https://classic.austlii.edu.au/au/legis/cth/consol_act/caca2010265/sch2.html) and the [ACCC small business guide](https://www.accc.gov.au/system/files/Small%20business%20and%20the%20Competition%20and%20Consumer%20Act%20-%20July%202021.pdf); snippets. **Confidence: medium-high.**

- **s18:** misleading or deceptive conduct.
- **s29:** false or misleading representations, including about price or the existence of benefits.
- **s32:** offering gifts or prizes intending not to provide them, or not as offered. The gift must be the one advertised and supplied within the stated or a reasonable time.
- **s35, bait advertising:** don't advertise goods at a specified price if there are reasonable grounds to believe they can't be supplied "in reasonable quantities for a reasonable time". Intent is not required.
- What to disclose:
  - the weekly cap;
  - participating stores and states;
  - that Pro is needed;
  - that offers change.

### 3.5 Disclosure checklist (all four countries)

Show these on the card or teaser itself; the full T&Cs can be one tap away:
1. **Who qualifies:** "Pro members", plus the Pro price and that it auto-renews (UK CAP 3.21; FTC "Free" Guide; Apple 3.1.2(c)).
2. **How many:** "up to 2 a week (Mon–Sun)". If the free tier gets 1, say "1 for everyone, +1 with Pro".
3. **Where:** "participating [Partner] stores in [UK/area]". Show the teaser only where the user's country, and ideally area, has partner coverage (CAP 8.17; Apple 2.3.1(a)).
4. **Stock limits, if any:** "first N claims each week". Show a live "available this week" status (CAP 8.14; Canada s74.04; ACL s35; DMCC Schedule 20 bait advertising).
5. **Changes:** "Offers come from partners and can change or end. We'll tell you in the app." Add an end date where one exists (CAP 8.17.4(e); CRA Schedule 2).
6. **Commercial nature:** "Partner offer. We may earn a commission." (CAP 2.1 and 2.3; FTC Endorsement Guides.)
7. **No "free" for the Pro-only extra:** use "included with Pro" (CAP 3.25; FTC "Free" Guide).

---

## 4. Precedents: paid tiers with partner perks

| Programme | How it's paid | Free versus paid | How paid perks are shown to non-payers | Published uplift data | Source and confidence |
|---|---|---|---|---|---|
| **Gridwise** (US gig drivers) | **App Store IAP**: Plus at $14.99/month or $107.99/year | Free users get "exclusive benefits… Plus users get even higher discounts and offers". Plus gets 50% off Keeper tax prep, Gridwise Gas (up to 50¢/gal on up to 100 gal/month; a snippet says this needs Plus), extra insurance cover, 15% off rentals and 33% off CarAdvise | The store listing tells everyone "Unlock even more perks with Plus!" In-app screens not seen | "Plus members earn 30% more on average within their first month". This is about earnings, not upgrades, and is a company claim | [App Store listing](https://apps.apple.com/us/app/gridwise-gig-driver-assistant/id1215991382), **high**; [help: cost](https://help.gridwise.io/hc/en-us/articles/360061691773-How-Much-Does-Gridwise-Cost) and [blog](https://gridwise.io/blog/gridwise-increases-gas-discount-to-help-rideshare-and-delivery-drivers), snippets, **medium** |
| **Strava** | **App Store IAP**: £8.99/month or £54.99/year | Partner perks for subscribers only (gear discounts, events, Sundays Insurance, Apple Fitness+ trial). The free tier has no perks page | "Subscriber Perks" page | None found | [Listing](https://apps.apple.com/gb/app/strava-run-bike-walk/id426826309), **high**; [perks page](https://www.strava.com/subscription/perks), snippet, **medium** |
| **Everlance** | IAP subscription (Starter and Professional) | No consumer perks marketplace found. Discounts are *on Everlance itself* (DoorDash 20%, non-profit) | n/a | None | [Help: plans](https://help.everlance.com/hc/en-us/articles/17537341557261-What-is-the-Difference-Between-the-Free-Version-and-Premium), snippet, **medium** |
| **Stride** | Free app; earns from its marketplace and insurance | Everyone gets a "marketplace" of discounts (gas, dining, business services). There is no paid tier | n/a | "Users save $710/year on taxes" is a company claim about tax, not perks | [Stride blog](https://blog.stridehealth.com/post/stride-drive-really-free), snippet, **medium** |
| **Three+** (UK mobile network) | Free with any Three contract or pay-as-you-go | Weekly £1 Caffè Nero coffee: "one single-use code per customer, per week", "one hour to use your code". A £1 coffee at about 1,400 independent cafés. 10% off Nike, Cineworld £3 and so on. "Subject to availability" | Perks are the reason to choose the network. There is no free/paid split within Three+ | None published | [Three+](https://www.three.co.uk/why-three/threeplus), [Three media centre](https://www.threemediacentre.co.uk/content/treat-yourself-to-a-1-coffee-from-three-at-caffe-nero/); snippets, **medium** |
| **O2 Priority** (UK) | Free with O2 or Virgin Media | Was a weekly free Greggs coffee plus a breakfast item. **Since 12 Sept 2024 it is £1/month for a hot-drink offer.** Ticket presales "subject to availability" | Network marketing | None. Press reported customer anger at the cut ([yourmoney](https://www.yourmoney.com/household-bills/o2-axes-free-hot-drinks-at-greggs/); [inkl](https://www.inkl.com/news/o2-priority-quietly-axe-free-greggs-and-customers-are-fuming)) | News, **medium**. A warning about withdrawing perks |
| **Monzo Perks** (UK bank) | Card or bank billing, not IAP; about £7–9/month (sources conflict) | A free weekly Greggs treat (sausage roll, hot drink, doughnut or muffin) by QR code at "participating" Greggs, plus a Railcard and other items. The free account has none of these | Plan comparison in the app and on the web. In-app screens not seen | Paid-plan customers about 0.9m (FY2025) and over 1.6m (FY2026), from snippets of [Monzo annual report](https://monzo.com/annual-report). **Not attributed to perks** | [Monzo help](https://monzo.com/help/monzo-perks/monzo-perks-what), snippet, **medium** |
| **Revolut plans** | Card billing, not IAP. Standard (free), Plus £3.99, Premium £7.99, Metal £14.99, Ultra £55 | Premium and Metal bundle partner subscriptions (ClassPass, Deliveroo, FT, Headspace, Tinder and others), "valued at up to £545 / £1,730" a year. RevPoints earn faster on higher plans | A plan comparison page that lists the partner value | None found | [Revolut plans](https://www.revolut.com/our-pricing-plans/), [Revolut news](https://www.revolut.com/news/revolut_revamps_premium_and_metal_plans_with_new_partner_subscriptions/); snippets, **medium** |
| **Deliveroo Plus** | Card billing, not IAP. Silver (via partners), Gold £7.99/month, Diamond £19.99/month | Gold includes "exclusive partner offers". Diamond has exclusive restaurant and partner perks. Plus members get "exclusive restaurant offers, which aren't available to customers who don't have a Deliveroo Plus plan" | Offers are marked as Plus-only in the app (reported, not seen) | None | [The Grocer](https://www.thegrocer.co.uk/news/deliveroo-launches-invitation-only-diamond-plus-subscription/692472.article), [Deliveroo FAQ](https://deliveroo.co.uk/faq), [mobiletopup](https://www.mobiletopup.co.uk/infos/deliveroo/amazon-prime-deliveroo-plus); snippets, **medium-low** |
| **Amazon Prime UK** | Amazon billing | Partner benefits, such as about a year of Deliveroo Plus Silver, kept only while still a Prime member | Amazon pages | None for the partner perk | [Amazon UK](https://www.amazon.co.uk/b?ie=UTF8&node=26804070031), snippet, **medium** |
| **Uber One** | Uber billing, not IAP. $9.99/month or $96/year (US) | Members get $0 delivery fees, ride savings and "exclusive offers". Member Days (15–24 May 2026) had partner deals (Domino's 50%, McDonald's, Delta SkyMiles "first 14,000 members" and others) | Prices and offers shown with an Uber One upsell in the app (common knowledge, not verified) | Members about 50m+. They spend about 3× non-members and retain about 15% better. Members are about 50% of bookings (Q1 2026). **About membership as a whole, not perks** | [Uber newsroom](https://www.uber.com/us/en/newsroom/us-uber-one-member-days-2026/), [PYMNTS](https://www.pymnts.com/earnings/2025/uber-one-hits-30-million-subscribers-drives-delivery-revenues-22percent-higher/), [TheStreet](https://www.thestreet.com/investing/stocks/uber-just-hit-an-impressive-50m-milestone); snippets, **medium** |

**What the precedents show:**
- Only the *IAP-billed* precedents (Gridwise and Strava) are directly comparable to MileSprout. Both are approved.
- **Uber's Delta offer limited to the "first 14,000 members"** shows the right style of stock disclosure.
- **Three+'s "one code per week, one hour to use"** matches MileSprout's planned claim window and states it openly.
- **No company publishes data showing that perks alone lift paid upgrades.** The upgrade-lift effect is unproven. MileSprout should A/B test the teaser against no teaser before claiming anything.

---

## 5. Partner side: will partners fund a richer offer for paid members?

- **Yes. Member-only offers are usually merchant-funded.**
  - Uber reported merchant-funded offers on its platform up over 70% year on year ([Uber 8-K, Q2 2024](https://www.sec.gov/Archives/edgar/data/1543151/000154315124000024/uberq224earningspressrelea.htm); snippet, **medium**).
  - Uber Eats merchants also pay an **"Offer Redemption Fee" of $0.99 per order** in which an offer is redeemed ([Uber Eats merchant terms](https://www.uber.com/us/en/legal/uber-eats-merchant-terms-and-conditions/); snippet, **medium**).
  - Merchants on the Plus pricing plan reportedly pay **an extra 5% on Uber One orders**, while on Premium it is included ([Uber Eats pricing](https://merchants.ubereats.com/us/en/pricing/); snippet, **low-medium**).
  - Uber's [advertising business](https://www.uber.com/us/en/advertising/press/) sells sponsored placements by auction and direct deal, with no public rate card.
- **Bank and loyalty programmes:** the typical structure is merchant-funded rewards, with the operator taking a cut. Sources are vendor and industry blogs, not primary ([Kard](https://www.getkard.com/blog/how-neobanks-can-differentiate-with-merchant-funded-rewards); [Loyalty & Reward Co](https://loyaltyrewardco.com/3-types-of-merchant-funded-loyalty-programs/); **low**).
- **Not published:** the terms of the Monzo–Greggs, Three–Caffè Nero and O2–Greggs deals.
  - O2 moving from a free item to £1 a month suggests the cost per redemption was too high for someone. That is inference, not a published fact.
- **What this means for MileSprout's pitch to partners:**
  - Partners see a paying member as a better-qualified, more engaged customer. That is the case for "1 for everyone, 2 for Pro".
  - Ask the partner to fund the drink itself.
  - Optionally offer a per-redemption fee or a flat sponsorship to MileSprout.
  - Agree in writing:
    - a weekly cap;
    - the participating stores;
    - **at least 30–90 days' notice before changing or ending the offer**, so MileSprout can update the copy and avoid misleading Pro buyers;
    - who is responsible for honouring codes at the till.
  - This last item is a recommendation, not a published standard.
- **Partner coverage at launch is thin.** See `perks-simulation.md`: coverage is the biggest unknown. A Pro-only drink that most Pro users can't reach would fail CAP 8.17, 2.3.1(a) and 3.1.2(c) in spirit.
  - Only tease, or sell, Pro perks where coverage exists.

---

## 6. Open items and conflicts to resolve

1. **This conflicts with earlier notes.** `perks-simulation.md` says "Free and Pro get the same perks", and `rewards-partners.md` says "perks unlock nothing". The founders need to choose one.
2. **DMCC subscription regime start date.** The sources conflict (spring 2027 versus January 2027). Check gov.uk.
3. **Quote the exact CAP wording from asa.org.uk.** It was blocked here. Confirm rule numbers 8.14, 8.17, 3.21 and 3.25 against the current CAP Code PDF.
4. **Apple has published no guidance on this exact model.** If in doubt, describe the perks precisely in the App Review Notes and on the paywall, and keep the software features as the main value.
5. **State auto-renewal laws (US) and Quebec** were not researched.
6. **No data was found on whether perks lift upgrades.** Measure it with a holdout before making any claim.
