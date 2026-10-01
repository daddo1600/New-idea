# zh-Hans accuracy review (check 2 of 3: back-translation)

Reviewer: independent second check. File: `src/i18n/locales/zh-Hans.ts`.

## Scope

- All 662 entries were back-translated on their own and compared with the English key. Plural objects, `{{placeholders}}` and `<b>` tags were checked too.
- Context was checked in the source for these lines: `{{amount}} back in your pocket`, `+{{distance}} … your app missed`, `Your driving`, `Where do you drive?`, `Swipe to sort business trips`, the `returnIsDue`/`{{dueLine}}` lines, `{{used}} of {{limit}} free drives in {{month}}`, `Past trips keep their names.`, and `{{rate}}` in welcome.
- `npx jest src/i18n` passes after the changes (30/30).

Overall the meaning holds well. Tax figures, dates, thresholds and form names were all correct, and "estimated" / "not tax advice" are kept. The fixes below are mostly cases where the Chinese said more than the English, plus a few clumsy phrasings.

## Changes (21 lines)

| English | Before | After | Why |
|---|---|---|---|
| +{{distance}} km your app missed | 配送 App 漏算了 +{{distance}} 公里 | +{{distance}} 公里，配送 App 漏算了 | "漏算了 +5" marks the extra twice. This is a big-number display, so the number now leads. |
| +{{distance}} miles your app missed | 配送 App 漏算了 +{{distance}} 英里 | +{{distance}} 英里，配送 App 漏算了 | Same as above. |
| I use MileMint … so nothing goes unclaimed. | …一点都不漏报。 | …该申报的一点都不落下。 | In tax language 漏报 usually means *failing to declare income*, which is the wrong and alarming sense. The new wording matches the other "unclaimed" lines. |
| I’ve found {{amount}} in business mileage with MileMint … | 找到了 {{amount}} 的工作里程抵扣 | 找到了价值 {{amount}} 的工作里程 | 抵扣 (deduction) is added. The English only says the mileage is worth this much, so the Chinese was a firmer tax statement. |
| MileMint has now found {{amount}} in business mileage for you. … (×4: Hard work… / Nicely done… / That’s real money… / every penny…) | 找到 {{amount}} 的工作里程抵扣 | 找到价值 {{amount}} 的工作里程 | Same as above. The rest of each sentence is unchanged. |
| My delivery app counted … I'd have missed claiming. (×6: km/miles × week/month/last month) | …差点就漏报了。 | …差点就没能申报。 | 漏报 has the "failed to declare" sense. The English means "missed claiming". |
| Name, e.g. Cargo bike | 名称，例如：载货自行车 | 名称，例如载货自行车 | Made consistent with the other "Name, e.g." placeholders. |
| Select {{count}} unsorted | 选择 {{count}} 次未分类 | 选择 {{count}} 次未分类行程 | The noun was missing, so the line read as unfinished ("select 3 times unsorted"). |
| Sort {{count}} drives | 分类 {{count}} 次行程 | 给 {{count}} 次行程分类 | 分类 + object is unidiomatic as a verb phrase. The new wording matches the 给…分类 pattern used everywhere else. |
| The IRS asks for a record made at or near the time of each trip… | 在每次行程当时或前后及时记录 | 在每次行程当时或之后不久做好记录 | 前后 includes "before the trip". The IRS "at or near the time" means at the time or soon after. |
| Swipe to sort business trips | 滑动分类工作行程 | 滑动即可给行程分类 | This is a Pro-table feature row. The old wording back-translated as "swipe-classify business trips" (sorting only business ones). The feature sorts trips into business or personal. |
| Where do you drive? | 你在哪里开车？ | 你在哪个国家开车？ | This is the title of the country step (welcome.tsx, Step 1 · Country). 哪里 reads as "which place/road" and doesn't ask for a country. |
| Your driving | 你的驾驶 | 你的行车 | This is a Settings section header (vehicles, "New drives start as business", Shift mode). 你的驾驶 sounds like "your driving skill". |

## Unsure list, resolved

1. **使用App时允许**: kept. This is the zh-Hans button in the iOS location alert (允许一次 / 使用App时允许 / 不允许). Settings uses a different wording, **使用App期间**, which is correctly used for "While Using the App" / “While Using”. The translator's split is right.
2. **更改为始终允许**: kept, with no inner quotes. This is the follow-up alert button (next to 保持仅使用期间允许), and iOS writes it without quote marks.
3. **允许访问位置信息**: kept. This is the header on Settings → App → 位置.
4. **下次询问或在我共享时**: kept. It matches iOS 16+ zh-Hans.
5. **“设置”→“通知”**: kept. Apple's zh-Hans help docs quote menu paths this way.
6. **{{dueLine}}**: checked in tax-countdown.tsx and tax-dates.tsx. `{{year}} … 申报截止日` works as a standalone label (it sits above the date on Tax dates and next to the day count on the card) and before "：还有 N 天" / "：就在今天". No change.
7. **价值看得见** (Worth money): natural for a short feature heading. No change.
9. **班次和派送**: acceptable. 跑单 would be more colloquial, but it is slangier. No change.
10. **剧情反转：开车也有回报**: fine, and makes no money promise.
11. **{{month}}**: `toLocaleDateString(displayLocale, { month: 'long' })` gives "10月" for zh-Hans-*, so `10月免费行程已用 3/40 次` reads correctly.

## Unresolved / for check 3

- **Moped → 助力车** (Unsure #8). In mainland usage 助力车 often means an electric-assist bicycle or e-bike rather than a 50cc scooter. 轻便摩托车 is the dictionary term, but "Moped or motorbike" would then become 轻便摩托车或摩托车. It is left as 助力车 because it is understood. Check 3 may prefer 踏板车/轻便摩托车 (note that 踏板车 is already used for "scooter").
- iOS strings were checked from knowledge of zh-Hans iOS 17/18, not on a physical device. A device screenshot check of the two location alerts is still worthwhile.
- `+{{amount}} since you last looked` → 比上次查看时 +{{amount}} is understandable but a little stiff. It is left as is.

## Round 3: logbook, P87, privacy and backup (October 2026)

All 201 new lines were back-translated cold and compared with the English. I checked placeholders, the 5 years / 12 weeks / 10,000 miles / 5,000 km figures, units (英里 only in the UK-only P87 lines, 公里 only in the AU-only logbook lines), and that every "about" / "estimated" / "not tax advice" caveat is still there. Context was checked in `app/claim-relief.tsx`, `app/index.tsx`, `app/logbook.tsx`, `app/settings.tsx`, `app/welcome.tsx`, `app/add-trip.tsx`, `domain/privacy.ts`, `backup/copy.ts` and `milestones/copy.ts`.

Things confirmed in the code:
- The stored privacy label is always the English `Client visit · <area>` (`domain/privacy.ts`, `CLIENT_VISIT`), and it is what goes in the HMRC/ATO report. So the add-trip alert keeps “Client visit · 区域” in English, because that is what the user will see on the trip. Only the purpose-picker chip "Client visit" (客户探访) is translated.
- `{{year}}` in the logbook cost lines is an income-year label such as 2026–27. `{{distance}}` in the logbook nudge already has its unit.
- `{{limit}}` in the P87 route lines is a money amount (£2,500), not a distance.
- P87 relief lines say 减免 (relief) and 退税 (tax back) separately and never call the relief itself a refund. 约 and 估算 are kept.
- `npx jest src/i18n/__tests__/completeness.test.ts -t "zh-Hans "` passes.

| English | Before | After | Why |
|---|---|---|---|
| Pick 12 weeks that are typical… you add the reason for each work trip. | …你只需为每次工作行程填写事由。 | …你来为每次工作行程填写事由。 | 只需 ("you only need to") added a reassurance the English doesn't make. |
| Start logbook | 开始记录 | 开始行车日志 | Back-translated as just "Start recording". The button starts the logbook period. |
| {{vehicle}}’s costs in {{year}} | {{vehicle}} 在 {{year}} 的用车费用 | {{vehicle}} 在 {{year}} 收入年度的用车费用 | `{{year}}` is "2026–27"; 在 2026–27 的 reads as a bare number. |
| {{category}} in {{year}}, in dollars | {{year}} {{category}}（澳元） | {{year}} 收入年度的 {{category}}（澳元） | Same. Screen-reader label for each cost box. |
