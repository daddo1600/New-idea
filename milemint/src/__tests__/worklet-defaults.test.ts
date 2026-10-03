import { describe, expect, it } from '@jest/globals';
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

/**
 * A worklet must not have default parameters that use outside values: the
 * worklets plugin unpacks the closure after the parameters, so on the UI
 * thread `limit = PULL_LIMIT` throws and the app closes (a TestFlight crash on
 * "How do you work?"). The web and these tests run worklets as plain
 * JavaScript, so only this check catches it.
 */
function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === '__tests__' || name === 'locales' ? [] : files(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

const WORKLET = /(?:function\s+\w*\s*\(([^)]*)\)|\(([^)]*)\)\s*(?::[^=>{]*)?=>)\s*(?::\s*[^{]+)?\{\s*'worklet'/g;

describe('worklets', () => {
  it('have no default parameters', () => {
    const found: string[] = [];
    for (const file of files(join(__dirname, '..'))) {
      const source = readFileSync(file, 'utf8');
      for (const match of source.matchAll(WORKLET)) {
        const params = match[1] ?? match[2] ?? '';
        if (params.includes('=')) found.push(`${file}: (${params.trim()})`);
      }
    }
    expect(found).toEqual([]);
  });
});
