# Handover to the main session (3 Oct 2026, evening)

Read `CLAUDE.md`, then `decisions.md`. Everything below is pushed.

## Ready, waiting for the founder
- **Website publish:** `website-preview` at **7cdef35** has marketing and QA sign-off. It contains:
  - the bigger zoom when parked, with the touch indicator;
  - the London scene and the scenes engine (`/api/scene`);
  - the re-shot deck screens;
  - the new feature panels, with panel 1 localised;
  - the "Work out yours ↓" link;
  - the privacy wording.

  **Merge recipe (from QA):**
  1. On the live branch, `git merge --no-ff origin/website-preview`.
  2. Exactly 8 conflicts, all `?v=`/preload lines (404, index, partners, privacy, r/index, support, testers, waitlist). Resolve with `git checkout --theirs` on those files.
  3. `node --test tests/*.mjs` (54 pass), then commit and push.

  Push only on the founder's "publish". A push to the live branch was once blocked by the auto-mode classifier; the founder may need to allow it.
- **App build:** `claude/ios-app-ideas-market-of84qv` passes preflight (PREFLIGHT OK). It includes:
  - the setup v2 screens and the one-line Home status row;
  - the wording fixes and the tab bar;
  - the brown reindeer nose;
  - the Founding driver badge for TestFlight testers. This adds a new native module, `modules/install-source`, which is QA-reviewed but has never been compiled; the first EAS build is its first compile.

  Build only when the founder says "build".

## Waiting on founder decisions
- **Google title:** "MileSprout: automatic mileage log for work drives" (recommended) vs keeping "mileage tracker".
- **Launch date:** none yet. These wait for it:
  - `FOUNDING_TESTER_ENDS` (placeholder 2027-01-31);
  - the `{LAUNCH_DATE}`/`{PROMISE_END}` dates in `price-promise.md`.

## Next work (approved, not started)
- **Pro price on the website:**
  - show the price, the price promise ("Subscribe in our first year and keep your price for as long as you stay subscribed", worded relative to launch day) and a trial line;
  - a clearer heading "Logging is free. Pro is a paid upgrade.", with the Free card first on phones and a "Paid upgrade" label;
  - our price in the comparison table.

  Sources: `pro-price-display.md`, `price-promise.md`, `trial-season-risk.md`. App Store Connect already holds the option A prices (set 3 Oct).
- **App:**
  - demo paywall prices (`pro.tsx` line 46: 5.99/49.99 → 3.99/29.99);
  - the paywall line "One report a year? Monthly is £3.99." and the promise text, in all 10 languages;
  - the store listing (`store.config.json`): new prices, "a free month", remove "MileMint" and "tracking";
  - the friend offer code at half of yearly (`offer-code-setup.md`).
- **Waitlist and tester codes:** tick "no auto-renew" when they are created. Our wording must not say they "can't combine" with the trial (`trial-season-risk.md`).
- **Testing open to UK/US/CA/AU:** update the testers page and tour copy. Also:
  - **Tester tour (`/tour`):** the spec is in `tester-tour.md`, in English, Spanish and Polish. Build it once testing opens.
  - Raise the public TestFlight link limit from 10 to 100+.
  - The first external build needs TestFlight review.
- **Persona deck** (`persona-deck.md`, research-checked): coding on `website-preview`.
- **Brand review items not started:**
  - the hero money count-up;
  - the CTA/footer pass;
  - the country tiles;
  - the sign-up, Free card, languages and comparison specs.
- **Seasons** (`scene-calendar.md`): autumn is live. Next are jacaranda (redraw florets; NSW from 25 Oct), Bonfire Night, Diwali, US Thanksgiving, winter/Christmas and New Year. Each goes live once marketing and QA pass it (no founder publish needed). Halloween only if it passes by 23 Oct.
- **Local scenes:** more UK scenes (countryside, Scotland), then the US, CA and AU.
- **Small app follow-ups:** `website-claims-check.md` §3 still lists Canada at $5,526 (now $5,446). Canada's app demo month is 640 km.

## Environment notes
- The App Store Connect key is not in the repo. This session kept `AuthKey.p8` in its scratchpad. The new session needs `EXPO_ASC_KEY_P8_BASE64` (the base64 of the .p8) as an environment variable, plus `EXPO_TOKEN`, `EXPO_APPLE_TEAM_ID`, `EXPO_ASC_ISSUER_ID` and `EXPO_ASC_KEY_ID`.
- Scripts used for builds and prices (`ship.sh`, `tf-promote.js`, `price-*.js`) lived in the old scratchpad. They are rebuilt from the `release` and `app-store` agent instructions if needed.
- milesprout.app is blocked by this session's network policy, so live checks need the founder's phone or an allowed host.
