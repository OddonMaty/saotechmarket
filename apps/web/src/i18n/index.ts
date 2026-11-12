import fr from './locales/fr.json';
import en from './locales/en.json';

export type Locale = 'fr' | 'en';
export const DEFAULT_LOCALE: Locale = 'fr';

const dictionaries = {
  fr,
  en,
};

export type Dictionary = typeof fr;

export function getDictionary(locale: Locale = DEFAULT_LOCALE): Dictionary {
  return dictionaries[locale] || dictionaries[DEFAULT_LOCALE];
}

