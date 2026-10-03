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
