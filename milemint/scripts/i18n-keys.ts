/**
 * Writes every translatable string (with where it's used) to
 * src/i18n/source-keys.json, for translators: `npx tsx scripts/i18n-keys.ts`.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { extractKeys } from '../src/i18n/extract';

const keys = extractKeys(join(__dirname, '..', 'src'));
const sorted = [...keys.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, files]) => ({ key, files: [...new Set(files)] }));
writeFileSync(join(__dirname, '..', 'src', 'i18n', 'source-keys.json'), JSON.stringify(sorted, null, 2) + '\n');
console.log(`${sorted.length} strings`);
