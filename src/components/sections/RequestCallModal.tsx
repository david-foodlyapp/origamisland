import type { FormEvent, InvalidEvent } from "react";
import type { Language, TranslationKey } from "../../i18n";
import { CheckIcon, CloseIcon } from "../Icons";

type PhoneCountryCodeOption = {
  code: string;
  dialCode: string;
  label: string;
};

type RequestCallModalProps = {
  active: boolean;
  modalDescription?: string;
  showSuccessState: boolean;
  isSubmitting: boolean;
  submitError: string;
  formName: string;
  formEmail: string;
  formPhone: string;
  formPreferredLanguage: string;
  formPreferredChannel: string;
  formCountry: string;
  countryCodeOptions: PhoneCountryCodeOption[];
  language: Language;
  closeModal: () => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  handleFieldInvalid: (field: "name" | "email" | "phone") => (event: InvalidEvent<HTMLInputElement>) => void;
  clearFieldValidity: (event: FormEvent<HTMLInputElement>) => void;
  setFormName: (value: string) => void;
  setFormEmail: (value: string) => void;
  setFormPhone: (value: string) => void;
  setFormPreferredLanguage: (value: string) => void;
  setFormPreferredChannel: (value: string) => void;
  setFormCountry: (value: string) => void;
  onSwitchModalStyle?: (style: "consultation" | "request_call") => void;
  t: (key: TranslationKey) => string;
};

export function RequestCallModal({
  active,
  modalDescription,
  showSuccessState,
  isSubmitting,
  submitError,
  formName,
  formEmail,
  formPhone,
  formPreferredLanguage,
  formPreferredChannel,
  formCountry,
  countryCodeOptions,
  language,
  closeModal,
  handleSubmit,
  handleFieldInvalid,
  clearFieldValidity,
  setFormName,
  setFormEmail,
  setFormPhone,
  setFormPreferredLanguage,
  setFormPreferredChannel,
  setFormCountry,
  t
}: RequestCallModalProps) {
  return (
    <div id="request-call-modal" className={`request-call-modal ${active ? "active" : ""}`}>
      <div className="request-call-overlay" onClick={closeModal}></div>

      <div className="request-call-content">
        <button
          className="request-call-close"
          aria-label="Close request call modal"
          type="button"
          onClick={closeModal}
        >
          <CloseIcon />
        </button>

        {!showSuccessState ? (
          <>
            <div className="request-call-header">
              <h3 className="request-call-title">{t("request_call_title")}</h3>
              <p className="request-call-desc">
                {modalDescription || t("request_call_desc")}
              </p>
            </div>

            <div className="request-call-body">
              <form className="request-call-form" onSubmit={handleSubmit}>
                <div className="request-call-grid-top">
                  {/* Field 1: Name */}
                  <div className="request-call-field">
                    <input
                      type="text"
                      id="rc-form-name"
                      className="request-call-input"
                      required
                      placeholder={t("form_name")}
                      autoComplete="name"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      onInvalid={handleFieldInvalid("name")}
                      onInput={clearFieldValidity}
                    />
                  </div>

                  {/* Field 2: Email */}
                  <div className="request-call-field">
                    <input
                      type="email"
                      id="rc-form-email"
                      className="request-call-input"
                      required
                      placeholder={t("form_email")}
                      autoComplete="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      onInvalid={handleFieldInvalid("email")}
                      onInput={clearFieldValidity}
                    />
                  </div>

                  {/* Field 3: Country */}
                  <div className="request-call-field request-call-select-wrapper">
                    <select
                      id="rc-form-country"
                      className="request-call-select"
                      value={formCountry}
                      onChange={(e) => setFormCountry(e.target.value)}
                    >
                      <option value="">{t("request_call_country_label")}</option>
                      {countryCodeOptions.map((opt) => (
                        <option key={`${opt.code}-${opt.dialCode}`} value={opt.dialCode}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <div className="request-call-select-arrow">
                      <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L6 6L11 1" stroke="#A38558" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="request-call-grid-bottom">
                  {/* Field 4: Phone number */}
                  <div className="request-call-field">
                    <input
                      type="tel"
                      id="rc-form-phone"
                      className="request-call-input"
                      required
                      placeholder={t("form_phone")}
                      autoComplete="tel"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      onInvalid={handleFieldInvalid("phone")}
                      onInput={clearFieldValidity}
                    />
                  </div>

                  {/* Field 5: Preferred Communication Language */}
                  <div className="request-call-field request-call-select-wrapper">
                    <select
                      id="rc-form-language"
                      className={`request-call-select ${!formPreferredLanguage ? "is-placeholder" : ""}`}
                      value={formPreferredLanguage}
                      onChange={(e) => setFormPreferredLanguage(e.target.value)}
                      required
                    >
                      <option value="" disabled>{t("form_preferred_language")}</option>
                      <option value="ka">🇬🇪 ქართული</option>
                      <option value="en">🇺🇸 English</option>
                      <option value="ru">🇷🇺 Русский</option>
                      <option value="pl">🇵🇱 Polski</option>
                      <option value="ar">🇸🇦 العربية</option>
                    </select>
                    <div className="request-call-select-arrow">
                      <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L6 6L11 1" stroke="#A38558" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>

                  {/* Field 6: Preferred Communication Channel */}
                  <div className="request-call-field request-call-select-wrapper">
                    <select
                      id="rc-form-channel"
                      className={`request-call-select ${!formPreferredChannel ? "is-placeholder" : ""}`}
                      value={formPreferredChannel}
                      onChange={(e) => setFormPreferredChannel(e.target.value)}
                      required
                    >
                      <option value="" disabled>{t("form_preferred_channel")}</option>
                      <option value="Phone Call">{t("channel_phone")}</option>
                      <option value="WhatsApp">{t("channel_whatsapp")}</option>
                      <option value="Telegram">{t("channel_telegram")}</option>
                      <option value="Viber">{t("channel_viber")}</option>
                    </select>
                    <div className="request-call-select-arrow">
                      <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L6 6L11 1" stroke="#A38558" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div style={{ marginTop: "0.25rem" }}>
                  <button type="submit" className="request-call-submit-btn" disabled={isSubmitting}>
                    <span>
                      {isSubmitting
                        ? (language === "en" ? "Sending..." : "იგზავნება...")
                        : t("request_call_button")}
                    </span>
                    <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 1L17 7M17 7L11 13M17 7H1" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>

                {submitError ? (
                  <p
                    role="alert"
                    style={{
                      marginTop: "0.75rem",
                      color: "#b42318",
                      fontSize: "0.95rem",
                      lineHeight: 1.5,
                      textAlign: "center"
                    }}
                  >
                    {submitError}
                  </p>
                ) : null}

                <p className="request-call-recaptcha">
                  {t("request_call_recaptcha")}
                </p>
              </form>
            </div>
          </>
        ) : (
          <div
            className="request-call-header"
            style={{
              padding: "3.5rem 2rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.25rem"
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor: "rgba(163, 133, 88, 0.12)",
                border: "2px solid #A38558",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#A38558",
                marginBottom: "0.5rem"
              }}
            >
              <CheckIcon />
            </div>
            <h4 className="request-call-title" style={{ fontSize: "1.75rem", marginBottom: 0 }}>
              {t("form_success_title")}
            </h4>
            <p className="request-call-desc" style={{ maxWidth: "400px" }}>
              {t("form_success_desc")}
            </p>
            <button
              className="request-call-submit-btn"
              style={{ maxWidth: "240px", marginTop: "1rem" }}
              type="button"
              onClick={closeModal}
            >
              {t("form_success_close")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
