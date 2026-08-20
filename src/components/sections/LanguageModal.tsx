import type { Language, TranslationKey } from "../../i18n";
import type { CurrencyRates, SupportedCurrency } from "../../unitCatalog";
import { CloseIcon } from "../Icons";

type LanguageOption = {
  code: Language;
  label: string;
  shortLabel: string;
};

type LanguageModalProps = {
  active: boolean;
  language: Language;
  languageOptions: LanguageOption[];
  currency: SupportedCurrency;
  currencyRates: CurrencyRates | null;
  closeModal: () => void;
  handleLanguageSelect: (nextLanguage: Language) => void;
  handleCurrencySelect: (nextCurrency: SupportedCurrency) => void;
  t: (key: TranslationKey) => string;
};

const currencyOptions: SupportedCurrency[] = ["GEL", "USD", "EUR"];

function getCurrencyRateText(currency: SupportedCurrency, rates: CurrencyRates | null, language: Language) {
  if (currency === "GEL") {
    return language === "ka" ? "ძირითადი ვალუტა" : "Base currency";
  }

  const rate = rates?.[currency];
  if (!rate) {
    return language === "ka" ? "კურსი იტვირთება" : "Loading rate";
  }

  return `1 ${currency} = ${rate.toFixed(4)} GEL`;
}

export function LanguageModal({
  active,
  language,
  languageOptions,
  currency,
  currencyRates,
  closeModal,
  handleLanguageSelect,
  handleCurrencySelect,
  t
}: LanguageModalProps) {
  return (
    <div className={`modal ${active ? "active" : ""}`}>
      <div className="modal-overlay" onClick={closeModal}></div>

      <div className="modal-content language-modal-content">
        <button className="modal-close" aria-label="Close language modal" type="button" onClick={closeModal}>
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
            </button>
          ))}
        </div>

        <div className="currency-modal-section">
          <h4>{language === "ka" ? "აირჩიეთ ვალუტა" : "Choose currency"}</h4>
          <div className="currency-options" role="list">
            {currencyOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`language-option currency-option ${currency === option ? "is-active" : ""}`}
                onClick={() => handleCurrencySelect(option)}
              >
                <span>{option}</span>
                <em>{getCurrencyRateText(option, currencyRates, language)}</em>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
