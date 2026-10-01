import type { Dictionary, Lang } from '../i18n';
import bn from './bn';
import en from './en';
import es from './es';
import fr from './fr';
import hi from './hi';
import pa from './pa';
import pl from './pl';
import ptBR from './pt-BR';
import ro from './ro';
import zhHans from './zh-Hans';

export const DICTIONARIES: Record<Lang, Dictionary> = {
  en,
  es,
  'pt-BR': ptBR,
  fr,
  ro,
  pl,
  hi,
  pa,
  bn,
  'zh-Hans': zhHans,
};
