# Scene calendar: seasons and celebration dates (Oct 2026 – Dec 2027)

**Checked:** 3 Oct 2026, by research. **For:** the local hero scenes (`local-scenes-research.md`, `local-scenes-art-direction.md`), decision of 3 Oct 2026 in `decisions.md`.
**How it was checked:** gov.uk, canada.ca and other primary sites refuse direct fetches from this environment (egress blocked, as in the scenes research). Dates come from web search results that quote the primary source, cross-checked against a second site and the day-of-week arithmetic. Lines marked *(secondary)* rest on those. Moon-sighted dates (Eid) can move by a day. **This is research, not legal advice.**

## Answers first

- **Start now (in date order):** northern autumn leaves; Australian spring (jacaranda); Bonfire Night (UK); Diwali; US Thanksgiving; northern winter + Christmas, with Australia's summer Christmas; New Year. That's 7 pieces of work for the next 3 months.
- **Skip this year:** Canadian Thanksgiving (12 Oct, 9 days away). **Halloween is a stretch only:** show it just Fri 30 – Sat 31 Oct, and only if the redrawn art passes marketing and QA by 23 Oct; otherwise skip.
- **Never decorate:** Remembrance Day / Remembrance Sunday, Veterans Day, Memorial Day, Anzac Day, Juneteenth, Canada's Truth and Reconciliation Day, and **Australia Day** (contested). Keep the normal season scene on those days.
- **Dependency:** the scene engine and the local scenes (art direction §6, steps 1–6) aren't built yet. Until they are, everything for Oct–Dec 2026 has to go on **today's hero and the `season.js` hooks**, picking the country from the time zone, as `season.js` does now. Each piece must also work on the local scenes later.
- **Fix now, in both app and website:** the festive sleigh's lead reindeer has a **red nose** (`website/assets/season.js` `reindeer(72, true)`; `milemint/src/components/season/rider.tsx` `<Reindeer x={72} nose />`). The Rudolph trade mark is described as "a red-tipped nose on any fanciful deer-like animal". Make the nose brown like the others. Confidence: medium (secondary sources quoting the US registration).
- **Standard scene:** no country celebrations and no hemisphere seasons (we don't know where the visitor is). It gets only **New Year** (31 Dec – 2 Jan) and its year-round brand look.

## 1. Where each scene applies

| Area | How we know (scenes research §1) | Seasons | Notes |
|---|---|---|---|
| England, Wales, Northern Ireland | `cf.country = GB` + `cf.region` (hand-check still open) | Northern, 4 seasons | Wales and NI events need the region check. Until then, use only UK-wide dates. |
| Scotland | `cf.region = Scotland` (hand-check open) | Northern; snow only on Highland hills | St Andrew's, Burns Night and Hogmanay need this check. |
| US | `cf.country = US` + state | Northern; snow only in northern and mountain states | — |
| Canada | `cf.country = CA` + province; time zone can't split Quebec from Ontario | Northern; snow almost everywhere except the BC coast | Quebec-only dates (Fête nationale) need `cf.regionCode = QC`. |
| Australia | country + state (time zone works by state) | Southern, flipped; no snow in any city; the tropical north has wet and dry seasons | — |
| Standard (EU, unknown, VPN-like, opted out) | fallback | **None** (neutral brand look) | New Year only. |

## 2. Seasons: when to switch and what's true per place

Base rule: meteorological seasons (spring Mar–May, summer Jun–Aug, autumn Sep–Nov, winter Dec–Feb; flipped for Australia). That's what `season.js` already uses. The visual windows below move a little to match what people actually see.

| Season art | Where | Window | What's visually true | Source / confidence |
|---|---|---|---|---|
| **Autumn leaves** | UK | 1 Oct – 25 Nov | Colour peaks Oct to early Nov; Scotland and the north turn first, the south runs into late Nov. Wet roads, low sun. | [Forestry England leaf watch](https://www.forestryengland.uk/news/forestry-england-launches-autumn-leaf-watch-trees-prepare-colourful-autumn); high |
| | Canada, northern US | 15 Sep – 10 Nov | Sugar maples red and orange; New England and Quebec peak late Sep to mid Oct. Say "fall" on US/CA greetings (`season.js` already does). | General knowledge; medium |
| | Southern US (TX, FL, Gulf, AZ, south CA) | Light touch only, Nov | Little colour change; keep trees green, warm sky. | Medium |
| **Winter, bare trees, frost** | England, Wales, NI, Scottish lowlands and cities | 26 Nov – end Feb | **No lying snow by default:** low-lying areas average about 10 days of lying snow a year. Use frost, bare trees and a pale sky. | [Met Office NE England climate](https://www.metoffice.gov.uk/binaries/content/assets/metofficegovuk/pdf/weather/learn-about/weather/regional-climates/north-east-england_-climate-met-office.pdf); high |
| **Winter with snow** | Scottish Highlands countryside (UK3) | Dec – Mar | Snow on the hills (about 60 days lying in the Highlands); the road itself stays clear. | Same, plus [State of the Coast: snow in Scotland](https://www.stateofthecoast.scot/the-climate-change/decline-of-snow-in-scotland/); medium-high |
| | Canada (not the BC coast) | 1 Dec – 15 Mar | Snowbanks, ploughed roads. Toronto, Montreal, Prairies, Atlantic. Vancouver: rain, with snow only on the North Shore peaks. | Medium |
| | US northern and mountain states (New England, NY, Great Lakes, Midwest, Rockies, Alaska) | 1 Dec – end Feb | Snow. **Not** FL, Gulf, TX, AZ low desert, southern CA or HI. | Medium |
| | Australia | **No snow in any city scene, ever** | Sydney hasn't had snow since 1836. Alpine snow only in a future Snowy Mountains / Victorian Alps scene, from the King's Birthday weekend (2nd Mon in June) to early Oct. Hobart: a little snow on kunanyi/Mt Wellington in winter, on the peak only. | [Skiing in Australia (secondary)](https://en.wikipedia.org/wiki/Skiing_in_Australia), [australia.com Sydney weather](https://www.australia.com/en/facts-and-planning/weather-in-australia/sydney-weather.html); high |
| **Spring blossom** | UK | 20 Mar – 10 May | Cherry, blackthorn, daffodils (daffodils from late Feb). | Medium |
| | Washington DC, US north-east | 20 Mar – 20 Apr | NPS puts DC peak bloom in late March to early April (2026: 29 Mar – 1 Apr). | [NBC Washington quoting NPS](https://www.nbcwashington.com/entertainment/the-scene/cherry-blossoms-dc/when-will-dcs-cherry-blossoms-hit-peak-bloom-park-service-drops-2026-prediction/4070981/); high |
| | Vancouver / BC coast | 1 Mar – 20 Apr | Cherry blossom; average peak about 2 Apr. | [Vancouver Is Awesome](https://www.vancouverisawesome.com/local-news/peak-time-cherry-blossoms-vancouver-bc-scientists-exact-date-5205201); medium |
| | Toronto, Montreal | 25 Apr – 20 May | Later spring; snow can last into April. | Medium |
| | **Australia: jacaranda** | Brisbane / QLD: 25 Sep – 31 Oct; Sydney / NSW: 20 Oct – 30 Nov | Purple street trees. Brisbane peaks first; Sydney peaks about the second week of November. Wattle (yellow) Aug – Sep. | [ABC: jacarandas in Sydney](https://www.abc.net.au/news/2017-10-28/where-to-see-jacaranda-trees-in-sydney/9084172), [Time Out](https://www.timeout.com/australia/things-to-do/the-best-place-to-see-jacarandas-in-australia); medium-high |
| **Summer** | Northern | Jun – Aug | Long light, green; the existing `summer` art. | High |
| | Australia | Dec – Feb | The existing `aussie-summer`: high sun, dry grass, beach light. | High |
| **Wet / dry season** | Darwin, NT, far-north QLD | Wet Nov – Apr (storms, lush green); dry May – Oct | There are no four seasons here; `season.js` would show "winter" in July. **Coding: use wet/dry for the NT and far north.** | [NT tourism: weather and seasons](https://northernterritory.com/plan/weather-and-seasons), BoM via secondary; medium-high |

Rules for the art (from art direction §2.7): never put snow or season art on the **Opera House** or the **CN Tower**. Gums and pines don't change colour.

## 3. Celebrations, Oct 2026 – Dec 2027

**Window:** what we show. "Day" = that date only, local time. **Days away** counts from 3 Oct 2026. **Safe?** ✓ = decorate; ~ = light touch only; ✗ = don't decorate.

| Date(s) | Celebration | Where | Window | Safe? | Imagery and pitfalls | Source |
|---|---|---|---|---|---|---|
| Mon 12 Oct 2026 | Thanksgiving (Canada) | CA | Sat – Mon | ✓ | Harvest, maple, pumpkins. **9 days away: skip.** | [canada-holidays.ca](https://canada-holidays.ca/federal/2027) |
| Sat 31 Oct 2026 | Halloween | US, CA, UK (AU: skip, it's jacaranda season and less marked) | Fri 30 – Sat 31 Oct (normally 24 – 31) | ✓ | Pumpkins, friendly bats, sweets. Not scary or gory; no film characters. | — |
| Tue 3 Nov 2026 | Melbourne Cup | VIC | — | ✗ | "Melbourne Cup" is a VRC registered trade mark; it's also a betting event. Don't. | [IP Australia record via Trademark Elite](https://www.trademarkelite.com/australia/trademark/trademark-detail/344957/MELBOURNE-CUP) |
| Thu 5 Nov 2026 | Bonfire Night | UK (not NI, where it's little marked) | Wed 4 – Sat 7 Nov | ✓ | Fireworks over the hills, a distant bonfire glow. **No Guy figure or effigy.** Reduce Motion: a still sky. | Fixed date |
| Sun 8 Nov 2026 (festival 6 – 10 Nov) | Diwali | All four countries | Fri 6 – Mon 9 Nov | ✓ | Diyas (oil lamps), rangoli, strings of lights, marigolds. **No deities, no Om.** In the UK, 8 Nov is also **Remembrance Sunday**: use lamps and lights, not fireworks, so it sits quietly. Relevant to our hi, pa and bn users. | [diwali.info](https://diwali.info/diwali-dates), [publicholidays.com](https://publicholidays.com/diwali/) |
| Sun 8 Nov 2026 | Remembrance Sunday | UK | — | ✗ | **Never use the poppy.** It's a registered mark of the Royal British Legion (UK) and the Royal Canadian Legion (CA); business use needs permission and is refused for promotion. | [Royal Canadian Legion: the poppy trade mark](https://www.legion.ca/remembrance/the-poppy/the-poppy-trademark) |
| Wed 11 Nov 2026 | Remembrance Day (UK, CA, AU); Veterans Day (US) | All | — | ✗ | No overlay of any kind that day. | — |
| Thu 26 Nov 2026 | Thanksgiving (US) | US | Wed 25 – Sun 29 Nov | ✓ | The busiest driving weekend of the US year, so a good fit. Autumn harvest, pie, a busy highway home. **No Pilgrim or Native American figures.** | 4th Thursday of Nov |
| Mon 30 Nov 2026 | St Andrew's Day (bank holiday) | Scotland | Sat 28 – Mon 30 Nov | ~ | A saltire on a cottage flagpole is fine. Needs the `cf.region` check, so likely skip this year. | [gov.uk bank holidays](https://www.gov.uk/bank-holidays) *(secondary)* |
| 1 – 26 Dec 2026 (Christmas Fri 25, Boxing Day Sat 26; UK bank holiday Mon 28) | Festive season | All four | 1 – 26 Dec (as `season.js`) | ✓ | Lights, a decorated tree, gifts. Snow only where it's true (§2): Australia gets sun, stars and red Christmas bush. Greeting stays "Happy holidays". **Santa: a generic figure is public domain; don't copy Coca-Cola's styling or ads. Reindeer must not have a red nose (Rudolph trade mark).** No nativity. | [Nelligan Law on Rudolph](https://nelliganlaw.ca/the-untold-story-of-rudolph-a-copyrighted-christmas-icon/) |
| 4 – 12 Dec 2026 | Hanukkah | — | — | ~ | No separate scene; the generic "Happy holidays" covers it. Don't add a Christian-only image on top. | [Farmers' Almanac](https://www.farmersalmanac.com/when-hanukkah) |
| Thu 31 Dec 2026 – Sat 2 Jan 2027 | New Year / Hogmanay | All, **including standard** | 31 Dec – 2 Jan (Scotland has a bank holiday on 2 Jan; substitute Mon 4 Jan) | ✓ | Fireworks (the existing art). Sydney: fireworks near the bridge are true to life, but **don't use the City of Sydney "Sydney New Year's Eve" logo or name**, and leave the Opera House unaltered. | *(secondary)* gov.uk |
| Mon 25 Jan 2027 | Burns Night | Scotland | Day | ~ | Low value for a driving scene. Skip. | — |
| Tue 26 Jan 2027 | Australia Day | AU | — | ✗ | **Contested:** many First Nations people mark it as Invasion or Survival Day, and brands get backlash either way (Woolworths, 2024). Show the normal summer scene. | [Mumbrella](https://mumbrella.com.au/is-australia-day-approaching-its-use-by-date-for-marketers-812888), [B&T on Woolworths](https://www.bandt.com.au/woolworths-on-again-off-again-relationship-with-australia-day/) |
| Sat 6 Feb 2027 | Lunar New Year (Year of the Goat) | All four (strong in Vancouver, Toronto, Sydney, Melbourne, SF, NYC) | Fri 5 – Sun 14 Feb | ✓ | Red lanterns, a friendly goat, plum blossom. Say **"Lunar New Year"**, not "Chinese New Year" (Tết and Seollal fall on the same day). No dragons on cars as a gag; no religious images. Relevant to our zh-Hans users. | [Smithsonian](https://www.si.edu/spotlight/lunar-year-goat), [Royal Museums Greenwich](https://www.rmg.co.uk/stories/time/lunar-new-year-dates-animals-zodiac) |
| Mon 1 Mar 2027 | St David's Day | Wales | Day | ~ | Daffodils. Needs the region check. Low. | — |
| Tue 9 or Wed 10 Mar 2027 | Eid al-Fitr | All four | 9 – 11 Mar (covers both possible dates) | ✓ | Crescent moon, stars, lanterns, lights. **No Quranic text, no Kaaba.** Greeting "Eid Mubarak" stays general. Relevant to our bn and hi users. | [IslamicFinder](https://www.islamicfinder.org/special-islamic-days/eid-ul-fitr-2027/) (moon-sighted; ±1 day) |
| Wed 17 Mar 2027 | St Patrick's Day | NI (bank holiday), US, CA, AU | Day (US: Sat 13 – Wed 17 for parades) | ~ | Green, shamrocks. **No leprechaun or drinking jokes.** Ireland itself is EU, so it sees the standard scene. | Fixed date |
| Tue 23 Mar 2027 | Holi | UK, US, CA, AU | Day | ~ | Colour clouds in the sky. Optional; low. | [Prokerala](https://www.prokerala.com/festivals/holi.html) *(secondary)* |
| Fri 26 – Mon 29 Mar 2027 (Easter Sun 28) | Easter | All four | Fri – Mon (Scotland: Fri – Sun; no Easter Monday holiday) | ✓ | Eggs, bunnies, spring blossom in the north; in Australia it's **autumn**, so eggs and a bilby, with no spring flowers. **No crosses.** Avoid Cadbury-purple foil eggs. | [gov.uk bank holidays](https://www.gov.uk/bank-holidays) *(secondary)* |
| Wed 14 Apr 2027 | Vaisakhi | UK, CA (BC, ON), US, AU | Sat 10 – Wed 14 Apr (the big parades are at weekends: Surrey BC, Southall, Birmingham) | ✓ | Golden wheat fields, marigolds, harvest. **No Khanda, Nishan Sahib or Gurus' images** (religious symbols). Relevant to our pa users. | [Drik Panchang](https://www.drikpanchang.com/festivals/vaisakhi/vaisakhi-date-time.html?year=2027), [CalendarLabs](https://www.calendarlabs.com/holidays/sikh/vaisakhi.php) |
| Fri 23 Apr 2027 | St George's Day | England | — | ✗ | The St George's flag can read as political. Skip. | — |
| Sun 25 Apr 2027 | Anzac Day | AU (and NZ) | — | ✗ | **The word "Anzac" needs the Minister's permission for any commercial use** (Protection of Word "Anzac" Regulations 1921). Solemn. Never. | [DVA: protecting the word Anzac](https://www.dva.gov.au/recognition-and-commemoration/education-resources/protecting-the-word-anzac) |
| Sun 16 or Mon 17 May 2027 | Eid al-Adha | All four | 16 – 18 May | ✓ | As Eid al-Fitr; no animals. | [Human Appeal USA](https://humanappealusa.org/news/2026/4/when-is-eid-al-adha-date-meaning-and-how-to-prepare) (±1 day) |
| Mon 24 May 2027 | Victoria Day | CA (not QC: Journée nationale des patriotes) | Sat 22 – Mon 24 | ~ | Long weekend, start of summer, fireworks. Low. | [canada-holidays.ca](https://canada-holidays.ca/federal/2027) |
| Mon 31 May 2027 | Memorial Day | US | — | ✗ | Solemn. Don't. | — |
| Sat 19 Jun 2027 | Juneteenth | US | — | ✗ | A commemoration of the end of slavery; our judgement is that decoration would read as marketing. Don't. | — |
| Thu 24 Jun 2027 | Fête nationale | Quebec | Day | ~ | Blue and white, fleur-de-lis bunting; **no official festival logo.** Needs `QC`. Low. | [canada-holidays.ca](https://canada-holidays.ca/federal/2027) |
| Thu 1 Jul 2027 | Canada Day | CA (not QC-only) | Day | ✓ | Red and white, a natural maple leaf, fireworks. **Don't draw the National Flag:** commercial use needs Canadian Heritage permission. Use a hand-drawn natural leaf, not the 11-point flag leaf. | [canada.ca: commercial use of Canadian symbols](https://www.canada.ca/en/canadian-heritage/services/commercial-use-symbols-canada.html) |
| Sun 4 Jul 2027 (observed Mon 5) | Independence Day | US | Sat 3 – Mon 5 Jul | ✓ | Fireworks, red-white-blue bunting. The Flag Code (4 USC §8) says the flag shouldn't be used in advertising. It's etiquette, not enforced, but use bunting, not the flag itself. | [4 USC §8](https://uscode.house.gov/view.xhtml?req=granuleid%3AUSC-prelim-title4-section8&num=0&edition=prelim) |
| Mon 6 Sep 2027 | Labor Day / Labour Day | US, CA | — | ✗ | No visual hook. Skip. | — |
| Mon 11 Oct 2027 | Thanksgiving (Canada) | CA | Sat 9 – Mon 11 Oct | ✓ | As above. | [canada-holidays.ca](https://canada-holidays.ca/federal/2027) |
| Fri 29 Oct 2027 | Diwali | All four | Thu 28 Oct – Sun 31 Oct | ✓ | Same art as 2026. **It overlaps Halloween:** Diwali takes 28 – 30 Oct and Halloween only 31 Oct. | [diwali.info](https://diwali.info/diwali-dates) |
| Sun 31 Oct 2027 | Halloween | US, CA, UK | Day (see above) | ✓ | | |
| Fri 5 Nov 2027 | Bonfire Night | UK | Thu 4 – Sat 6 Nov | ✓ | | |
| Thu 11 Nov 2027; Remembrance Sunday 14 Nov | Remembrance | All | — | ✗ | | |
| Thu 25 Nov 2027 | Thanksgiving (US) | US | Wed 24 – Sun 28 Nov | ✓ | | |
| Tue 30 Nov 2027 | St Andrew's Day | Scotland | Day | ~ | | |
| 1 – 26 Dec 2027 (Christmas Sat 25; UK bank holidays Mon 27, Tue 28) | Festive | All four | 1 – 26 Dec | ✓ | Hanukkah is 24 Dec 2027 – 1 Jan 2028. | [Farmers' Almanac](https://www.farmersalmanac.com/when-hanukkah) |
| Fri 31 Dec 2027 | New Year | All + standard | 31 Dec – 2 Jan | ✓ | | |

**Clashes to handle in code:** a celebration window beats a season. On the same day, the order is "don't decorate" days (e.g. 11 Nov) > celebration > season. Diwali and Halloween in 2027: split as above.

**Language:** the scene picker never uses browser language (scenes research). Diwali, Vaisakhi, Lunar New Year and Eid show by country to everyone in the four countries: all four are widely marked there and are good, warm, non-religious imagery. That needs no language signal.

## 4. General rules for any celebration art

- No official logos, event names or mascots (Melbourne Cup, Sydney NYE, festival logos, sports teams).
- No remembrance poppies, ever (UK and CA Legion marks); never use the word "Anzac".
- No national flags drawn as flags for Canada; bunting and colours instead for the US. The saltire and the Union flag are fine in moderation (no commercial-use rule found); avoid St George's.
- Religious days: lights, lamps, flowers, food and harvest only. No deities, scripture, places of worship or holy symbols.
- No caricatures of people or cultures (Pilgrims, Native Americans, leprechauns).
- Santa: a generic figure is fine; no Coca-Cola styling. Reindeer: no red nose.
- Every greeting goes to the translator (10 languages); "Fall" for US and CA.
- Reduce Motion: fireworks, bats and falling leaves become a still frame.

## 5. Build schedule (lead time 3–4 weeks per piece)

Rules applied: **under 3 weeks away = skip this year; 3 weeks – 3 months = do now, soonest first; over 3 months (after about 3 Jan 2027) = low priority.** "Start by" = window start minus about 4 weeks. Everything up to New Year goes on today's hero and `season.js` (the engine isn't built), redrawn to the quality bar that kept `SEASONS_LIVE = false`.

| # | Piece | Live window | Start by | Status |
|---|---|---|---|---|
| — | Canadian Thanksgiving 2026 | 10 – 12 Oct | — | **Skip this year** (9 days) |
| 0 | Fix: brown nose on the festive reindeer (app + website) | before 1 Dec | now | Tiny; goes into the next grouped build |
| 1 | **Autumn leaves, northern** (redraw `autumn`, switch on for UK/US/CA) | now – 25 Nov (UK) | **now** | Priority 1; the season is already under way |
| 2 | **Australian spring: jacaranda** (NSW, QLD) | 25 Oct – 30 Nov | **now** | Priority 1; Brisbane is already in bloom, so aim at Sydney |
| — | Halloween 2026 | Fri 30 – Sat 31 Oct | now | **Stretch only:** live only if it passes by 23 Oct, otherwise skip |
| 3 | **Bonfire Night** (UK) | 4 – 7 Nov | 7 Oct | Priority 2 |
| 4 | **Diwali** (all four) | 6 – 9 Nov | 9 Oct | Priority 2; shares the night sky and lights with #3 |
| 5 | **US Thanksgiving** | 25 – 29 Nov | 28 Oct | Priority 3 |
| — | St Andrew's Day | 28 – 30 Nov | 31 Oct | Skip unless the `cf.region` check is done by then |
| 6 | **Winter + Christmas** (snow only where true; Australian summer Christmas) | 26 Nov / 1 – 26 Dec | 3 Nov | Priority 3; the biggest piece |
| 7 | **New Year** (all, incl. standard) | 31 Dec – 2 Jan | 3 Dec | Priority 4; existing fireworks need a polish only |
| 8 | NT / far north wet season | Nov – Apr | when the AU scenes are built | Low; logic only |
| — | Lunar New Year 2027 | 5 – 14 Feb | 8 Jan | Low priority (over 3 months); first item for January |
| — | Eid al-Fitr | 9 – 11 Mar | 9 Feb | Low |
| — | St Patrick's | 13 – 17 Mar | 13 Feb | Low |
| — | Spring blossom (UK, DC, Vancouver) + Easter | 20 Mar → / 26 – 29 Mar | 20 Feb | Low |
| — | Vaisakhi | 10 – 14 Apr | 13 Mar | Low |
| — | Eid al-Adha | 16 – 18 May | 16 Apr | Low |
| — | Canada Day, 4 July | 1 Jul, 3 – 5 Jul | early Jun | Low |
| — | Autumn 2027 onward | | | Reuse the 2026 art |

**Not ever:** Remembrance, Veterans Day, Memorial Day, Anzac Day, Juneteenth, Truth and Reconciliation Day, Australia Day, Melbourne Cup, St George's.

**Usage note:** items 1–7 are 7 art pieces in 3 months, on top of the engine and the launch scenes. If that's too much, keep 1, 4, 6 and 7 (autumn, Diwali, winter/Christmas, New Year) and drop 2, 3 and 5.

## Open items

- [ ] Coding: festive reindeer nose to brown (website `season.js`; app `season/rider.tsx`), in the next grouped build.
- [ ] Coding: celebration windows as data (start, end, countries, regions, kind = celebrate / quiet), with "quiet" days beating everything.
- [ ] Coding: wet/dry seasons for the NT and far-north QLD; no snow in any Australian city scene.
- [ ] Research: re-check the Eid dates a week before (moon sighting), and gov.uk bank holidays directly when egress allows.
- [ ] Translator: greetings for Bonfire Night, Diwali, Thanksgiving, Lunar New Year, Eid, Vaisakhi, Easter, Canada Day and 4 July.
