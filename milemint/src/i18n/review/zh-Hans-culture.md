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
