import { useEffect, useState } from "react";
import type { Language } from "../i18n";
import type { Theme } from "../types";
import type { SupportedCurrency } from "../unitCatalog";

const supportedLanguages: Language[] = ["en", "ka", "ru", "zh", "he", "it", "de", "ar"];

function getInitialTheme(): Theme {
  const savedTheme = localStorage.getItem("origami_theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function getInitialLanguage(): Language {
  const savedLanguage = localStorage.getItem("origami_language") as Language | null;
  return savedLanguage && supportedLanguages.includes(savedLanguage) ? savedLanguage : "ka";
}

function getInitialCurrency(): SupportedCurrency {
  const savedCurrency = localStorage.getItem("origami_currency");
  return savedCurrency === "GEL" || savedCurrency === "USD" || savedCurrency === "EUR" ? savedCurrency : "USD";
}

export function usePreferences() {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [currency, setCurrency] = useState<SupportedCurrency>(getInitialCurrency);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("origami_theme", theme);
    document.querySelector('meta[name="color-scheme"]')?.setAttribute("content", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("origami_language", language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" || language === "he" ? "rtl" : "ltr";
  }, [language]);

  useEffect(() => {
    localStorage.setItem("origami_currency", currency);
  }, [currency]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    const handlePreferenceChange = (event: MediaQueryListEvent) => {
      if (!localStorage.getItem("origami_theme")) {
        setTheme(event.matches ? "light" : "dark");
      }
    };

    mediaQuery.addEventListener("change", handlePreferenceChange);
    return () => mediaQuery.removeEventListener("change", handlePreferenceChange);
  }, []);

  return { language, setLanguage, theme, setTheme, currency, setCurrency };
}
