# Running a rewards/affiliate partner business inside a free iPhone app (MileSprout): networks, Apple rules, attribution, partner needs, gig-platform perks, benchmarks

Research date: 2026-10-02. Method note: awin.com and integrations.impact.com were blocked by the research environment's egress proxy, so some network details come from search-result snippets of primary pages (flagged as such) rather than full-page reads. About 16 tool calls were used, so coverage of the long network list is uneven. The Gaps sections say what is missing.

## 1. Affiliate networks and app/offerwall/fintech platforms: sign-up, fees, app support, tracking, payouts, incentivised traffic

### Takeaway
The big networks (Awin, CJ, Impact, Rakuten, Commission Factory) are free or nearly free to join and accept cashback/loyalty ("incentivised") publishers in principle, but each advertiser decides whether it allows them. A rewards-style app like MileSprout should register as a loyalty/cashback/incentive publisher and expect some advertisers to turn it down. Impact has the strongest documented in-app/deep-link tooling. Offerwall SDKs like BitLabs pay a revenue share but bring in third-party SDK code, which clashes with a no-tracking privacy position.

### Cited Findings
**Awin**
- Joining needs a deposit of 1 EUR/GBP/USD (or equivalent). Awin says the deposit "helps deter unscrupulous users from creating multiple accounts". It is credited to the publisher account and paid back with the first commission payment once the payment threshold is reached. For GB publishers the minimum BACS payment threshold is £20. (Search-result summary of Awin's own help/FAQ pages; full page fetch was blocked.) — [Awin Success Centre: Why do I have to pay the sign-up fee](https://success.awin.com/articles/en_US/Knowledge/Why-do-I-have-to-pay-the-sign-up-fee); [Awin GB FAQs](https://www.awin.com/gb/faqs)
- Awin's publisher standard terms PDF (2020 version, older than 2024, so check for a newer one) — [Awin AG Standard Terms for Publishers](https://s3.amazonaws.com/docs.awin.com/Legal/Publisher+Terms/2020/UK_EN_Awin+AG+Publisher+terms.pdf)

**CJ (Commission Junction)**
- CJ allows cashback/loyalty publishers, but "some advertisers restrict or cap participation". CJ recommends that advertisers list the publisher models they don't allow in the "Promotional Methods" section of their programme terms. — [Junction by CJ: promotional methods articles](https://junction.cj.com/article/tag/topic-promotional-methods)
- CJ uses essential cookies when it needs to identify a consumer in order to give them loyalty points or cash back. Loyalty publishers can file missing-reward claims through the Order Inquiry Manager. CJ also has a "Loyalty Exemption" solution aimed at the loyalty-publisher attribution problem. — [CJ's Loyalty Exemption Solution](https://junction.cj.com/en-gb/article/cjs-loyalty-exemption-solution-addresses-a-critical-industry-challenge)

**Impact.com**
- Impact offers TrueLink mobile deep linking, which "sends users directly to the desired place in-app and seamlessly falls back to mobile web". Impact claims deep linking into the app gives 3x the conversion rate of mobile web. — [impact.com Mobile](https://impact.com/mobile/)
- Impact and AppsFlyer are pre-integrated, and Impact adds the tracking parameters automatically, including for deferred deep links. For Branch, the brand adds impact.com as an Ad Partner, creates a Branch Ad Link and sets it as the app Download URL. Impact says "partners don't need to change a thing to begin driving traffic into your app", so the MMP integration is the advertiser's job, not the publisher's. — [Impact: Integrate with AppsFlyer](https://integrations.impact.com/integration-guides/for-brands/plugin-integrations/mmp-mobile-measurement/integrate-with-appsflyer); [Impact: Integrate with Branch](https://integrations.impact.com/integration-guides/for-brands/plugin-integrations/mmp-mobile-measurement/integrate-with-branch); [Impact x AppsFlyer one-sheet (2021, older)](https://impact.com/downloads/one-sheets/Appsflyer-impact-Integration-one-sheet-0221.pdf)
- Impact has a separate "Mobile App Tracking Integration" doc for publishers (not read: blocked) — [Impact publisher docs](https://integrations.impact.com/impact-publisher/docs)

**Commission Factory (AU)**
- Minimum payout threshold is AUD 50 (adjustable up to AUD 10,000). AU affiliates can be paid by Australian bank account, PayPal or Payoneer, weekly, fortnightly or monthly. Affiliates set the threshold and frequency in Billing settings. — [Commission Factory Affiliate FAQ](https://help.commissionfactory.com/affiliate-frequently-asked-questions); [How to apply as an affiliate](https://help.commissionfactory.com/how-to-apply-to-commission-factory-as-an-affiliate); [Adding your ABN](https://help.commissionfactory.com/adding-your-abn)

**Rakuten Advertising**
- Has a publisher help article titled "Minimum Payment Threshold". The figure was not retrieved. — [Rakuten Advertising pubhelp: Minimum Payment Threshold](https://pubhelp.rakutenadvertising.com/hc/en-us/articles/4412254867981-Minimum-Payment-Threshold)

**FlexOffers / fintech advertisers**
- MoneyLion runs an affiliate programme on FlexOffers. Search summaries cite $80 per funded loan for MoneyLion's traditional affiliate programme (snippet-level, not verified on the page). — [FlexOffers: MoneyLion affiliate program](https://www.flexoffers.com/affiliate-programs/moneylion-affiliate-program/)

**Engine by MoneyLion (formerly Even Financial)**
- Engine sells "financial marketplaces and search tools" that let publishers (from news sites to financial-wellness sites) send users to third-party financial providers for a fee. It has more than 400 financial partners covering loans, savings, insurance, cards and mortgages. Enterprise partners that embed the marketplace "receive a revenue share from the third-party financial providers". — [The Financial Brand](https://thefinancialbrand.com/news/fintech-banking/how-moneylion-paired-consumer-banking-and-embedded-finance-to-power-its-hypergrowth-172184); [Engine API reference](https://engine.tech/docs/api-reference/); [Even developer center](https://even-financial.gitbook.io/developer-center); [Engine legal](https://engine.tech/resources/legal)

**Offerwall / rewarded-survey SDKs (BitLabs)**
- BitLabs can be integrated by SDK (iOS, Android, Unity, Flutter, React Native), iframe offerwall or API. Users are rewarded in in-app currency. — [BitLabs iOS SDK](https://developer.bitlabs.ai/docs/ios-sdk-v3); [BitLabs How it works](https://bitlabs.ai/how-it-works)
- Publishers are paid a revenue share on NET-30 terms. A $100 threshold is reported by third-party reviewers, not BitLabs itself. — [BitLabs review (third party, 2026)](https://hansaldev.com/blog/bitlabs-review-2026-a-deep-dive-into-the-survey-offerwall-monetization-platform); [PubScale: offerwall networks 2026](https://pubscale.com/blog/offerwall-ad-networks)

### Inferences
- Rewarding users with "Pro" for a partner action puts MileSprout in the incentivised/loyalty publisher category. It should say so honestly on network applications, because misclassifying is a common reason for commission reversals.
- For a privacy-first, no-SDK app, the cleanest setup is outbound affiliate links plus network reporting, with no partner SDKs in the app. The advertiser's own Branch/AppsFlyer setup handles any app-to-app attribution on their side.
- Offerwall SDKs such as BitLabs, Tapjoy or Pollfish are probably a poor fit. They are third-party code that collects data, Apple holds the developer responsible for it (see Q3), and survey/offerwall content would weaken the brand.

### Gaps
- No verified data from primary sources on Partnerize, TradeDoubler, Rakuten (actual threshold), FlexOffers sign-up requirements, Kashkick, Tapjoy, Pollfish, Bankrate, Lendflow or Fiona. Not researched because of the tool-call budget.
- No verified publisher-support or partnerships contact channels were collected. Contacts should be taken from each network's help centre directly; none are listed here to avoid guessing.
- Whether each network accepts app-only publishers with no website was not confirmed on primary pages.
- MoneyLion corporate status: it was reportedly acquired in 2025 (not verified in this session). Check that Engine's partner programme still runs as described.

## 2. Apple App Store Review Guidelines: exact text relevant to affiliate/rewards unlocks

### Takeaway
Making "Pro free if you open a bank account" (or sign up to any partner) risks rejection. Guideline 3.1.1 requires in-app purchase to unlock features. Guideline 3.1.4 explicitly says you "may not… require users to… engage in advertising or marketing activities to unlock app functionality". Guideline 3.2.2(x) only blesses incentives for actions *within* apps. The safer design is to make Pro free for everyone and present partner offers as optional, separate deals that unlock nothing. Earning affiliate commission on physical goods and services bought outside the app is allowed under 3.1.3(e).

### Cited Findings
All quotes are from [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), fetched 2026-10-02. The page showed no explicit last-updated date. The 3.1.3 text includes the post-2025 "except for apps on the United States storefront" wording, which shows it is the current version.
- **3.1.1**: "If you want to unlock features or functionality within your app, (by way of example: subscriptions, in-game currencies, game levels, access to premium content, or unlocking a full version), you must use in-app purchase. Apps may not use their own mechanisms to unlock content or functionality, such as license keys, augmented reality markers, QR codes, cryptocurrencies and cryptocurrency wallets, etc."
- **3.1.1**: "Digital gift cards, certificates, vouchers, and coupons which can be redeemed for digital goods or services can only be sold in your app using in-app purchase."
- **3.1.3 (intro)**: "Apps in this section cannot, within the app, encourage users to use a purchasing method other than in-app purchase, except for apps on the United States storefront and as set forth in 3.1.1(a) and 3.1.3(a). Developers can send communications outside of the app to their user base about purchasing methods other than in-app purchase."
- **3.1.3(e) Goods and Services Outside of the App**: "If your app enables people to purchase physical goods or services that will be consumed outside of the app, you must use purchase methods other than in-app purchase to collect those payments, such as Apple Pay or traditional credit card entry." (This covers affiliate referrals to insurance, fuel cards, banking and similar services.)
- **3.1.4 Hardware-Specific Content**: "…You may not, however, require users to purchase unrelated products or engage in advertising or marketing activities to unlock app functionality."
- **3.2.1(viii)**: "Apps used for financial trading, investing, or money management should be submitted by the financial institution performing such services and must have necessary licensing and permissions in the locations where you make them available."
- **3.2.2(iii)** (unacceptable): "Artificially increasing the number of impressions or click-throughs of ads, as well as apps that are designed predominantly for the display of ads."
- **3.2.2(ix)**: "Apps offering personal loans must clearly and conspicuously disclose all loan terms, including but not limited to equivalent maximum Annual Percentage Rate (APR) and payment due date. Loan apps may not charge a maximum APR higher than 36%, including costs and fees, and may not require repayment in full in 60 days or less."
- **3.2.2(x)**: "Apps must not force users to rate the app, review the app, download other apps, or other store-related actions in order to access functionality, content, or use of the app. Apps may otherwise incentivize users to take specific actions within apps (e.g. completing a level, watching an ad)."
- **5.1.1**: "Paid functionality must not be dependent on or require a user to grant access to this data."
- **5.1.2(i)**: "You must clearly disclose where personal data will be shared with third parties, including with third-party AI, and obtain explicit permission before doing so. Data collected from apps may only be shared with third parties to improve the app or serve advertising… You must receive explicit permission from users via the App Tracking Transparency APIs to track their activity. Your app may not require users to enable system functionalities (e.g. push notifications, location services, tracking) in order to access functionality, content, use the app, or receive monetary or other compensation, including but not limited to gift cards and codes."
- **4.2**: "If your app is not particularly useful, unique, or 'app-like,' it doesn't belong on the App Store."

### Inferences
- "Unlock Pro by signing up to partner X" falls into the "engage in… marketing activities to unlock app functionality" wording of 3.1.4 and bypasses IAP (3.1.1). It also goes beyond the "within apps" incentives that 3.2.2(x) allows. Rejection risk is high.
- Lower-risk models:
  - Pro is free for everyone, and partner offers are optional with cash or partner-side rewards paid by the partner.
  - Pro stays an IAP subscription, and partner offers are a separate "Deals" tab.
- 3.2.2(iii) means the app must not become "predominantly for the display of ads". The mileage tracker has to stay the core.
- If loan offers are shown, 3.2.2(ix) disclosure rules apply. MileSprout is not a "money management" app run by a financial institution, so avoid features that could be read as such under 3.2.1(viii) (for example account aggregation).
- 5.1.2(i) bars making any reward depend on granting ATT/tracking permission.

### Gaps
- No Apple statement was found that specifically addresses affiliate commissions from in-app links. Apple's silence plus 3.1.3(e) suggests referrals for physical/real-world services are allowed, but this is an inference.
- The exact revision date of the guidelines was not shown on the page.

## 3. Privacy-preserving attribution and ATT

### Takeaway
Apple defines tracking as linking your app's user/device data with other companies' data *for targeted advertising or advertising measurement*, or sharing it with data brokers. A plain outbound affiliate link carrying a network click ID, with no user identifier, email or IDFA sent by MileSprout and no third-party SDK in the app, does not obviously fit that definition. Apple does not address this case explicitly, though, so it remains a judgement call. SKAdNetwork/AdAttributionKit measure ad-driven *installs into* apps and are irrelevant to outbound referrals.

### Cited Findings
- Apple: "Tracking refers to the act of linking user or device data collected from your app with user or device data collected from other companies' apps, websites, or offline properties for targeted advertising or advertising measurement purposes. Tracking also refers to sharing user or device data with data brokers." — [Apple User Privacy and Data Use](https://developer.apple.com/app-store/user-privacy-and-data-use/)
- Apple's examples of tracking include "Placing a third-party SDK in your app that combines user data from your app with user data from other developers' apps to target advertising or measure advertising efficiency, even if you don't use the SDK for these purposes." — [same](https://developer.apple.com/app-store/user-privacy-and-data-use/)
- Not tracking: "When user or device data from your app is linked to third-party data solely on the user's device and is not sent off the device in a way that can identify the user or device." — [same](https://developer.apple.com/app-store/user-privacy-and-data-use/)
- On SDKs, Apple's FAQ says developers are responsible: "Yes. Developers are responsible for all code included in their apps." Third-party SDK practices must be described in privacy manifests. — [same](https://developer.apple.com/app-store/user-privacy-and-data-use/)
- Apple positions AdAttributionKit as the tool "to attribute in-app ad campaigns and web ads on mobile, while maintaining user privacy". It is for measuring ads, not for outbound affiliate links. — [same](https://developer.apple.com/app-store/user-privacy-and-data-use/)
- CJ's loyalty model uses "essential cookies" to identify the consumer for cashback. That identification happens in the browser on the network's domain after the click. — [CJ Loyalty Exemption](https://junction.cj.com/en-gb/article/cjs-loyalty-exemption-solution-addresses-a-critical-industry-challenge)

### Inferences
- Privacy-preserving pattern: generate a random, single-use sub-ID (for example Impact's SubId or Awin's clickref) on device, append it to the outbound link, and store it only on device. The network's report/postback returns the sub-ID with a conversion status. The app can then match it locally or via a stateless lookup with no account, and nothing identifies the user to MileSprout or to the partner beyond what the partner collects itself at sign-up.
- If a user-level reward is needed (for example "you earned £X"), a no-account design is hard. Options:
  - Show a voucher/promo code from the partner.
  - Have the partner pay the reward directly to the user (common in fintech referral offers).
  - Accept aggregate-only revenue and no per-user rewards.
- Passing hashed emails or IDFA to networks would be tracking under Apple's definition and would need an ATT prompt. Avoid both.
- App Privacy "nutrition label": if the link carries only a random click ID and no user data is collected, MileSprout may be able to keep "Data Not Collected". Confirm this against Apple's App Privacy definitions.

### Gaps
- No Apple text explicitly states whether an outbound link with a click ID requires ATT. The conclusion above is inferred from the definition.
- Network-side postback mechanics (Impact/Awin server-to-server publisher postbacks) were not verified because the docs were blocked.

## 4. What advertisers want from a publisher app; first-deal structures

### Takeaway
Little primary-source material was gathered here. The verified point is that advertisers control whether incentivised/loyalty publishers are allowed, through their programme terms ("Promotional Methods"). Niche apps therefore start on networks, where they are approved or declined advertiser by advertiser, and pitch direct deals once they have conversion data.

### Cited Findings
- On CJ, advertisers list disallowed publisher models in programme terms, and cashback/loyalty participation is set per advertiser. — [Junction by CJ](https://junction.cj.com/article/tag/topic-promotional-methods)
- Finance and insurance affiliate deals are mostly flat CPA per approved lead or funded product. Aggregators cite $20–$200 per lead, with loans and mortgages up to $300 (low-quality aggregator data, treat as indicative). — [dollarpocket benchmarks 2026](https://www.dollarpocket.com/affiliate-marketing-benchmarks-2026/); [affninja commission rates 2026](https://affninja.com/affiliate-commission-rates-niche/)
- Example fintech CPA: MoneyLion $80 per funded loan (snippet). — [FlexOffers](https://www.flexoffers.com/affiliate-programs/moneylion-affiliate-program/)

### Inferences
- Typical early structure is CPA through a network. Hybrid deals (CPA plus a flat placement fee) and sponsorships usually need proven volume.
- A media kit should show monthly active users by country, driver segment (couriers vs rideshare), offer click-through and conversion data, and the privacy stance. The privacy stance is a selling point for brand safety.

### Gaps
- No primary sources for minimum audience thresholds, media-kit expectations, exclusivity norms or approval timelines. Treat these as unverified.

## 5. Gig platforms' driver-perk programmes

### Takeaway
Uber, DoorDash, Amazon Flex and Deliveroo all run perk marketplaces stocked by brand partners: fuel, car maintenance, tax tools, telecoms. DoorDash lists Everlance (a mileage tracker) as a partner, which shows that mileage/tax apps can get in. No public "apply to be a perk partner" route was found for third-party apps. These programmes are mainly a list of advertisers MileSprout could approach directly or via networks.

### Cited Findings
- **Uber Pro (US)**: fuel savings via the Uber Pro Card, Upside (up to $1.00/gal by tier) and Shell Fuel Rewards (up to 21¢/gal), valid through 30 June 2026. Partners named include Costco, Shell, ExxonMobil, CarAdvise and Evolve Bank. Diamond/Platinum/Gold drivers get EVgo charging discounts and ASU tuition. — [Uber newsroom: gas savings 2026](https://www.uber.com/us/en/newsroom/us-gas-price-relief-2026/); [Uber Pro page](https://www.uber.com/us/en/drive/uber-pro/?id=2); [Uber Pro programme terms](https://www.uber.com/us/en/legal/uber-pro-program-terms/)
- **DoorDash**: Dasher Rewards tiers are Silver, Gold and Platinum. Partner discounts include CarAdvise, Maaco, GasBuddy, Shell Fuel Rewards, Everlance, TurboTax and Zoomo. DoorDash Crimson is a banking account/card with up to 3% back on gas. — [DoorDash Help: Dasher Deals](https://help.doordash.com/en-us/dashers/article/dasher-deals); [DoorDash: Making the dashing experience even better](https://about.doordash.com/en-us/news/making-the-dashing-experience-even-better); [TripLog explainer (third party)](https://www.triplog.net/blog/doordash-dasher-rewards-explained)
- **Deliveroo (UK)**: rider perks include Caffè Nero, Pizza Express, Shell (4p/litre), Three mobile, OpenClassrooms and Blys massages. Riders get access after their first order. In Singapore Deliveroo uses BenefitHub for 200+ discounts. — [Deliveroo UK rider perks](https://rider.deliveroo.co.uk/perks); [Blys x Deliveroo](https://getblys.com/uk/blog/blys-partners-with-deliveroo-to-launch-exclusive-rider-perks/); [Marketing-Interactive (SG)](https://www.marketing-interactive.com/deliveroo-sg-lures-riders-benefits-brands)
- **Amazon Flex Rewards (US)**: Flex debit card cash back (up to 6% on fuel in earlier coverage, 2020, older), "thousands of discounts", insurance and tax tools, and promotions such as $125 off Goodyear tyres (May 2025). — [Amazon Flex Rewards discounts](https://flex.amazon.com/amazonflexrewards/discounts); [Flex blog May 2025](https://flex.amazon.com/blog/2025/delivery-partners-can-save-more-on-tires-from-may1-to-may31-2025); [CNBC 2020 (older)](https://www.cnbc.com/2020/11/06/amazon-rewards-program-makes-it-easier-for-drivers-to-get-more-work.html)

### Inferences
- The partner lists double as an advertiser target list, because these brands have already decided to pay for gig-driver audiences: Upside, GasBuddy, Shell Fuel Rewards, CarAdvise, TurboTax, Zoomo, Three and Blys.
- Everlance's presence in DoorDash Dasher Deals shows that platform partnership is possible for a mileage app. However, Everlance is an established competitor, so platforms may not take a second one.
- Cross-promoting the platforms' own perks in MileSprout earns nothing unless those brands have affiliate programmes. Several do (for example Upside and GasBuddy run referral programmes), but this was not verified.

### Gaps
- Just Eat courier perks were not researched.
- No published application process for becoming an Uber/DoorDash/Deliveroo perk partner was found.
- No business partnership contacts were collected.

## 6. Benchmarks: revenue per user and in-app offer conversion

### Takeaway
Only low-quality aggregator benchmarks were found. They put finance/insurance affiliate conversion at roughly 4–8% and EPC at about $0.40 to $2.80. No credible public figure for revenue per MAU of fintech comparison apps was found.

### Cited Findings
- "Financial services affiliate programs average a 4.2% conversion rate for lead generation offers"; finance/insurance at 4–8% vs 1–3% for ecommerce; financial services EPC averages $2.80, while another source gives finance/investing an EPC of $0.40 with "good" at $1.00+ (conflicting figures from aggregator blogs whose methodology was not disclosed). — [wecantrack 2026](https://wecantrack.com/insights/affiliate-program-performance-statistics/); [dollarpocket 2026](https://www.dollarpocket.com/affiliate-marketing-benchmarks-2026/); [GrowSurf 2026](https://growsurf.com/statistics/affiliate-program-benchmarks/)
- Unbounce publishes landing-page conversion benchmarks for finance and insurance (landing pages, not in-app offers). — [Unbounce](https://unbounce.com/conversion-benchmark-report/finance-insurance-conversion-rate/)

### Inferences
- Illustrative only, built from the unverified figures above: 10,000 MAU × 5% who click an offer each month × 5% conversion × $50 CPA ≈ $1,250/month, or about $0.12 per MAU per month. Real results depend heavily on the offer mix (insurance and banking CPAs are much higher than fuel apps).

### Gaps
- No reliable primary data on revenue per MAU for comparison or fintech apps (for example from public filings of NerdWallet or MoneySuperMarket). Not researched in this session.
- No benchmark for conversion of in-app (as opposed to web) affiliate offers.
