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
  showSuccessState: boolean;
  isSubmitting: boolean;
  submitError: string;
  formName: string;
  formEmail: string;
  formCountryCode: string;
  formPhone: string;
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
  t: (key: TranslationKey) => string;
};

export function ConsultationModal({
  active,
  selectedChooseItem,
  showSuccessState,
  isSubmitting,
  submitError,
  formName,
  formEmail,
  formCountryCode,
  formPhone,
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
  t
}: ConsultationModalProps) {
  return (
    <div id="vip-modal" className={`modal ${active ? "active" : ""}`}>
      <div id="modal-overlay" className="modal-overlay" onClick={closeModal}></div>

      <div className="modal-content">
        <button id="close-modal-btn" className="modal-close" aria-label="Close modal window" type="button" onClick={closeModal}>
          <CloseIcon />
        </button>

        <h3 className="modal-title">{selectedChooseItem?.title || t("modal_title")}</h3>

        {selectedChooseItem ? (
          <p className="modal-desc modal-desc-detail">{selectedChooseItem.description}</p>
        ) : !showSuccessState ? (
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

            <button type="submit" className="gold-button" style={{ width: "100%", marginTop: "1.5rem" }} disabled={isSubmitting}>
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
