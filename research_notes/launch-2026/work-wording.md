# "Work", not "Business": where each word stays

October 2026. The founder decided that drivers should read "Work" and tax offices should read "Business". Gig couriers ask "was that a work drive?", and HMRC, the IRS, the CRA and the ATO all say "business".

## What changed to "Work"

These are the lines a driver taps or reads day to day:

- **Classification:** the Work / Personal buttons, the swipe labels, the selection bar, the "Work" pill on selected rows and the add-trip toggle. The toggle uses its own key, `Work (drive type)`, which English shows as "Work". Some languages name the drive type and the saved place "Work" differently: Polish *Służbowy* vs *Praca*, Bengali *কাজ* vs *কর্মস্থল*, Romanian *De lucru* vs *Serviciu*, Chinese 工作 vs 工作地点.
- **Rows and prompts:** "Work or personal? Worth £3.74 if work.", "Auto: work by default · swipe left if personal", "Mark Home to Office as work" (screen reader), "Needs a purpose", "Purpose: Client meeting" and "Purpose: not chosen".
- **The practice run:** "Mark as work" and "Sorted as work: worth £3.52".
- **Shift prompt:** "…They'll be added to the shift as work."
- **Purpose:** the field label "Business purpose" became "Purpose". It only shows on work drives, so nothing is lost. The settings row is now "Usual purpose", and the error reads "HMRC needs a purpose for every work drive, e.g. "Client meeting"."
- **The report screen nudge:** "HMRC expects a purpose for every work drive. One tap each." (the same line appears on Home).
- **Notifications and reminders:** "Every work mile counts", "Every work kilometre counts", "…Every work mile is money back." and "Last chance: make sure every work drive is in MileSprout before…"
- **Celebrations and share lines:** "£500 of work mileage logged", "MileSprout has now found £1,000 in work mileage for you…", "1,000 work miles", "…work miles logged with MileSprout", and the Milestones screen's "Work miles" / "Work km" section and "of work driving" line.
- **Missed-miles check (compare):** "of work driving this week" and "…are work miles too". The share text says "logged 412 work miles", and the empty result says "Check your drives are sorted as work."
- **Setup and empty states:** "Every work mile, counted.", "Tax offices want a purpose for every work drive…", "Drives in your hours count as work." and "Drives in your work hours are sorted as work for you."
- **Launch intro:** "a typical month of work driving".
- **Settings descriptions:** "Drives that start during your hours are marked work, others personal…", "New drives start as work" and "…only work drives should be claimed."
- **Parking and tolls note on a trip:** "Kept with the drive, but only counted on work drives."
- **The ATO 5,000 km nudge:** "…has done 1,200 km of work driving this year…"

### The Home and Money figure

"4,086.6 mi business" became **"4,086.6 mi for work"**, and "4,086.6 mi for work · 1 to review" when there are drives to review. The Drives tab's month headers read the same way ("40.9 mi for work · £22.49").

Why not keep "business":
- This card sits right above rows whose buttons now say Work. With "business" on the card, the screen would use two names for one thing.
- Accountants don't read this card. They read the PDF and CSV, which still say "Business miles".

Why "for work" and not the other choices:
- The distance comes already formatted with its unit ("4,086.6 mi"), so "work" can't go before the unit.
- "4,086.6 mi work" reads oddly.
- "4,086.6 mi for work" is plain English and still works with "· 1 to review" after it.

## Where "business" stays, and why

### Official tax term in the report, exports and tax screens

**PDF, CSV and accounting exports** (`src/domain/report.ts`, `src/domain/accounting-export.ts`, `src/domain/logbook.ts`, `src/domain/mar.ts`). None of this is translated. It is English for the tax office and the accountant:
- the "Business" value in the Type column;
- the "Business purpose", "Business miles" and "Business km" column headers;
- "Business-use share", "Business-use percentage", "Business km travelled in the period" and "Logbook method: expenses × N% business use";
- "Parking (business trips)", "Tolls and road charges (business trips)" and "Parking and tolls (business journeys)" in Xero and QuickBooks;
- the "Business mileage <month>" journal text;
- the P87 / Mileage Allowance Relief PDF ("Business miles", "first 10,000 business miles", "Ordinary commuting is not business mileage").

**Report screen** (`src/app/report.tsx`). This screen describes the exports, so it uses their words:
- "Business miles" and "Business km" (summary labels);
- "{{distance}} driven · {{percent}}% business" (the business-use share);
- "CRA needs your total distance driven to work out your business-use share.";
- "Optional. Shows your total driving and the business share on the report.";
- "Driving more than 5,000 business km in a car?…" (ATO rule);
- the export descriptions: Xero ("each month of business mileage"), QuickBooks, FreeAgent ("Your business trips…"), Employer expenses ("every business trip") and the ATO logbook ("total and business km, each business journey… business-use percentage").

**ATO logbook screen** (`src/app/logbook.tsx`). The logbook is a tax record, and the ATO's terms are "business journeys" and "business-use percentage":
- "Business journeys", "Business km", "{{percent}}% business use" and "…so far";
- "Keep a logbook for 12 weeks… business-use percentage…";
- "{{count}} business drives have no reason yet. The ATO asks for the reason for each journey.";
- "Your odometer readings show less driving than the business drives logged."

**Mileage Allowance Relief / P87 screen** (`src/app/claim-relief.tsx`). These lines are HMRC's own wording:
- "Business miles";
- "Each tax year's business miles, HMRC's approved amount…";
- "Estimates from your logged business drives at HMRC's approved mileage rates…";
- "Only business journeys count, not ordinary commuting…";
- "You'll need: … your business miles and the mileage allowance…";
- "HMRC's rate is … for the first 10,000 business miles."

**Rate names and region guidance** (`src/domain/regions.ts`, shown in Settings, the report and the trip screen). These lines quote the tax rules:
- "HMRC mileage rate: 55p a mile for the first 10,000 business miles, then 25p";
- "Business mileage (HMRC simplified expenses)";
- "Business use of your vehicle" (CRA);
- "Ordinary commuting… is not business mileage";
- "Self-employed: business parking, tolls…", "…on business journeys…" and "…simplified expenses figure for business mileage";
- "Self-employed: enter business, commuting and other miles on Schedule C, Part IV…" (IRS form wording);
- "The IRS asks for a record… the business purpose and the miles.";
- "CRA asks for a logbook… each business trip…";
- "Self-employed (T2125): … business-use share, which is business kilometres divided by…";
- "Parking and tolls are listed separately… business parking fees…" and "Recorded apart from the per-km figure. Self-employed: business parking…";
- "Parking fees and tolls for business trips can be deducted…" (IRS);
- "Business parking and tolls are deductible…";
- "You can claim up to 5,000 business kilometres per car each income year." (ATO);
- "Individuals: … Sole traders: include it with your business motor vehicle expenses." (ATO).

**Settings rows about the tax return or rule** (`src/app/(tabs)/settings.tsx`):
- "Your business mileage is an expense on your Self Assessment return." This line describes the Self Assessment entry, which HMRC calls business mileage.
- "Over 5,000 business km in a car? Keep a 12-week logbook and claim the business share of its running costs." This is the ATO's rule, in its terms.

### Stored data (never changed)

- The classification value `'business'` in the database, the `defaultBusiness` setting, the `TutorialStep` value `'business'`, and every type and variable named `business…`.
- The saved English purpose **"Business errand"** (`src/components/purpose-picker.tsx`). It is stored with each trip and printed verbatim on the report, so the key and its translations stay. Renaming only its display would make the app and the report disagree.

### Outside the app (not changed here)

- `store.config.json` (App Store descriptions and keywords, e.g. "business miles", "business use"). This is search-driven marketing copy, so change it separately if the founder wants.
- `assets/store/make_screenshots.py` ("Swipe to sort business trips." on a store screenshot). The next screenshot pass should use "work trips".
- Code comments that describe the data (e.g. "business distance").

## Translations

All nine languages were updated. Each key whose English changed was renamed in every locale, with no missing and no stale keys. French, Portuguese, Hindi, Punjabi and Bengali also had their business word replaced on lines whose English already said "work", such as "{{count}} work drives need a purpose" and "What are most of your work drives for?".

| Language | Drive type (toggle) | In a sentence | Was |
|---|---|---|---|
| fr | Travail | trajet de travail, km pour le travail | Affaires, d'affaires |
| pt-BR | Trabalho | trajeto de trabalho, km a trabalho | Profissional |
| es | Trabajo | viaje de trabajo | (already trabajo) |
| pl | Służbowy | przejazd służbowy | (already służbowy) |
| ro | De lucru | cursă de lucru | (already de lucru) |
| hi | काम | काम की ट्रिप | बिज़नेस |
| pa | ਕੰਮ | ਕੰਮ ਦਾ ਟ੍ਰਿਪ | ਬਿਜ਼ਨਸ |
| bn | কাজ | কাজের ট্রিপ | ব্যবসায়িক |
| zh-Hans | 工作 | 工作行程 | (already 工作) |

Notes on the choices:
- **French:** not "pro". In this app, "Pro" is the name of the paid plan, and "Classer comme pro" would read as a plan feature. The French glossary already avoided it for that reason.
- **Polish:** the toggle stays *Służbowy*. It pairs with *Prywatny*, which is an adjective, so the toggle needs one too. "Praca" stays the saved place "Work".
- **Romanian:** stays *de lucru*. *Lucru* is the everyday word for work, as in "mă duc la lucru". Romanian already used it for this line (toggle *De lucru* / *Personală*), and the glossary had rejected *de serviciu* because it sounds like an employee on assignment. *Muncă* doesn't work as an adjective here: "cursă de muncă" isn't natural.
- **Tax terms that stay "business" keep their existing translations**, such as fr *affaires* / *usage professionnel*, pt-BR *profissional*, hi बिज़नेस, pa ਬਿਜ਼ਨਸ and bn ব্যবসায়িক.

The glossary entries are in `milemint/src/i18n/TRANSLATOR-NOTES.md` ("Glossary: Work vs business"), and each language's row is in `milemint/src/i18n/glossary/<lang>.md`. These lines haven't had a native read-through yet.
