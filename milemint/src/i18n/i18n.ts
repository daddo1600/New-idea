import { getLocales } from 'expo-localization';
import * as SecureStore from 'expo-secure-store';
import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

import { dictionary } from './locales';

/**
 * The app's words in the user's language. English text is the key
 * (`t('Start shift')`), so the code stays readable and anything not yet
 * translated simply shows in English. Placeholders are `{{name}}`. A value
 * can be split by plural category ({ one, few, many, other }) and is chosen
 * with the `count` param.
 *
 * Text kept in data (tax-office guidance, reminder messages) is marked with
 * `msg()` where it's written and passed through `t()` where it's shown, so
 * the completeness test finds it.
 */

export const LANGUAGES = [
  { code: 'en', name: 'English', english: 'English' },
  { code: 'es', name: 'Español', english: 'Spanish' },
  { code: 'pt-BR', name: 'Português (Brasil)', english: 'Portuguese (Brazil)' },
  { code: 'fr', name: 'Français', english: 'French' },
  { code: 'ro', name: 'Română', english: 'Romanian' },
  { code: 'pl', name: 'Polski', english: 'Polish' },
  { code: 'hi', name: 'हिन्दी', english: 'Hindi' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', english: 'Punjabi' },
  { code: 'bn', name: 'বাংলা', english: 'Bengali' },
  { code: 'zh-Hans', name: '简体中文', english: 'Chinese (Simplified)' },
] as const;

export type Lang = (typeof LANGUAGES)[number]['code'];
export type Plural = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };
export type Dictionary = Record<string, string | Plural>;
type Params = Record<string, string | number>;

const CODES: readonly string[] = LANGUAGES.map((l) => l.code);
const STORE_KEY = 'milemint.language';

/** Marks text kept in data for translation; returns it unchanged. */
export const msg = <T extends string>(text: T): T => text;

/** The supported language closest to an iPhone language tag ("pt-PT" → Brazilian Portuguese, "zh-Hant" → English). */
export function matchLanguage(tag: string | null | undefined): Lang | null {
  if (!tag) return null;
  const lower = tag.toLowerCase();
  if (lower.startsWith('zh')) return lower.includes('hans') || lower.endsWith('-cn') || lower.endsWith('-sg') || lower === 'zh' ? 'zh-Hans' : null;
  if (lower.startsWith('pt')) return 'pt-BR';
  const base = lower.split(/[-_]/)[0];
  return (CODES.find((code) => code === base) as Lang | undefined) ?? null;
}

function deviceLanguage(): Lang {
  try {
    for (const locale of getLocales()) {
      const match = matchLanguage(locale.languageTag);
      if (match) return match;
    }
  } catch {
    // No locale information (tests): English.
  }
  return 'en';
}

/** Fills `{{name}}` placeholders. */
function fill(text: string, params?: Params): string {
  if (!params) return text;
  return text.replace(/\{\{(\w+)\}\}/g, (whole, name: string) =>
    params[name] === undefined ? whole : String(params[name]),
  );
}

/** `key` in `lang`, falling back to English and then to the key itself. */
export function translate(lang: Lang, key: string, params?: Params): string {
  const entry = dictionary(lang)?.[key] ?? dictionary('en')?.[key] ?? key;
  if (typeof entry === 'string') return fill(entry, params);
  const count = typeof params?.count === 'number' ? params.count : 0;
  // A language can word zero its own way ("0 milhas", where its rules would pick the singular).
  if (count === 0 && entry.zero) return fill(entry.zero, params);
  let category: Intl.LDMLPluralRule = 'other';
  try {
    category = new Intl.PluralRules(lang).select(count);
  } catch {
    category = count === 1 ? 'one' : 'other';
  }
  return fill(entry[category] ?? entry.other, params);
}

// ─── The current language ──────────────────────────────────────────────────

let current: Lang = deviceLanguage();
/** True once the user has picked a language (not just inherited the phone's). */
let chosen = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

/** Loads the language picked last time (kept on the device, outside the database). */
export async function loadLanguage(): Promise<void> {
  try {
    const stored =
      Platform.OS === 'web' ? globalThis.localStorage?.getItem(STORE_KEY) : await SecureStore.getItemAsync(STORE_KEY);
    if (stored && CODES.includes(stored)) {
      chosen = true;
      if (stored !== current) {
        current = stored as Lang;
        emit();
      }
    }
  } catch {
    // Keep the phone's language.
  }
}

export function setLanguage(lang: Lang): void {
  chosen = true;
  current = lang;
  try {
    if (Platform.OS === 'web') globalThis.localStorage?.setItem(STORE_KEY, lang);
    else SecureStore.setItemAsync(STORE_KEY, lang).catch(() => {});
  } catch {
    // Still applies for this session.
  }
  emit();
}

export const getLanguage = (): Lang => current;
export const languageChosen = (): boolean => chosen;

/** Translates in the current language, outside React (notifications). */
export const t = (key: string, params?: Params): string => translate(current, key, params);

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The current language, re-rendering when it changes. */
export function useLanguage(): Lang {
  return useSyncExternalStore(subscribe, getLanguage, getLanguage);
}

/** `t` for components: re-renders the screen when the language changes. */
export function useT(): (key: string, params?: Params) => string {
  const lang = useLanguage();
  return (key, params) => translate(lang, key, params);
}
