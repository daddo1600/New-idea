# The friend's offer code: App Store Connect setup

*2 Oct 2026. For the invite reward that ships in the app (variant B in `invite-reward-panel.md`): **"Your friend's gift: 50% off your first year of Pro"**.*

The app is ready and waiting for one value: `FRIEND_OFFER_CODE` in `milemint/src/constants/rewards.ts`. While it's empty, every line about the friend's discount is hidden (the invite card says "Invite a driver, unlock Pro perks", the share message has no discount and the Pro screen shows no gift). Set it once the code below exists, and ship a build.

Apple only allows offer codes once the app has been approved, so this comes after 1.0 is live.

## What the code must be

| Setting | Value |
|---|---|
| Subscription | The yearly plan, `com.milemint.app.pro.yearly` (group "MileSprout Pro") |
| Customer eligibility | **New subscribers** only (never subscribed in this group) |
| Offer | **Pay up front, 1 year**, at half the yearly price |
| Price | Half of each storefront's yearly price, e.g. £24.99 (UK), $24.99 (US), and the matching CAD/AUD price points |
| Code type | One **custom code** to start (e.g. `SPROUTFRIEND`), with a redemption cap and an end date |

## Steps

1. Sign in to [App Store Connect](https://appstoreconnect.apple.com) with the Account Holder, Admin or App Manager role.
2. **Apps → MileSprout → Monetization → Subscriptions** (in the sidebar), then open the **MileSprout Pro** group and click the yearly subscription, `com.milemint.app.pro.yearly`.
3. Scroll to **Subscription Prices** and check the yearly price for each storefront. Note the price points that are half of it (Apple lists price points, so pick the nearest one: £24.99 for £49.99, $24.99 for $49.99).
4. Scroll to **Offer Codes** and click **Create Offer Code** (or the **+** next to "Offer Codes").
5. **Reference name:** `Friend 50% first year` (internal only, customers never see it).
6. **Customer eligibility:** tick **New Subscribers** only. Leave "Existing subscribers" and "Expired subscribers" unticked, so a lapsed or current subscriber can't use it to cut their price.
7. **Offer type:** **Pay Up Front**. **Duration:** **1 year**.
8. **Countries or regions and prices:** select every storefront the app sells in (at least the UK, US, Canada and Australia) and set each one to the half-price point from step 3. Check the "Proceeds" column: Apple's commission applies as usual.
9. Click **Next**, review and **Confirm**. The offer now exists, but it has no codes yet.
10. On the offer's page, open **Create Codes** (or **Generate codes**) and choose **Custom Code**:
    - **Code:** `SPROUTFRIEND` (letters and numbers, no spaces; it's case-insensitive for customers).
    - **Number of redemptions:** a cap, e.g. **2,000** for the first quarter. Raise it later if it's being used by real friends.
    - **Expiration date:** the end of the quarter (e.g. 31 Dec 2026). Make a new code each quarter (step 12).
11. Click **Create**. The code is live within about an hour.
12. Put the code in `milemint/src/constants/rewards.ts`:
    ```ts
    export const FRIEND_OFFER_CODE = 'SPROUTFRIEND';
    ```
    Ship the build. The invite card switches to "Give 50% off. Get Pro perks.", the share message says the first year of Pro is 50% off with the invite code, and anyone who entered a friend's code in the last 12 months sees the gift on the Pro screen.

## How the friend redeems it

- In the app: **Pro screen → "Redeem your friend's gift"** opens Apple's own offer-code sheet (`presentCodeRedemptionSheetIOS` in expo-iap). The screen shows the code to type in.
- Outside the app (or where the sheet isn't available): the App Store's redeem page with the code filled in, `https://apps.apple.com/redeem?ctx=offercodes&id=6817748981&code=SPROUTFRIEND`. The app falls back to this link itself.
- Redeeming starts the subscription at once, at the offer price. That's why the code is only offered on the Pro screen, when the friend wants Pro, and not at install.

## Things to know

- **One offer per purchase.** A new subscriber either takes the 1-month free trial (the introductory offer) or the friend's half-price year, not both. The Pro screen says so: "It's one offer per purchase, so it's instead of the free month." The app doesn't schedule its "your trial ends soon" reminder for a purchase made with the code.
- **Renewal at full price.** After the first year Pro renews at the normal yearly price. Apple requires that to be clear; the Pro screen says "Pro then renews at the normal yearly price", next to the usual auto-renewal terms.
- **Limits.** Apple allows up to 1 million offer-code redemptions per app per quarter, and each Apple Account can redeem a given offer once.
- **Leaks.** A custom code can end up on deal sites (HotUKDeals, Slickdeals, OzBargain), which turns it into a public price cut. Keep the cap and the quarterly end date, rotate the code each quarter, and update `FRIEND_OFFER_CODE` with each new one (an old build keeps showing the old code until it expires, so overlap the dates by a few weeks).
- **Later: one-time-use codes.** Once iCloud invites are live (`milemint/modules/referral-cloud/README.md`), switch to Apple's one-time-use codes (Create Codes → **One-Time Use Codes**, downloaded as a file), handed out one per friend whose claim qualified. That stops leaks entirely, but needs a small service to hand them out, so it isn't part of this build.
- **Testing.** Offer codes can't be redeemed in the sandbox from the redeem URL. Test with a StoreKit configuration file in Xcode (add an offer code to the yearly product there) or with TestFlight once the code exists.
- **Group admins and accountants** get their own named custom codes (one offer, several codes), outside the in-app ladder (panel §6.5). Create them on the same offer with step 10.

## Also in App Store Connect

- Nothing else is needed for the inviter's perks: they're unlocked in the app and never touch the subscription.
- Review notes for the build that sets the code: mention that the invite reward gives the invited friend a discount through an App Store offer code, and that the inviter's rewards are in-app features only, with no cash or gift cards (App Review Guideline 3.1.1 and 3.2.2).
