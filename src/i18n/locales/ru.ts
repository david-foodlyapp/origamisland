import { en } from "./en";
import type { TranslationKey } from "../types";

export const ru: Record<TranslationKey, string> = {
  ...en,
  language_modal_title: "Выберите язык",
  language_modal_desc: "Пожалуйста, выберите предпочитаемый язык."
};
