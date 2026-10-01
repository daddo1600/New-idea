import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Every translatable string in the app: the first argument of `t('…')`,
 * `t("…")` and `msg('…')` calls under `src/` (string literals only). Used by
 * the completeness test and to hand translators the full list.
 */
const CALL = /(?<![\w.])(?:t|msg)\(\s*(['"])((?:\\.|(?!\1)[^\\])*)\1/g;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === '__tests__' || name === 'locales' ? [] : files(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

export function extractKeys(root: string): Map<string, string[]> {
  const keys = new Map<string, string[]>();
  for (const file of files(root)) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(CALL)) {
      const key = match[2].replace(/\\(['"\\])/g, '$1').replace(/\\n/g, '\n');
      keys.set(key, [...(keys.get(key) ?? []), file.slice(root.length + 1)]);
    }
  }
  return keys;
}

/** `{{name}}` placeholders in a string, sorted. */
export function placeholders(text: string): string[] {
  return [...text.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]).sort();
}
