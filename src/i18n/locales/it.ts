import { en } from "./en";
import type { TranslationKey } from "../types";

export const it: Record<TranslationKey, string> = {
  ...en,
  language_modal_title: "Scegli la lingua",
  language_modal_desc: "Scegli la lingua che preferisci."
};
