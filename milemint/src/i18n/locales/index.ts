import type { Dictionary, Lang } from '../i18n';

/*
 * Each language is loaded the first time it's needed: the app builds only
 * the phone's own language (and English, the fallback), not all ten, which
 * keeps start-up quicker and memory lower. Metro still ships every file, so
 * switching language in Settings works offline.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const LOADERS: Record<Lang, () => Dictionary> = {
  en: () => require('./en').default,
  es: () => require('./es').default,
  'pt-BR': () => require('./pt-BR').default,
  fr: () => require('./fr').default,
  ro: () => require('./ro').default,
  pl: () => require('./pl').default,
  hi: () => require('./hi').default,
  pa: () => require('./pa').default,
  bn: () => require('./bn').default,
  'zh-Hans': () => require('./zh-Hans').default,
};
/* eslint-enable @typescript-eslint/no-require-imports */

const loaded: Partial<Record<Lang, Dictionary>> = {};

/** The dictionary for a language, loaded on first use. */
export function dictionary(lang: Lang): Dictionary | undefined {
  const load = LOADERS[lang];
  if (!load) return undefined;
  return (loaded[lang] ??= load());
}

export const LANGS = Object.keys(LOADERS) as Lang[];
