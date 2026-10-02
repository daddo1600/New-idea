# Invite-a-friend reward panel (simulated, n=60)

*2 Oct 2026. **This is a simulated panel, not user research.** The 60 personas are model-generated, and their scores come from a seeded, rule-based generator (scratchpad `invite/sim.py`): each persona has a sharing habit, a driver network size, a preferred channel, and interest in the tax set-aside pot, in status perks, in causes and in paying for Pro. The rules turn those traits into scores for each variant, and a little deterministic noise is added. The quotes are invented, written to match each segment. **The results show the generator's assumptions, not drivers' behaviour.** Use them to rank the options, and test the winner with real users before trusting any number.*

Inputs: `BRAND.md`, `14-launch-campaign.md`, `launch-playbook.md`, `uk-competitors-pricing.md`, `ui-panel-milemint-mileclear-mileiq.md`, the three `communities-*.md` notes and `milesprout-brand-brief.md`. The app is called **Milesprout** below (the working name). Prices: Pro £49.99/yr (1-month trial) or £5.99/mo; US $49.99/yr or $5.99/mo.

## Summary

| Variant | Share intent (1–5) | Friends sent, month 1 (stated) | Friend installs (1–5) | Friend pays in year 1 (1–5) | Net year-1 revenue per 1,000 free users | k (12 months) |
|---|---|---|---|---|---|---|
| A: +10 drives each (control) | 2.0 | 0.2 | 2.2 | 2.6 | **£28** | 0.01 |
| **B: friend 50% off; inviter gets non-report perks + sprout garden** | 3.4 | 2.7 | 3.2 | 3.4 | **£183** | **0.10** |
| C: B + a real tree per friend | 3.4 | 2.8 | 3.4 | 3.4 | £190 (after ~£51 of trees) | 0.12 |
| D: 1 month Pro free each (leaky) | **3.8** | **3.6** | **3.8** | **2.0** | **−£607** | **0.21** |
| E: friend 50% off; inviter 20% off renewal per friend who *joins* | 2.9 | 1.8 | 3.3 | 3.4 | **−£237** | 0.06 |
| **F: B + 20% off renewal per friend who *goes Pro* (founder's request)** | 3.4 | 2.8 | 3.2 | **3.5** | **£176** | 0.11 |

Scores are averages over all 60 personas. "Friends sent" is the mean that the 54 drivers and trades people *say* they'd send. The funnel model halves it. Revenue is at customer prices, before VAT and Apple's 15% (multiply by about 0.71 for proceeds).

**Recommendation: launch B with four tweaks (§6), and add F's renewal discount as phase 2,** once the CloudKit referral build and a small signing function exist.
- **D** gets the most sharing and installs, but the free Pro month is spent on the year-end report and then cancelled. It loses money.
- **E** pays inviters for *joins*. Joins are cheap to fake, so E loses money and is the easiest to game.
- **F** fixes E by rewarding only friends who *pay*. That makes it self-funding and almost impossible to game. It earns about the same as B in year 1, because free users, who are most inviters, don't value a renewal discount. Its benefit is giving paying power users a reason to share.
- **Trees: no** (§8).

---

## 1. The panel

60 personas:
- 24 UK couriers, including 3 Brazilian, 3 Polish, 2 Romanian and 4 South Asian riders who live in WhatsApp groups;
- 11 US drivers (3 Spanish speakers);
- 5 in Canada and 5 in Australia;
- 8 trades people and reps;
- 3 group admins: a Brazilian motoboys WhatsApp community (~900 members), a Polish couriers UK Facebook group (~1,800) and a Brampton Punjabi drivers WhatsApp group (~450);
- 2 accountants, a growth marketer and a subscription-finance analyst.

The panel includes sceptics (Dan, Derek, Owen) and people who never share apps (Brian, Karen, Nathan).

Every persona answered twice:
- **as an inviter:** share intent 1–5, how many friends they'd send it to in month 1, and where;
- **as a friend who got the link:** how likely they'd be to install (1–5) and to pay for Pro in year 1 (1–5).

### Persona-level results

Share intent is shown for every variant. The other columns are for B, D and F, the variants that matter most for the decision.

| # | Persona | Segment | Share A | B | C | D | E | F | Friends sent B / D / F | Where (F) | Friend install (F) | Friend pay (F) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Kwame 34, Uber Eats + Deliveroo car, Leeds | UK courier | 2 | 4 | 3 | 4 | 4 | 4 | 4 / 4 / 4 | 1:1 | 3 | 4 |
| 2 | Sophie 27, Deliveroo car, nights, Bristol | UK courier | 2 | 4 | 3 | 4 | 3 | 4 | 4 / 4 / 4 | 1:1 | 3 | 4 |
| 3 | Imran 41, Uber + Stuart car, Birmingham | UK courier | 2 | 4 | 3 | 4 | 4 | 4 | 4 / 4 / 4 | WA group | 3 | 4 |
| 4 | Jordan 22, Deliveroo e-bike, London | UK courier | 2 | 4 | 4 | 4 | 3 | 3 | 4 / 4 / 2 | 1:1 | 3 | 2 |
| 5 | Tiago 29, Brazilian, Deliveroo moped, London | UK courier | 3 | 5 | 5 | 5 | 4 | 4 | 7 / 7 / 4 | WA group | 4 | 3 |
| 6 | Rafaela 33, Brazilian, Uber Eats moped, Croydon | UK courier | 3 | 4 | 5 | 5 | 4 | 4 | 4 / 7 / 5 | WA group | 5 | 4 |
| 7 | Lucas 31, Brazilian, Amazon Flex van, Birmingham | UK courier | 2 | 4 | 4 | 4 | 3 | 4 | 4 / 4 / 4 | WA group | 3 | 4 |
| 8 | Gary 52, Amazon Flex van, Swindon | UK courier | 2 | 3 | 2 | 3 | 2 | 2 | 2 / 2 / 0 | not at all | 3 | 4 |
| 9 | Aneta 38, Polish, Evri van, Coventry | UK courier | 2 | 4 | 4 | 4 | 3 | 4 | 4 / 4 / 4 | FB group | 4 | 4 |
| 10 | Pawel 44, Polish, Amazon Flex, Northampton | UK courier | 2 | 4 | 3 | 4 | 3 | 4 | 4 / 4 / 4 | FB group | 3 | 4 |
| 11 | Tomasz 29, Polish, Uber Eats moped, Edinburgh | UK courier | 2 | 4 | 3 | 4 | 3 | 3 | 4 / 4 / 2 | WA group | 3 | 3 |
| 12 | Mihai 31, Romanian, Deliveroo car, Manchester | UK courier | 2 | 4 | 3 | 4 | 3 | 4 | 4 / 4 / 4 | WA group | 3 | 3 |
| 13 | Ionela 36, Romanian, Evri round, Peterborough | UK courier | 3 | 4 | 5 | 5 | 4 | 5 | 4 / 7 / 7 | WA group | 4 | 4 |
| 14 | Rahim 45, Bengali, Uber Eats car, East London | UK courier | 2 | 4 | 4 | 4 | 3 | 4 | 4 / 4 / 4 | WA group | 4 | 4 |
| 15 | Jaswinder 50, Punjabi, Amazon Flex van, Southall | UK courier | 2 | 3 | 4 | 4 | 3 | 3 | 2 / 4 / 2 | WA group | 4 | 4 |
| 16 | Bilal 28, Pakistani, Uber Eats + Just Eat car, Bradford | UK courier | 3 | 4 | 4 | 5 | 3 | 4 | 5 / 8 / 4 | WA group | 3 | 3 |
| 17 | Priyanka 26, Indian student, Deliveroo bike, Leicester | UK courier | 2 | 3 | 3 | 4 | 3 | 3 | 2 / 4 / 2 | WA group | 3 | 2 |
| 18 | Kemi 37, Deliveroo + Uber nights, London | UK courier | 2 | 3 | 4 | 4 | 3 | 4 | 2 / 4 / 4 | 1:1 | 3 | 4 |
| 19 | Dan 30, Just Eat + Uber Eats car, Glasgow (sceptic: 'referrals are spam') | UK courier | 1 | 2 | 1 | 2 | 1 | 1 | 0 / 0 / 0 | not at all | 2 | 3 |
| 20 | Maureen 61, rural Evri round | UK courier | 1 | 3 | 3 | 3 | 2 | 2 | 2 / 2 / 0 | not at all | 3 | 3 |
| 21 | Brian 67, part-time courier, never shares apps | UK courier | 1 | 1 | 2 | 2 | 1 | 1 | 0 / 0 / 0 | not at all | 2 | 3 |
| 22 | Lee 40, DPD owner-driver, Bristol | UK courier | 1 | 3 | 3 | 3 | 3 | 3 | 1 / 1 / 1 | 1:1 | 3 | 5 |
| 23 | Chloe 24, Uber Eats car, Cardiff, Instagram | UK courier | 2 | 3 | 4 | 4 | 3 | 4 | 2 / 4 / 4 | 1:1 | 3 | 3 |
| 24 | Arjun 33, Uber PHV driver, London | UK courier | 2 | 3 | 4 | 4 | 4 | 4 | 2 / 4 / 4 | WA group | 3 | 5 |
| 25 | Marcus 30, DoorDash, Atlanta | US driver | 2 | 3 | 3 | 4 | 3 | 3 | 2 / 4 / 2 | 1:1 | 3 | 3 |
| 26 | Linda 56, Instacart, Ohio | US driver | 2 | 4 | 3 | 4 | 3 | 3 | 4 / 4 / 2 | FB group | 3 | 4 |
| 27 | Tom 42, teacher, DoorDash weekends, Texas | US driver | 1 | 3 | 2 | 3 | 2 | 2 | 2 / 2 / 0 | not at all | 3 | 3 |
| 28 | Lupe 35, Spanish-speaking, DoorDash, Los Angeles | US driver | 2 | 4 | 4 | 5 | 3 | 4 | 5 / 7 / 4 | WA group | 4 | 3 |
| 29 | Carlos 41, Spanish-speaking, Uber, Miami | US driver | 2 | 4 | 3 | 4 | 3 | 4 | 4 / 4 / 4 | WA group | 3 | 4 |
| 30 | Rosa 38, Spanish-speaking, Uber Eats, Houston | US driver | 2 | 3 | 4 | 4 | 3 | 3 | 2 / 4 / 2 | FB group | 3 | 3 |
| 31 | Derek 45, full-time Uber, Phoenix, Reddit sceptic | US driver | 1 | 1 | 1 | 2 | 1 | 1 | 0 / 0 / 0 | not at all | 2 | 4 |
| 32 | Aisha 29, Lyft + DoorDash, Chicago | US driver | 2 | 3 | 4 | 4 | 3 | 4 | 2 / 4 / 4 | 1:1 | 3 | 4 |
| 33 | Mike 63, retired, Spark Driver, Florida | US driver | 2 | 3 | 3 | 3 | 3 | 4 | 2 / 2 / 4 | FB group | 3 | 2 |
| 34 | Jenny 34, Amazon Flex, Seattle | US driver | 2 | 3 | 4 | 4 | 3 | 4 | 2 / 4 / 4 | 1:1 | 3 | 4 |
| 35 | Kevin 27, Chinese-American, e-bike delivery, NYC | US driver | 2 | 3 | 2 | 3 | 2 | 3 | 2 / 2 / 2 | WA group | 3 | 2 |
| 36 | Hardeep 39, Punjabi, Skip + Uber, Brampton | Canada | 2 | 4 | 5 | 5 | 4 | 4 | 4 / 7 / 4 | WA group | 4 | 4 |
| 37 | Emilie 26, Skip, Montreal | Canada | 2 | 4 | 4 | 4 | 3 | 4 | 4 / 4 / 4 | 1:1 | 3 | 3 |
| 38 | Mandeep 31, Punjabi, Uber Eats, Surrey BC | Canada | 2 | 4 | 3 | 4 | 3 | 3 | 4 / 4 / 2 | WA group | 4 | 4 |
| 39 | Jason 37, Uber, Calgary | Canada | 1 | 3 | 3 | 3 | 2 | 3 | 2 / 2 / 2 | 1:1 | 3 | 3 |
| 40 | Chen 30, Fantuan + DoorDash, Vancouver | Canada | 2 | 3 | 2 | 3 | 2 | 3 | 2 / 1 / 2 | WeChat | 3 | 2 |
| 41 | Sujan 23, Nepali student, e-bike, Sydney | Australia | 2 | 3 | 3 | 4 | 3 | 3 | 2 / 4 / 2 | WA group | 3 | 2 |
| 42 | Ankit 25, Indian student, DoorDash car, Melbourne | Australia | 2 | 4 | 3 | 4 | 3 | 4 | 4 / 4 / 4 | WA group | 3 | 3 |
| 43 | Bruna 28, Brazilian, Uber Eats moped, Brisbane | Australia | 3 | 4 | 4 | 5 | 4 | 4 | 5 / 7 / 4 | WA group | 4 | 3 |
| 44 | Shane 46, Uber + tradie side work, Perth | Australia | 2 | 2 | 3 | 3 | 3 | 3 | 0 / 2 / 2 | 1:1 | 3 | 4 |
| 45 | Mei 32, HungryPanda + Uber Eats, Melbourne | Australia | 1 | 3 | 3 | 3 | 2 | 3 | 2 / 2 / 2 | WeChat | 3 | 3 |
| 46 | Dave 47, electrician, Kent | Trades/reps | 1 | 3 | 3 | 3 | 2 | 3 | 2 / 1 / 2 | 1:1 | 3 | 3 |
| 47 | Priya 35, mobile hairdresser, Reading | Trades/reps | 2 | 3 | 4 | 4 | 3 | 4 | 2 / 4 / 4 | 1:1 | 3 | 4 |
| 48 | Grace 44, care worker, Nottingham | Trades/reps | 2 | 3 | 4 | 4 | 3 | 4 | 2 / 4 / 4 | WA group | 3 | 3 |
| 49 | Steve 52, plumber, Leeds | Trades/reps | 2 | 3 | 2 | 3 | 3 | 3 | 2 / 2 / 1 | 1:1 | 3 | 4 |
| 50 | Karen 39, medical sales rep (employee), Surrey | Trades/reps | 2 | 2 | 3 | 3 | 2 | 2 | 0 / 2 / 0 | not at all | 3 | 2 |
| 51 | Olu 41, runs a 3-van cleaning firm, London | Trades/reps | 2 | 4 | 4 | 4 | 3 | 4 | 4 / 4 / 4 | WA group | 3 | 4 |
| 52 | Hannah 33, mobile dog groomer, Devon | Trades/reps | 2 | 3 | 4 | 3 | 3 | 3 | 2 / 2 / 2 | FB group | 3 | 4 |
| 53 | Nathan 29, estate agent, own car, Manchester | Trades/reps | 1 | 2 | 2 | 3 | 2 | 2 | 0 / 2 / 0 | not at all | 3 | 3 |
| 54 | Admin: Joao 36, runs 'Motoboys Londres' WhatsApp community, ~900 members | Group admin | 4 | 5 | 5 | 5 | 4 | 5 | 1 / 1 / 1 | WA group | 4 | 4 |
| 55 | Admin: Agnieszka 42, runs Polish couriers UK Facebook group, ~1,800 members | Group admin | 4 | 5 | 5 | 5 | 4 | 5 | 1 / 1 / 1 | FB group | 4 | 4 |
| 56 | Admin: Gurpreet 47, runs Brampton Punjabi drivers WhatsApp group, ~450 members | Group admin | 3 | 5 | 5 | 5 | 5 | 5 | 1 / 1 / 1 | WA group | 4 | 4 |
| 57 | Helen 49, ACCA, 40 courier clients, Midlands | Accountant | 2 | 4 | 4 | 3 | 3 | 3 | 15 / 5 / 5 | email/1:1 | 4 | 3 |
| 58 | Maria 51, Spanish-speaking enrolled agent, 120 gig clients, Texas | Accountant | 2 | 3 | 3 | 3 | 3 | 3 | 5 / 5 / 5 | email/1:1 | 4 | 4 |
| 59 | Nina 38, growth marketer (ex-fintech referral programmes) | Growth marketer | 2 | 3 | 3 | 4 | 3 | 4 | 0 / 0 / 0 | - | 3 | 4 |
| 60 | Owen 44, subscription-finance analyst | Finance analyst | 1 | 2 | 2 | 3 | 2 | 2 | 0 / 0 / 0 | not at all | 3 | 4 |

Group admins' "friends sent" means **one group post**, which reaches hundreds of members. Accountants' figure is the number of clients they'd pass it to.

## 2. Results by variant

### 2.1 Inviter, friend and fairness scores (all 60)

| Variant | Share intent | Say they'd send ≥1 in month 1 (drivers) | Friend install | Friend pay Y1 | Fair (1–5) | Gimmicky (1–5, high = bad) | On-brand (1–5) |
|---|---|---|---|---|---|---|---|
| A | 1.98 | 9% | 2.23 | 2.63 | 2.0 | 3.9 | 1.8 |
| B | 3.37 | 89% | 3.23 | 3.37 | 4.1 | 2.2 | **4.3** |
| C | 3.37 | 83% | 3.40 | 3.42 | 3.8 | 2.8 | 3.7 |
| D | 3.77 | 94% | 3.80 | 2.02 | **4.3** | 1.9 | 3.0 |
| E | 2.92 | 75% | 3.32 | 3.37 | 3.4 | 2.9 | 3.0 |
| F | 3.38 | 85% | 3.22 | 3.45 | 4.0 | 2.4 | 4.0 |

"Say they'd send" is stated intent, and it is wildly optimistic: real share rates for referral programmes run at about 5–15% of users (§4). The model below uses deflated figures.

### 2.2 By segment (share / install / pay, 1–5)

| Segment (n) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|
| UK couriers (24) | 2.0 / 2.2 / 2.7 | 3.5 / 3.2 / 3.5 | 3.5 / 3.2 / 3.5 | 3.9 / 3.7 / 2.2 | 3.0 / 3.2 / 3.6 | 3.4 / 3.2 / 3.6 |
| US drivers (11) | 1.8 / 2.0 / 2.4 | 3.1 / 3.1 / 3.2 | 3.0 / 3.2 / 3.3 | 3.6 / 3.7 / 1.5 | 2.6 / 3.2 / 3.1 | 3.2 / 3.0 / 3.3 |
| Canada (5) | 1.8 / 2.4 / 2.6 | 3.6 / 3.4 / 3.6 | 3.4 / 3.8 / 3.4 | 3.8 / 4.0 / 2.0 | 2.8 / 3.6 / 3.4 | 3.4 / 3.4 / 3.2 |
| Australia (5) | 2.0 / 2.2 / 2.0 | 3.2 / 3.4 / 2.8 | 3.2 / 3.2 / 2.8 | 3.8 / 3.8 / 1.6 | 3.0 / 3.4 / 3.0 | 3.4 / 3.2 / 3.0 |
| Trades and reps (8) | 1.8 / 2.0 / 2.9 | 2.9 / 3.0 / 3.4 | 3.2 / 3.4 / 3.6 | 3.4 / 3.4 / 2.2 | 2.6 / 3.0 / 3.1 | 3.1 / 3.0 / 3.4 |
| Group admins (3) | 3.7 / 3.0 / 3.0 | **5.0** / 4.0 / 3.7 | 5.0 / 4.7 / 3.3 | 5.0 / 5.0 / 2.0 | 4.3 / 4.3 / 3.3 | **5.0** / 4.0 / **4.0** |
| Accountants (2) | 2.0 / 3.0 / 3.0 | 3.5 / 4.0 / 3.0 | 3.5 / 4.0 / 4.0 | 3.0 / 5.0 / 2.5 | 3.0 / 4.0 / 3.5 | 3.0 / 4.0 / 3.5 |

### 2.3 Where people would share (54 drivers and trades people)

| Variant | WhatsApp group | 1:1 (WhatsApp/SMS) | Facebook group | WeChat | Not at all |
|---|---|---|---|---|---|
| A | 5 | 0 | 0 | 0 | **48** |
| B | 22 | 17 | 6 | 2 | 6 |
| C | 21 | 16 | 6 | 1 | 9 |
| D | 22 | 20 | 6 | 2 | 3 |
| E | 21 | 13 | 6 | 0 | 13 |
| F | 22 | 15 | 6 | 2 | 8 |

**WhatsApp is the channel.** Groups lead for the Brazilian, Polish, Romanian, South Asian, Spanish-speaking, Nepali and Indian personas. 1:1 messages lead for native-English couriers and trades. Facebook groups matter for the Polish, US Instacart and Spark, and pet/trades personas. Nobody picked Reddit, which fits the community notes ("never post referral links in driver subs"). Chinese-speaking couriers (Chen, Mei) would only share on WeChat, so the share sheet must not assume WhatsApp.

### 2.4 Abuse and gaming risk

| Variant | Fake accounts | Tax-time timing | Family devices / second Apple Accounts | Code leaking to deal sites | Overall |
|---|---|---|---|---|---|
| A | Low value, so low effort | None | Possible, worthless | n/a | **Low** (nobody wants it) |
| B | Inviter perks need a friend on a *different* iCloud account with 3 real automatic drives. A spare phone works, but the prize is only a pot, an icon and a badge | None: no report is ever given away | Possible for perks, harmless | **Yes**, if the friend offer is one shared custom code (HotUKDeals, Slickdeals, OzBargain) | **Low–medium** (code leakage is the real cost) |
| C | As B. A tree per join also invites "farm joins for trees" posts | None | As B | As B | Low–medium |
| D | **High.** A free Pro month is worth £5.99 and is exactly what people want in January | **Severe.** Invite a partner the week before 31 Jan, export the year, cancel. Repeat each year with a new "friend" | **Severe.** The family iPad, a partner's phone | n/a | **High** |
| E | **High.** Each fake join is worth £10 off a renewal, and 5 joins give a free year, which is the report | Medium | **High.** 5 family Apple Accounts = a free year | As B | **High** |
| F | **Negligible.** A friend counts only when they *pay*; a fake friend pays £24.99 to earn the inviter £10 | Low | Paying family members do count, but each one is £24.99 of real revenue | As B | **Low** |

### 2.5 Representative quotes (all simulated)

**UK couriers**
- A: "Ten more drives? It's already unlimited. That's a reward for nothing." (Kwame)
- B: "Half off for my mate, and I get the tax pot. I'd put that in the zone group, yeah." (Bilal)
- B: "A gold icon? I'm 52. Give me something that does a job." (Gary, who still shared once for the set-aside pot)
- D: "Free month each? I'd send it to my brother in December, do my report, cancel. Everyone would." (Imran)
- E: "20% off a renewal I haven't bought yet. It's a coupon for a coupon." (Mihai)
- F: "If my friends pay, I pay less. Fair. They have to actually want it, not just download it." (Arjun, a Pro user)
- Sceptic: "I don't send referral links. It's spam, and my mates know it." (Dan, all variants)

**Brazilian, Polish, Romanian and South Asian WhatsApp riders**
- "In our group, if it's a discount for *them*, I can post it. If it's only for me, people think I'm selling." (Tiago, B 5/5)
- "Polish version, half price, no account. I'd pin that." (Aneta)
- "A tree is nice, but I drive a moped all day. People will laugh." (Rafaela, who still rated C 5/5 because "it's kind")
- "My uncle and cousins all do Flex. Free month for everyone? I'd send it to ten." (Jaswinder, D)

**US drivers (including Spanish speakers)**
- "Fifty percent off the IRS log, from a friend? I'd send it to my cousins doing Uber." (Lupe, in Spanish)
- "Every app has a referral code. I can't tell a real one from a scam in these groups." (Rosa, about Facebook groups where accounts are sold)
- "If there's a link, it's an ad. Show me the export first." (Derek, Reddit sceptic)

**Canada and Australia**
- "Brampton groups will share anything that saves money at tax time. Put it in Punjabi." (Hardeep)
- "Students don't pay for Pro. The discount means nothing to me, but my friend with a car would use it." (Sujan)

**Trades and reps**
- "I'd tell the other lad on the job, once. Not a group." (Steve)
- "I don't claim mileage myself, my employer pays it. Nothing here's for me." (Karen)

**Group admins (super-sharers)**
- "I pin it if it helps members. Fifty percent for them is perfect. Give me the badge and early features so I look like I know something." (João, B/F 5/5)
- "Free months everyone would love, but in January I'd get 200 messages asking how to cancel." (Agnieszka, on D)
- "Can I have a group code instead of one link per person?" (Gurpreet)

**Accountants**
- "B is clean: clients pay less, the log is proper, nothing's free that shouldn't be. Give me my own code so I can see who came from me." (Helen)
- "D looks generous until a client turns up with a log they can't re-export after cancelling." (Maria)

**Growth marketer (Nina)**
- "Double-sided with a clear gift to the friend is the pattern that works (Dropbox, Uber, Monzo). Put the money on the friend's side; inviters share to look good. Your inviter perks just need to *feel* earned. The sprout garden is the right idea. Time-box a founding boost."

**Subscription-finance analyst (Owen)**
- "Anything that hands over Pro without a payment is a refund of your one revenue moment. D and E's free year both do that. F is fine: every discount is paid for by a paid conversion. Watch the 50% code: a leaked custom code is a permanent price cut."

---

## 3. Variant F: does counting only friends who go Pro change things?

**Yes, on both money and gaming.**

| | E (per friend who joins) | F (per friend who pays) |
|---|---|---|
| What earns 20% off | An install plus 3 drives | A friend's paid Pro purchase (after the 50% offer) |
| Friends credited per inviter (model) | 0.48 joined | 0.06 paid |
| Renewal-discount cost per 1,000 free users | **~£380** (incl. gaming) | **~£40** |
| Revenue each credited friend brings | £0 (a join earns nothing) | £24.99 (their first year) |
| Cost per credited friend | £10 | £10, **paid for 2.5× over by the friend** |
| Fake-account economics | 5 fake joins = a free year (≈£50) for no outlay | 5 fake "friends" cost £125 to save £50: pointless |
| Can a stateless server check it? | **No.** No Apple-signed proof of a "join" exists, so the client could lie | **Yes.** A friend's purchase is an Apple-signed transaction (see §7) |
| Inviter motivation | Higher on paper, but free users don't care | Weaker and slower: friends pay at report time (Jan–Apr), so the discount arrives months later |
| Net year-1, per 1,000 | −£237 | **£176** (B: £183) |

**Why F doesn't beat B in year 1:** the inviters are mostly *free* users (the model assumes 35% of sharers are or will become payers), and a renewal discount means nothing to someone who doesn't renew. F's renewal discounts cost about £40 a year, and its slightly higher friend conversion (inviters nudge friends to go Pro) almost makes that back. Where F helps is with power users, accountants' clients and admins who already pay: it gives them a reason to share that B doesn't.
- **Show it as "Grow your own discount":** "2 friends joined · 1 went Pro → 20% off your next year."
- **Display the cap** ("up to 100%: a free year at 5 Pro friends"). It's a strong claim and cheap, because 5 paying friends bring £125.

---

## 4. Funnel model: 1,000 active free users over 12 months

### Benchmarks used (with sources)

| Benchmark | Figure | Source |
|---|---|---|
| Dropbox (double-sided, free storage) | Referrals gave a permanent ~60% lift in sign-ups and ~35% of daily sign-ups at peak; 100k to 4M users in 15 months | Secondary write-ups: [GrowSurf](https://growsurf.com/blog/dropbox-referral-program/), [Referral Rock](https://referralrock.com/blog/dropbox-referral-program/) |
| Monzo / Revolut (UK fintech) | ~2/3 of new customers by word of mouth (Monzo FY2025: 67%); Revolut ~63–65% organic or referral | [Financial IT on Monzo](https://financialit.net/news/banking/monzo-tops-13-million-customers-back-record-growth-word-mouth-referrals-and-surge), [insights4vc on Revolut](https://insights4vc.substack.com/p/revolut-6b-revenue-70m-customers), [Viral Loops on Revolut](https://viral-loops.com/revolut-referral-marketing-case-study) |
| Uber | Two-sided (free first ride + inviter credit); faster market starts where referral came before paid ads | [vmobify guide](https://vmobify.com/blog/mobile-app-referral-program) (secondary, weak) |
| Share rate (users who share) | Healthy 5–9%; top quartile ~4.6%+ and top decile ~13% "share action" rate (ecommerce data) | [ReferralCandy benchmarks](https://www.referralcandy.com/blog/referral-program-benchmarks-whats-a-good-conversion-rate-in-2025/), [GrowSurf statistics](https://growsurf.com/statistics/referral-marketing-statistics/) (search summaries; page fetch blocked) |
| Referred-friend conversion | Consumer apps: 20–35% of referred visitors convert; referred customers retain ~37% better | [GrowSurf statistics](https://growsurf.com/statistics/referral-marketing-statistics/), [theonrep](https://www.theonrep.com/blog/referral-program-benchmarks-conversion-rates/) |
| Viral coefficient (k) | SaaS typical 0.15–0.25; consumer apps 0.2–0.4 without a programme, 0.5–0.8 claimed with a good one (blog claim; treat the upper end as optimistic) | [First Round glossary](https://review.firstround.com/glossary/k-factor-virality/), [LaunchList k-factor guide](https://getlaunchlist.com/blog/viral-coefficient-k-factor-guide) |
| Who should get the reward | Rewards aimed at the friend recruit as well as or better than inviter-only rewards; inviters gain from looking generous | [Baylor Keller Center](https://kellercenter.hankamer.baylor.edu/news/story/2020/earning-effective-referrals-right-incentives), [impact.com](https://impact.com/referral/better-referral-rewards-recipient-incentives/) |
| Rewards can backfire | For innovative products, a referral reward can make the inviter look self-interested and reduce referrals | [Journal of the Academy of Marketing Science (Springer)](https://link.springer.com/article/10.1007/s11747-019-00635-z) |
| Freemium download → paid | ~2–3% by day 35, top quartile 4–6% | RevenueCat 2025/26, via `launch-playbook.md` §6 |
| Apple offer codes | One-time-use (18-digit) or custom codes; up to 1M redemptions per app per quarter; one code per customer per offer; eligibility can include new, active or expired subscribers | [App Store Connect Help](https://developer.apple.com/help/app-store-connect/manage-subscriptions/set-up-subscription-offer-codes), [Apple: custom offer codes](https://developer.apple.com/news/?id=9sjl5wuv) |

### Assumptions

1. **Who actually shares in 12 months,** by stated intent: 1 → 1%, 2 → 4%, 3 → 12%, 4 → 28%, 5 → 45%. This is calibrated so B lands near the top of the 5–15% benchmark band (B comes out at 18%, a "with good in-app moments" case).
2. **Invites per sharer:** the friends they *say* they'd send among people with intent 3 or more, × 0.5 (people send half what they say), × 1.6 for 12 months (launch plus a tax-time wave).
3. **Installs per 1:1 invite,** by the friend's install score: 1 → 3%, 2 → 10%, 3 → 22%, 4 → 38%, 5 → 55%. Then × 0.75, because not every recipient drives for work. That gives 19–26% for B to D, inside the 20–35% benchmark.
4. **Group admins:** 2 per 1,000 users, with 600-member groups. A pinned post converts 1.2% of members, scaled by the variant's install score.
5. **Paying in year 1** among referred installs, by pay score: 1 → 1%, 2 → 3%, 3 → 7%, 4 → 14%, 5 → 24%. That gives about 10% for B and F (a referred-user lift over the 2–5% freemium baseline) and 4% for D.
6. **Revenue per full-price payer** in year 1: £41 (55% annual at £49.99; 45% monthly for about 5 months at £5.99). With the friend offer: £24.99, and 85% of referred payers use it.
7. **Revenue lost** (each assumption is the model's):
   - **Cannibalisation:** 25% of referred payers would have found the app and paid full price anyway.
   - **Code leak (B, C, E, F):** a shared custom code reaches deal sites, and 8% of the 50 organic payers per 1,000 use it.
   - **D:** 60% of sharers earn at least one free month. 20% of those would have paid, and 60% of *those* now use the free month for the report and cancel. Separately, 10% of organic payers time a family "friend" invite.
   - **E:** 35% of sharers are payers and 60% renew inside the year. The discount is 20% per joined friend (payer-sharers bring 1.3× the average), plus 15% of paying sharers gaming 5 joins.
   - **F:** as E, but per friend who pays, with 1% gaming.
   - **C:** £0.60 per tree for each friend who "joins" (70% of installs).
8. **k** = installs from invites ÷ 1,000, first generation only. The campaign doc's target (0.3 within 2 months) uses a different window.

### Results per 1,000 active free users, 12 months

| | A | B | C | D | E | F |
|---|---|---|---|---|---|---|
| Users who share | 42 | 182 | 188 | 244 | 123 | 191 |
| Invites sent (1:1 + group posts) | 67 | 450 | 498 | 737 | 236 | 496 |
| Installs from invites | 11 | 102 | 122 | 210 | 59 | 109 |
| …of which from group admins | 5 | 14 | 15 | 16 | 11 | 14 |
| Paying conversions (year 1) | 0.7 | 10.3 | 12.7 | 7.7 | 5.9 | 11.6 |
| Year-1 revenue gained (collected) | £28 | £282 | £349 | £317 | £163 | £318 |
| Friend discount given (vs list; *not* a loss on new payers) | £0 | £140 | £173 | £0 | £81 | £158 |
| Revenue lost: cannibalised + code leak | £0 | £99 | £107 | £0 | £84 | £104 |
| Revenue lost: Pro leaks (free months, renewal discounts, gaming) | £0 | £0 | £0 | **£924** | **£316** | **£38** |
| Trees | — | — | £51 | — | — | — |
| **Net year-1 revenue** | **£28** | **£183** | **£190** | **−£607** | **−£237** | **£176** |
| **k** | 0.01 | **0.10** | 0.12 | 0.21 | 0.06 | 0.11 |

**Sensitivity:** if the share and install assumptions are 40% lower, B's k is about 0.05; if they're 50% higher, about 0.2. D's range is roughly 0.1–0.4, and its net stays negative across that range, because its losses grow with sharing.

**How to read it:**
- At 1,000 users, referral revenue is small in pounds. The value is in **installs, which cost nothing, and payers who renew.** B's 10 referred payers bring about £280 more in year 2 (55% renew at £49.99), and the free installs add tracking users who pay later.
- **D is the only variant that clearly moves k,** and it does so by giving away the one thing people pay for.
- B and F sit at roughly a third of the campaign's k target of 0.3. **Referral alone won't carry the launch.** Group admins, accountants and content still have to do the heavy lifting (`launch-playbook.md`).

---

## 5. The expert view: B now, F next

**Why B:**
- It's the only variant that is **generous, on-brand and leak-free at once.** The money goes to the friend, which is what makes WhatsApp sharing socially safe ("it's a discount for *them*").
- No inviter perk touches the report.
- Gaming is pointless.
- It needs no server: an App Store offer code plus the CloudKit claim records already designed in `milemint/modules/referral-cloud/README.md`.

**Why not D:** it has the best scores and the worst economics. It recreates TripLog's "free pass at report time" and turns it into an annual cancel ritual.

**Why not E:** it rewards joins, which are cheap to fake and impossible to verify statelessly, and the reward means nothing to free users.

**F** is the honest version of the founder's "E" instinct. Add it once the signing function exists (§7).

## 6. Tweaks to B

1. **Make the friend's 50% work at report time, not install time.**
   - The friend enters the invite code at welcome, or it is filled in from the link.
   - The Pro screen then shows "**Your friend's gift: Pro for £24.99 for your first year**" for 12 months.
   - Redeeming an offer code starts the subscription, so it must happen when they choose Pro, through the in-app offer-code sheet.
   - Use "pay up front, 1 year at £24.99 / $24.99" on the annual plan.
   - Check in App Store Connect how this interacts with the 1-month trial. One offer applies per purchase, so the friend most likely chooses either the trial or the half-price year. Say so plainly.
2. **Stop the code leaking.**
   - Start with one **custom code**, with eligibility set to new subscribers, a redemption cap and a quarterly expiry, and rotate it.
   - Once CloudKit claims are live, switch to **one-time-use codes**, given out only after the friend's claim qualifies (3 real automatic drives on a different iCloud account).
   - Watch HotUKDeals, Slickdeals and OzBargain.
3. **Swap the 3-friend reward.**
   - Practical personas (Gary, Lee, Steve, Shane) ignored cosmetics. Make 3 friends unlock **Earnings by platform** (a Pro view, not the report), as well as the gold icon and gold leaves.
   - Ladder: **1 → Tax set-aside, forever · 3 → Earnings by platform + gold sprout icon · 5 → Founding driver badge + early access.**
4. **Founding boost, time-limited.**
   - Until 31 Jan 2027, or the first 1,000 founding inviters, whichever comes first, perks unlock at **1 / 2 / 3** friends instead of 1 / 3 / 5.
   - Show it on the card: "Founding season: rewards at half the friends."
   - **Don't** raise the friend discount above 50%: it's the costliest lever and already strong.
5. **Group admins and accountants get codes, outside the in-app ladder.**
   - A named custom code per admin and per accountant (`ct=` campaign link as well), so they can post one link to a group.
   - Thank them by hand: the ambassador "free Pro for an active one who brings in 25 drivers" from `14-launch-campaign.md`.
   - Admins asked for this directly.
6. **Prompt at the right moments only:** milestone celebrations, the missed-miles card and right after a report export (a happy payer). Never during tax-deadline stress, and never more than once a fortnight.
7. **Localise the share message** into all 10 app languages, and put WeChat and SMS in the share sheet next to WhatsApp.

### Share message copy (under 300 characters)

The link is a placeholder: the name and domain are pending clearance.

**UK (256 characters):**
> I log my work miles with Milesprout. It tracks every drive by itself, free, no account. HMRC now allows 55p a mile, so it adds up. When you need the HMRC report, my link gets you Pro half price for your first year (£24.99): https://milesprout.app/i/TRVB7K2

**US (263 characters):**
> I track my work miles with Milesprout. It logs every drive by itself, free, no account. The IRS rate is 76¢ a mile, so it adds up fast. When you need your IRS mileage log, my link gets you 50% off Pro for your first year ($24.99): https://milesprout.app/i/TRVB7K2

Notes:
- Both lead with what's free, so the discount reads as a gift, not a sales pitch.
- Update the rate lines when the 2027 rates are announced.
- For F, add the inviter-side line in the app, not in the message.
- Per Apple's rules, the Pro screen must state that Pro renews at the normal price after the first year.

### Share card headline options

One gold word each (BRAND.md):
1. "Every mile grows your **claim**." (the tagline; safest)
2. "From one driver to **another**: Pro at half price."
3. "My sprout garden is **growing**." (with the sprouts and "3 drivers joined")
4. "Uber only sees Uber. This sees every **mile**." (couriers; text-only platform names)
5. "Plant your first **sprout**." (the friend's landing view)

Avoid "little" and "tiny", and anything that looks like a Brussels sprout (brand brief).

### Risks

- **Offer-code leakage** turns 50% into a public price cut. Mitigate with caps, rotation, then one-time codes.
- **Cannibalisation:** some referred payers would have paid full price. Track referred payers who already had the app (claims older than 30 days are refused).
- **Apple rules:**
  - rewards stay in the app, with no cash;
  - never reward reviews;
  - disclose that the subscription auto-renews;
  - don't name competitors on the store page.
- **Privacy label:** CloudKit claims and any signing call must not make the label "Data collected". Keep both anonymous and without logs (§7).
- **Spam reputation in groups:** driver groups are full of account-rental and referral spam (US community notes). The admin-code route and a message that leads with "free" reduce this.
- **k stays well below 1.** Plan acquisition as if referrals add 10–20%, not as if they do the job.
- **The perk ladder costs some Pro value** (set-aside and earnings are given free to sharers). That's acceptable, because people pay for the report.

## 7. E and F: the signing service

Apple **promotional offers** (the "20% off your next renewal" mechanism) need a signature made with the developer's In-App Purchase key. That has to happen off the phone, because a key shipped in the app could be extracted.

**What to build:**
- One stateless function (e.g. a Cloudflare Worker or similar) holding the .p8 key as a secret.
- The app sends the inviter's credited friends as **Apple-signed transaction JWSs**. The friend's purchase sets `appAccountToken` to a UUID derived from the inviter's code.
- The function checks Apple's signature chain, the product, the matching token and distinct `originalTransactionId`s.
- It then returns a signature for the right offer: 20/40/60/80/100%, five offers, inside Apple's per-subscription limit.
- It stores nothing and keeps no logs.

This only works for **F**. E's "joins" have no Apple-signed proof, so a stateless signer would have to trust the phone.

**Effort:** about 3–5 developer days, on top of the CloudKit referral build:
- the function and its secret;
- StoreKit 2 promotional-offer purchase;
- creating 5 offers per subscription in App Store Connect;
- testing in the sandbox.

**Risks:**
- If the key leaks, anyone could sign any offer. Rotate the key and use a dedicated one.
- If the service is down, the app shows "discount ready, try again later".
- Refunded friend purchases still count, which costs little.
- Promotional-offer eligibility rules have historically targeted current or lapsed subscribers; that fits F, since only payers benefit, but check the current rules.
- The App Store label must stay "Data not collected": a transaction ID passed through without being stored should qualify, but confirm against Apple's definition before shipping.

## 8. Tree planting: no

- **It doesn't earn its place.**
  - In the simulation it adds about 0.02 to k and roughly £7 net per 1,000 users (+£58 of conversions, −£51 of trees). That's inside the noise.
  - It raised "gimmicky" from 2.2 to 2.8 and lowered on-brand from 4.3 to 3.7.
- **It invites mockery.** Couriers drive all day, and "a tree for a car app" drew greenwashing jokes from sceptics.
- **It's a claim we'd have to prove.** BRAND.md says no unprovable claims, so we'd need partner certificates and audits.
- **It's a cost per join that fake joins can farm.**
- The founder has already dropped it. If an environmental angle is ever wanted, use a one-off, honest donation, not a per-referral reward.

---

*Simulated personas and a rule-based model. These are directional, not evidence. Before building, show B's share card and message to 8–10 real couriers (at least 3 in WhatsApp groups, 1 admin). After launch, track share rate, claims, qualified claims, offer redemptions and referred payers weekly (`14-launch-campaign.md` §6).*
