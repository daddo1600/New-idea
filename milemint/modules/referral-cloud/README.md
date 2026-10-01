# referral-cloud (design only, not built yet)

Credits the person who shared a referral code, with no MileMint server: CloudKit's **public database** in the app's iCloud container `iCloud.com.milemint.app`.

This folder holds only this design. There is deliberately **no Swift, no podspec and no `expo-module.config.json`** yet, so nothing here compiles into a build. The JS side is ready: `src/referral/cloud.ts` looks for a native module called `ReferralCloud` with `requireOptionalNativeModule` and, while it's missing (today), records nothing and counts 0.

What already works without it: every user has a code (`src/referral/code.ts`, kept in settings and the iPhone keychain); a new user who enters a friend's code in the first 30 days gets +10 free automatic drives a month at once (`src/domain/plan.ts` `monthlyAllowance`). What this module adds: the sharer's +10 a month for each friend who joined.

## Data

Record type **`Referral`** in the **public** database, default zone:

| Field | Type | Notes |
|---|---|---|
| `code` | String | The sharer's code, e.g. `TRVB-7K2`. **Queryable** index. |
| `createdAt` | Date/Time | When the friend's app saved it. |

The friend's identity is CloudKit's own system field `creatorUserRecordID`: an opaque per-app id of the friend's iCloud account. No name, email or Apple ID is stored or visible to anyone.

Record name: `referral-<code>` is **not** used (anyone could overwrite it). Use CloudKit's default random record name; each friend writes one record.

## Native API (`ios/ReferralCloudModule.swift`, `Name("ReferralCloud")`)

```ts
isAvailable(): Promise<boolean>        // CKContainer.accountStatus == .available
recordReferral(code: string): Promise<void>
countReferrals(code: string): Promise<number>
```

- `container = CKContainer(identifier: "iCloud.com.milemint.app")`, `db = container.publicCloudDatabase`.
- **recordReferral**: first query `Referral` where `code == code` and `creatorUserRecordID == <my user record id>` (`container.userRecordID()`); if one exists, return (idempotent). Otherwise save a new `CKRecord(recordType: "Referral")` with `code` and `createdAt = Date()`.
- **countReferrals**: query `Referral` where `code == code` (`NSPredicate(format: "code == %@", code)`), fetch with `desiredKeys = []` (system fields only), page through all results with cursors, and return the number of **distinct** `creatorUserRecordID.recordName` values. Exclude the caller's own user record id (no self-referral). One friend writing twice, or reinstalling, still counts once.
- Errors (no iCloud account, network, quota) reject; the JS side turns them into "not now" and retries on the next app open.

## When the app calls it (already wired in `src/referral/referral.tsx`)

- **Friend side:** once the friend has redeemed a code **and** has at least 3 real automatic drives (`DRIVES_BEFORE_RECORDING`), `recordReferral(code)` runs once; success is saved as `referralRecordedAt` in settings. Friends who redeemed before this module ships are recorded on their first open of the build that has it, so sharers get credit back-dated.
- **Sharer side:** on launch and when the app comes back to the foreground (at most hourly), `countReferrals(myCode)`; the result is saved as `friendsJoined` in settings (never lowered) and the free allowance becomes `40 + 10 × (redeemed ? 1 : 0) + 10 × friendsJoined`. "Invite friends" then shows "Friends joined: N · +X free drives a month".

## CloudKit Dashboard (once)

1. Development environment: create record type `Referral` with `code` (String) and `createdAt` (Date/Time).
2. Indexes: `code` **Queryable**; `recordName` **Queryable** (needed for queries); `createdBy` (creator) **Queryable**.
3. Security roles: World can **Read**; Authenticated can **Create**; only the Creator can **Write** (edit/delete) their own records.
4. **Deploy Schema Changes** to Production before the App Store build.

## Capability, entitlements and build

Same container as the iCloud backup (`modules/icloud-backup/README.md`), so it shares the `extra.icloudBackup` switch in `app.json`:

1. Apple Developer portal: container `iCloud.com.milemint.app` exists, App ID `com.milemint.app` has **iCloud** with **CloudKit** ticked and the container selected.
2. `app.config.js` adds, when `extra.icloudBackup` is true, `CloudKit` to `com.apple.developer.icloud-services` (next to `CloudDocuments`), and the container to `com.apple.developer.icloud-container-identifiers` (already there). The push-entitlement removal in `plugins/without-push-entitlement` stays: CloudKit works without push for this (no subscriptions needed).
3. Write `ios/ReferralCloudModule.swift`, `ios/ReferralCloud.podspec` and `expo-module.config.json` (`{"platforms":["apple"],"apple":{"modules":["ReferralCloudModule"]}}`), copying the icloud-backup module's layout.
4. Set `extra.icloudBackup` to `true` and make a new build. `ReferralCloud.supported` turns true and the counter appears.

## Abuse and privacy

- Only the creator id is counted, so one iCloud account counts once per code, however many times the app is reinstalled. Redemption itself is once per iPhone (settings plus a keychain flag that survives reinstalling).
- The 3-real-drives rule keeps out install-and-delete farming; the reward is drives, not money, so the incentive to cheat is small and uncapped bonuses are safe.
- Public records hold only a code and a date. The privacy policy should say: "If you enter a friend's code, MileMint saves that code and the date anonymously in Apple's iCloud so your friend gets their bonus."
