import { en } from "./en";
import type { TranslationKey } from "../types";

export const he: Record<TranslationKey, string> = {
  ...en,
  language_modal_title: "בחר שפה",
  language_modal_desc: "בחר את השפה המועדפת עליך."
};
