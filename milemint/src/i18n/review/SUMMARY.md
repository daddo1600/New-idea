# Translation review summary

Every language went through three independent passes over all 662 lines:

1. **Translate.** Each translator followed the brief and the glossary, then did a self-check.
2. **Accuracy.** A separate reviewer back-translated every line and compared its meaning with the English.
3. **Culture and tone.** A third reviewer checked for offence and double meanings, tone, honest money and tax wording, unit-neutral lines and on-screen fit.

| Language | Check 2 fixes | Check 3 fixes | Status |
|---|---|---|---|
| Español (es) | 24 | 38 | Approved |
| Português (Brasil) (pt-BR) | 24 | 34 (+18 zero forms) | Approved |
| Français (fr) | 30 | 29 | Approved |
| Română (ro) | 25 | 19 | Approved |
| Polski (pl) | 16 | 36 | Approved |
| हिन्दी (hi) | 29 | 51 | Approved |
| ਪੰਜਾਬੀ (pa) | 36 | 68 | Approved |
| বাংলা (bn) | 31 | 30 | Approved |
| 简体中文 (zh-Hans) | 21 | 28 | Approved |

The tables of every change are in `<code>-accuracy.md` and `<code>-culture.md`.

## Common fixes, worth knowing for future copy

- **Money wording.** "Money back", "free money", "savings" and "back in your pocket" read as a refund promise or a scam in most languages. The translations talk about the *value* of drives and the *deduction* instead.
- **"Mile" lines shown everywhere.** Lines such as "Never miss a mile" use "drive" or "trip" so they make sense in kilometre countries.
- **Gender.** In Hindi, Punjabi and others, wording addresses the user in a gender-neutral way.
- **"Your country".** It means "the chosen country", never where the user is from.
- **Slang and double meanings.** Several were caught and replaced:
  - Spanish: *acabar*, *travieso*;
  - Polish: *łatwa*, *zaliczyć*, *pierwszy raz*;
  - Romanian: *ușoară*;
  - Portuguese: the *dar uma …ada* pattern;
  - Chinese: 开干, 冲, 上路, 开车;
  - Bengali: খেলা (an echo of a political slogan).

## Still to do

- **iOS wording on a real iPhone, per language.** Check what the device actually shows: "Allow While Using App", "Change to Always Allow", "Always", "Location", "Ask Next Time Or When I Share" and the "ALLOW LOCATION ACCESS" header. Romanian iOS may use the polite form.
- **Native-speaker read-through, per language,** before marketing in that language, ideally by a driver from that community.

## Round 3 (October 2026): logbook, P87, privacy, backup and the shift switch

All nine languages gained 201 lines for the four new features, plus the two shift-switch lines. Each went through the same three checks (translate, cold back-translation, culture and length); every change is listed in each language's `-accuracy.md` and `-culture.md` under "Round 3". The translators found one code bug, now fixed: logbook amounts typed with a decimal comma ("2400,50") were read as 240050. Open questions for native reviewers on a real iPhone are mainly Apple's own names for iCloud Keychain and the Settings path; see each glossary's Unsure list.

## October 2026: "Work", not "Business"

Driver-facing text now says "Work" (Work / Personal, "work drive", "Mark as work", "{{distance}} for work"). "Business" stays only as the official tax term: the report, exports, logbook, P87, rate names and region guidance. See "Work vs business" in `TRANSLATOR-NOTES.md` for the full split and each language's word. French, Portuguese, Hindi, Punjabi and Bengali moved from their business word to *travail*, *trabalho*, काम, ਕੰਮ and কাজ. Spanish, Polish, Romanian and Chinese already said *trabajo*, *służbowy*, *de lucru* and 工作, so only their keys changed. The tables from earlier rounds, above and in the per-language files, still show the old business wording for these lines. They are history, not the current text. These lines haven't had a native read-through yet.
