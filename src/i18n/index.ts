import { ar } from "./locales/ar";
import { de } from "./locales/de";
import { en } from "./locales/en";
import { he } from "./locales/he";
import { it } from "./locales/it";
import { ka } from "./locales/ka";
import { ru } from "./locales/ru";
import { zh } from "./locales/zh";
import type { Language, TranslationKey } from "./types";

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en,
  ka,
  ru,
  zh,
  he,
  it,
  de,
  ar
};

export type { Language, TranslationKey } from "./types";
