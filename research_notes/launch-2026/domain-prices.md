# MileSprout domain prices: cheapest way to register (UK sole founder)

Checked: **2026-10-02**. Prices only. **Domain availability is unverified.** No registrar search pages, baskets or accounts were used. See `milesprout-check-3-domains-social-language.md` for how to check availability safely.

## How this was checked (read first)

- **Every registrar page was blocked by the network egress proxy.** That covers porkbun.com, namecheap.com, spaceship.com, dynadot.com, cloudflare.com (and developers.cloudflare.com), ionos.co.uk, 123-reg.co.uk, ventraip.com.au, crazydomains, cira.ca, auda.org.au, tld-list.com, tldes.com and 365i.co.uk. WebFetch and curl both failed.
- Every price below therefore comes from **web-search result snippets**. Those snippets quote either the registrar's own page or a price-tracker page (tld-list, tldspy, domainoffer, domainnameservices.net and similar). **Treat every figure as [secondary source, flagged]** and confirm it on the registrar's price list before you pay. Where two sources disagree, both figures are given.
- **Currency.** Rates on 2026-10-02 were **£1 = US$1.32**, **A$1 = £0.5254** and **C$1 = £0.5295** ([Trading Economics GBP/USD](https://tradingeconomics.com/united-kingdom/currency), [OFX AUD/GBP](https://www.ofx.com/en-us/exchange-rates/aud-to-gbp/), [OFX CAD/GBP](https://www.ofx.com/en-us/exchange-rates/cad-to-gbp/)). Registrars that bill in USD will drift with the exchange rate.
- **VAT.** UK registrars (IONOS, 123-reg) quote prices without VAT. A sole trader who is not VAT-registered pays the extra 20%, and it has been added to IONOS prices below. Whether US registrars (Cloudflare, Porkbun, Namecheap, Spaceship, Dynadot) add UK VAT at checkout was **not confirmed**. If one does, multiply its figures by 1.2.
- **.com price rise.** Verisign's wholesale .com fee goes from **$10.26 to $10.97 on 1 Nov 2026**, and further annual rises of about 7% are expected up to 2030 ([OSIR](https://osir.com/en/blog/verisign-com-price-update-2026/), [DomainSmoke](https://www.domainsmoke.com/blog/verisign-raises-com-prices-again-effective-november-1)). A .com bought in October 2026 gets the old first-year price, but **every .com renewal below already uses the higher price**.

## Eligibility and technical blockers

| TLD | Rule | Can a UK sole trader register it? |
|---|---|---|
| .com, getmilesprout.com | Open to anyone | **Yes** |
| .app | Open to anyone, but the whole TLD is on the browser **HSTS preload list**. Browsers force HTTPS, so the site **will not load without a valid TLS certificate** ([Google Registry .app](https://www.registry.google/domains/app/), [Wikipedia](https://en.wikipedia.org/wiki/.app_(top-level_domain))). This is fine with Cloudflare, Vercel, Netlify or Let's Encrypt, but **never point it at a plain-HTTP parking page**. | **Yes** |
| .co.uk, .uk | Open to anyone with an accurate address. Nominet hides individual registrants' details by default, so no privacy add-on is needed. | **Yes** |
| .ca | CIRA **Canadian Presence Requirements**. A non-Canadian qualifies only as the **owner of a trade mark *registered* in Canada** (with CIPO, under the Trademarks Act). The domain must contain the exact word part of that mark, and a copy of the registration is required ([CIRA CPR](https://www.cira.ca/en/resources/documents/domains/canadian-presence-requirements-registrants/), [CanReg summary](https://www.canreg.com/cira_canadian_presence_requirements.html)). A UK trade mark does not count, and from the wording a pending application does not count either. | **No, blocked** until a Canadian trade mark for MILESPROUT is *registered*, which usually takes a long time (timing unverified). Alternatively, form or partner with a Canadian entity. |
| .com.au | auDA **Australian presence** rule. A foreign registrant can qualify as the **applicant for, or owner of, an Australian trade mark**, but only for a domain that is an **exact match** of the trade-mark words ([auDA explainer](https://www.auda.org.au/news-insights/blog/comau-and-netau-rule-changes-explained-using-trade-mark-meet-australian-presence-requirement/), [auDA Licensing Rules](https://www.auda.org.au/au-domain-names/au-rules-and-policies/au-domain-administration-rules-licensing-2/)). Without that you need an ABN or ACN. | **No, blocked** until you **file** an IP Australia trade-mark application for "MILESPROUT". The application alone is enough, so this is quicker than .ca. Fee not checked. |

**Bottom line: 5 of the 7 domains can be registered today.** Those are milesprout.com, getmilesprout.com, milesprout.app, milesprout.co.uk and milesprout.uk. Treat .ca and .com.au as later purchases that depend on the trade marks.

## Registrar notes that matter

- **Cloudflare Registrar** sells at cost (wholesale plus the ICANN fee, no markup) with free WHOIS privacy. It supports **.com, .app, .co.uk, .uk and .ca**. .ca support began rolling out on 26 Jul 2025 ([Cloudflare Community](https://community.cloudflare.com/t/ca-domain-is-it-available-now/820491), [Cloudflare .ca page](https://www.cloudflare.com/application-services/products/registrar/buy-ca-domains/)). It does **not** support **.com.au or .au** ([Cloudflare Community](https://community.cloudflare.com/t/com-au-domains-still-not-supported-by-cloudflare/555520)).
  - **Gotcha:** you **must use Cloudflare's nameservers**. To use other DNS you would have to transfer the domain away (Domain Registration Agreement §6.1, per [Cloudflare Community](https://community.cloudflare.com/t/change-nameservers-when-cloudflare-is-my-registrar/240975)).
  - There are no promo prices, so year 1 costs the same as later years.
- **Porkbun** includes free WHOIS privacy and an SSL certificate. It supports **all 7 TLDs**, .com.au included. It is CIRA-certified for .ca. First-year "sale" prices apply to several TLDs.
- **Spaceship** (sister company of Namecheap) includes free WHOIS privacy. It supports .com, .app, .co.uk, .uk and .ca. **.com.au support was not confirmed.**
  - Its $10.18 .com renewal is below the new wholesale cost, so **expect it to rise after 1 Nov 2026**. The plans below assume about $10.89, which is $10.18 plus the $0.71 Verisign increase. That figure is an assumption.
- **Namecheap** includes free WHOIS privacy but has big renewal jumps (.com $18.48, .app $22.98). Sources disagree on whether it still sells .com.au.
- **Dynadot** charges a flat price for registration, renewal and transfer on .com (single-tier pricing since 2025) and includes free WHOIS privacy. Its .com.au price was not found.
- **Squarespace Domains** (successor to Google Domains) includes free WHOIS privacy but is expensive to renew: .com $20, .app $30, .ca $20 and .uk $11.
- **IONOS UK** gives the first year for **£1 + VAT** on .com, .co.uk and .uk. Renewal is **£15 + VAT for .com** and **£10 + VAT for .co.uk and .uk**, and IONOS has said renewals rise during 2026. The domain sits on an auto-renewing contract.
  - **Gotcha:** you must cancel or transfer out before the renewal date or you pay full price. Whether the £1 offer is limited to one per customer was **not confirmed**.
- **123-reg** charges £3.99 for the first year of .co.uk or .uk, then £12.99 a year. A **£0.01 .com is only offered with a 3-year term**, and .com renews at £18.99. The search results did not make clear whether years 2 and 3 of that term are charged at full price, so it is **excluded from the plans**. Whether 123-reg charges for WHOIS privacy on .com was **not checked**.

### Transfer-lock gotchas with intro promos

- **.com and .app (ICANN rules).** A new registration is locked against transfer for **60 days**. ICANN's revised Transfer Policy cuts this to **30 days (720 hours)**, but registrars are rolling the change out through 2026 ([Domain Incite](https://domainincite.com/30891-icann-to-kill-off-60-day-domain-transfer-lock), [OpenSRS Q&A](https://opensrs.com/new-transfer-policy-qa/)).
  - A 30- or 60-day lock also follows a registrant change.
  - A transfer-in costs about one year's fee and adds a year to the registration, so moving a domain after a first-year promo just means paying the new registrar's yearly price.
- **.co.uk and .uk (Nominet).** These transfer by changing the IPS tag. There is no ICANN 60-day lock and no year is added. Cloudflare lists the .uk transfer fee as $0, after which you renew at cost. This makes promo-then-move cheap for .uk domains.
- **Promo first years are only worth it if you set a calendar reminder.** IONOS and 123-reg contracts auto-renew at full price. Start the transfer 2 to 4 weeks before expiry, because some registrars won't release a domain that is close to expiring or in its renewal window.
- **.com.au.** Licences can run for 1 to 5 years. Namecheap only allows renewal between 90 and 12 days before expiry. Porkbun gives no free year when you transfer a .com.au in.

## Price tables per domain (GBP, renewal = per year)

### milesprout.com and getmilesprout.com (each)

| Registrar | Year 1 | Renewal | 3-yr total | Source |
|---|---|---|---|---|
| **Spaceship** | $9.08 = **£6.88** | $10.18 = £7.71 now; **~$10.89 = £8.25 after 1 Nov (assumed)** | **£23.38** (£22.30 at today's renewal) | [startupowl](https://startupowl.com/reviews/spaceship), [sidebysidedomains](https://sidebysidedomains.com/blog/09-spaceship-pricing.html) |
| Cloudflare | $10.46 = £7.92 | ~$11.17 = £8.46 (after 1 Nov) | £24.84 | [startupowl](https://startupowl.com/reviews/cloudflare-registrar), [OSIR](https://osir.com/en/blog/verisign-com-price-update-2026/) |
| Dynadot | $10.88 = £8.24 | $10.88 now, likely about $11.59 after 1 Nov | ~£25.80 | [dynadot .com](https://www.dynadot.com/domain/com) (snippet) |
| Porkbun | $11.08 = £8.39 | ~$11.81 = £8.95 (after 1 Nov) | £26.29 | [Porkbun KB](https://kb.porkbun.com/article/201-why-did-com-prices-go-up-and-how-high-will-they-go), [tldes](https://tldes.com/registrars/porkbun) |
| Namecheap | $11.28 = £8.55 | $18.48 = £14.00 | £36.55 | [stackscored](https://www.stackscored.com/pricing/domain-registrars/namecheap/) |
| IONOS UK | £1 + VAT = £1.20 | £15 + VAT = £18.00 | £37.20 | [ionos.co.uk .com](https://www.ionos.co.uk/domains/com-domain) (snippet) |
| Squarespace | ~$10 = £7.58 | $20 = £15.15 | £37.88 | [whatsquare.space](https://whatsquare.space/blog/squarespace-domain-renewal-cost) |
| 123-reg | £0.01, 3-yr term only | £18.99 | unclear, excluded | [123-reg blog](https://www.123-reg.co.uk/blog/featured/how-much-does-domain-name-cost-uk/) |

**Cheapest: Spaceship** for both first year and renewal. Cloudflare is within about £1.50 over 3 years and is the most predictable price.

### milesprout.app

| Registrar | Year 1 | Renewal | 3-yr total | Source |
|---|---|---|---|---|
| **Spaceship** | $4.98 = **£3.77** | $14.69 = **£11.13** | **£26.03** | [tld-list via search](https://tld-list.com/registrars/spaceship), [domainoffer](https://domainoffer.net/tld/app/spaceship) |
| Porkbun | $8.75 sale = £6.63 (another source says $13.98) | $14.93 = £11.31 (another source says $15.98) | £29.25 | [porkbun.com/tld/app](https://porkbun.com/tld/app) (snippet), [priceworld](https://priceworld.com/domains/porkbun/) |
| Cloudflare | $14.20 = £10.76 | $14.20 = £10.76 | £32.27 | [Cloudflare .app](https://www.cloudflare.com/application-services/products/registrar/buy-app-domains/), [domainnameservices](https://domainnameservices.net/registrars/cloudflare) |
| Dynadot | not found | $14.50 = £10.98 | n/a | [easytlds](https://easytlds.com/registrar/dynadot) |
| Namecheap | $6.98 sale = £5.29 | $22.98 = £17.41 | £40.11 | [namecheap .app](https://www.namecheap.com/domains/registration/gtld/app/) (snippet) |
| IONOS UK | no UK promo found (~$12 on the US site) | £25 a year | ~£75 | [IONOS price comparison](https://www.ionos.co.uk/domains/domain-name-price-comparison) (snippet) |
| Squarespace | n/a | $30 = £22.73 | ~£68 | [whatsquare.space](https://whatsquare.space/blog/squarespace-domain-renewal-cost) |

**Cheapest: Spaceship.** WHOIS privacy is free at all of the US registrars above. You need TLS from day one because of HSTS preload.

### milesprout.co.uk

| Registrar | Year 1 | Renewal | 3-yr total | Source |
|---|---|---|---|---|
| **Porkbun** | $4.32 = **£3.27** | $5.66 = **£4.29** | **£11.85** | [porkbun.com/tld/co.uk](https://porkbun.com/tld/co.uk) (snippet) |
| Cloudflare | $5.30 = £4.02 | $5.30 = £4.02 | £12.05 | [Cloudflare .uk](https://www.cloudflare.com/en-gb/application-services/products/registrar/buy-uk-domains/), [domainoffer](https://domainoffer.net/tld/co.uk/cloudflare) |
| Spaceship | $5.42 = £4.11 | $5.42 = £4.11 | £12.32 | [spaceship .co.uk](https://www.spaceship.com/domains/cctld/co-uk/) (snippet) |
| Dynadot | $6.44 = £4.88 | $6.27 = £4.75 | £14.38 | [dynadot .co.uk](https://www.dynadot.com/domain/co.uk) (snippet) |
| Namecheap | $6.98 = £5.29 | $9.98 = £7.56 | £20.41 | [namecheap .co.uk](https://www.namecheap.com/domains/registration/cctld/co-uk/) (snippet) |
| IONOS UK | £1 + VAT = £1.20 | £10 + VAT = £12.00 | £25.20 | [ionos.co.uk .co.uk](https://www.ionos.co.uk/domains/co-uk-domain) (snippet) |
| Squarespace | free year with an annual site plan | ~£8 (sources vary up to £20) | ~£16–£40 | [startups.co.uk](https://startups.co.uk/websites/builders/squarespace-pricing/) |
| 123-reg | £3.99 | £12.99 | £29.97 | [123-reg blog](https://www.123-reg.co.uk/blog/featured/cheap-domain-registrars-uk-compared/) |

**Cheapest: Porkbun**, with Cloudflare and Spaceship within about 50p over 3 years. Nominet's wholesale price is in GBP (£3.90 at the 2020 change, per [Nominet](https://nominet.uk/news/change-to-wholesale-pricing-for-uk-domains/)), so USD prices here move with the exchange rate.

### milesprout.uk

| Registrar | Year 1 | Renewal | 3-yr total | Source |
|---|---|---|---|---|
| **Porkbun** | $4.32 = **£3.27** (one source says $3.32 with a promo code) | $5.66 = **£4.29** | **£11.85** | [porkbun.com/tld/uk](https://porkbun.com/tld/uk) (snippet) |
| Cloudflare | $5.30 = £4.02 | $5.30 = £4.02 | £12.05 | [Cloudflare .uk](https://www.cloudflare.com/en-gb/application-services/products/registrar/buy-uk-domains/) |
| Spaceship | $5.42 = £4.11 | $5.42 = £4.11 | £12.32 | [spaceship .uk](https://www.spaceship.com/domains/cctld/uk/) (snippet) |
| Dynadot | not found | $6.22 = £4.71 | n/a | [easytlds](https://easytlds.com/registrar/dynadot) |
| Namecheap | $6.98 = £5.29 | $9.98 = £7.56 | £20.41 | [namecheap .uk](https://www.namecheap.com/domains/registration/cctld/uk/) (snippet) |
| IONOS UK | £1 + VAT = £1.20 | £10 + VAT = £12.00 | £25.20 | [ionos.co.uk .uk](https://www.ionos.co.uk/domains/uk-domain) (snippet) |
| Squarespace | n/a | $11 = £8.33 | ~£25 | [whatsquare.space](https://whatsquare.space/blog/squarespace-domain-renewal-cost) |
| 123-reg | £3.99 | £12.99 | £29.97 | [123-reg blog](https://www.123-reg.co.uk/blog/featured/how-much-does-domain-name-cost-uk/) |

**Cheapest: Porkbun.**

### milesprout.ca (blocked by eligibility)

| Registrar | Year 1 | Renewal | 3-yr total | Source |
|---|---|---|---|---|
| **Porkbun** (CIRA-certified) | $7.78 = **£5.89** (older data: $8.69 sale, $11.12 regular) | $9.19 = **£6.96** (older data: $11.61) | **£19.81** | [porkbun.com/tld/ca](https://porkbun.com/tld/ca), [domainoffer](https://domainoffer.net/tld/ca/porkbun) (snippets) |
| CanSpace (Canadian, CIRA-certified) | C$11.99 = £6.35 | C$12.99 = £6.88 | £20.11 | [canspace.ca](https://www.canspace.ca/domains.html), [wideripples](https://wideripples.com/best-domain-name-providers-canada/) |
| Cloudflare | $9.19 = £6.96 | $9.19 = £6.96 | £20.89 | [domainoffer](https://domainoffer.net/tld/ca/cloudflare), [Cloudflare .ca](https://www.cloudflare.com/application-services/products/registrar/buy-ca-domains/) |
| Spaceship | $9.32 = £7.06 | $9.32 = £7.06 | £21.18 | [spaceship .ca](https://www.spaceship.com/domains/cctld/ca/) (snippet) |
| Dynadot | not found | $9.48 = £7.18 | n/a | [dynadot .ca](https://www.dynadot.com/domain/ca) (snippet) |
| Rebel (Canadian) | C$9.99 = £5.29 | C$17.99 = £9.53 | £24.35 | [wideripples](https://wideripples.com/best-domain-name-providers-canada/) |
| Namecheap | $11.98 = £9.08 | $14.98 = £11.35 | £31.78 | [hostadvice](https://ca.hostadvice.com/hosting-company/namecheap-reviews/pricing/) |
| Squarespace | n/a | $20 = £15.15 | ~£45 | [whatsquare.space](https://whatsquare.space/blog/squarespace-domain-renewal-cost) |

**Cheapest: Porkbun.** CanSpace and Cloudflare are within about £1 over 3 years. CIRA hides individuals' WHOIS details by default. **You cannot register this without a trade mark registered in Canada.**

### milesprout.com.au (blocked by eligibility)

| Registrar | Year 1 | Renewal | 3-yr total | Source |
|---|---|---|---|---|
| **Porkbun** | $7.87 sale = **£5.96** | $13.70 = **£10.38** | **£26.72** | [porkbun.com/tld/com.au](https://porkbun.com/tld/com.au) (snippet) |
| VentraIP (Australian) | A$9.95 = £5.23 | A$22.95 = £12.06 | £29.35 | [VentraIP .com.au](https://ventraip.com.au/domain-names/extensions/com-au/) (snippet, verified June 2026). Whether GST applies to overseas customers is unconfirmed. |
| Crazy Domains (Australian) | A$21.07 = £11.07 | A$24.50 = £12.87 | £36.81 | [cybernews](https://cybernews.com/best-web-hosting/crazy-domains-review/), [Crazy Domains](https://www.crazydomains.com.au/domain-names/domain-extension/com-au-domain-registration/) |
| Namecheap | $18.98 = £14.38 | $20.98 = £15.89 | £46.16 | [namecheap .com.au](https://www.namecheap.com/domains/registration/cctld/com-au/) (snippet; one source says it is no longer sold) |
| Cloudflare | **not supported** | | | [Cloudflare Community](https://community.cloudflare.com/t/com-au-domains-still-not-supported-by-cloudflare/555520) |
| Spaceship, Dynadot, Squarespace | support not confirmed | | | |

**Cheapest: Porkbun.** **You cannot register this without an ABN or ACN, or an Australian trade-mark application or registration that exactly matches "milesprout".**

## Plans (the 5 domains you can register now)

The 5 domains are .com, getmilesprout.com, .app, .co.uk and .uk. The plans assume purchase in October 2026 at the old first-year .com price, with .com renewals at the post-1-Nov price. A further Verisign rise of about 7% in late 2027 would add roughly 50p to 60p per .com in year 3. Amounts exclude any US-registrar VAT.

### Recommended: one registrar, Spaceship

| | Year 1 | Year 2 | Year 3 | 3-yr total |
|---|---|---|---|---|
| milesprout.com | £6.88 | £8.25 | £8.25 | £23.38 |
| getmilesprout.com | £6.88 | £8.25 | £8.25 | £23.38 |
| milesprout.app | £3.77 | £11.13 | £11.13 | £26.03 |
| milesprout.co.uk | £4.11 | £4.11 | £4.11 | £12.32 |
| milesprout.uk | £4.11 | £4.11 | £4.11 | £12.32 |
| **Total** | **£25.75** | **£35.85** | **£35.85** | **£97.45** |

- Why Spaceship: it is the cheapest single registrar over 3 years. WHOIS privacy and DNS are free, you are not locked into its nameservers, and it also sells .ca for later.
- The price is about £35.85 a year from year 2 (£34.77 if Spaceship keeps its current $10.18 .com renewal).
- **Runners-up:**
  - **Cloudflare**: £34.64, then £35.72 a year, **£106.08** over 3 years. At-cost and the most transparent, but you must use Cloudflare DNS, and it cannot sell .com.au.
  - **Porkbun**: £29.95, then £37.79 a year, **£105.53** over 3 years. It is the **only registrar checked that sells all 7 TLDs**, so pick it if you want .ca and .com.au in the same account later.

### Cheapest possible: mixed registrars plus promo hopping

| Domain | Year 1 | Year 2 | Year 3 | 3-yr |
|---|---|---|---|---|
| milesprout.com | IONOS £1.20 | transfer to Spaceship $9.68 = £7.33 (adds a year) | Spaceship £8.25 | £16.78 |
| getmilesprout.com | IONOS £1.20 | transfer to Spaceship £7.33 | Spaceship £8.25 | £16.78 |
| milesprout.app | Spaceship £3.77 | £11.13 | £11.13 | £26.03 |
| milesprout.co.uk | IONOS £1.20 | IPS-tag transfer to Cloudflare ($0), renew £4.02 | £4.02 | £9.24 |
| milesprout.uk | IONOS £1.20 | IPS-tag transfer to Cloudflare, renew £4.02 | £4.02 | £9.24 |
| **Total** | **£8.57** | **£33.83** | **£35.67** | **£78.07** |

- This saves **about £19 over 3 years** compared with the Spaceship-only plan, in return for 3 registrar accounts and 4 transfers.
- **Risks:**
  - IONOS auto-renews at £18 (.com) or £12 (.uk) including VAT if you miss the transfer window.
  - Whether the £1 offer is limited per customer is unverified.
  - IONOS makes you cancel the contract, and transfers can be slow.
  - Moving .uk domains to Cloudflare forces Cloudflare DNS.
- Mixing registrars **without** the IONOS promo saves almost nothing. Spaceship for .com and .app plus Porkbun for .co.uk and .uk comes to £24.07, then £36.21 a year, **£96.49** over 3 years. That is £0.96 less than Spaceship-only, which is not worth a second account.

### If .ca and .com.au become eligible later

- Add **Porkbun .ca** at about £5.89 in year 1, then £6.96 a year. Spaceship or Cloudflare cost about £7 a year if you want the .ca with the rest of the Spaceship domains.
- Add **Porkbun .com.au** at about £5.96 in year 1, then £10.38 a year.
- The trade-mark filings needed for eligibility (IP Australia and CIPO) cost far more than the domains themselves. Those fees were not checked.

## Before buying (no lookups were done here)

1. Confirm availability with ICANN Lookup, Nominet WHOIS and the auDA WHOIS, not registrar search boxes (see check 3).
2. Then reopen each registrar's public price page and confirm the figures above, because all of them are second-hand.
3. Buy .com, .app, .co.uk and .uk in one sitting.
4. Turn on auto-renew and registrar lock, and note each renewal date.
5. Point .app only at an HTTPS host.
