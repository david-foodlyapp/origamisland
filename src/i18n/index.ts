import { en } from "./locales/en";
import { ka } from "./locales/ka";
import { pl } from "./locales/pl";
import { ru } from "./locales/ru";
import type { Language, TranslationKey } from "./types";

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en,
  ka,
  ru,
  pl
};

export type { Language, TranslationKey } from "./types";
