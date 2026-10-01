# MileMint

Automatic mileage and receipt tracker for US self-employed and gig workers. Built with Expo (SDK 57) for iOS first, Android later. Product background is in the research docs one folder up.

## Run it

```bash
npm install
npm test            # unit tests (rates, deductions, parsing)
npm run typecheck
npm run lint
npx expo start      # press w for the web preview (also generates route types)
```

**Web preview demo:** open `http://localhost:8081/?demo` to see sample auto-logged drives, or `?demo=setup` to see first launch. This works in development only.

**Testing automatic tracking needs a development build on a real iPhone** (`npx eas-cli@latest build --profile development --platform ios`). Background location doesn't run in Expo Go or on the web.

**Expo Go and web are previews only.** They don't include SQLCipher, so the database is **not encrypted** there. Development and App Store builds made with EAS always encrypt, and a store build refuses to open an unencrypted database.

## Layout

| Path | What |
|---|---|
| `src/domain/` | Pure logic, unit-tested: IRS rate table (split-rate years), deductions, trip detector (GPS samples → drives, stop merging, walk/jitter/glitch filtering), battery policy (geofence ↔ GPS) |
| `src/tracking/` | Background tracking: geofence while parked, GPS while driving, trips saved with route and place names |
| `src/db/` | Encrypted SQLite (SQLCipher, key in Keychain), migrations, trip repository with an append-only edit history for audits |
| `src/app/` | Screens (Expo Router): home with deductions counter and trip list, add-trip modal |
| `src/backup/`, `modules/icloud-backup/` | Automatic end-to-end encrypted backup to the user's own iCloud (key in iCloud Keychain), and restore on a new phone. Setup notes for the iCloud container are in `modules/icloud-backup/README.md` |

## Status

**Done:**
- Automatic trip detection (geofence + GPS, low battery)
- Permission setup and a tracking-status card
- Automatic sorting: learned routes, work hours, named places, commute warning (home ↔ work isn't deductible)
- Swipe to classify, trip detail screen (purpose, labels, save as place), settings (work hours, places)
- Business/personal classification with a "worth $X if business" prompt
- Deductions counter
- Split IRS rates
- Encrypted storage with edit history
- Encrypted iCloud backup and restore, no account (needs the iCloud container set up once, see `modules/icloud-backup/README.md`)
- Manual "add missed trip" fallback

**Next:**
- Bulk classify, trip map, edit place name/type/radius
- Motion-sensor and car Bluetooth/CarPlay triggers
- Field test on an iPhone
- Receipt scanning
- Paywall (RevenueCat)
- PDF/CSV export
- EAS build to TestFlight (needs an Apple Developer account and `EXPO_TOKEN`)

**Before launch:**
- Confirm the 1 July 2026 IRS rate (76¢) on irs.gov. It's `TODO` in `src/domain/rates.ts`.
- Answer the App Store export-compliance question about encryption (SQLCipher).
