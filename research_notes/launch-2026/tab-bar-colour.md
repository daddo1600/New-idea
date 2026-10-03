# Tab bar colour: should Perks be coloured?

Research agent, checked 3 October 2026. No code changed.

## Answer

- **Recommendation: (b) + a restrained (d).** Keep every unselected tab grey, but make the grey darker so labels pass 4.5:1. Add two cues to the selected tab that are not colour: a soft green pill behind it and a heavier label. Don't colour Perks permanently.
- **Perks gets a small green dot only when there's a genuinely new partner offer.** It shows at most once a week and clears when Perks is opened. It stays off until real partners are live; today every offer is a demo.
- **Why not a gold or partner-coloured Perks icon (c):**
  - Apple says to use colour on tab bars sparingly and to keep it for state or primary actions.
  - A second coloured tab muddles which tab is selected, especially for red-green colour-blind users, who see the green and the gold as similar olive shades.
  - Amber already means "something to check" in our theme (`warning #CA8A04`).
  - It makes the app read as an ad, which works against the calm, trustworthy look. Earlier panel work found drivers like that Perks stays inside its tab (`pro-value-plan.md`, `perks-simulation.md`).
- **Why not as it is (a):**
  - The current unselected label grey is 3.28:1 in light mode and 4.49:1 in dark. Both are under the 4.5:1 that Apple's HIG and WCAG 1.4.3 set for text this small (10 pt).
  - Selected versus unselected is shown by hue alone.
  - The app ignores Increase Contrast.

## 1. Apple's Human Interface Guidelines

Sources:
- Tab bars: https://developer.apple.com/design/human-interface-guidelines/tab-bars
- Color: https://developer.apple.com/design/human-interface-guidelines/color
- Accessibility: https://developer.apple.com/design/human-interface-guidelines/accessibility
- SF Symbols: https://developer.apple.com/design/human-interface-guidelines/sf-symbols

I read all four pages on 3 October 2026 through Apple's JSON feed of the same pages. The text below is quoted word for word. Confidence: high.

**Navigation, not promotion**
- "Use a tab bar to support navigation, not to provide actions." (Tab bars)

**Badges**
- "Use a badge to indicate that critical information is available. You can display a badge — a red oval containing white text and either a number or an exclamation point — on a tab to indicate that there's new or updated information in the section that warrants a person's attention. Reserve badges for critical information so you don't dilute their impact and meaning." (Tab bars)
- So a red, numbered "new offers" badge would go against this. Home already uses the red badge for drives to sort, which is a real task. That's why the Perks indicator below is a small dot in brand green, not the system red badge, and it's rare.

**Monochrome tab bars and colour on Liquid Glass**
- "If your app already has bright, colorful content in the content layer, prefer a monochromatic appearance for tab bars, or choose an accent color with sufficient visual differentiation." (Tab bars)
- "Apply color sparingly to the Liquid Glass material, and to symbols or text on the material. If you apply color, reserve it for elements that truly benefit from emphasis, such as status indicators or primary actions. … Refrain from adding color to the background of multiple controls." (Color › Liquid Glass color)
- "Symbols and text that appear on Liquid Glass can have color, like in a selected tab bar item." (Color). Apple's own example of colour in a tab bar is the *selected* item.
- "By default, symbols and text on these elements follow a monochromatic color scheme." (Color)
- "In apps with primarily monochromatic content or backgrounds, choosing your brand color as the app accent color can be an effective way to tailor your app experience and reflect your company's identity." (Color). This supports green for the selected tab, as we do now.

**Not colour alone**
- "Avoid relying solely on color to differentiate between objects, indicate interactivity, or communicate essential information. … you can use text labels or glyph shapes to identify objects or states." (Color)
- "Offer visual indicators, like distinct shapes or icons, in addition to color to help people perceive differences in function and changes in state." (Accessibility)

**Contrast**
- The Accessibility page has a table: text up to 17 pt needs 4.5:1, text of 18 pt or more needs 3:1, and bold text of any size needs 3:1.
- "If your app doesn't provide this minimum contrast by default, ensure it at least provides a higher contrast color scheme when the system setting Increase Contrast is turned on. … check the minimum contrast in both light and dark appearances."
- "If you define a custom color, make sure to supply light and dark variants, and an increased contrast option for each variant." (Color)

**SF Symbols**
- "Prefer filled symbols or icons for consistency with the platform." (Tab bars)
- "an iOS tab bar prefers the fill variant." (SF Symbols)
- We already use `.fill` symbols on every tab, so no change is needed. Swapping between outline (unselected) and filled (selected) is no longer Apple's pattern, so the cue that isn't colour should be the pill and the label weight.

**iOS 26 Liquid Glass**
- "A tab bar floats above content at the bottom of the screen. Its items rest on a [Liquid Glass] background." (Tab bars)
- The native iOS 26 tab bar marks the selected item with a glass lozenge behind it. The pill below echoes that on our JS tab bar, so it will look familiar.
- Our bar is the JS tab bar (`expo-router/js-tabs`), so it is a solid bar, not Liquid Glass. Moving to native tabs is a separate decision and out of scope here.

## 2. Accessibility

### Current set-up, read from the code

- `milemint/src/app/(tabs)/_layout.tsx` sets only `tabBarActiveTintColor: theme.accent`. Nothing sets the inactive tint, background, label style or accessibility label.
- Every icon is an SF Symbol drawn by `SymbolIcon` (`milemint/src/components/symbol-icon.tsx`), tinted with the `color` the tab bar passes in.
- **The Money tab's "filled circle"** is just the symbol `sterlingsign.circle.fill`, or `dollarsign.circle.fill` outside the UK. It is filled in both states and only its tint changes, so unselected it is a solid grey disc, the heaviest glyph in the bar. No extra drawing is involved.
- **The inactive colour** comes from the library default: `colors.text` at 50% alpha. See `node_modules/expo-router/build/react-navigation/bottom-tabs/views/BottomTabItem.js`, lines 26–30.
- **The bar background** is `colors.card`, from the nav theme in `src/app/_layout.tsx`:
  - light: the DefaultTheme white `rgb(255,255,255)`;
  - dark: `#121212`.
- **The labels** are 10 pt (`labelBeneath`).
- **Badge:** the Home badge uses `colors.notification`, which is red, and fades and scales in over 150 ms (`elements/Badge.js`).
- **VoiceOver label** defaults to "<title>, tab, N of 5", built in English inside `BottomTabBar.js`, lines 283–287, with `aria-selected` set. The Home badge's count is **not** in the label, so VoiceOver users don't hear "3 drives to sort".
- Theme: `milemint/src/constants/theme.ts`, where the accent is `#0B7A55` in light mode and `#34D399` in dark.

### Measured contrast (WCAG 2.x formula, alpha blended onto the bar)

| | Light (bar #FFFFFF) | Dark (bar #121212) | Needs |
|---|---|---|---|
| Unselected grey now | rgba(28,28,30,.5) → **#8E8E8E: 3.28:1** | rgba(229,229,231,.5) → **#7C7C7C: 4.49:1** | Icon 3:1 (1.4.11) passes; 10 pt label 4.5:1 (1.4.3, HIG) **fails** both |
| Selected green | #0B7A55: 5.34:1 | #34D399: 9.74:1 | Passes |
| Selected vs unselected (now) | 1.63:1 | 2.17:1 | The state is mostly hue |
| Proposed unselected | **#6E6E73: 5.07:1** | **#98989D: 6.52:1** | Passes |
| Proposed with Increase Contrast | #3C3C43: 10.94:1 | #C7C7CC: 11.12:1 | Passes |
| Selected green on proposed pill | #0B7A55 on #E6F2ED: 4.65:1 | #34D399 on #163A2E: 6.51:1 | Passes |
| Gold idea, for reference | #CA8A04: 2.94:1 (fails); #B8860B: 3.25:1 | #FBBF24: 11.2:1 | Gold barely clears 3:1 on white |

**The trade-off.**
- Darkening the grey to pass 4.5:1 brings it to almost the same lightness as the green: 1.05:1 in light mode, 1.49:1 in dark.
- For someone with red-green colour blindness, selected and unselected would then look nearly the same.
- So contrast can't be fixed alone. It has to come with a selected-state cue that isn't colour (the pill and the semibold label), which is what Apple and WCAG 1.4.1 ask for anyway.

**WCAG wording.** Fetched from the W3C's GitHub source on 3 October 2026, because w3.org is blocked from this sandbox. Confidence: high.
- From Understanding 1.4.11: "any visual information necessary to indicate state, such as whether a component is selected … must also ensure that the information used to identify the control in that state has a minimum 3:1 contrast ratio. This success criterion does not require that changes in color that differentiate between states of an individual component meet the 3:1 contrast ratio…"
- Also from Understanding 1.4.11: "Non-text information within controls that uses a change of hue alone to convey the value or state … is likely to fail the Use of color criterion."
- Links:
  - https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
  - https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html

**A permanently coloured Perks tab, and who it hurts.**
- With Perks gold and, say, Drives selected in green, two tabs are coloured.
- People with deuteranopia or protanopia see green (#0B7A55) and gold as similar yellow-olive shades. They lose the one cue that says which tab is open, and may read Perks as selected.
- VoiceOver users aren't affected visually, because the selected state is announced. But a colour that means "promoted" carries nothing to them, so the dot needs a spoken label (see the spec).
- Low-vision users with Increase Contrast on would get a gold tab that doesn't adapt.

## 3. Precedents

**Confidence: medium at best.** Apart from Instagram, these come from general knowledge of the apps, not from a primary source checked today. Tab bars change often, so get current App Store screenshots before any of this is quoted outside the team. I couldn't verify Tesco Clubcard or Three+.

| App | What it does | How it reads |
|---|---|---|
| **Instagram** | Added a Shop tab in 2020 and **removed it in February 2023**, putting Create back in the centre. Mosseri said the change was to "simplify" the app. Source: https://www.nbcnews.com/tech/instagram-will-remove-shop-tab-rcna64998 and https://www.idownloadblog.com/2023/01/10/instagram-navigation-bar-changes-shop-tab-removal/ (high) | A commercial tab in the bar didn't earn its place. Shopping moved into the feed, stories and reels, at the moments people are already looking. That is the same idea as our "four quiet moments" in `perks-simulation.md`. |
| **TikTok** | The centre "+" is a distinct two-tone button, not a tab: it starts an action (filming). | It works because it is the app's core action. Apple says tab bars are for navigation, not actions. Perks isn't our core action. |
| **Revolut, Monzo** | Monochrome bars with the selected item highlighted. Promotions and rewards sit inside screens, not in a permanently coloured tab. Monzo uses badges or dots sparingly. (medium) | They're money apps that keep the bar calm to look trustworthy. That's the bar we're judged against. |
| **Uber** | Home, Services, Activity, Account in plain black and white. Uber One and promotions are pushed inside Home and Services. Source for the tab names: https://9to5mac.com/2023/02/22/uber-simplified-home-screen-live-activities/ (medium) | Revenue features don't need a coloured tab. |
| **Deliveroo** | Plain tab bar. Plus and offers live in screens and in an offers area. Source: https://becleverwithyourcash.com/how-to-save-money-at-deliveroo/ (low–medium) | The same pattern. |
| **Starbucks** | A rewards and loyalty app whose bar is all one style with a green selected tint. Pay/Scan is reached in one tap but isn't coloured differently. Source: https://9to5google.com/2018/10/31/starbucks-android-redesign-bottom-bar/ (medium, older) | Even a loyalty-first app keeps the tabs uniform. |
| **Tesco Clubcard, Three+** | Not verified. | — |

**Pattern:** the well-known money and service apps keep tabs uniform and highlight only the selected one. Promotion lives in content, and a dot appears when there's something new. The only permanently distinct item, TikTok's "+", is an action.

## 4. Decision against the criteria

| | (a) As is | (b) Better grey + cues | (c) Gold/partner Perks | (d) Dot when new | **(b)+(d) chosen** |
|---|---|---|---|---|---|
| Attention for Perks | Low | Low | High, but becomes wallpaper | High when it matters | Good |
| Apple's guidance | OK | Best | Against "sparingly" | Borderline (badges are for "critical") | Good if rare |
| Accessibility | Fails 4.5:1; hue only | Passes | Breaks the selected state | OK with a VoiceOver label | Passes |
| Calm and trustworthy | Yes | Yes | No: reads like an ad | Yes if rare | Yes |
| Pro perks | — | — | Tempts "Pro gold" creep | Must not be used for Pro | Same for free and Pro |

A partner's colour is the worst version of (c). It would change with each partner, its contrast is unknown, and putting another brand's colour on our tab bar looks like that brand's app.

## 5. Implementation spec for the coding agent

Files: `milemint/src/app/(tabs)/_layout.tsx` and `milemint/src/constants/theme.ts`.

**New theme tokens**

| Token | Light | Dark | Increase Contrast (light / dark) |
|---|---|---|---|
| `tabInactive` | `#6E6E73` | `#98989D` | `#3C3C43` / `#C7C7CC` |
| `tabActive` (= accent) | `#0B7A55` | `#34D399` | same |
| `tabActivePill` | `#E6F2ED` | `#163A2E` | same |
| `tabNewDot` (= accent) | `#0B7A55` | `#34D399` | same |

Bar background and border stay as they are: `#FFFFFF` / `#D8D8D8` in light, `#121212` / `#2E3135` in dark.

**Tabs `screenOptions`**
- `tabBarActiveTintColor: theme.accent`
- `tabBarInactiveTintColor`: `tabInactive`, or its Increase Contrast value when `AccessibilityInfo.isDarkerSystemColorsEnabled()` is true. Listen for `darkerSystemColorsChanged`. This is iOS only, so default to false elsewhere.
- `tabBarActiveBackgroundColor: tabActivePill`
- `tabBarItemStyle: { borderRadius: 14, marginHorizontal: 4, marginVertical: 4 }`. On a 375 pt-wide iPhone SE each tab is still about 67 pt wide.
- `tabBarLabel: ({ focused, color, children }) => <Text style={{ fontSize: 10, fontWeight: focused ? '600' : '500', color }} allowFontScaling={false}>{children}</Text>`
  - Keep `allowFontScaling` matching the library default (false where the Large Content Viewer is supported), so long-press still shows the large label.
  - Check that the label width doesn't jump between weights.
- Icons: unchanged. Keep the `.fill` symbols, and keep Money's `*.circle.fill`. Its tint follows the state like every other tab.

**Perks "new" dot**
- **Visibility** = `hasNewPartnerOffer && !perksFocused`.
- **What counts as "new":** an offer id not in a stored set `perksSeenOfferIds` that is:
  - for the user's region and vehicle;
  - not a demo offer (`DEMO_OFFERS` never count);
  - not expired.
- **When it clears:**
  - Opening the Perks tab adds every current id to the seen set and clears the dot.
  - It shows at most once every 7 days. Store `perksDotLastShownAt` and suppress until 7 days have passed, even if more offers arrive.
- **Rules:**
  - The dot never appears for Pro content, Pro teasers or "upgrade" lines, matching `pro-value-plan.md` ("no badge, no red dot").
  - Free and Pro users get exactly the same dot.
  - Ship it behind a flag that is off until the first real partner is live.
- **Drawing:**
  - Draw the dot inside `tabBarIcon`, not with `tabBarBadge`, so it doesn't use the library's red colour or its 150 ms fade and scale animation.
  - An 8 pt circle, `tabNewDot` fill, with a 1.5 pt ring in the bar colour (`#FFFFFF` / `#121212`) to separate it from the glyph.
  - Absolutely positioned at the icon's top right (`top: 0, right: -2`).
  - Render it the same in the active and inactive icon copies, since the tab bar draws both on top of each other.
- **Motion:** the dot appears and disappears with **no animation**, so Reduce Motion needs nothing. If anyone later adds a pulse or fade, it must check `useReducedMotion()` and be static when that is on.

**VoiceOver**
- **Perks, with the dot showing:** `tabBarAccessibilityLabel: t('Perks, new offers')`. VoiceOver then says "Perks, new offers, selected/tab". Without the dot, leave the default.
- **Home:** include the count, as `tabBarAccessibilityLabel: unsorted > 0 ? t('Home, {n} drives to sort', { n: unsorted }) : undefined`. It is currently silent, which is an existing gap.
  - Use the plural rules for each language.
- **Default label:** react-navigation builds "…, tab, N of 5" in English for every language. Ask qa to check on a device with a non-English language whether VoiceOver reads the English "tab, 4 of 5". If it does, set `tabBarAccessibilityLabel` to the translated title on every tab and rely on `role="tab"` and `aria-selected` for "tab" and "selected".
- **New strings, all 10 languages:**
  - "Perks, new offers"
  - "Home, {n} drives to sort", with plural forms
- Wording rule: "drives to sort" is fine. Never "tracking".

**Not doing**
- Don't colour any unselected tab.
- Don't use a gold, amber or partner colour in the bar.
- Don't use a red badge on Perks.
- Don't use a numbered count on Perks.

**QA checklist**
1. Check light, dark, and Increase Contrast in both.
2. Check with Settings › Accessibility › Display › Color Filters set to greyscale and to deuteranopia: the selected tab must still be obvious from the pill and the weight.
3. Check VoiceOver on all five tabs, with and without the dot, in English and one other language.
4. Check on an iPhone SE width.
5. Check that the dot clears when Perks is opened and doesn't come back within 7 days.
6. Run preflight before any build, and only build when the founder asks.

## Confidence and open points

- **High:** the HIG quotes, WCAG wording, contrast numbers and code readings.
- **Medium or low:** the precedents, except Instagram.
- **Open:** whether to move to native tabs (`expo-router/native-tabs`) for real Liquid Glass on iOS 26 is a separate call. If we do, iOS draws the selected lozenge and Increase Contrast itself. The pill and grey tokens then fall away, but the dot and VoiceOver rules still apply.
