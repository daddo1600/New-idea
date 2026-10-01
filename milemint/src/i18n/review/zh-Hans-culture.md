# zh-Hans cultural and UX-copy review (check 3 of 3)

Reviewer: independent third check, done by a mainland Mandarin speaker who knows Chinese courier communities in AU, CA and the UK. File: `src/i18n/locales/zh-Hans.ts`.

## Scope

All 662 lines were read for offence and slang double meanings, tone, money/tax honesty, units, UI fit and naturalness. Context was checked in the source for `domain/reminders.ts`, `domain/seasons.ts`, `milestones/copy.ts`, `app/welcome.tsx` and `components/launch-intro.tsx`. `npx jest src/i18n` passes (30/30).

Nothing was offensive, political or about nationality. Country names are neutral (美国 / 英国 / 加拿大 / 澳大利亚), and no line touches mainland, Taiwan or Hong Kong. The festive lines use the neutral commercial forms (节日快乐, 万圣节快乐, 新年快乐). Every change below is for slang risk, money honesty, unit neutrality or naturalness.

## Changes (28 lines)

| English | Before | After | Why |
|---|---|---|---|
| Game on! 🎯 | 开干！🎯 | 开工大吉！🎯 | 干 carries a vulgar sexual sense in mainland internet slang, and 开干 also reads as "start a fight". 开工大吉 is a warm traditional opener and echoes the 开工 button. |
| Let’s do this! 💪 | 冲吧！💪 | 加油！💪 | 冲 has a crude slang reading in some online circles. This was rewritten to the zero-tolerance standard. |
| Time to roll! 🚗 | 上路啦！🚗 | 出车啦！🚗 | 上路 is also a euphemism for dying or execution ("送你上路"). That is an unlucky word for drivers. 出车 is what working drivers say. |
| G’day! Summer on the road ☀️ | 你好呀！夏日上路 ☀️ | 你好呀！夏日出车好时光 ☀️ | Same 上路 issue. |
| Plot twist: driving pays | 剧情反转：开车也有回报 | 剧情反转：这些路没白跑 | 开车 is common slang for smutty talk, so 开车也有回报 can be read the wrong way out of context in a notification. The new line also drops the "pays" money promise. |
| Free money alert 💸 | 发钱提醒 💸 | 天上不掉馅饼 💸 | 发钱 sounds like a giveaway or scam pitch. The idiom ("no free pie falls from the sky") keeps the joke and is honest. |
| Well, technically it’s your money. Sort this week’s drives to claim it back. | 好吧，严格来说那本来就是你的钱。给本周行程分类，把它拿回来。 | 不过这笔本来就是你的。给本周行程分类，该申报的别落下。 | This follows the new title. 把它拿回来 promised money back, so the line now says to claim what you're entitled to. |
| Swipe right on savings | 右滑，为省钱心动 | 右滑，心动一下 | 省钱 promises a saving. The dating-app pun works without it. |
| Swipe this week’s trips business or personal and see what you’ve earned back. | …看看你拿回了多少。 | …看看它们值多少。 | "Got back" promised a refund. The app shows an estimated value. |
| Sort this week’s drives and bank the deduction. Done in a minute. | …把抵扣额稳稳收好。… | …把可抵扣的里程记清楚。… | 稳稳收好 sounded like a guaranteed deduction. |
| MileMint has now found {{amount}} … That’s real money back at tax time. | …报税时，这可是实打实的钱。 | …报税时，这些记录都用得上。 | Promised money. The new line keeps the warm "this pays off" feeling without a refund claim. |
| Sort your drives … before {{date}}. Every business mile is money back. | …每一英里工作里程都能换回钱。 | …每一英里工作里程都算数。 | 换回钱 promised money back. |
| Sort your drives … before {{date}}. Every business kilometre is money back. | …每一公里工作里程都能换回钱。 | …每一公里工作里程都算数。 | Same as above. |
| {{amount}} back in your pocket | {{amount}} 回到你的口袋 | 里程价值达到 {{amount}} | The old line was literal translationese and read as a promised refund. It is now milestone wording that matches the message below it (已为你找到价值 {{amount}} 的工作里程). |
| Money back | 找回的钱 | 里程价值 | This is the Milestones section header. 找回的钱 implies money recovered. |
| Your money back and badges | 找回的钱和徽章 | 里程价值和徽章 | Same as above, and consistent with the header. |
| Never miss a mile. | 一英里都不漏。 | 一趟都不落下。 | This welcome tagline is shown in every country, including km ones. Unit-neutral now. |
| Every business mile, counted. | 每一英里工作里程，一个不漏。 | 每一段工作里程，都记得清清楚楚。 | This is the welcome title, shown before the country is chosen. 里程 is unit-neutral. |
| I’ve found {{amount}} in business mileage with MileMint 🚗💸 Every mile counted, automatically. | …每一英里都自动记下。 | …每一段路都自动记下。 | The share line is used in every country. It has no km variant. |
| Your kilometres called 📞 | 你的公里数来电了 📞 | 你的里程来电了 📞 | 公里数来电 is clumsy. 里程 is still correct for km and matches the miles line. |
| Miles don’t sort themselves… | 英里数不会自己分类…… | 英里可不会自己分好类…… | This is a more playful, natural joke setup. The unit is kept because there is a km variant. |
| Kilometres don’t sort themselves… | 公里数不会自己分类…… | 公里可不会自己分好类…… | Same as above. |
| Moped or motorbike | 助力车或摩托车 | 踏板车或摩托车 | This resolves the open point from check 2. In mainland usage 助力车 mostly means an e-assist bicycle. Couriers on a Honda PCX-type bike call it 踏板车. The term matches "Motorbike or scooter" (摩托车或踏板车), and at 7 characters it fits the one-third-width button. |
| Uber Eats, … Car, van, moped or bike. | …汽车、货车、助力车或自行车。 | …汽车、货车、踏板车或自行车。 | Same term. |
| +{{amount}} since you last looked | 比上次查看时 +{{amount}} | 比上次查看又多了 {{amount}} | This polishes check 2's note. The old line was stiff, half-symbol phrasing. 又多了 already says "+" and reads warmly under the total. |
| {{distance}} miles · a typical month of business driving | {{distance}} 英里 · 典型的一个月工作里程 | {{distance}} 英里 · 通常一个月的工作里程 | 典型的一个月 is translationese. |
| {{distance}} km · a typical month of business driving | {{distance}} 公里 · 典型的一个月工作里程 | {{distance}} 公里 · 通常一个月的工作里程 | Same as above. |
| Site visit | 现场走访 | 去现场 | 走访 sounds like an official or inspection visit. 去现场 is how tradespeople say it, and it matches 见客户. |

## Checked and kept

- **Unit-neutral already:** {{achievement}} share line (每一段路都不漏记), Sunny days (工作里程照样攒), Autumn/Fall (秋天的里程), Missed miles check (漏记里程检查). Every miles/km pair keeps its own unit.
- **Jokes:** 咚咚咚 / 谁呀？ (knock-knock), 周日焦虑, 未来的你会感谢你, 我们一个个数过了, 最累的活，车已经干完了 (干活 is the standard sense here) and 本周最轻松的一场“约会” all land and stay kind. 第一个月我请客 is fine as the user's own referral voice.
- **Money:** "estimated" (估算) and "not tax advice" (不构成税务建议) are present wherever the English has them. 最划算 (Best value) is a standard, non-pushy badge.
- **UI fit:** tabs, badges, buttons and country tiles (4 characters at most for 澳大利亚) are all short. 你 is used throughout, never 您.
- **Numbers:** a 4 only appears in factual figures (e.g. 4 tax years). There are no 死 puns.

## Still worth doing (not blocking)

- A device screenshot check of the two iOS location alerts (already noted by check 2).

## Sign-off

**Approved for release.**

## Round 3: logbook, P87, privacy and backup (October 2026)

All 201 new lines were read as a Chinese-speaking carer in the UK and a courier in Australia would read them: tone, money honesty, privacy reassurance, glossary consistency, iOS wording and button/label length (≤1.3× English).

- **Money:** relief (减免) is never presented as a refund. Every tax-back figure has 约 or 估算, and the "depends on your income and tax rate" and "not tax advice" lines are kept. 看起来更有利 compares methods without promising savings.
- **Privacy:** lines are calm and plain (我们只保存所在区域，绝不保存他们的地址). Nothing suggests hiding anything from the tax office; 对税务局来说，有区域、距离和事由就够了 says what the tax office needs.
- **Backup:** says it is encrypted (加密), stored in the user's own iCloud, and that MileMint never sees the trips.
- **iOS wording:** iCloud Drive → iCloud 云盘 and iCloud Keychain → iCloud 钥匙串, Apple's zh-Hans names, following the precedent of Apple Account → Apple 账户. Paths quote iOS as before (iPhone 的“设置”→你的姓名→“iCloud”).
- **Terms:** logbook = 行车日志 (glossary); logbook method = 行车日志法; cents per km method kept in English; reason = 事由; personal/private = 私人; employee = 雇员; claim (to HMRC) = 申请/申报 and expense claims = 报销.
- No offensive or slang double meanings were found. 开车 is avoided in headings (汽车工作里程超过 5,000 公里？).

| English | Before | After | Why |
|---|---|---|---|
| I visit clients or patients at home (care, nursing, support work) | 我会上门探访客户或病人（护理、照护、支援服务） | 我会上门探访客户或患者（照护、护理、支援服务） | 患者 is the respectful healthcare word; 病人 is blunt. The order now follows the English. |
| Area only | 只存区域 | 只保存区域 | 存 alone is clipped. This now matches the 只保存所在区域？ title of the same alert. |
| Relief to claim | 可申请减免 | 可申请减免额 | Row label next to an amount; 额 makes it read as a figure. |
| Estimated tax back | 估算退税 | 估算退税额 | Same as above. |
| Backed up just now | 刚刚已备份 | 上次备份：刚刚 | This is the status line in the Backup section. 上次备份：… is the familiar iOS pattern. |
| Backed up {{count}} minutes ago | {{count}} 分钟前已备份 | 上次备份：{{count}} 分钟前 | Same as above. |
| Backed up {{count}} hours ago | {{count}} 小时前已备份 | 上次备份：{{count}} 小时前 | Same as above. |
| Backed up {{count}} days ago | {{count}} 天前已备份 | 上次备份：{{count}} 天前 | Same as above. |
| The logbook method looks better: about {{amount}} more. | …约多 {{amount}}。 | …约多出 {{amount}}。 | 约多 + number is ambiguous ("about how many"). 多出 makes it read as "more by". |
| Cents per km looks better: about {{amount}} more. | …约多 {{amount}}。 | …约多出 {{amount}}。 | Same as above. |
| Spreadsheet (CSV) | 表格（CSV） | 电子表格（CSV） | 表格 alone also means a paper form, which is confusing next to "P87 form". |

## Round 3b: shift switch and number format

Each line was translated, back-translated cold, then checked for culture and length (the shift hint is a wrapping caption under the shift bar; target ≤1.3× English). The logbook parser now accepts both decimal points and decimal commas. `npx jest src/i18n` passes.

| English | Before | After | Why |
|---|---|---|---|
| Swipe back to end your shift. | (missing) | 往回滑动即可收工。 | New line. Back-translation: "Swipe back to clock off." Mirrors "滑动开工" and uses 收工 for End shift (你 implied). |
| {{hint}}. Swipe the button to the left, or double-tap. | (missing) | {{hint}}。向左滑动按钮，或连按两下。 | New VoiceOver hint; mirrors the "向右滑动按钮" line exactly. |
| Enter amounts as numbers, e.g. 2400 or 2,400.50. | 请用数字输入金额，例如 2400 或 2,400.50。 | (unchanged) | Checked: English-style example is standard in Chinese; no dot instruction. |

## Round 4: referrals

28 new lines (Invite friends screen, the friend’s-code box in the welcome and Settings, the celebration share button, the free-plan counter, the share message with the code) and 3 removed (Invite a friend, Share it, Share MileMint on WhatsApp and more). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rule for all of them: the friend’s bonus is immediate, the sharer’s only “when a friend joins”, so nothing promises the user drives they don’t have yet. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| You both get +10 free drives a month when a friend joins. | 朋友加入后，你们俩每月都能多得 10 次免费行程。 | “+10” written as 多得 10 次, the natural Chinese way to say a bonus. |
| code (referral) | 邀请码 | The term Chinese apps use for referral codes; never just 代码. |
| Your friends get their extra drives… coming in an update. | …你的奖励会在 MileMint 能统计已加入的朋友后发放，这项功能将在后续更新中推出。 | Honest timing: “will be issued once MileMint can count…, coming in a later update”. |
| Redeem | 兑换 | Apple’s 兑换 for codes. |
| How it works | 了解规则 | “See the rules”: natural for a referral link; 如何运作 sounds technical. |
| Share it · friends get +10 drives | 分享 · 朋友多得 10 次行程 | Short; fits the pill. |

## Round 5: single-use invites

Referrals now use single-use invites: every share makes a new code that works for one friend, and a friend’s code stays **pending** (no bonus yet) until iCloud confirms it. 15 new lines (the Invite friends screen and Settings, the pending and confirmed states of the friend’s-code box, the reasons a code is turned down, the share message) and 6 removed (Your code, Share my code, the old hero line, the old “friends get their drives at once” note, the old own-code message and the old share line). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rule for all of them: nothing implies one permanent personal code, and nothing promises drives before the invite is confirmed. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| Send a friend an invite. When they join MileMint with it, you both get 10 extra free automatic drives a month. For every friend, with no limit. | 给朋友发一份邀请。朋友用它加入 MileMint 后，你们俩每月都能多得 10 次免费自动记录的行程。每位朋友都算，没有上限。 | “Send a friend an invitation. After the friend joins MileMint with it, you both get 10 more free auto-recorded trips a month. Every friend counts, no limit.” Same phrasing as Round 4’s hero line. |
| Send an invite | 发送邀请 | “Send invitation” 4 characters. |
| Every invite has its own code, for one friend. | 每份邀请都有专属邀请码，仅限一位朋友使用。 | “Every invitation has its own invite code, for one friend only.” *专属* = exclusive; *仅限一位* makes the single use clear. |
| Invites sent: {{count}} | 已发送邀请：{{count}} 份 | “Invitations sent: {{count}}” Measure word *份* for invitations. |
| Invites are confirmed through iCloud, which is coming in an update. Friends who join before then get their extra drives once it’s switched on, and so do you. | 邀请需通过 iCloud 确认，这项功能将在后续更新中推出。在此之前加入的朋友，会在功能开启后获得额外行程，你也一样。 | “Invitations need confirming through iCloud; this feature will come in a later update. Friends who join before then get extra trips once it’s on, and so do you.” Mirrors Round 4’s “这项功能将在后续更新中推出”. |
| You entered {{code}}. Your 10 extra drives are on their way once the invite is confirmed. | 你已输入 {{code}}。邀请确认后，你的 10 次额外行程就会到账。 | “You’ve entered {{code}}. After the invitation is confirmed, your 10 extra trips will arrive.” *到账* = credited; common in Chinese apps. |
| Code {{code}} saved | 已保存邀请码 {{code}} | “Invite code {{code}} saved” Mirrors “已添加邀请码 {{code}}”. |
| Your 10 extra drives are on their way once the invite is confirmed. | 邀请确认后，你的 10 次额外行程就会到账。 | “After the invitation is confirmed, your 10 extra trips will arrive.” |
| Your invite code is {{code}}. Enter it when you set up MileMint for 10 extra free drives a month. | 你的邀请码是 {{code}}。设置 MileMint 时输入它，每月可多得 10 次免费行程。 | “Your invite code is {{code}}. Enter it when setting up MileMint and get 10 more free trips a month.” |
| We couldn’t find that invite. Check the code with your friend. | 找不到这个邀请。请和朋友核对一下邀请码。 | “Can’t find this invitation. Please check the invite code with your friend.” |
| That invite has already been used. Ask your friend to send you a new one. | 这个邀请已经被使用过了。请朋友再发一份新的给你。 | “This invitation has already been used. Ask your friend to send you a new one.” |
| That’s one of your own invites. Send it to a friend instead. | 这是你自己发出的邀请，发给朋友吧。 | “This is an invitation you sent yourself; send it to a friend.” |
| This Apple Account has already joined with a friend’s invite. | 此 Apple 账户已经通过朋友的邀请加入过了。 | “This Apple Account has already joined through a friend’s invitation.” *Apple 账户* as in existing lines. |
| 🎉 Your friend’s invite is confirmed | 🎉 朋友的邀请已确认 | “🎉 Friend’s invitation confirmed” |
| Your friend’s invite couldn’t be used | 无法使用朋友的邀请 | “Can’t use the friend’s invitation” |

**Sign-off:** approved, pending an on-device check of the new alert titles.

## Round 8: fair free plan

The free plan is made fair, with no surprise paywall. Personal drives no longer use the 40 free drives. Drives past the limit stay fully visible and sortable, and they are in the spreadsheet; only their value (money) waits for Pro. The limit is stated up front on the welcome screen, on the home meter ("What counts?" sheet) and on the paywall. 26 new lines, 13 removed (the old “locked drive” row, “Kept, locked”/“Unlocked”, the old meter and welcome lines, the old Settings plan line). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rule for all of them: nothing says a drive is *locked* or *hidden* any more. A drive past the limit is *saved and shown*, and only its **value** waits for Pro. “Work drives” uses the glossary’s business term. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| Saved · value unlocks with Pro | 已保存 · 升级 Pro 解锁金额 | “Saved · upgrade to Pro to unlock the amount.” *金额* (amount) instead of *价值* (value): in Chinese “value” of a trip reads abstract; the amount is what waits. |
| Saved. This month’s free drives are used, so a drive sorted back from personal waits for Pro to show its value. Drives already showing their value keep it. | 已保存。本月免费次数已用完，所以从私人改回工作的行程要升级 Pro 才会显示金额。已经显示金额的行程会一直保留。 | “Saved. This month’s free count is used up, so a trip changed back from personal to work only shows its amount after upgrading to Pro. Trips already showing an amount keep it.” |
| {{used}} of {{limit}} free work drives in {{month}} | {{month}}免费工作行程已用 {{used}}/{{limit}} 次 | “{{month}} free work trips used {{used}}/{{limit}} times”. Same pattern as the old meter line. |
| Free: {{count}} work drives a month. Personal drives don’t count, and a shift counts once a day. Trips you add by hand are always free. Pro: unlimited. | 免费：每月 {{count}} 次工作行程。私人行程不计数，一个班次每天只算一次。手动添加的行程永远免费。Pro：不限次数。 | “Free: 40 work trips a month. Personal trips aren’t counted; a shift only counts once a day. Trips added by hand are always free. Pro: no limit.” 班次 for shift (glossary). |
| Personal drives don’t count. Sort one personal and the next drive gets its place. | 私人行程不计数。把一次行程分类为私人，下一次行程就补上它的名额。 | “Personal trips aren’t counted. Classify a trip as personal and the next trip fills its slot.” 名额 (“slot”) is the everyday word for a quota place. |
| Past the limit nothing is hidden or lost: every drive is saved, shown in full, can be sorted and is in your spreadsheet export. Only its value waits for Pro. | 超出限额也不会隐藏或丢失任何内容：每次行程都会保存、完整显示、可以分类，也会出现在电子表格导出里。只有金额要等 Pro 解锁。 | “Even past the limit nothing is hidden or lost: every trip is saved, shown in full, can be classified and appears in the spreadsheet export. Only the amount waits for Pro.” |
| The month’s earliest drives go first, so a drive showing its value keeps it. The count starts again on the 1st. | 每月最早的行程优先计入，所以已显示金额的行程会一直保留。每月 1 日重新计数。 | “Each month’s earliest trips count first, so a trip already showing its amount keeps it. The count restarts on the 1st of each month.” |

**Sign-off:** approved, pending an on-device check of the “What counts?” sheet and the long welcome line on a small iPhone.

## Round 6: shift rows

The home list now shows one row per shift, which opens to its drives. A drive that runs past the end of a shift is cut there, and the part after it (the drive home) is left to sort. Shifts can be paused for an errand, started late (“Start shift from 10:40?”), have their times corrected, be undone for a few seconds after ending, and say when they end by themselves at 16 hours or the car has been parked at home a while. 41 new lines (row, legs, time steppers, pause, offers, undo toast, two notifications, a stored place label). Three passes per line: translate; cold back-translation against the English; culture, honesty and length. Rules for all of them: the shift, drive and sort terms from the glossary; the part after a shift is never called personal (it is *not counted as work unless you choose*); nothing promises a tax result. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| {{count}} drives | other: {{count}} 次行程 | “{{count}} trips” |
| {{count}} drives since then look like deliveries. They’ll be added to the shift as business. | other: 从那时起的 {{count}} 次行程看起来是在送货，会作为工作行程加入本班次。 | “The {{count}} trips since then look like delivering; they’ll join this shift as work trips.” 送货 as “Delivery or collection”. |
| {{purpose}} · {{count}} to sort | other: {{purpose}} · {{count}} 次待分类 | “{{purpose}} · {{count}} to classify” |
| After your shift ended · not counted as work unless you say so | 收工之后 · 除非你自己标记，否则不算工作 | “After finishing work · not counted as work unless you mark it yourself” 收工 = end of shift, as the button. |
| Deliveries | 送货 | “Delivering goods” |
| Did your shift start at {{time}}? | 你是 {{time}} 开工的吗？ | “Did you start work at {{time}}?” 开工 = start shift. |
| Drives join or leave the shift by when they started. A drive past the end is cut there. | 行程按开始时间计入或移出班次。收工时还在进行的行程，会在收工那一刻分成两段。 | “Trips are counted into or out of the shift by start time. A trip still going at finishing time is split into two at that moment.” |
| During a pause in your shift · not counted as work unless you say so | 班次暂停期间 · 除非你自己标记，否则不算工作 | “While the shift is paused · not counted as work unless you mark it yourself” |
| End 15 minutes earlier | 收工时间提前 15 分钟 | “Finish time 15 minutes earlier” |
| End 15 minutes later | 收工时间推后 15 分钟 | “Finish time 15 minutes later” |
| End your shift? | 要收工吗？ | “Finish work?” |
| Ended {{time}} | {{time}} 收工 | “Finished at {{time}}” |
| Hide drives ▴ | 收起行程 ▴ | “Collapse trips ▴” |
| Hides the drives in this shift | 收起这个班次的行程 | “Collapses this shift’s trips” |
| It was still on, so MileMint ended it. Drives from now on are left for you to sort. Tap to check the times. | 班次一直没收工，MileMint 已帮你收工。之后的行程留给你自己分类。轻点查看时间。 | “The shift was never finished, so MileMint finished it for you. Later trips are left for you to classify. Tap to see the time.” 轻点, as elsewhere. |
| Map of the drives in this shift | 这个班次的行程地图 | “Map of this shift’s trips” |
| On shift | 开工中 | “Working” As the shift bar. |
| Pause | 暂停 | “Pause” |
| Pause the shift for a personal errand | 为私事暂停班次 | “Pause the shift for a personal matter” |
| Paused · {{elapsed}} | 已暂停 · {{elapsed}} | “Paused · {{elapsed}}” |
| Paused: drives now aren’t counted as work. Resume when you’re back. | 已暂停：现在的行程不算工作。回来后再继续。 | “Paused: current trips don’t count as work. Continue when you’re back.” |
| Resume | 继续 | “Continue” |
| Resume the shift | 继续班次 | “Continue the shift” |
| Shift | 班次 | “Shift” |
| Shift ended | 已收工 | “Finished work” |
| Shift on {{date}}, {{span}}, {{hours}}, {{distance}}, {{drives}}, {{value}} | {{date}} 的班次，{{span}}，{{hours}}，{{distance}}，{{drives}}，{{value}} | “Shift of {{date}}, …” |
| Show drives ▾ | 查看行程 ▾ | “View trips ▾” |
| Shows the drives in this shift | 展开这个班次的行程 | “Expands this shift’s trips” |
| Since {{time}} | 从 {{time}} 起 | “From {{time}}” |
| Start 15 minutes earlier | 开工时间提前 15 分钟 | “Start time 15 minutes earlier” |
| Start 15 minutes later | 开工时间推后 15 分钟 | “Start time 15 minutes later” |
| Start from {{time}} | 从 {{time}} 开工 | “Start work from {{time}}” |
| Start shift from {{time}}? | 从 {{time}} 开始算开工？ | “Count work as starting from {{time}}?” |
| Started {{time}} | {{time}} 开工 | “Started work {{time}}” |
| Still working | 还在干活 | “Still working” |
| Undo | 撤销 | “Undo” iOS 撤销. |
| Undo ending the shift | 撤销收工 | “Undo finishing work” |
| Where your shift ended | 收工地点 | “Finishing place” |
| You’ve been parked at home for a while and your shift is still on. Drives after it ends aren’t counted as work. | 你已在家停车一段时间，班次还没收工。收工后的行程不算工作。 | “You’ve been parked at home for a while and the shift isn’t finished. Trips after finishing don’t count as work.” |
| You’ve been parked at home since {{time}}. Drives after the shift aren’t counted as work. | 你从 {{time}} 起就停在家里了。收工后的行程不算工作。 | “You’ve been parked at home since {{time}}. Trips after finishing don’t count as work.” |
| Your shift ended after 16 hours | 班次满 16 小时，已自动收工 | “Shift reached 16 hours, finished automatically” |

**Sign-off:** approved, pending an on-device look at the shift row and the undo toast in this language.

## Round 7: tracking health

Tracking health: home card, Settings “追踪检查” row and background notifications. 24 new lines. Terms: *行程*, *自动追踪*, *记录*, *补记*, 你. iOS wording: “设置”, “位置”, “精确位置” in Apple’s corner quotes style; *轻点* as elsewhere. Three passes per line: translate; cold back-translation against the English; culture, honesty and length (titles and the Settings row wrap; buttons ≤1.3× English). Rule for all of them: say plainly what's wrong and the one tap that fixes it, never blame the driver, and say "may" wherever a missed drive isn't certain. `npx jest src/i18n` passes.

| English | Translation | Back-translation / check |
|---|---|---|
| Precise Location is off | “精确位置”已关闭 | ““Precise Location” is off”. Apple’s zh-Hans toggle is 精确位置. |
| MileMint only gets a rough position, so drives can’t be measured. In Settings, tap Location and turn on Precise Location. | MileMint 只能获得大致位置，无法测量行程。请在“设置”中轻点“位置”，然后打开“精确位置”。 | “MileMint can only get an approximate location and can’t measure trips. In “Settings” tap “Location”, then turn on “Precise Location”.” |
| Tracking has stopped | 追踪已停止 | “Tracking has stopped”. |
| Automatic tracking stopped running, so new drives aren’t being logged. | 自动追踪已停止运行，新行程不会被记录。 | “Automatic tracking has stopped running; new trips won’t be recorded.” |
| Tracking may have stopped | 追踪可能已停止 | “Tracking may have stopped”. |
| No location since {{time}}, in the middle of a drive. | 行程途中，自 {{time}} 起没有位置信息。 | “During the trip, no location information since {{time}}.” |
| Turn tracking back on | 重新开启追踪 | “Turn tracking back on”. 6 characters. |
| Tracking stopped {{from}}–{{to}} | 追踪中断：{{from}}–{{to}} | “Tracking interrupted: {{from}}–{{to}}”. |
| A drive may have been missed | 可能漏记了一次行程 | “A trip may have been missed”. 漏记 = “missed recording”. |
| About {{distance}} may be missing. Add the missed trip? | 约 {{distance}} 可能漏记了。要补记这次行程吗？ | “About {{distance}} may have been missed. Record this trip afterwards?” 补记 matches the “补记行程” button. |
| Your phone moved about {{distance}} between {{from}} and {{to}}, but no drive was logged. Add the missed trip? | 你的手机在 {{from}} 到 {{to}} 之间移动了约 {{distance}}，但没有记录任何行程。要补记这次行程吗？ | “Your phone moved about {{distance}} between {{from}} and {{to}}, but no trip was recorded. Record this trip afterwards?” |
| Not a drive | 不是行程 | “Not a trip”. |
| All good | 一切正常 | “Everything is normal”. |
| just now | 刚刚 | “just now”. |
| {{count}} minutes ago | other: {{count}} 分钟前 | “{{count}} minutes ago”. other only. |
| {{count}} hours ago | other: {{count}} 小时前 | “{{count}} hours ago”. |
| {{count}} days ago | other: {{count}} 天前 | “{{count}} days ago”. |
| Tracking check | 追踪检查 | “Tracking check”. |
| Last location: {{ago}} | 上次位置：{{ago}} | “Last location: {{ago}}”. |
| No location yet | 暂无位置 | “No location for now”. |
| Location access for MileMint is off, so drives aren’t being logged. Tap to turn it back on. | MileMint 的位置权限已关闭，行程不会被记录。轻点即可重新开启。 | “MileMint’s location permission is off; trips won’t be recorded. Tap to turn it back on.” |
| Drives can’t be measured from a rough position. Tap to fix it. | 仅凭大致位置无法测量行程。轻点即可修复。 | “Trips can’t be measured from an approximate location alone. Tap to fix.” |
| New drives aren’t being logged. Tap to turn tracking back on. | 新行程没有被记录。轻点即可重新开启追踪。 | “New trips aren’t being recorded. Tap to turn tracking back on.” |
| No location since {{time}}, in the middle of a drive. Open MileMint to pick it back up. | 行程途中，自 {{time}} 起没有位置信息。打开 MileMint 即可继续追踪。 | “During the trip, no location information since {{time}}. Open MileMint to continue tracking.” |

**Sign-off:** approved.


## Round 8: pre-release fixes

| English | zh-Hans | Back-translation | Note |
|---|---|---|---|
| Where your shift started | 开工地点 | Place where work started | Mirrors the existing "Where your shift ended" line, same length and register. |

## Round 8b: business purpose

| English | zh-Hans | Back-translation | Note |
|---|---|---|---|
| Opens trip details | 打开行程详情 | Opens trip details | Matches the row’s existing hint. |
| Usual purpose · tap to change | 常用事由 · 点按可更改 | Usual reason · tap to change | *事由* as in “工作事由”. |
| Purpose needed for your tax records | 报税记录需要填写事由 | Tax records need a reason filled in | Natural, fits its place. |
| Shows only the drives that need a purpose | 只显示需要填写事由的行程 | Shows only trips that need a reason | Natural, fits its place. |
| {{count}} work drives need a purpose | other: {{count}} 次工作行程需要填写事由 | {{count}} work trips need a reason | Measure word 次 as in “{{count}} 次工作行程”. |
| {{authority}} expects a purpose for every business drive. One tap each. | {{authority}} 要求每次工作行程都有事由。每次点一下就好。 | {{authority}} requires every work trip to have a reason. Just one tap each. | *要求* as in “{{authority}} 要求填写工作事由”. |
| Add purposes › | 添加事由 › | Add reasons › | Natural, fits its place. |
| Every work drive has a purpose ✓ | 每次工作行程都有事由了 ✓ | Every work trip has a reason now ✓ | Natural, fits its place. |
| Show all drives | 显示全部行程 | Show all trips | Natural, fits its place. |
| {{count}} work drives have no purpose | other: {{count}} 次工作行程没有事由 | {{count}} work trips have no reason | Natural, fits its place. |
| {{authority}} expects a purpose for every business drive. Add them before you export? | {{authority}} 要求每次工作行程都有事由。导出前先补上吗？ | {{authority}} requires every work trip to have a reason. Fill them in before exporting? | 补上 = fill in what’s missing; natural and short. |
| Export anyway | 仍然导出 | Export anyway | Natural, fits its place. |
| Add purposes | 添加事由 | Add reasons | Natural, fits its place. |
| Usual business purpose | 常用工作事由 | Usual work reason | Natural, fits its place. |
| Clear | 清除 | Clear | Natural, fits its place. |
| Filled in for work drives that have none, so your tax records are complete. Shift drives use “Deliveries” unless you choose one. | 自动填入没有事由的工作行程，让报税记录完整。开工期间的行程使用“送货”，除非你另选一个。 | Filled in automatically on work trips without a reason, so tax records are complete. Trips while on shift use “Deliveries” unless you choose another. | *开工* as in “自动：开工中”. |
| Filled in for work drives that have none, so your tax records are complete. You can change it on any trip. | 自动填入没有事由的工作行程，让报税记录完整。任何行程都可以单独修改。 | Filled in automatically on work trips without a reason, so tax records are complete. Any trip can be changed individually. | Natural, fits its place. |
| None: ask me each time | 不设置：每次问我 | Don’t set: ask me each time | Natural, fits its place. |
| What are most of your work drives for? | 你的工作行程大多是做什么？ | What are your work trips mostly for? | Natural, fits its place. |
| Tax offices want a purpose for every business drive. We’ll fill this in for you, and you can change it on any trip. | 税务机关要求每次工作行程都有事由。我们会帮你填好，任何行程都可以修改。 | Tax authorities require every work trip to have a reason. We’ll fill it in for you; any trip can be changed. | Natural, fits its place. |


## Round 8c: work purpose tiles

Back-translations: Multiple choice allowed. The first one chosen is filled in for you automatically. / Filled in for you automatically / Common (usual). "Default" is rendered with the same word as the existing "Usual purpose" line, so the badge and the trip note match.


## Round 8d: permission preview

The four new lines reuse this file's existing wording: the two iOS button names are taken from the quoted part of "Tap “Allow While Using App”" and "Tap “Change to Always Allow”", "Tap “{{button}}”" keeps that line's frame, and "{{step}} OF 2" is "↑ {{step}} OF 2" without the arrow. No new terms.

## Round 8e: shorter setup

The welcome’s privacy line now names the phone, not the iPhone. Home and work are no longer asked during set-up; the home screen asks “Is this home?” / “Is this work?” instead. The removed set-up lines (“Where’s home?”, “Step 4 · Places”, …) are gone from the dictionary.

| English | zh-Hans | Back-translation | Note |
|---|---|---|---|
| No account. Your trips stay on your phone. | 无需注册账户。你的行程只保存在你的手机上。 | No account needed. Your trips are saved only on your phone. | Keeps “无需注册账户”; *手机* instead of iPhone. |
| Is this home? {{place}} | 这里是家吗？{{place}} | Is this home? {{place}} | *家* as in “Home”; full-width question mark. |
| You stopped here for the night. Trips to and from it will read “Home”. | 你在这里停了一夜。往返这里的行程将显示为“家”。 | You parked here for a night. Trips to and from here will show “Home”. |  |
| Yes, that’s home | 是，这是我家 | Yes, this is my home |  |
| No | 不是 | No | “不是” answers a 是…吗 question naturally. |
| Is this work? {{place}} | 这里是工作地点吗？{{place}} | Is this the workplace? {{place}} | *工作地点* as in “Work”. |
| You’re often parked here in your work hours. Trips will read “Work”, and drives between home and work are flagged as commutes. | 你常在工作时间停在这里。行程将显示为“工作地点”，家和工作地点之间的行程会标为通勤。 | You often park here in work hours. Trips will show “Workplace”, and trips between home and workplace will be marked as commutes. | *通勤* as in the commute notes. |
| Yes, that’s work | 是，这是工作地点 | Yes, this is the workplace |  |


## Round 8f: motion activity

iOS’s own names: “运动与健身” (设置), “允许” / “不允许” (alert). “行程” and “你” as everywhere else. The alert’s own title and body come from iOS (the body is the English NSMotionUsageDescription), so the preview shows them as grey bars.

| English | Translation | Back-translation | Notes |
|---|---|---|---|
| One more for accuracy: Motion & Fitness | 再开一项，记录更准确：运动与健身 | Turn on one more, for more accurate records: Motion & Fitness | |
| Lets MileMint tell driving from walking, so a stroll is never logged as a trip. It stays on your phone. | 让 MileMint 分辨开车和步行，散步绝不会被记成行程。数据只留在你的手机上。 | Lets MileMint tell driving from walking; a walk will never be recorded as a trip. The data only stays on your phone. | |
| Turn on Motion & Fitness | 开启运动与健身 | Turn on Motion & Fitness | |
| Allow | 允许 | Allow | |
| Don’t Allow | 不允许 | Don’t allow | |
| Motion & Fitness | 运动与健身 | Motion & Fitness | |
| On | 已开启 | On | |
| Off | 已关闭 | Off | |

## Round 8g: practice tutorial

The practice run after setup (sorting two sample drives, a sample shift) and home’s first, empty screen worded from the setup answers. Business, personal, swipe and shift reuse this file’s existing words.

| English | Translation | Back-translation | Note |
|---|---|---|---|
| Swipe on your shift when you start work. Every drive in it counts as {{purpose}}. | 开始干活时滑动开工。开工期间的每次行程都算作{{purpose}}。 | When you start work, swipe to start. Every trip while on shift counts as {{purpose}}. | *滑动开工* as on the shift bar. |
| Drives in your hours ({{days}} {{from}}–{{to}}) are sorted as business for you. | 你工作时间（{{days}} {{from}}–{{to}}）内的行程会自动归为工作。 | Trips within your work hours ({{days}} {{from}}–{{to}}) are filed as work automatically. | Full-width brackets. |
| Drives in your work hours are sorted as business for you. | 你工作时间内的行程会自动归为工作。 | Trips within your work hours are filed as work automatically. | Natural, fits its place. |
| After each drive, swipe right for business or left for personal. | 每次行程后，右滑为工作，左滑为私人。 | After each trip, swipe right for work, left for personal. | *右滑/左滑* as in the auto notes. |
| {{rate}} a mile · {{vehicle}} · {{country}} | 每英里 {{rate}} · {{vehicle}} · {{country}} | {{rate}} per mile · {{vehicle}} · {{country}} | Natural, fits its place. |
| {{rate}} a km · {{vehicle}} · {{country}} | 每公里 {{rate}} · {{vehicle}} · {{country}} | {{rate}} per km · {{vehicle}} · {{country}} | *每公里* as in the vehicle note. |
| PRACTICE RUN | 练习一下 | A LITTLE PRACTICE | Eyebrow; no capitals in Chinese. |
| This is how a drive shows up after you park. Try sorting it. | 停车后行程会这样显示。试着给它分类。 | After you park a trip shows like this. Try classifying it. | Natural, fits its place. |
| Swipe left for personal | 私人请左滑 | If personal, swipe left | As in the auto note. |
| Not that way. Try again. | 方向不对，再试一次。 | Wrong direction, try again. | Natural, fits its place. |
| Sorted as personal ✓ | 已归为私人 ✓ | Filed as personal ✓ | Natural, fits its place. |
| Now a work drive. Work drives are worth money back. | 再来一段工作行程。工作行程可以帮你拿回钱。 | Next, a work trip. Work trips can get you money back. | Natural, fits its place. |
| Swipe right for business | 工作请右滑 | If work, swipe right | Natural, fits its place. |
| Sorted as business: worth {{amount}} | 已归为工作：价值 {{amount}} | Filed as work: worth {{amount}} | *价值* as in the row. |
| Swipe to start your shift | 滑动即可开工 | Swipe to start work | Natural, fits its place. |
| Your shift is on ✓ | 已开工 ✓ | Shift started ✓ | *开工* as in “开工中”. |
| Mark as personal | 标为私人 | Mark as personal | As in the row buttons. |
| Mark as business | 标为工作 | Mark as work | Natural, fits its place. |
| Practice drive · not saved | 练习行程 · 不会保存 | Practice trip · not saved | Natural, fits its place. |
| Supermarket | 超市 | Supermarket | Natural, fits its place. |
| Office | 办公室 | Office | Natural, fits its place. |
| Customer | 顾客 | Customer | Natural, fits its place. |
| That’s it. Just drive: trips appear here after you park. | 就这样。尽管开车：停车后行程会出现在这里。 | That’s it. Just drive: trips appear here after you park. | *尽管开车* as in the old empty state. |
| Start driving | 出发吧 | Let’s go | Button. |
| Skip | 跳过 | Skip | Natural, fits its place. |
| Skip the practice run | 跳过练习 | Skip the practice | Natural, fits its place. |
| Tutorial | 教程 | Tutorial | Natural, fits its place. |
| Replay the tutorial | 重看教程 | Watch the tutorial again | Natural, fits its place. |
| Try sorting two sample drives again. Nothing is saved. | 再练习分类两段示例行程。不会保存任何内容。 | Practise classifying two sample trips again. Nothing is saved. | Natural, fits its place. |
| Replay | 重看 | Watch again | Natural, fits its place. |

## Round 8i: parking & tolls

Parking and tolls on a drive: the “+ Parking or tolls” fields when adding a trip and on the trip screen, the line on a business trip’s row and under home’s total, the report screen, and each country’s line on what counts. Tax terms stay in English as elsewhere (Mileage Allowance Relief, Car, van and travel expenses, T2125, D2, cents per km, Congestion Charge, ULEZ). The “recorded” lines are for Canada and UK employees, where they aren’t added to the total.

| English | Translation | Back-translation | Note |
|---|---|---|---|
| Kept with the drive, but only counted on business drives. | 随行程保存，但只在工作行程上计入。 | Saved with the trip, but only counted on work trips. | Add trip / trip details: note under the fields on a personal drive. |
| + Parking or tolls | + 停车费或过路费 | + Parking fee or toll | Add trip: the link that opens the two fields. Keep the "+". |
| incl. {{amount}} parking & tolls | 含 {{amount}} 停车费和过路费 | incl. {{amount}} parking fees and tolls | Home hero card, under the total; lower-case start as it continues the figure. |
| Parking & tolls: {{amount}} (recorded) | 停车费和过路费：{{amount}}（已记录） | Parking fees and tolls: {{amount}} (recorded) | Home hero card where they aren’t added (Canada, UK employees). |
| +{{amount}} parking & tolls | +{{amount}} 停车费和过路费 | +{{amount}} parking fees and tolls | Trip row detail on a business drive. |
| A claim line for every business trip (date, from, to, purpose, distance, rate, amount, parking and tolls) for your employer’s expense system. | 每段工作行程一行报销明细（日期、起点、终点、事由、距离、费率、金额、停车费和过路费），用于提交到雇主的报销系统。 | One reimbursement line per work trip (date, start, end, reason, distance, rate, amount, parking fees and tolls), for submitting to the employer’s reimbursement system. | Report screen: expense-claim export description (was without parking and tolls). |
| Mileage at {{authority}} rates | 按 {{authority}} 费率计算的里程 | Mileage calculated at {{authority}} rates | Report screen: the mileage part of the total. |
| Parking | 停车费 | Parking fee | Field label and report line. |
| Tolls | 过路费 | Toll | Field label and report line (bridge and road tolls, Congestion Charge, ULEZ). |
| Included in the total above. {{note}} | 已计入上面的总额。{{note}} | Already counted in the total above. {{note}} | Report screen; note = the country’s line below. |
| Recorded, not included in the total above. {{note}} | 已记录，但未计入上面的总额。{{note}} | Recorded, but not counted in the total above. {{note}} | Report screen (Canada, UK employees); note = the country’s line below. |
| Enter parking as an amount, e.g. 3.50. | 请输入停车费金额，例如 3.50。 | Please enter the parking amount, e.g. 3.50. | Error under the fields. |
| Enter tolls as an amount, e.g. 3.50. | 请输入过路费金额，例如 3.50。 | Please enter the toll amount, e.g. 3.50. | Error under the fields. |
| Parking or tolls over {{max}} for one drive? Check the amount. | 一段行程的停车费或过路费超过 {{max}}？请检查金额。 | One trip’s parking or toll over {{max}}? Please check the amount. | Error; max = £1,000.00 / $1,000.00. |
| {{what}}, in {{currency}} | {{what}}，单位 {{currency}} | {{what}}, unit {{currency}} | VoiceOver label of a money box, e.g. "Parking, in GBP". |
| Business parking and tolls are deductible on top of the mileage rate. Parking at your regular workplace isn’t, and fines never are. | 工作停车费和过路费可以在里程费率之外另行抵扣。在固定工作地点停车不行，罚款一律不行。 | Work parking and tolls can be deducted separately besides the mileage rate. Parking at your fixed workplace can’t, and fines never can. | US note under the fields. |
| Parking at your regular place of work and tolls on your commute are not deductible. | 在固定工作地点停车的费用，以及通勤途中的过路费，都不能抵扣。 | Parking costs at your fixed workplace, and tolls on your commute, can’t be deducted. | US report guidance (PDF stays English). |
| Self-employed: business parking, tolls and Congestion Charge or ULEZ charges are claimed on top of the mileage rate. Parking and traffic fines never are. | 自雇者：工作的停车费、过路费以及 Congestion Charge 或 ULEZ 费用，可以在里程费率之外另行申报。停车罚款和交通罚款一律不行。 | Self-employed: work parking, tolls and Congestion Charge or ULEZ charges can be claimed separately besides the mileage rate. Parking and traffic fines never can. | UK self-employed note under the fields. |
| Parking and tolls aren’t part of Mileage Allowance Relief. Claim them from your employer, or as a separate employment expense if they don’t repay them. Fines never count. | 停车费和过路费不属于 Mileage Allowance Relief。请找雇主报销；如果雇主不报销，可作为单独的工作开支申报。罚款一律不算。 | Parking and tolls aren’t part of Mileage Allowance Relief. Ask your employer to reimburse them; if they don’t, claim them as a separate work expense. Fines never count. | UK employee note under the fields. |
| Self-employed: parking, tolls and Congestion Charge or ULEZ charges on business journeys are added on top of the mileage figure, in the same Car, van and travel expenses box. Parking and traffic fines are never allowable. | 自雇者：工作行程的停车费、过路费以及 Congestion Charge 或 ULEZ 费用，加在里程金额之上，填在同一个 Car, van and travel expenses 栏目。停车罚款和交通罚款一律不能抵扣。 | Self-employed: parking, tolls and Congestion Charge or ULEZ charges on work trips are added on top of the mileage amount, in the same Car, van and travel expenses box. Parking and traffic fines can never be deducted. | UK report guidance (PDF stays English). |
| Employees: parking and tolls are not part of Mileage Allowance Relief. They are listed separately, to claim from your employer or as a separate employment expense. | 雇员：停车费和过路费不属于 Mileage Allowance Relief。它们单独列出，可找雇主报销，或作为单独的工作开支申报。 | Employees: parking and tolls aren’t part of Mileage Allowance Relief. They’re listed separately, to reimburse from the employer or claim as a separate work expense. | UK report guidance (PDF stays English). |
| Recorded apart from the per-km figure. Self-employed: business parking is usually claimed in full. Ask your accountant about tolls. | 与按公里计算的金额分开记录。自雇者：工作停车费通常可全额申报。过路费请咨询你的会计师。 | Recorded separately from the per-km amount. Self-employed: work parking can usually be claimed in full. For tolls, ask your accountant. | Canada note under the fields. |
| Parking and tolls are listed separately and not added to the per-km figure. Self-employed: business parking fees are deducted in full on T2125, not reduced to your business-use share. Ask your accountant whether your tolls can be claimed. | 停车费和过路费单独列出，不计入按公里计算的金额。自雇者：工作停车费在 T2125 上全额抵扣，不按工作用车比例折算。过路费能否申报，请咨询你的会计师。 | Parking and tolls are listed separately, not counted in the per-km amount. Self-employed: work parking is deducted in full on T2125, not prorated by the work-use share. Whether tolls can be claimed, ask your accountant. | Canada report guidance (PDF stays English). |
| Work parking and tolls aren’t covered by cents per km, so they’re claimed separately. Not parking at your regular workplace, or tolls on the way there. | cents per km 不包括工作的停车费和过路费，所以要另行申报。在固定工作地点停车，或去那里途中的过路费除外。 | Cents per km doesn’t include work parking and tolls, so they’re claimed separately. Except parking at your fixed workplace, or tolls on the way there. | Australia note under the fields. |
| Parking fees and tolls for work trips aren’t covered by the cents per km rate. Claim them separately: individuals as Work-related travel expenses (D2), sole traders with business expenses. Not parking at your regular workplace, or tolls between home and work. | cents per km 费率不包括工作行程的停车费和过路费。请另行申报：个人填入 Work-related travel expenses（D2），个体经营者（sole trader）计入业务开支。在固定工作地点停车，或家与工作地点之间的过路费除外。 | The cents per km rate doesn’t include parking and tolls on work trips. Claim them separately: individuals in Work-related travel expenses (D2), sole traders in business expenses. Except parking at your fixed workplace, or tolls between home and workplace. | Australia report guidance (PDF stays English). |
