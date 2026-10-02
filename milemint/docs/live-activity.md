# Shift Live Activity (lock screen and Dynamic Island)

While a shift is on, iOS 16.2+ shows it on the lock screen and in the Dynamic Island:
"Shift on · 2:14:05 · 38.2 mi · £20.90". On iOS 17+ the card has two buttons, **End shift** and
**Not working** (only while a drive is being recorded). Settings › Your driving › "Show shift on
lock screen" turns it off (it's on by default; it shows money on the lock screen).

## Pieces

| Where | What |
| --- | --- |
| `targets/shift-activity/` | The WidgetKit extension (`com.milemint.app.LiveActivity`), generated into the Xcode project at prebuild by `@bacons/apple-targets`. SwiftUI layout only: every string comes from the app. |
| `targets/shift-activity/_shared/ShiftActivityIntents.swift` | The buttons' App Intents. `_shared` files are compiled into the app **and** the extension. |
| `modules/live-activity/` | Local Expo module (same layout as `modules/motion-activity`): start, update and end the activity with ActivityKit, and hand the buttons' taps to JS. |
| `ShiftActivityAttributes.swift` (two copies) | The ActivityAttributes type, compiled once into the app (the module) and once into the extension. They must stay identical; a Jest test checks it. |
| `src/live-activity/` | `model.ts` (pure: what the card says, translated, in the region's unit and currency; when to send an update), `sync.ts` (start/update/end from the database), `actions.ts` and `not-working.ts` (what the buttons do), `use-shift-activity.ts` (mounted in the root layout). |

Updates come from the app itself; there is no push server. The card starts when a shift starts (iOS
only allows that from the foreground), updates when a drive is saved, a pause starts or ends, and
every 45 s or so with the live drive's distance while the background tracker runs, and ends with
the shift (its summary stays on the lock screen for 15 minutes). The elapsed time is a system
timer (`Text(timerInterval:)`), so it counts without updates. iOS ends any Live Activity after
8 hours on screen; a longer shift loses its card then (the shift itself carries on).

## Why `@bacons/apple-targets` plus a local module

- `expo-widgets` (Expo's own, 57.0.x) renders layouts from a JS bundle run inside the extension, and
  its buttons are evaluated in the extension. Our buttons have to change the app's encrypted
  database, which the extension can't open. It's also still marked alpha.
- `expo-live-activity` (0.4.x) ships a fixed generic layout; no custom Dynamic Island or our
  buttons.
- `@bacons/apple-targets` (5.0, `expo >= 52`) only generates the Xcode target from plain Swift files
  kept outside `ios/`, so prebuild stays clean (CNG), and it registers the target for EAS signing
  (below). The Swift is small and ours.

## How the buttons reach the app

A widget can't run the app's JavaScript or open its database. Each button is a `LiveActivityIntent`
with `openAppWhenRun = true`. `perform()` appends `{action, at}` to a small queue in the App Group
`group.com.milemint.app` (shared `UserDefaults`), posts an in-process notification, and iOS opens
the app. The app empties the queue at launch, on every return to the foreground and on that
notification (`consumeActions`), then:

- **End shift** ends the shift as of the tap (`endShift(db, at)`), so time spent unlocking the phone
  isn't counted.
- **Not working** marks the drive under way; when it's saved it's filed as personal, outside the
  shift. If it was saved in the meantime (or ended up to 10 minutes before the tap) it's taken out
  of the shift and sorted personal at once. The shift carries on.

Why not a deep link (`milemint://shift/end`): Apple documents per-element `Link`s only for the
expanded Dynamic Island; the lock-screen card reliably has one URL for the whole card
(`widgetURL`), so two buttons can't be told apart there. A URL is also only handled once the app is
unlocked and open, and it says nothing about when the button was tapped. The App Group queue also survives the app being killed. Why not run the intent without
opening the app: ending a shift has to update the database at once, or every drive until the app is
next opened would count as work; opening the app guarantees the JavaScript runs.

## Signing with EAS (read before the next iOS build)

What changes for the build:

- a second bundle id, **`com.milemint.app.LiveActivity`** (the extension);
- a new capability on both ids, **App Groups**, with the group **`group.com.milemint.app`**;
- `NSSupportsLiveActivities` in the app's Info.plist (no extra capability needed for that).

`@bacons/apple-targets` adds the extension to `extra.eas.build.experimental.ios.appExtensions` when
the config is evaluated (check with `npx expo config --json`), so EAS knows about the target
without anything in `app.json` or `eas.json`. On the next `eas build -p ios`, with remote
credentials, EAS will:

1. register the bundle id `com.milemint.app.LiveActivity` in the Apple Developer account;
2. enable App Groups on both bundle ids, create `group.com.milemint.app` and assign it;
3. create an App Store provisioning profile for the extension (and regenerate the app's, since its
   capabilities changed), both signed with the existing distribution certificate.

All three need Apple Developer access at build time. EAS gets it either from an interactive Apple
ID login or from an App Store Connect API key in the environment (`EXPO_ASC_API_KEY_PATH`,
`EXPO_ASC_KEY_ID`, `EXPO_ASC_ISSUER_ID`). The key the EAS project keeps for `eas submit` is not
necessarily used for build credentials.

**Risk.** A `--non-interactive` build (CI, a build started from the Expo website or a GitHub
integration) with no Apple access will fail at the credentials step with an error like "Credentials
are not set up for target LiveActivity / run this command again in interactive mode". Safest: run
the first build after this change from a terminal, `npx eas-cli@latest build -p ios --profile
production`, and log in to Apple when asked (or run `npx eas-cli@latest credentials -p ios` first
and set up the new target there). Later builds reuse the stored profiles.

Other things that can fail the build:

- The API key (if one is used) needs the Admin or App Manager role to register ids and groups.
- `ios.appleTeamId` isn't set in `app.json`, so prebuild warns and leaves the extension's
  `DEVELOPMENT_TEAM` empty. EAS sets the team when it signs each target, so this should not
  matter on EAS; set it (from the Apple Developer membership page) for local Xcode builds.
- The extension is Swift that has never been compiled here (no macOS in this environment). The
  first build is the first compile; a mistake fails the build with a Swift error in
  `targets/shift-activity`, not at runtime.
- `@bacons/apple-targets` uses Xcode 16 file-system synchronised groups: the EAS build image must be
  Xcode 16 or newer (the SDK 57 default image is).
