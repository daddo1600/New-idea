import { describe, expect, it } from '@jest/globals';
import { join } from 'node:path';

import { extractKeys, placeholders } from '../extract';
import { LANGUAGES, translate, type Plural } from '../i18n';
import { DICTIONARIES } from '../locales';

const keys = extractKeys(join(__dirname, '..', '..'));
const forms = (entry: string | Plural) => (typeof entry === 'string' ? [entry] : Object.values(entry));

describe('translations', () => {
  it('finds the app’s text', () => {
    expect(keys.size).toBeGreaterThan(0);
  });

  it('has English plural forms for every line with a count', () => {
    const missing = [...keys.keys()].filter((key) => key.includes('{{count}}') && typeof DICTIONARIES.en[key] !== 'object');
    expect(missing).toEqual([]);
  });

  for (const { code } of LANGUAGES.filter((l) => l.code !== 'en')) {
    describe(code, () => {
      const dictionary = DICTIONARIES[code];
      const translated = Object.keys(dictionary).length > 0;

      // A language is either not started yet or complete: never half-translated.
      it('translates every line (or none yet)', () => {
        const missing = [...keys.keys()].filter((key) => !(key in dictionary));
        expect(translated ? missing : []).toEqual([]);
      });

      it('keeps every placeholder', () => {
        const broken = Object.entries(dictionary).filter(([key, entry]) =>
          forms(entry).some((form) => placeholders(form).join() !== placeholders(key).join()),
        );
        expect(broken.map(([key]) => key)).toEqual([]);
      });

      it('has no empty lines or stale keys', () => {
        expect(Object.entries(dictionary).filter(([, e]) => forms(e).some((f) => !f.trim())).map(([k]) => k)).toEqual([]);
        expect(Object.keys(dictionary).filter((key) => !keys.has(key))).toEqual([]);
      });
    });
  }
});

describe('translate', () => {
  it('uses a zero form when a language gives one', () => {
    const lang = 'pt-BR';
    const key = '{{distance}} miles';
    const entry = DICTIONARIES[lang][key];
    if (typeof entry === 'object' && entry.zero) {
      expect(translate(lang, key, { distance: '0', count: 0 })).toBe(entry.zero.replace('{{distance}}', '0'));
    }
  });

  it('fills placeholders and falls back to English', () => {
    expect(translate('es', 'Hello {{name}}', { name: 'Ana' })).toBe('Hello Ana');
  });
});
