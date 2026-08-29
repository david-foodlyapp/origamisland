import { en } from "./en";
import type { TranslationKey } from "../types";

export const zh: Record<TranslationKey, string> = {
  ...en,
  language_modal_title: "选择语言",
  language_modal_desc: "请选择您的首选语言。"
};
