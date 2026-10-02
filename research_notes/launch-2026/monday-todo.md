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
