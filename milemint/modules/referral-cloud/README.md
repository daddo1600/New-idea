# referral-cloud (design only, not built yet)

Single-use referral invites with no MileMint server, using CloudKit's **public database** in the app's iCloud container `iCloud.com.milemint.app`.

This folder holds only this design. There is deliberately **no Swift, no podspec and no `expo-module.config.json`** yet, so nothing here compiles into a build. The JS side is ready: `src/referral/cloud.ts` looks for a native module called `ReferralCloud` with `requireOptionalNativeModule`. While it's missing (today), every call answers "unavailable":
- invites are kept on the phone to publish later;
- a friend's code is saved as **pending**, with no bonus yet;
- the sharer's count stays 0.

## The founder's two rules, and how they're met

1. **"A unique code each time, reset once used."** Every share (Invite friends, Settings, milestone celebrations, the "compare" share) makes a **new** code (`src/referral/invites.ts` `issueInvite`). The code is published as an `Invite` record whose record name *is* the code. Creating a record whose name exists fails, so codes are unique across all users. Claiming creates `claim-<code>`, which can only exist once, so each invite works for one friend.
2. **"No getting a code, deleting and starting over."** Claiming also creates `claimer-<userRecordID>`. The `userRecordID` is CloudKit's per-container id of the friend's iCloud account. It's the same after deleting the app, on a new iPhone or after a factory reset. So one Apple Account claims one invite, ever. Two more things live in the keychain, which survives deleting the app: the phone's own redemption, and the install date (so the 30-day window can't be reopened).

## Records (public database, default zone)

The `creatorUserRecordID` system field is the opaque id of the iCloud account that wrote a record. No name, email or Apple ID is stored or visible.

### `Invite`, recordName = the code (e.g. `TRVB-7K2`)

| Field | Type | Notes |
|---|---|---|
| `createdAt` | Date/Time | When the sharer's app published it. |

The owner is `creatorUserRecordID`. There are no other fields: the code is the record name.

### `Claim`, recordName = `claim-<code>` (e.g. `claim-TRVB-7K2`)

| Field | Type | Notes |
|---|---|---|
| `code` | String | The invite claimed. |
| `inviter` | Reference (no action) | The `Invite` record. It's a convenience: counting doesn't trust it (see below). |
| `qualified` | Int64 (0/1) | Set to 1 by the claimer's app after 3 real automatic drives. |
| `claimedAt` | Date/Time | |
| `qualifiedAt` | Date/Time | |

The claimer is `creatorUserRecordID`.

### `Claimer`, recordName = `claimer-<userRecordID.recordName>`

| Field | Type | Notes |
|---|---|---|
| `code` | String | The one invite this account claimed. |
| `claimedAt` | Date/Time | |

## CloudKit Dashboard (once)

1. Development environment: create the three record types with the fields above.
2. Indexes:
   - `recordName` **Queryable** on all three (the dashboard needs it for any query).
   - `createdBy` (creator) **Queryable** on `Invite` (the sharer finds their own invites) and on `Claim` (fallback check, below).
   - `code` **Queryable** on `Claim`.
   - Nothing needs Sortable or Searchable.
3. Security roles, for all three types:
   - **World**: Read.
   - **Authenticated**: Create.
   - **Creator**: Read, Write.
   - Nobody else may write. So only the claimer can update or delete their claim, only the sharer their invite, and **no one can change or delete someone else's record**.
4. **Deploy Schema Changes** to Production before the App Store build.

## Native API (`ios/ReferralCloudModule.swift`, `Name("ReferralCloud")`)

```ts
isAvailable(): Promise<boolean>              // CKContainer.accountStatus == .available
publishInvite(code: string): Promise<'ok' | 'exists'>
claimInvite(code: string): Promise<'ok' | 'not-found' | 'used' | 'own' | 'already-claimed'>
markQualified(code: string): Promise<void>
countQualifiedClaims(): Promise<number>
```

The JS wrapper (`src/referral/cloud.ts`) adds `'unavailable'` for the cases below, and treats any unexpected answer as `'unavailable'`:
- the module is missing;
- `isAvailable()` is false;
- a call rejects (no iCloud account, network, quota, throttling).

All calls use `container = CKContainer(identifier: "iCloud.com.milemint.app")`, `db = container.publicCloudDatabase`, `me = try await container.userRecordID()`.

- **publishInvite(code)**: save `CKRecord(recordType: "Invite", recordID: CKRecord.ID(recordName: code))` with `createdAt`, using `CKModifyRecordsOperation` with `savePolicy = .ifServerRecordUnchanged`. On `.serverRecordChanged` (the name is taken), fetch it:
  - if its `creatorUserRecordID == me`, return `'ok'` (a retry of our own publish);
  - otherwise return `'exists'`, and the JS side makes a new code (up to 8 tries).
- **claimInvite(code)**:
  1. Fetch `Invite` `code`. If it's missing, return `'not-found'`. If `creatorUserRecordID == me`, return `'own'`.
  2. Fetch `claim-<code>`. If it exists, return `'used'`.
  3. Fetch `claimer-<me.recordName>`:
     - if it exists **and its creator is me**, return `'already-claimed'`;
     - if its creator isn't me, someone squatted the name (it's guessable from public records). Ignore it and instead query `Claim` where `creatorUserRecordID == me`; any result means `'already-claimed'`.
  4. Save `Claimer` `claimer-<me>` with `.ifServerRecordUnchanged`. If it already exists (a race on another device), return `'already-claimed'`.
  5. Save `Claim` `claim-<code>` with `.ifServerRecordUnchanged`. If it already exists (a race with another friend), **delete our new `Claimer` record** (we created it, so we may) and return `'used'`.
  6. Return `'ok'`.

  The public database has no atomic multi-record saves, hence this order: the claimer record is the cheap one to roll back.
- **markQualified(code)**: fetch `claim-<code>`. It must be ours (`creatorUserRecordID == me`). Set `qualified = 1` and `qualifiedAt`, then save. It's idempotent.
- **countQualifiedClaims()**:
  1. Query `Invite` where `creatorUserRecordID == me`, with `desiredKeys = []`, paging with cursors. This finds every invite this account published, so it works after a reinstall without a backup.
  2. Fetch `claim-<recordName>` for those ids in batches of up to 400 (`CKFetchRecordsOperation`). Missing records are fine.
  3. Return how many have `qualified == 1` and a creator other than `me`.

  The count trusts only record names and creators, never the `inviter` field, so nobody can raise another person's count by writing claims that point at them.

## When the app calls it (already wired in `src/referral/referral.tsx`)

The calls run on launch and whenever the app comes back to the foreground, only while `ReferralCloud.supported`:

1. **Publish waiting invites** (`publishPending`): invites made while iCloud was out of reach. One whose code turns out to be someone else's is dropped. This is astronomically rare: there are about 164 million codes.
2. **Check a pending code** (`submitPendingClaim`):
   - `ok`: the code is **granted** (it counts towards the sharer's perks, and the friend's 50% off shows on the Pro screen once the offer code is set) and the app shows a small "🎉 Your friend's invite is confirmed" alert.
   - `used`, `own` or `already-claimed`: the code is **cleared**, with an alert giving the reason. The box opens again if the user is still inside the 30 days, and shows the same reason.
   - `not-found`: the code waits up to 7 days, in case the sharer's own iPhone was offline when they sent it. After that it's cleared.
   - `unavailable`: nothing changes.

   A code typed while iCloud *is* reachable is claimed at once, and turned down at once if iCloud says no.
3. **Mark qualified** (`markQualified`): once the friend's code is granted and they have made at least 3 real automatic drives (`DRIVES_BEFORE_RECORDING`). This is saved as `qualifiedAt`.
4. **Count** (`countQualifiedClaims`): at most hourly. The answer is saved as `friendsJoined`, which never goes down.

The allowance is `40 + 10 × (granted ? 1 : 0) + 10 × friendsJoined` (`referralAllowance` in `src/referral/invites.ts`, which uses `monthlyAllowance` in `src/domain/plan.ts`). A pending code adds nothing.

Friends who entered a code before this module ships are pending, and are confirmed on their first open of the build that has it. So both sides get their drives then.

## Capability, entitlements and build

This uses the same container as the iCloud backup (`modules/icloud-backup/README.md`), so it shares the `extra.icloudBackup` switch in `app.json`:

1. Apple Developer portal: the container `iCloud.com.milemint.app` exists, and App ID `com.milemint.app` has **iCloud** with **CloudKit** ticked and the container selected.
2. When `extra.icloudBackup` is true, `app.config.js` adds:
   - `CloudKit` to `com.apple.developer.icloud-services` (next to `CloudDocuments`);
   - the container to `com.apple.developer.icloud-container-identifiers` (already there).

   The push-entitlement removal in `plugins/without-push-entitlement` stays: this needs no subscriptions, so no push.
3. Write `ios/ReferralCloudModule.swift`, `ios/ReferralCloud.podspec` and `expo-module.config.json` (`{"platforms":["apple"],"apple":{"modules":["ReferralCloudModule"]}}`), copying the icloud-backup module's layout.
4. Set `extra.icloudBackup` to `true` and make a new build. `ReferralCloud.supported` turns true, invites are published and checked, and the "Friends joined" counter appears.

## Abuse and privacy

- **Reinstalling, a new iPhone, a reset**: the `Claimer` record is per iCloud account, so a second claim is refused. On the same iPhone, the keychain also remembers the redemption (pending or granted) and the first install date.
- **Sharing one code with many people**: the first to claim it gets it. Everyone else sees "That invite has already been used. Ask your friend to send you a new one."
- **Claiming your own invite**: refused on the phone (it remembers its own invites) and in iCloud (same creator).
- **Many Apple Accounts, or install-and-delete farms**: each new account needs its own iCloud sign-in, and the sharer is only credited after 3 real automatic drives. The reward is drives, not money, so uncapped bonuses are safe.
- **Tampering**: other people's records can't be edited or deleted (security roles), and the count ignores any field a claimer could forge.
- **Privacy**: public records hold only a code, dates and a qualified flag, all tied to opaque per-app ids. The privacy policy should say: "When you send or use an invite, MileMint saves the invite code, the date and whether the invite was used in Apple's iCloud, linked only to an anonymous id, so the person who invited you gets their bonus."
