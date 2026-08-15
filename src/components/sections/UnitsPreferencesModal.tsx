import type { Language, TranslationKey } from "../../i18n";
import type { SupportedCurrency } from "../../unitCatalog";
import { CloseIcon } from "../Icons";

type LanguageOption = {
  code: Language;
  label: string;
  shortLabel: string;
};

type CurrencyOption = {
  code: SupportedCurrency;
  label: string;
};

type UnitsPreferencesModalProps = {
  active: boolean;
  language: Language;
  currency: SupportedCurrency;
  languageOptions: LanguageOption[];
  currencyOptions: CurrencyOption[];
  closeModal: () => void;
  handleLanguageSelect: (nextLanguage: Language) => void;
  handleCurrencySelect: (nextCurrency: SupportedCurrency) => void;
  t: (key: TranslationKey) => string;
};

export function UnitsPreferencesModal({
  active,
  language,
  currency,
  languageOptions,
  currencyOptions,
  closeModal,
  handleLanguageSelect,
  handleCurrencySelect,
  t
}: UnitsPreferencesModalProps) {
  return (
    <div className={`modal ${active ? "active" : ""}`}>
      <div className="modal-overlay" onClick={closeModal}></div>

      <div className="modal-content language-modal-content">
        <button
          className="modal-close"
          aria-label="Close language and currency modal"
          type="button"
          onClick={closeModal}
        >
          <CloseIcon />
        </button>

        <h3 className="modal-title language-modal-title">{t("language_modal_title")}</h3>
        <div className="language-options" role="list">
          {languageOptions.map((option) => (
            <button
              key={option.code}
              type="button"
              className={`language-option ${language === option.code ? "is-active" : ""}`}
              onClick={() => handleLanguageSelect(option.code)}
            >
              <span>{option.label}</span>
              {language === option.code ? <span className="language-option-check">â€¢</span> : null}
            </button>
          ))}
        </div>

        <h3 className="modal-title language-modal-title currency-modal-title">{language === "ka" ? "áƒáƒ˜áƒ áƒ©áƒ˜áƒ”áƒ— áƒ•áƒáƒšáƒ£áƒ¢áƒ" : "Choose currency"}</h3>
        <div className="language-options" role="list">
          {currencyOptions.map((option) => (
            <button
              key={option.code}
              type="button"
              className={`language-option ${currency === option.code ? "is-active" : ""}`}
              onClick={() => handleCurrencySelect(option.code)}
            >
              <span>{option.label}</span>
              {currency === option.code ? <span className="language-option-check">â€¢</span> : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
