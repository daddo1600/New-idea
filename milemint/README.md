# MileMint

Automatic mileage and receipt tracker for US self-employed and gig workers. Built with Expo (SDK 57) for iOS first, Android later. Product background is in the research docs one folder up.

## Run it

```bash
npm install
npm test            # unit tests (rates, deductions, parsing)
npm run typecheck
npm run lint
npx expo start      # scan the QR code with Expo Go on an iPhone, or press w for web
```

**Expo Go and web are previews only.** They don't include SQLCipher, so the database is **not encrypted** there. Development and App Store builds made with EAS always encrypt, and a store build refuses to open an unencrypted database.

## Layout

| Path | What |
|---|---|
| `src/domain/` | Pure logic: IRS rate table (split-rate years), deductions, yearly summary, input parsing. Unit-tested. |
| `src/db/` | Encrypted SQLite (SQLCipher, key in Keychain), migrations, trip repository with an append-only edit history for audits |
| `src/app/` | Screens (Expo Router): home with deductions counter and trip list, add-trip modal |

## Status

**Done:**
- Manual trips
- Business/personal classification
- Deductions counter
- Split IRS rates
- Encrypted storage with edit history

**Next:**
- Automatic trip detection (motion, car Bluetooth/CarPlay, background location)
- Receipt scanning
- Paywall (RevenueCat)
- PDF/CSV export
- EAS build to TestFlight (needs an Apple Developer account and `EXPO_TOKEN`)

**Before launch:**
- Confirm the 1 July 2026 IRS rate (76¢) on irs.gov. It's `TODO` in `src/domain/rates.ts`.
- Answer the App Store export-compliance question about encryption (SQLCipher).
