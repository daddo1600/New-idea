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
