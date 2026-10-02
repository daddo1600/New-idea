# Pitch panel: Head of Partnerships, UK business-account fintech (simulated)

> **Simulated persona.** This is a fictional panellist: Head of Partnerships at an unnamed UK e-money institution offering business accounts to sole traders. It is not a real person or company. Every CPA, volume, rate or timeline below is **this persona's working assumption** for discussion, not a market statistic and not a quote. None of this is legal advice.
>
> **Reviewed (2 Oct 2026):** the 13 deck slides (cover, audience, problem, how, demo, pricing, control, audit, basket, habit, privacy, review, pilot), the Perks screenshots (`milemint/docs/screenshots/perks/`), the iOS store screenshots (`milemint/assets/store/ios/`), and the UK money and compliance sections of `reports/Rewards partners for MileSprout.md`.

---

## In character: my candid take

"Your product looks good, and your audience is the one I most want: sole traders and couriers who are about to deal with Making Tax Digital and need somewhere to keep their tax money. Your Money tab already works out a weekly tax set-aside. That is the best reason in this whole deck for someone like me to be here, and the deck never mentions it.

But this deck is written for a coffee shop manager. The first line promises to 'bring working drivers through your door', and the deck keeps going back to the till. I don't have a till. I don't pay for visits. I pay for **customers who pass KYC, fund the account and use it**, and I can only count those through my affiliate network, in my own systems. A single-use code typed 'online' is one line on the How slide, and nothing after that explains how an online partner works.

The things that would get this past my compliance team aren't in the deck: who approves the copy, how the offer is labelled as an ad, whether MileSprout rewards the user for signing up, and how you stop the money-mule recruiters who go after gig workers. And when I open your App Store screenshots, the privacy one says '**No ads.**' A Perks tab full of paid offers is advertising. If my brand sits in an app whose store listing says there are no ads, that's a misleading-context problem I can't sign off.

So: I'm interested in the audience, I can't buy from this deck, and I'd give you a small test on the network. Come back with an online variant."

---

## 1. Does the deck work for an online or financial partner?

**No. It's built around the till from start to finish.** Every value claim assumes a physical visit:

- **Pay per redeemed visit** (cover, pricing, how). My trigger is not a redemption. It's an approved, funded and active account, confirmed days or weeks later.
- **30-minute window, sites, days and hours, quiet times** (control). These don't apply to an account application. KYC alone can take longer than 30 minutes.
- **Basket insight, upsell and extra spend** (basket, review). These don't apply. My equivalent is activation and how long the customer stays.
- **'Your till's count and ours' monthly match-up** (audit). I will never reconcile against MileSprout's code count. The affiliate network's tracked, validated conversions are the record, and that's not up for negotiation.
- **'Become their stop'** (habit). Doesn't apply. I want them to open one account, once.

**What I'd need: an "Online and financial partners" variant.** Either a separate 8-slide deck, or a 4-slide insert that replaces how, control, audit and basket when you present to online partners.

| Insert slide | What it must show |
|---|---|
| **online-how** | Driver taps the offer, which is labelled "Ad", and sees the partner's own approved copy. "Continue" opens a plain outbound **Awin or Impact tracking link with a random on-device clickref/SubId**. The partner's onboarding and KYC happen outside the app. The network records the conversion, the partner validates it, and the network pays. Say clearly: no partner SDK in the app, and no PII from MileSprout. |
| **online-compliance** | Partner-supplied creative only, approved before it goes live. Every placement labelled "Ad". Dated archive of every version. Partner can pull an offer within 24 hours. A statement on incentives: either "MileSprout gives the user nothing for signing up; any welcome bonus is the partner's own", or full disclosure of whatever reward exists. Perks unlock nothing in the app (Apple 3.1.4), and Pro is not tied to signing up for anything. |
| **online-quality** | The funnel you'll report, with conversion steps owned by the partner: offer views, outbound clicks, then (from the network) applications, approvals, funded, active at day 30/60/90. Fraud controls: no incentivised posting on deal or voucher sites, no paid search on brand terms, no sub-affiliates, and clawback accepted. |
| **online-fit** | Why this audience needs this product now: MTD, the tax set-aside in the Money tab, keeping business and personal money apart. Contextual placement rules: where the offer appears, and where it never appears (for example, not as a pop-up on the tax figure). |

---

## 2. Slide-by-slide notes

| Slide | Note from my seat |
|---|---|
| **cover** | "Through your door" and "walk in" tell me in five seconds that this isn't for me. For the online variant, change the headline to something like "Reach working drivers when they set up their business money", with "Pay on the outcome you define" as the subhead. The yellow and green look reads as consumer, not finance, which is fine for a consumer partner and doesn't bother me. |
| **audience** | Good segments. Naming Deliveroo, Uber Eats, Just Eat, Amazon Flex, Evri and DPD as if they were your channels is a brand-safety flag for me. Write "drivers who work for platforms such as…" or remove the names, unless you have permission. **`[__ drivers using MileSprout by __]` is the most important number in the deck, and it's blank.** I understand why before launch, but give me a plan: launch date, target installs, how you'll acquire users, and the share who are sole traders versus PAYE drivers. |
| **problem** | It's a high-street marketing problem. Mine is different: affiliate traffic from cashback and voucher sites gives me low-quality, incentivised sign-ups that never fund. Write the problem for the online variant around that. |
| **how** | Step 3 says "typed in online" and then step 4 says "Only codes used in store count". That contradicts itself for online. The online flow needs its own diagram (see insert above). |
| **demo** | The screens are clean, and the "Demo offers, these partners are examples" banner is honest. Keep it. There's no online offer in the demo: no "Open account" card and no outbound tap. Add one mocked card for a fictional bank with an "Ad" label and a "Continue to [partner]" step. Note that "Mark as used" is a demo stand-in; for me, a code should never be self-marked. |
| **pricing** | "[£__] per visit" is a one-line model, which works for retail. For online, pay is the network CPA on a defined conversion event, with a validation period and clawback. Also say plainly whether MileSprout's fee comes through the network or as a direct invoice. I'd want it through the network. |
| **control** | Caps and pause are useful to me too: a monthly cap on paid conversions and a 24-hour kill switch. The 30-minute window and "one per person" don't help me, because I de-duplicate customers at KYC. Your speaker note admits site and hour targeting isn't confirmed, so don't show it as a feature yet. |
| **audit** | "The scan checks the code with MileSprout" is fine for shops. For me, the network is the record. Put that in writing in the variant, or my finance team will assume you'll invoice me against your own counts. "Spot checks: drivers confirm 'I used it'" is not evidence I'd accept. |
| **basket** | Not relevant. Replace it with the funnel and quality view. |
| **habit** | Not relevant. The online equivalent is "right moment": MTD deadlines and starting self-employment. Handle it carefully, because deadline-driven urgency aimed at people who may be stretched is a Consumer Duty risk. |
| **privacy** | Strong and believable. But it has to be accurate for online: once a driver opens an account with me, **I** hold their name and details, and I'll know they came via MileSprout. Say "MileSprout shares nothing about you; if you sign up with a partner, that partner's privacy policy applies". Without that, "You never get names" becomes a misleading claim for online partners. |
| **review** | The tiles fit retail. For me: clicks, applications, approval rate, funded rate, 30/60/90-day activity, fraud reversals, effective CPA. Most of these come from my side through the network, so frame it as "we review your network data together". |
| **pilot** | Three months, capped, stop any time: that's the right shape. But `[Founder name] · [email] · milesprout.app`, with a note saying the domain isn't live yet, will end the meeting in fintech. I need a company name, a registered address, a working domain with a privacy page and a "how we earn" page, and a named person before onboarding starts. |

---

## 3. Top 5 objections and what would satisfy me

1. **Financial promotion and Consumer Duty compliance.** E-money business accounts aren't controlled investments, so s21 approval isn't the issue. But our copy must still be clear, fair and not misleading. We're responsible for what our affiliates say. Under Consumer Duty we have to show good consumer understanding and avoid foreseeable harm, including to vulnerable customers, and we treat sole traders as in scope for that. Risks I can see: the "No ads" store copy next to paid offers; any wording that suggests FSCS protection; anything that reads as MileSprout *recommending* an account (it's next to tax figures, which looks like advice); urgency messaging around deadlines.
   **What would satisfy me:** a written publisher agreement that uses only our creative and gets our sign-off before anything goes live (and again before any edit). Every placement labelled "Ad". "No ads" removed from the store listing. A dated archive of everything shown, shared with me monthly. Offers never shown as pop-ups or inside the tax figures. A 24-hour takedown commitment.

2. **Tracking and attribution: your codes vs. my network.** I pay on what Awin or Impact tracks and I validate, under our last-click and de-duplication rules. MileSprout's own single-use codes can't be my source of truth. Promo codes on my side also leak to voucher sites and get attributed to whoever ranks for "[brand] promo code".
   **What would satisfy me:** an outbound tracking link with an on-device clickref, which your research already describes, and no SDK. If you want a code as well, it should be one *we* issue as a unique code tied to your publisher ID. No "MileSprout invoices from its own count".

3. **Fraud and sign-up quality.** Account-opening incentives aimed at gig workers attract money-mule recruiters and multi-account abuse. Your app has no user account, so "one per person" is really one per device, and that resets on reinstall. Incentivised traffic usually converts to *funded* worse than organic.
   **What would satisfy me:** you declare honestly whether MileSprout rewards users (my working assumption: a "Pro free" funded by partners is fine as long as no user reward depends on signing up). No posting on deal or voucher sites, no brand bidding, no sub-affiliates. You accept a validation window and clawback for fraud or accounts closed by us. A named contact who responds within a set time when we raise a quality flag.

4. **Audience size and certainty.** Launching October 2026 with a blank user count means I'm buying a promise. I can join you on the network at zero fixed cost, but bespoke rates, featured placement or co-marketing need proof.
   **What would satisfy me:** a written plan with launch installs, monthly active users, the share who are self-employed versus PAYE, and the acquisition channels. Then 60–90 days of real network data before we discuss bespoke terms.

5. **Brand safety and adjacency.** Fictional examples are fine, but who else is in the Perks tab? I won't sit next to credit, gambling, crypto, "get paid early" products or anything predatory aimed at couriers. Naming the gig platforms without permission also worries me. And the "make Pro free from partner revenue" story must not turn into "open this account to unlock Pro". Apple guideline 3.1.4 aside, that's an inducement my compliance team wouldn't accept.
   **What would satisfy me:** a published category policy (what you will and won't carry), category exclusivity or at least no direct competitor in the same view during the pilot, and a written statement that Perks unlock nothing.

---

## 4. Terms I'd expect (persona assumptions, not market data)

| Term | My working position |
|---|---|
| **Route** | Through our existing Awin or Impact programme as a standard app publisher first. A bespoke direct deal comes only after the test. |
| **Conversion event** | **Funded and active**: KYC approved, first deposit above a set minimum, and a minimum number of card or payment transactions within 30–60 days. No CPL or pay-per-click. |
| **CPA during the test** | Our standard network rate. As an illustrative assumption, roughly **£25–£50 per funded and active account**. If your traffic counts as "incentivised" or "loyalty", expect a **lower tier**, so classify yourself honestly. |
| **CPA after proven quality** | Possibly **£50–£100+** for a bespoke tier if the 90-day activity rate beats our affiliate average. That's an assumption about what I could take to my CFO, not an offer. |
| **Minimum volumes** | No minimum on the open programme. For a bespoke rate or featured placement, I'd want a credible forecast of around **50–100+ funded accounts a month** within three months, and the right to cap at, say, **200 a month** while we watch quality. |
| **Validation and payment** | 30–90 day validation, monthly network payout, clawback for fraud, duplicates and accounts we close in the first 90 days. |
| **Copy approval** | Our approved creative library only. Any new or changed copy, including a one-word edit, goes through our financial-promotions review with a stated turnaround (assume **5–10 working days**). Annual re-approval. We monitor your placements (screenshots, mystery-shopping your app). Material changes need re-approval. |
| **Prohibited** | Brand bidding, voucher or cashback sites, sub-affiliates, comparative claims ("best", "free banking" without conditions), FSCS implications, urgency tied to tax deadlines, any link between signing up and unlocking app features. |
| **Contract** | Publisher terms plus a short side letter covering placement, labelling, takedown, data (none shared beyond the network click ID), and a 30-day no-fault exit. |

---

## 5. Brand and visual credibility

- **App screens: strong.** Clean, plain-English and honest ("This code has nothing about you in it"). The demo-offers banner is the right kind of candour, and the HMRC-rate and MTD screens make the product feel serious. That's the best evidence in the deck.
- **Deck look: consumer-retail.** Bright green, yellow call-to-action and big friendly headlines suit a café owner. For a fintech they're fine but not reassuring. Credibility for me comes from substance (company details, policy pages, compliance process), not colour.
- **Credibility gaps that hurt:** a placeholder founder name and email, a domain that isn't live, blank audience numbers, platform logos named without permission, "No ads" in the store set against a paid Perks tab, and fictional brand names ("Kerbside Fuel") with no real partner yet. Any one of these alone is forgivable pre-launch. Together they'll fail our due-diligence checklist.
- **Name and app:** "MileSprout" reads friendly and trustworthy. Nothing about the brand would embarrass us.

---

## 6. Scores and decision

| Measure | Score | Why |
|---|---|---|
| **Clarity** | **8/10 for retail, 4/10 for me** | The till model is clear. The online model is barely there. |
| **Credibility** | **4/10** | Good product. Placeholders, no company details, no domain, no users yet, and a conflicting "No ads" claim. |
| **Commercial appeal** | **5/10** | The right audience at the right moment (MTD, sole traders, tax set-aside), but unknown scale and unproven quality. |

**Would I partner?** **Not on a bespoke deal from this deck.** **Yes to a low-risk test:** I'd approve MileSprout as a publisher on our existing network programme at the standard rate once it has a live domain, a company identity and a corrected store listing, with our creative only, an "Ad" label, a monthly cap and 90 days' review. Bespoke CPA and featured placement can be discussed after that, based on our funded and active data.

---

## 7. The five deck changes with the most impact (for financial and online partners)

1. **Build the online variant.** Replace how, control, audit and basket with online-how, online-compliance, online-quality and online-fit. The trigger is the partner's network-tracked, funded and active conversion, not a code redemption.
2. **Add a compliance and labelling slide, and fix the store copy.** Partner creative only, approval before going live, "Ad" labels, a dated archive, 24-hour takedown, and "Perks unlock nothing". Remove "No ads" from the store screenshots (06-privacy), or reword it to something like "No tracking ads. Partner offers are labelled", and make the privacy slide accurate for sign-ups.
3. **Lead with the contextual fit.** One slide that connects the Money tab's tax set-aside and MTD quarters to the need for a separate business account, with the placement rules that keep it from reading as advice.
4. **Fill in or replace every placeholder with real plans.** Company name, named founder, working domain with privacy and "how we earn" pages, launch installs and self-employed share (marked as targets), and a category and brand-safety policy. Drop or soften the gig-platform names.
5. **Show quality and fraud controls with numbers to agree.** The funnel you'll report alongside network data, the incentive policy, no voucher sites, brand bidding or sub-affiliates, accepted clawback, and an illustrative test ask: "standard network CPA, cap of [__] funded accounts a month, 90-day review".
