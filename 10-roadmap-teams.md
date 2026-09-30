# Roadmap: MileMint for Teams (future)

**Status:** planned, not started. Validate demand first (see the last section).

## The idea

A business pays for its drivers. Each driver tracks as today, and the owner or admins see the business mileage from the whole team in one place.

| | |
|---|---|
| **Who pays** | The business, per driver, monthly or yearly (billed outside the App Store; Apple allows this for apps sold to organisations for their staff) |
| **Price idea** | £6–8 / $8–10 per driver per month, discount for yearly, minimum 5 drivers, quotes for large fleets |
| **Example** | 50 drivers × £7 × 12 = **£4,200 a year** from one sale |
| **Competitors** | MileIQ for Teams, Everlance Business, TripLog Teams |

## How it works

1. **Owner signs up on the website** (teams dashboard), picks the number of drivers, pays by card.
2. **Gets an invite link and a team code**, e.g. `milemint.app/join/ACME-7K2P`. The link opens the app straight onto "Join Acme Ltd".
3. **Driver installs MileMint → Join a team → code.** Pro unlocks (company-paid). Driver adds their vehicle.
4. **Only business trips are shared** with the company. Personal trips never leave the phone. This is a privacy selling point and it keeps us on the right side of GDPR and US employee-monitoring rules.
5. **The dashboard shows:**
   - each driver's miles and money owed, with approve or query on each trip;
   - vehicles;
   - payroll and expenses exports (CSV and PDF);
   - a **daily, weekly or monthly email digest**, e.g. "3,420 business miles this week, £1,881 to reimburse, 2 trips to review".

**Company vehicles need different rates.** The app's rates are for drivers' own cars. UK company cars and vans use HMRC's **Advisory Fuel Rates**, and US fleets usually use actual costs. Teams needs a "company vehicle" option with the right rates.

## What's needed

| Need | What | Rough cost |
|---|---|---|
| **Domain** | For the website, the dashboard (`teams.<domain>`), invite links that open the app, and professional email. Also becomes the App Store privacy policy / support URL | £10–40 a year |
| **Website + waitlist** | One page: what Teams is, pricing, "join the waitlist" | Free (Vercel / Cloudflare Pages) |
| **Business email** | e.g. `hello@` and `support@` on the domain instead of Gmail | Free (Cloudflare email forwarding) to about £5 a month (Google Workspace) |
| **Backend** | Accounts, teams, invites, shared business trips, stored in the region the business chooses (UK/EU or US) | Free tier to start (e.g. Supabase), about $25 a month at scale |
| **Admin dashboard** | Web app for owners and admins | Hosting free to start |
| **Payments** | Stripe account (business details and bank) for per-driver billing | 1.5–3% per payment |
| **Email digests** | Sending the daily, weekly and monthly summaries | Free tier to start (Resend / Postmark) |
| **Sign-in (drivers in a team only)** | Email link, plus Sign in with Apple (Apple requires it when other sign-in options are offered). Solo users stay account-free | Free |
| **App changes** | "Join a team", sharing business trips, company-vehicle rates, links that open the app (Associated Domains) | Build effort |
| **Legal** | Business terms of service, a **Data Processing Agreement** (the business is the data controller, MileMint the processor), updated privacy policy. Consider a limited company before signing B2B contracts | Templates to solicitor review |

**Effort:** a first version (team codes, sharing, dashboard with exports, weekly email) is a few weeks of focused building. Anything beyond that is additional.

## Order of work

1. **Now (cheap):** register the domain, put up a one-page site with the Teams waitlist, add "MileMint for Teams: join the waitlist" to the app menu.
2. **Talk to 3–5 target businesses:** drivers, current tool, what they pay, what they'd need.
3. **Two or more say yes → build the first version** as above.
4. **Later:** approvals workflow, several admins, company-vehicle rates, integrations (Xero, QuickBooks, payroll).

## Before buying the domain: check the name

`milemint.com` and `milemint.app` are already registered, and `milemint.app` appears to be hosted on Vercel, so it may be a live product.

- Open both in a browser to see who has them.
- Run a quick trademark search for "MileMint":
  - USPTO: tmsearch.uspto.gov
  - UK IPO: trademarks.ipo.gov.uk

If someone is already trading as MileMint in mileage or finance, it's far cheaper to adjust the name now than after launch.

These appeared unregistered in a DNS check (confirm at the registrar): `milemint.co.uk`, `milemint.uk`, `milemint.io`, `milemint.co`, `getmilemint.com`, `trymilemint.com`, `usemilemint.com`.
