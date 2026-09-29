# Getting Started: What's Needed and Who Does It

## Decisions made

- **Platform:** iOS first, Android second.
- **Build route: Expo (React Native) + EAS cloud builds.** This replaces the earlier native-Swift recommendation, for two reasons:
  - **No Mac needed.** EAS builds, signs and submits the iOS app on Expo's cloud Macs, and Claude can write and test the code from this Linux cloud session.
  - **Android comes almost free.** Most of the code is shared. Only the platform-specific pieces (trip detection, car Bluetooth, widgets) need separate native modules.
  - **Trade-off:** Apple-only features (on-device Foundation Models, Live Activities, widgets) need small Swift modules written by Claude. They compile on EAS, not locally.
- **Name:** *TripLedger* is **already taken** on the App Store and Google Play (several apps), and `tripledger.app` is in use. A new name is needed. See the shortlist below.

## What you need to do

| # | Action | Cost | Why |
|---|---|---|---|
| 1 | **Pick launch market: US or UK** | – | Decides tax rules, currency and wording |
| 2 | **Pick a name** (shortlist below, or your own) | – | Needed for the bundle ID and App Store listing |
| 3 | **Enrol in the Apple Developer Program** at developer.apple.com: *Individual* (your legal name shows as seller) or *Organisation* (needs a D-U-N-S number, takes about 1–2 weeks) | $99/yr | Required to publish |
| 4 | **Get an iPhone for testing.** A used iPhone 12 or newer is fine; iPhone 15 Pro or newer if you want to test on-device AI | ~$150–400 used | You have to drive with it to test trip detection. The simulator can't do this. |
| 5 | **Create a free Expo account** (expo.dev) and give Claude access through an **access token** (see below) | Free tier | Cloud builds and TestFlight submission |
| 6 | After Apple approves you: in App Store Connect, **fill in Agreements, Tax & Banking** and **apply for the Small Business Program** | Free | Payouts; reduces Apple's commission to 15% |
| 7 | **A domain** for the privacy policy and support page (Apple requires both) | ~$12/yr | Required at submission |
| 8 | Later: **Google Play developer account** | $25 one-off | For the Android release |

### Giving Claude the Expo token safely

**Never paste tokens or passwords into chat.** Instead:

1. Create a token at expo.dev → Account settings → Access tokens.
2. Open the cloud environment menu in the session's title bar, choose **Edit**, and add it as an environment variable (or under API credentials, if that section is offered) named `EXPO_TOKEN`.
3. Start a new session so it's picked up.

Apple signing credentials are handled by EAS on its own servers. You log in to Apple once through EAS.

## Will AI-written code get the app rejected?

**No.** Apple reviews what the app does, not how it was written. Common rejection reasons, and how we avoid each:

| Guideline | Rejection reason | How we avoid it |
|---|---|---|
| 4.2 / 4.3 | Thin, template-like or copycat apps | Real, differentiated features (automatic trip detection, tax reports, privacy) |
| 2.1 | Crashes, placeholder content, broken links | TestFlight beta on a real iPhone before submitting |
| 5.1.1 / 5.1.5 | Background location without a clear reason | Clear permission prompts, an in-app explainer, and a screen-recording demo for the reviewer |
| 5.1.2(i) | Sending personal data to third-party AI without consent | AI runs on the device; any cloud AI is opt-in, with the provider named |
| 3.1.1 / 3.1.2 | Subscriptions outside Apple's in-app purchase system, or an unclear paywall | StoreKit through RevenueCat; price, trial length and renewal terms shown clearly; Restore button |

## Name shortlist (availability not yet checked)

MileMint · DriveDeduct · Milebook · Logbook+ · Claimly Miles · RoadReceipt

## What Claude does next, once 1–2 are answered

1. Scaffold the Expo app (TypeScript, Expo Router, EAS config), with CI running lint and tests.
2. Build the data model, manual trip logging and the running deductions counter. This runs in Expo Go or the web preview.
3. Add trip detection (background location, geofencing, car Bluetooth) and receipt scanning.
4. Add the paywall (RevenueCat) and reports (PDF/CSV).
5. Once the Apple account and `EXPO_TOKEN` exist: EAS build, then TestFlight on your iPhone.
