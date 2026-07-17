import { Dispatch, SetStateAction } from "react";
import { Theme } from "../../types";
import { Language, TranslationKey } from "../../i18n";
import { CloseIcon, GlobeOutlineIcon, MoonIcon, SunIcon } from "../Icons";

type HeaderProps = {
  headerShrunk: boolean;
  variant?: "default" | "units";
  darkThemeLogoSrc: string;
  lightThemeLogoSrc: string;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: Dispatch<SetStateAction<boolean>>;
  primaryNavItems: Array<{ href: string; label: string; isModalAction?: boolean }>;
  t: (key: TranslationKey) => string;
  openModal: () => void;
  isLanguageModalOpen: boolean;
  setIsLanguageModalOpen: Dispatch<SetStateAction<boolean>>;
  language: Language;
  languageOptions: Array<{ code: Language; label: string; shortLabel: string }>;
  handleLanguageSelect: (nextLanguage: Language) => void;
  theme: Theme;
  handleThemeToggle: () => void;
};

export function Header({
  headerShrunk,
  variant = "default",
  darkThemeLogoSrc,
  lightThemeLogoSrc,
  mobileMenuOpen,
  setMobileMenuOpen,
  primaryNavItems,
  t,
  openModal,
  isLanguageModalOpen,
  setIsLanguageModalOpen,
  language,
  languageOptions,
  handleLanguageSelect,
  theme,
  handleThemeToggle
}: HeaderProps) {
  const hasConsultationMenuItem = primaryNavItems.some((item) => item.isModalAction);
  const isUnitsVariant = variant === "units";

  const handleNavItemClick = (item: { href: string; label: string; isModalAction?: boolean }) => {
    setMobileMenuOpen(false);

    if (item.isModalAction) {
      openModal();
    }
  };

  return (
    <header id="main-header" className={`${headerShrunk ? "header-shrunk" : ""} ${variant === "units" ? "header-units" : ""}`.trim()}>
      <div className="container">
        <a href={isUnitsVariant ? "/" : "#"} className="logo-container">
          <img
            src={darkThemeLogoSrc}
            alt="ORIGAMI"
            className="logo-img logo-dark"
          />
          <img
            src={lightThemeLogoSrc}
            alt="ORIGAMI"
            className="logo-img logo-light"
          />
        </a>

        {!isUnitsVariant ? (
          <>
            <nav id="nav-menu" className={mobileMenuOpen ? "active" : ""}>
              <button
                className="mobile-menu-close"
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setMobileMenuOpen(false)}
              >
                <CloseIcon />
              </button>
              {primaryNavItems.map((item) => (
                <a
                  key={item.href}
                  href={item.isModalAction ? "#" : item.href}
                  onClick={(event) => {
                    if (item.isModalAction) {
                      event.preventDefault();
                    }
                    handleNavItemClick(item);
                  }}
                >
                  {item.label}
                </a>
              ))}
              <div className="mobile-nav-language-switcher" aria-label={t("language_modal_title")}>
                {languageOptions.map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    className={`mobile-nav-language-btn ${language === option.code ? "active" : ""}`}
                    onClick={() => {
                      handleLanguageSelect(option.code);
                      setMobileMenuOpen(false);
                    }}
                  >
                    {option.shortLabel}
                  </button>
                ))}
              </div>
              {!hasConsultationMenuItem ? (
                <button
                  className="nav-cta-btn"
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openModal();
                  }}
                >
                  {t("utility_schedule")}
                </button>
              ) : null}
            </nav>
            <button
              className={`mobile-menu-overlay ${mobileMenuOpen ? "active" : ""}`}
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setMobileMenuOpen(false)}
            />
          </>
        ) : (
          <div className="header-spacer" aria-hidden="true" />
        )}

        <div className="header-actions">
          <button
            className="nav-language-btn header-language-btn"
            type="button"
            aria-label={t("language_modal_title")}
            aria-haspopup="dialog"
            aria-expanded={isLanguageModalOpen}
            onClick={() => setIsLanguageModalOpen(true)}
          >
            <GlobeOutlineIcon />
          </button>
          <div className="controls-pill">
            <button
              id="theme-toggle-btn"
              className="theme-pill-btn"
              aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              aria-pressed={theme === "light"}
              data-theme-state={theme}
              type="button"
              onClick={handleThemeToggle}
            >
              <span className="theme-pill-option theme-pill-option-dark" aria-hidden="true">
                <MoonIcon />
              </span>
              <span className="theme-pill-option theme-pill-option-light" aria-hidden="true">
                <SunIcon />
              </span>
            </button>
          </div>
          {!isUnitsVariant ? (
            <button
              id="mobile-menu-toggle"
              className={`mobile-menu-btn ${mobileMenuOpen ? "active" : ""}`}
              aria-label="Toggle Navigation Menu"
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
