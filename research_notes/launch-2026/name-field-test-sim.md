# Name field test: Kilomi / Goldot / Drumi (simulated, n=1000)

**Simulated, not real people.** 8 segments × 125 generated respondents. Each segment came from a seeded rule-based generator (scratchpad `fieldtest/gen*.py`), so the results reflect the generators' assumptions about pronunciation and slang. Use them as a steer, not evidence.

**Segments:**
1. UK native-English couriers
2. UK couriers whose first language is Romanian, Polish, Portuguese, Bengali or Punjabi/Hindi/Urdu
3. US English-speaking drivers
4. US drivers whose first language is Spanish or Chinese, or another language
5. Canada: anglophone, Québécois and Punjabi/Chinese speakers
6. Australia: native-born and migrants
7. Trades and sales reps
8. The general public and accountants

## Overall

| Name | Spelled right after hearing | Guessed what it does | Like (/5) | Would tell another driver (/5) | Trust with tax (/5) | Fits a mileage app (/5) | First choice |
|---|---|---|---|---|---|---|---|
| Kilomi | 40% | 41% | 3.23 | 3.15 | 3.24 | 3.89 | 53% |
| Goldot | 35% | 3% | 3.00 | 3.06 | 3.02 | 2.37 | 24% |
| Drumi | 34% | 8% | 2.99 | 2.97 | 2.65 | 2.45 | 23% |

## Miles countries (GB/US, n=635) vs km countries (CA/AU, n=365)

Kilomi had a 51% first-choice share in miles countries and 56% in km countries, so its lead held in both. Its fit score was 3.81 in miles countries and 4.04 in km countries.

## Top negatives

- **Kilomi:** "kilo" as drug slang (45 mentions in total); "kill me" (15).
- **Goldot:** the Gold Coast (16); Gold Dot, a bullet brand (13); sounds like a scam or crypto (18).
- **Drumi:** sounds like "dummy" (28); close to "dormi", meaning "I slept" (20); Australian slang (22).

## Decision

- **Kilomi:** rejected by the founder because it sounds like "kill me".
- **Goldot and Drumi:** almost nobody could tell what the app does from these names (3–8% guessed correctly), and both carry negative associations.
- **No coined name passed.** Next, test MileSprout (capital S) the same way.

## MileSprout (capital S), simulated, n=1000

This used a separate generator (`fieldtest/gen_ms.py`), so compare it with the table above only roughly.

| Spelled right after hearing | Heard as "Miles Prout" | Read as intended | Guessed what it does | Like (/5) | Would tell another driver (/5) | Trust with tax (/5) | Fits a mileage app (/5) | Recalled |
|---|---|---|---|---|---|---|---|---|
| 61% | 10% | 48% | 44% | 2.93 | 2.90 | 2.97 | 3.46 | 63% |

**Top negatives:**
- The Brussels sprouts joke (~220 mentions).
- Sounds like a gardening or veg-box app (~127).
- Confused with Sprouts Farmers Market or Sprout Social (90).
- **French "prout" = fart:** 29 of 40 Canadian Québécois respondents (73%) and 42 of 55 Québécois across the whole study (76%).
- Canada and Australia: "we use km, miles feels American" (34). This applies to any "Mile" name.
- "spr" is hard to say for South Asian, Spanish and Portuguese speakers ("isprout", "esprout").

**Mitigation to consider:** the App Store name and the home-screen label can be set separately for each language, so the French-language listing could use a different display name.
