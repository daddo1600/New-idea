# Translations

- **Text in components:** `const t = useT();` then `t('Start shift')`. The English text is the key, and it must be a string literal.
- **Values:** `t('{{count}} drives to review', { count })`. Add English plural forms to `locales/en.ts` for any key with `{{count}}`.
- **Bold words inside a sentence:** `<Rich text={t('Tap <b>Allow</b> then …')} />`.
- **Text kept in data** (module constants, tax-office guidance, reminder messages): write it as `msg('…')` and show it with `t(value)`.
- **Outside React** (notifications): import `t` from `@/i18n/i18n`. It uses the current language.
- **Never stitch translated fragments together.** Translate whole sentences.
- **Kept in English:**
  - names: MileMint, HMRC, IRS, CRA, ATO, Self Assessment, Schedule C, the tax forms and the delivery apps;
  - the PDF and CSV reports, because they go to the tax office.
- **Checks:** `src/i18n/__tests__/completeness.test.ts` fails if a started language is missing a line, a placeholder is lost, or a translation is left over after its English line changes. For the full list for translators, run `npx tsx scripts/i18n-keys.ts`.
