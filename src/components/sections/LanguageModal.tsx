import type { Language, TranslationKey } from "../../i18n";
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
  closeModal: () => void;
  handleLanguageSelect: (nextLanguage: Language) => void;
  t: (key: TranslationKey) => string;
};

export function LanguageModal({ active, language, languageOptions, closeModal, handleLanguageSelect, t }: LanguageModalProps) {
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
      </div>
    </div>
  );
}
