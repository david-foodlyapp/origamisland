import { en } from "./en";
import type { TranslationKey } from "../types";

export const de: Record<TranslationKey, string> = {
  ...en,
  language_modal_title: "Sprache waehlen",
  language_modal_desc: "Bitte waehlen Sie Ihre bevorzugte Sprache."
};
