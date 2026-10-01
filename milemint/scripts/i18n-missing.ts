/**
 * Prints the English text a language is missing (or has extra), with each
 * line's English value and where it's used, as JSON. For translators:
 * `npx tsx scripts/i18n-missing.ts es`.
 */
import { join } from 'node:path';

import { extractKeys } from '../src/i18n/extract';
import { DICTIONARIES } from '../src/i18n/locales';

const lang = process.argv[2] as keyof typeof DICTIONARIES;
const dictionary = DICTIONARIES[lang];
if (!dictionary) throw new Error(`Unknown language: ${process.argv[2]}`);
const keys = extractKeys(join(__dirname, '..', 'src'));
const missing = [...keys.entries()]
  .filter(([key]) => !(key in dictionary))
  .map(([key, files]) => ({ key, english: DICTIONARIES.en[key] ?? key, files }));
const stale = Object.keys(dictionary).filter((key) => !keys.has(key));
console.log(JSON.stringify({ missing, stale }, null, 2));
