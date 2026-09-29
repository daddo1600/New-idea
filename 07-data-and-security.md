# MileMint: Where User Data Lives and How It's Protected

**Principle: local-first and private by design.** A user's trips, locations and receipts live on their own phone. Anything that leaves the phone is encrypted so that **we (the company) cannot read it**.

> This supersedes the earlier "SwiftData + CloudKit" plan in `01-ios-developer-prompt.md`. CloudKit doesn't work on Android, and we're now building with Expo.

## What we store, and where

| Data | Where it lives | Encrypted? | Can we (MileMint) see it? |
|---|---|---|---|
| Trips (routes, addresses, times, miles, purpose) | On the phone: SQLite database | ✅ AES-256 (SQLCipher) + iOS file protection | ❌ No |
| Receipt photos | On the phone: app's private folder | ✅ iOS file protection | ❌ No |
| Encryption key | iOS Keychain / Android Keystore (hardware-backed) | ✅ | ❌ No |
| Subscription / payment | Apple (and RevenueCat for status) | ✅ | Only "is Pro: yes/no". **We never see card details.** |
| Crash reports | Sentry | ✅ in transit | Yes, but **location and addresses are removed before sending** |
| Usage analytics | Privacy-first analytics (anonymous IDs) | ✅ in transit | Aggregate counts only, e.g. "paywall viewed". No location. |
| Sync / backup (v1.1) | Our server (Supabase, US region) | ✅ **End-to-end encrypted on the phone before upload** | ❌ No. The server stores only scrambled data. |

## The layers of security

1. **Database encryption:** the trip database is encrypted with SQLCipher (AES-256), built into Expo's `expo-sqlite`. The app checks at startup that encryption is actually active, and refuses to run unencrypted.
2. **Key in secure hardware:** the database key is created on the phone and kept in the iOS Keychain (Secure Enclave-backed), via `expo-secure-store`. It is never hard-coded or sent anywhere.
3. **iOS Data Protection:** files are also encrypted by iOS, tied to the phone's passcode. We use the "after first unlock" level, so trips can still be recorded in the background while the phone is locked in a car mount.
4. **Optional Face ID / passcode lock** on opening the app.
5. **In transit:** all network traffic uses HTTPS/TLS 1.2+, which iOS enforces.
6. **Server (when sync arrives):**
   - End-to-end encryption, so the server holds only ciphertext.
   - Row-level security, so each account can only touch its own rows.
   - Disk encryption at rest.
   - Sign in with Apple / Google, so **we store no passwords**.
7. **Collect the minimum:**
   - No ad SDKs and no data selling.
   - No insurance cross-selling (Stride's weakness).
   - No sending location to third-party AI: categorising trips and receipts runs on the phone.

## Backups and switching phones

- **v1 (launch):** data rides along in the user's **iCloud device backup**, which Apple encrypts, so a new iPhone restores it. Users can also export PDF/CSV at any time, and the app shows a reminder if backup looks switched off.
- **v1.1:** end-to-end encrypted sync, for multiple devices and the Android launch.
- **Trade-off:** with end-to-end encryption, if a user loses every device *and* their recovery key, we can't recover the data. We give them a recovery key and store it in their iCloud Keychain to reduce that risk.

## Legal and App Store obligations

- **App Store privacy label:** location, and "financial info" if receipt amounts are stored. Marked as *not used for tracking* and *not linked to identity*, because it stays on the device.
- **Account deletion inside the app** (Apple guideline 5.1.1(v)), plus full data export.
- **Privacy policy** covering US state privacy laws such as California's CCPA/CPRA: what we collect, why, how to delete it.
- **Retention:** records stay until the user deletes them. The app suggests keeping 3+ years of tax records.
- **Before launch:** an independent security review of the app, plus the `/security-review` check on every release.
