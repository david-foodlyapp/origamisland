import type { FormEvent, InvalidEvent } from "react";
import type { Language, TranslationKey } from "../../i18n";
import type { ChooseApiItem } from "../../types";
import { CheckIcon, CloseIcon } from "../Icons";

type PhoneCountryCodeOption = {
  code: string;
  dialCode: string;
  label: string;
};

type ConsultationModalProps = {
  active: boolean;
  selectedChooseItem: ChooseApiItem | null;
  modalDescription?: string;
  showSuccessState: boolean;
  isSubmitting: boolean;
  submitError: string;
  formName: string;
  formEmail: string;
  formCountryCode: string;
  formPhone: string;
  formPreferredLanguage: string;
  formPreferredChannel: string;
  countryCodeOptions: PhoneCountryCodeOption[];
  language: Language;
  closeModal: () => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  handleFieldInvalid: (field: "name" | "email" | "phone") => (event: InvalidEvent<HTMLInputElement>) => void;
  clearFieldValidity: (event: FormEvent<HTMLInputElement>) => void;
  setFormName: (value: string) => void;
  setFormEmail: (value: string) => void;
  setFormCountryCode: (value: string) => void;
  setFormPhone: (value: string) => void;
  setFormPreferredLanguage: (value: string) => void;
  setFormPreferredChannel: (value: string) => void;
  onSwitchModalStyle?: (style: "consultation" | "request_call") => void;
  t: (key: TranslationKey) => string;
};

export function ConsultationModal({
  active,
  selectedChooseItem,
  modalDescription,
  showSuccessState,
  isSubmitting,
  submitError,
  formName,
  formEmail,
  formCountryCode,
  formPhone,
  formPreferredLanguage,
  formPreferredChannel,
  countryCodeOptions,
  language,
  closeModal,
  handleSubmit,
  handleFieldInvalid,
  clearFieldValidity,
  setFormName,
  setFormEmail,
  setFormCountryCode,
  setFormPhone,
  setFormPreferredLanguage,
  setFormPreferredChannel,
  onSwitchModalStyle,
  t
}: ConsultationModalProps) {
  const descriptionText = selectedChooseItem?.description || modalDescription;

  return (
    <div id="vip-modal" className={`modal ${active ? "active" : ""}`}>
      <div id="modal-overlay" className="modal-overlay" onClick={closeModal}></div>

      <div className="modal-content">
        <button id="close-modal-btn" className="modal-close" aria-label="Close modal window" type="button" onClick={closeModal}>
          <CloseIcon />
        </button>

        {onSwitchModalStyle && (
          <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
            <div className="modal-form-switcher">
              <button
                type="button"
                className="active"
                onClick={() => onSwitchModalStyle("consultation")}
                title="Form 1 (VIP Consultation)"
              >
                Form 1 (VIP)
              </button>
              <button
                type="button"
                onClick={() => onSwitchModalStyle("request_call")}
                title="Switch to Form 2 (Request Call)"
              >
                Form 2 (Request Call)
              </button>
            </div>
          </div>
        )}

        <h3 className="modal-title">{selectedChooseItem?.title || t("modal_title")}</h3>


        {!showSuccessState ? (
          <>
            {descriptionText ? (
              <p className="modal-desc" style={{ marginTop: "0.5rem", marginBottom: "1.5rem", textAlign: "center" }}>
                {descriptionText}
              </p>
            ) : null}
            <form id="vip-consultation-form" className="luxury-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                id="form-name"
                required
                placeholder=" "
                autoComplete="name"
                value={formName}
                onChange={(event) => setFormName(event.target.value)}
                onInvalid={handleFieldInvalid("name")}
                onInput={clearFieldValidity}
              />
              <label id="form-name-label" htmlFor="form-name">
                {t("form_name")}
              </label>
            </div>

            <div className="form-group">
              <input
                type="email"
                id="form-email"
                required
                placeholder=" "
                autoComplete="email"
                value={formEmail}
                onChange={(event) => setFormEmail(event.target.value)}
                onInvalid={handleFieldInvalid("email")}
                onInput={clearFieldValidity}
              />
              <label id="form-email-label" htmlFor="form-email">
                {t("form_email")}
              </label>
            </div>

            <div className="form-row form-row-phone">
              <div className="form-group select-group country-code-group">
                <select
                  id="form-country-code"
                  value={formCountryCode}
                  onChange={(event) => setFormCountryCode(event.target.value)}
                  aria-label="Country code"
                  required
                >
                  {countryCodeOptions.map((option) => (
                    <option key={`${option.code}-${option.dialCode}`} value={option.dialCode}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group phone-number-group">
                <input
                  type="tel"
                  id="form-phone"
                  required
                  placeholder=" "
                  autoComplete="tel-national"
                  value={formPhone}
                  onChange={(event) => setFormPhone(event.target.value)}
                  onInvalid={handleFieldInvalid("phone")}
                  onInput={clearFieldValidity}
                />
                <label id="form-phone-label" htmlFor="form-phone">
                  {t("form_phone")}
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group select-group">
                <select
                  id="form-preferred-language"
                  value={formPreferredLanguage}
                  onChange={(event) => setFormPreferredLanguage(event.target.value)}
                  required
                >
                  <option value="ka">ქართული</option>
                  <option value="en">English</option>
                  <option value="ru">Русский</option>
                  <option value="zh">中文</option>
                  <option value="he">עברית</option>
                  <option value="it">Italiano</option>
                  <option value="de">Deutsch</option>
                  <option value="ar">العربية</option>
                </select>
                <label htmlFor="form-preferred-language">
                  {t("form_preferred_language")}
                </label>
              </div>

              <div className="form-group select-group">
                <select
                  id="form-preferred-channel"
                  value={formPreferredChannel}
                  onChange={(event) => setFormPreferredChannel(event.target.value)}
                  required
                >
                  <option value="Phone Call">{t("channel_phone")}</option>
                  <option value="WhatsApp">{t("channel_whatsapp")}</option>
                  <option value="Telegram">{t("channel_telegram")}</option>
                  <option value="Viber">{t("channel_viber")}</option>
                  <option value="Email">{t("channel_email")}</option>
                </select>
                <label htmlFor="form-preferred-channel">
                  {t("form_preferred_channel")}
                </label>
              </div>
            </div>

            <button type="submit" className="gold-button" style={{ width: "100%", marginTop: "0.5rem" }} disabled={isSubmitting}>
              {isSubmitting ? (language === "en" ? "Securing Access..." : "áƒ¬áƒ•áƒ“áƒáƒ›áƒ áƒ›áƒ£áƒ¨áƒáƒ•áƒ“áƒ”áƒ‘áƒ...") : t("form_send")}
            </button>
            {submitError ? (
              <p
                role="alert"
                style={{
                  marginTop: "1rem",
                  color: "#b42318",
                  fontSize: "0.95rem",
                  lineHeight: 1.5,
                  textAlign: "center"
                }}
              >
                {submitError}
              </p>
            ) : null}
          </form>
        </>
        ) : (
          <div
            id="form-success-state"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: "1.5rem",
              animation: "reveal-up 0.5s ease-out"
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                border: "2px solid var(--primary-gold)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary-gold)",
                marginBottom: "1rem"
              }}
            >
              <CheckIcon />
            </div>
            <h4 className="modal-title" style={{ marginBottom: 0 }}>
              {t("form_success_title")}
            </h4>
            <p className="modal-desc" style={{ maxWidth: "380px", marginBottom: "1.5rem" }}>
              {t("form_success_desc")}
            </p>
            <button id="success-close-btn" className="outline-button" style={{ width: "100%" }} type="button" onClick={closeModal}>
              {t("form_success_close")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
