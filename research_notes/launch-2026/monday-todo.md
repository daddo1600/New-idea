# Parked for Monday

1. **Seasonal artwork quality pass (website and app).** Feedback: the outback kangaroos, emu and hill look low quality. Redraw all seasonal art in more detail and with smoother motion: animals, hats, sleigh, pumpkin, leaves, snow, petals, bats, fireworks and sun. Check it frame by frame and don't rush the small stuff.
   - Website: `website/assets/season.js` (on `website-preview`, commit 11d9019).
   - App: `milemint/src/components/season/*` and `intro-scenery.tsx`. Ships with the next build sent to Apple, not as an extra build.
2. **Floating pill.** It only shows for a short stretch before the closing button, so the suggestion is to drop it. Waiting on the user.
3. **Publish.** The form, pill, road signs and seasons are on preview only. Publish once the user says "publish".
4. **iPhone-first home page.** Feedback from the live site on an iPhone: "I want to see the app first, not the give-me-your-details. I need to know what it's all about first. iPhone has less real estate."
   - On mobile, open with the app itself (phone screens or the card deck, what it does) before any form.
   - Move the sign-up below that, or behind a single button. Keep the hero short.
   - Re-check the vertical space on 375–430 px screens.
5. **User simulations, phone and desktop.** Run simulated visitors of every type through both layouts and gather their feedback:
   - visitors: food delivery rider, parcel courier, ride-hail driver, care worker, tradesperson, office worker who drives, a sceptical visitor, a partner/business visitor;
   - countries: UK, US, Canada, Australia.
   - Report: what each one understood in the first 5 seconds, where they dropped off, whether they signed up, and what put them off.
   Do this before publishing the redesign.
6. **Comparison table redesign.** Feedback: "this could look a whole lot better".
   - Replace the dense text grid with scannable ticks and crosses (✓ / ✕ / partial) and short labels; detail goes in footnotes or on tap.
   - Lift the MileSprout column into a raised, branded card (logo, gold "Free" badge) rather than a mint stripe.
   - Competitor logos or names in a single row; consistent cell heights; fewer words per cell (e.g. "40 drives/mo").
   - On iPhone, use a swipeable card per app, or MileSprout vs one app at a time with a picker, instead of a squeezed table.
   - The "Paid plan" row reads oddly ("Free; Pro optional") until Pro has a price. Revisit once pricing is set.
   - Keep every fact sourced (`website-comparison-sources.md`) and the "Checked October 2026" note.
   - Run it through the Monday visitor simulations.
7. **Perks redemption server.** The user is sorting it on Monday. It checks codes at the till or online, marks each one used once, enforces weekly caps and per-person limits, and bills partners per redemption.
   - The app now keeps a Keychain copy of claims, so reinstalling doesn't reset limits. A new phone or an erased iPhone still starts afresh.
   - For the server-side per-person limit without an account, consider Apple's DeviceCheck: two bits per device, kept by Apple and readable only by our server. Or use an anonymous install ID stored in the Keychain.
   - `REDEEM_URL_BASE` in `milemint/src/perks/code.ts` points at the placeholder `https://milesprout.app/r/`.
8. **Perks: two-step claim like Three+.** The user's screen recording of Three+ "My codes" shows "£1 weekly drink, Expires: 04/10/26", and the code screen itself recorded black.
   - **Claim (reserve):** any time, even before a shift. The code sits in "My codes" until the hold date (e.g. the end of the partner's week). A hold left unused lapses and goes back into the pool without using up the allowance.
   - **Use now (activate):** at the till, this starts the short window (30 min in store). The QR and code show only after activation. Once activated, it counts against the allowance.
   - **Park rule:** applies to "Use now" (and claiming), not just claiming.
   - **Screen-recording protection, as Three does:** hide the code while the screen is being recorded or mirrored (iOS `isCaptured`, e.g. expo-screen-capture), so codes can't be shared as videos. Screenshots can only be detected, not blocked.
   - **Changes:** a schema migration (`activated_at`, `hold_until`), `claims.ts` statuses (held, active, redeemed, lapsed), the Keychain ledger format, the offer card and code screen, new strings in 10 languages, and the server: activation should be checked by the server once it exists.
   - **Researched, 3 Oct 2026:** how Three+ runs its £1 Coffee Network offer.
     - It's claimable once a week from Monday, and the link waits in "My Codes".
     - You choose a venue near you (by location, town or postcode). That generates a single-use voucher tied to the venue, and only then does the timer start: 30 minutes per Three's community thread, 1 hour per an earlier report.
     - An activated voucher that isn't used expires, and there's no new one until next week.
     - It covers about 1,400 independent cafés plus chains like Wenzel's and PAUL.
     - Sources: three.co.uk/why-three/threeplus/help; stuff.tv/news/three-uk-offers-a-weekly-1-coffee-with-rewards-app; community.three.co.uk "Something new is brewing on Three+".
     - Takeaways for MileSprout:
       - Pick the venue when activating, so the partner sees which shop gets the visit.
       - An activated code that isn't used counts against the allowance (stops "activate, show a mate, let it lapse").
       - Partner with a café network, not single cafés, for coverage.
9. **"How you're paid for mileage" for people with more than one kind of work.** Today it's one global switch (Self-employed or Employee, in `settings.tsx` `MileagePayForm`, `use-mileage-pay.ts`, `use-year-money.ts`). That breaks for:
   - people who move from gig work to an employed job, or the reverse;
   - people who do both, e.g. a care worker employed by an agency who also does Uber Eats at weekends;
   - employees with a company car, who can't claim mileage relief on it.

   The user's own phone shows the risk: Employee at 45p per mile, with Shift mode on. So gig drives are being valued as employee drives.

   Proposal:
   - **Jobs, not one switch.** Each kind of work has its own basis: "Deliveries: self-employed", "Care agency: employee, paid 35p, own car", "Company car". A work drive belongs to a job. Shift-mode drives default to the self-employed job, and drives in work hours or for a saved workplace default to the employee job. A drive can be changed with a tap.
   - **Dated, never retroactive.** A change applies from a date, so switching from gig to employed doesn't revalue last year's drives.
   - **Vehicle per job.** Own car, van, motorbike or bicycle (self-employed rates differ), or company car, which has no mileage relief. Company-car drives are still logged for the employer, and relief applies only to unreimbursed fuel. Check each country's rules before writing copy.
   - **Short guided setup** (the tutorial):
     - Questions: "Do you work for yourself (delivery, ride-hail, trades)?", "Do you drive for an employer?", "Whose vehicle?", "What do they pay per mile?".
     - It sets up the jobs, and appears in onboarding after the work style.
     - Prompt again when it looks out of date: e.g. Shift mode turned on while only an employee job exists, a new tax year starts, or drives keep being re-marked.
   - **Per-country checks:**
     - UK: Mileage Allowance Relief for employees; simplified expenses for the self-employed.
     - US: no deduction for unreimbursed employee mileage at present; check whether that's still the case.
     - Canada: T2200 / T777.
     - Australia: cents per km, for both employees and the self-employed.
   - The money maths gets tests for mixed years (some drives self-employed, some employee) and for a company car.
10. **Backups: make failures visible and add backup to setup.** On the user's build 59, Settings shows "Not backed up yet" even though auto-backup is on by default (`useAutoBackup` in `(tabs)/_layout.tsx`) and there are trips. So automatic backups are failing silently: `use-backup.ts` swallows every error. iCloud availability passed, or Settings would say "iCloud is off".
    - **Diagnose first.** The user taps "Back up now" and reports the message. "Couldn't back up…" means `ICloudBackup.write` or `seal` threw: the container ID or entitlement, a refused Keychain key, or the iCloud container not created yet.
    - **Record the last error** (code plus time) and show it in Settings in plain words. Add a Home card if there are trips and no successful backup for 3+ days: "Your trips aren't backed up yet", with a fix button.
    - **Setup step "Keep your trips safe"** after location permission:
      - check that iCloud and iCloud Drive are on and that iCloud Keychain holds the key;
      - if not, show the steps (Settings → [your name] → iCloud → iCloud Drive on, and MileSprout allowed);
      - otherwise say "Backups are on" and run the first backup after the first trip;
      - with no iCloud, offer the export as a fallback.
    - Don't make it optional and don't ask for permission. It's already on; the step only confirms it works.

## Handover, 3 Oct 2026 (from the long first session)
- **Build 61** (crash fixes, backup, perks, opening, This week strip, wording) was building on EAS; check its state on TestFlight. Build 60 failed on AppShortcuts.xcstrings, which is now fixed and checked by preflight.
- **In flight in the old session, when it finished:**
  - research: website-claims-check.md, checking the app's rates, the typical month, the "unclaimed" claim and the waitlist reward rules;
  - qa: review of today's live website changes;
  - marketing: waitlist-hooks-copy.md;
  - coding: the 10-second app clip on `website-preview`.
- **Next on the website:** the calculator, money line, waitlist reward (3 months of Pro proposed; the founder confirms after research), trust line by the form, then qa, then "publish". Social proof waits for real tester quotes.
- **The App Store Connect key** needs to be in the environment (variable `EXPO_ASC_KEY_P8_BASE64`) for uploads from new sessions.

11. **Build the Pro perks "plus"** (signed off; see `decisions.md`, specs in `pro-value-plan.md` and `pro-perks-rules.md`). Delegate:
    - coding: a plus slot on offer cards, its own weekly pool, the teaser rules, a "Don't show Pro tips" switch, the Pro screen row, the "MileSprout this year" value line and the Pro extras tally;
    - translator;
    - qa.
    The live plus needs the redemption server. Also update the partner deck with the pitch line.
