# Signed-off decisions

The founder signs these off; the team builds from them. The newest decision wins where two disagree.

## 3 Oct 2026: Waitlist reward (approved)
- Anyone who joins the website waitlist before launch day gets **3 months of Pro free**.
- It's a one-time App Store offer code, emailed within 3 days of launch, to be redeemed within 60 days. One per person and per Apple Account, for new Pro subscribers. It can't be combined with the free trial.
- **It doesn't renew:** Pro stops after 3 months, and no one is charged unless they choose to subscribe.
- Founding testers get 12 months instead, not both. The offer comes off the site on launch day.
- There's no cap on numbers; Apple's code limits are being checked (`website-claims-check.md`, "Offer code limits").
- Sign-ups are protected by Cloudflare Turnstile (loaded once a full email is typed), a per-IP rate limit and the honeypot.

## 3 Oct 2026: Pro perks, the "plus" model (approved)
- **Every offer keeps a free version.** Free users never lose an offer because Pro exists.
- **Pro gets a partner-funded "plus" on selected offers,** e.g. a second drink a week. It comes from its own weekly pool, often in quiet hours, so it never uses up free users' codes. Pro also gets a first look at new partners, but claiming opens to everyone at once. **No Pro-only offers at launch.**
- **Apple rules** (`pro-perks-rules.md`): perks are never sold or stored as credit through IAP, and are always free to claim. Pro is sold on its software features, with perks as a bonus.
- **Wording:** the Pro plus is "included with Pro", never "free". Teasers show the conditions on the teaser itself: Pro's price and that it auto-renews, "up to 2 a week", which stores and area, and that offers can change. Partner offers are labelled "Partner offer · we may earn a commission".
- **Teasers to free users:**
  - only where a partner is near and the offer is live;
  - at most one Pro line a week;
  - never in notifications, on Home, on the parked card or at the till;
  - a "Don't show Pro tips" switch;
  - the button says "See what Pro includes".
- **Value shown:** the drives' value at the tax office's rate and the Perks savings are two figures, never added together; no "Pro pays for itself" claims.
- **Copy:** `pro-value-plan.md`. **Partner pitch:** "Give MileSprout Pro drivers a second visit a week, in your quiet hours, from a pool you set. You pay only when a code is used at your till."
- This **replaces** "same perks for Free and Pro" in `perks-simulation.md`, and "perks unlock nothing" in `rewards-partners.md`.
- It needs the redemption server (Monday) before the plus can be claimed for real.
