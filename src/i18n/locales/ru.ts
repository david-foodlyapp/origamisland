import { en } from "./en";
import type { TranslationKey } from "../types";

export const ru: Record<TranslationKey, string> = {
  ...en,
  language_modal_title: "Выберите язык",
  language_modal_desc: "Пожалуйста, выберите предпочитаемый язык.",
  form_send: "Забронировать консультацию",
  form_preferred_language: "Предпочитаемый язык общения",
  form_preferred_channel: "Предпочитаемый канал связи",
  channel_phone: "Телефонный звонок",
  channel_whatsapp: "WhatsApp",
  channel_telegram: "Telegram",
  channel_viber: "Viber",
  channel_email: "Эл. почта",
  form_success_title: "Спасибо"
};
