import { en } from "./en";
import type { TranslationKey } from "../types";

export const ar: Record<TranslationKey, string> = {
  ...en,
  language_modal_title: "اختر اللغة",
  language_modal_desc: "يرجى اختيار لغتك المفضلة."
};
