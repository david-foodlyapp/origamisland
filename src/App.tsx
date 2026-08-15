import { FormEvent, InvalidEvent, useEffect, useRef, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import GA4React from "react-ga4";
import "react-medium-image-zoom/dist/styles.css";
import { translations, type Language, type TranslationKey } from "./i18n";
import { API_BASE_URL } from "./config";
import { normalizeApiImageUrl } from "./utils/media";

import { Header } from "./components/sections/Header";
import { HeroSection } from "./components/sections/HeroSection";
import { PropertiesPage } from "./components/sections/PropertiesPage";
import { UnitCatalogPage } from "./components/sections/UnitCatalogPage";
import { AboutSection } from "./components/sections/AboutSection";
import { RenderSection } from "./components/sections/RenderSection";
import { ChooseSection } from "./components/sections/ChooseSection";
import { BiohackingSection } from "./components/sections/BiohackingSection";
import { InfrastructureSection } from "./components/sections/InfrastructureSection";
import { FinanceSection } from "./components/sections/FinanceSection";
import { OrigamiHoldingSection } from "./components/sections/OrigamiHoldingSection";
import { CompanyProjectsSection } from "./components/sections/CompanyProjectsSection";
import { NewsSection } from "./components/sections/NewsSection";
import { GallerySection } from "./components/sections/GallerySection";
import { Footer } from "./components/sections/Footer";
import { FloatingWidget } from "./components/sections/FloatingWidget";
import { ConsultationModal } from "./components/sections/ConsultationModal";
import { LanguageModal } from "./components/sections/LanguageModal";
import { UnitsPreferencesModal } from "./components/sections/UnitsPreferencesModal";
import {
  CalendarIcon, BuildingIcon,
  WellnessIcon, LongevityIcon, RecoveryIcon, HealthyLivingIcon,
  FitnessIcon, MeditationIcon, SpaIcon, EnergyBalanceIcon, ArrowIcon,
  AudienceOutlineIcon, PriceTagIcon, InstallmentIcon, ResidenceIcon, HotelSuiteIcon, PenthouseIcon
} from "./components/Icons";
import {
  type Theme,
  type BrandingSettings,
  type BrandingSettingsResponse,
  type FooterSection,
  type GalleryItem,
  type GalleryApiItem,
  type GallerySectionResponse,
  type NewsApiItem,
  type NewsCard,
  type InfrastructureApiItem,
  type BiohackingApiItem,
  type BiohackingSectionResponse,
  type OrigamiHoldingApiItem,
  type OrigamiHoldingSectionResponse,
  type ChooseApiItem,
  type ChooseSectionResponse,
  type FinanceApiItem,
  type FinanceSectionResponse,
  type InfrastructureSectionResponse,
  type FooterMenuApiItem,
  type FooterMenuSectionResponse,
  type ContactSettings,
  type ContactSettingsResponse,
  type SectionGridCardItem,
  type AboutSectionResponse,
  type CompanyProjectApiItem,
  type CompanyProjectsSectionResponse,
  type AboutUsApiItem,
  type AboutUsResponse,
  type ExplorerFloor,
  type ExplorerPropertyListResponse,
  type ExplorerPropertyDetail,
  type ExplorerPropertyResponse,
  type ExplorerUnit,
  type UnitFilterOptions,
  type SocialNetworkItem,
  type SocialNetworksResponse,
  type WebsiteSectionResponse
} from "./types";
import {
  DEFAULT_BUILDING_SLUG,
  buildUnitCatalogSearch,
  convertPrice,
  fetchCurrencyRates,
  fetchUnitFilters,
  fetchUnits,
  formatArea,
  formatPrice,
  getUnitDisplayTitle,
  getUnitCatalogRoute,
  mapUnitStatusLabel,
  mapUnitTypeLabel,
  navigateTo,
  type CurrencyRates,
  type SupportedCurrency
} from "./unitCatalog";
import { getExplorerRoute, type ExplorerRoute } from "./propertyExplorer";

const origamiInfoIcons = [
  <PriceTagIcon />,
  <CalendarIcon />,
  <InstallmentIcon />,
  <ResidenceIcon />,
  <HotelSuiteIcon />,
  <PenthouseIcon />
];

const languageOptions: Array<{ code: Language; label: string; shortLabel: string }> = [
  { code: "ka", label: "ქართული", shortLabel: "KA" },
  { code: "en", label: "English", shortLabel: "EN" },
  // { code: "ru", label: "Русский", shortLabel: "RUS" },
  // { code: "pl", label: "Polski", shortLabel: "POL" }
];

const currencyOptions: Array<{ code: SupportedCurrency; label: string }> = [
  { code: "USD", label: "USD — $" },
  { code: "EUR", label: "EUR — €" },
  { code: "GEL", label: "GEL — ₾" }
];

const brandingLogoFallbacks = {
  logo_en_url: "https://res.cloudinary.com/dju7d2yys/image/upload/v1777893298/origami/settings/logos/t58mnagh77bstwwmvpkg.png",
  logo_ka_url: "https://res.cloudinary.com/dju7d2yys/image/upload/v1777893299/origami/settings/logos/t9yu4mfpn9wteurraqqt.png",
  logo_dark_en_url: "https://res.cloudinary.com/dju7d2yys/image/upload/v1777893359/origami/settings/logos/uhlwllbfg89wynhjgcul.png",
  logo_dark_ka_url: "https://res.cloudinary.com/dju7d2yys/image/upload/v1777893360/origami/settings/logos/ia00pcubsclzataowqsu.png"
} as const;

type PhoneCountryCodeOption = {
  code: string;
  dialCode: string;
  label: string;
};

type CountryCodeApiItem = {
  code?: string;
  flag?: string;
  iso?: string;
  dial_code?: string;
  label?: string;
};

type CountryCodesResponse = {
  success?: boolean;
  data?: CountryCodeApiItem[] | string;
  message?: string;
};

const phoneCountryCodeFallbackOptions: PhoneCountryCodeOption[] = [
  { code: "+995", dialCode: "+995", label: "🇬🇪 GE (+995)" },
  { code: "+1", dialCode: "+1", label: "🇺🇸 US (+1)" },
  { code: "+44", dialCode: "+44", label: "🇬🇧 UK (+44)" },
  { code: "+971", dialCode: "+971", label: "🇦🇪 AE (+971)" },
  { code: "+90", dialCode: "+90", label: "🇹🇷 TR (+90)" },
  { code: "+48", dialCode: "+48", label: "🇵🇱 PL (+48)" }
];

const defaultPhoneCountryCode = phoneCountryCodeFallbackOptions[0].dialCode;

type NewsDetailRoute = { name: "newsDetail"; slug: string };
type AppRouteState = ReturnType<typeof getUnitCatalogRoute> | ExplorerRoute | NewsDetailRoute;
type FeaturedUnitsFilter = "all" | "hotel_room" | "apartment";
const SHOW_FEATURED_UNITS_SECTION = false;

function getInitialTheme(): Theme {
  const savedTheme = localStorage.getItem("origami_theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function getInitialLanguage(): Language {
  const savedLanguage = localStorage.getItem("origami_language");
  return languageOptions.some((option) => option.code === savedLanguage) ? (savedLanguage as Language) : "ka";
}

function getNewsLocale(language: Language) {
  return language === "ka" ? "ka" : "en";
}

function formatNewsDate(dateString: string, language: Language) {
  const formatted = new Intl.DateTimeFormat(language === "ka" ? "ka-GE" : language === "ru" ? "ru-RU" : language === "pl" ? "pl-PL" : "en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(dateString));

  return language === "ka" ? formatted : formatted.toUpperCase();
}

function formatNewsFallbackTitle(slug: string) {
  const normalized = slug.replace(/[-_]+/g, " ").trim();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function stripHtmlContent(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function resolveBrandingLogo(
  branding: BrandingSettings | null,
  language: Language,
  variant: "default" | "dark"
) {
  const localizedDefault = language === "ka" ? branding?.logo_ka_url : branding?.logo_en_url;
  const localizedDark = language === "ka" ? branding?.logo_dark_ka_url : branding?.logo_dark_en_url;

  if (variant === "dark") {
    return localizedDefault || branding?.logo_url || brandingLogoFallbacks[language === "ka" ? "logo_ka_url" : "logo_en_url"];
  }

  return localizedDark || localizedDefault || branding?.logo_dark_url || branding?.logo_url || brandingLogoFallbacks[language === "ka" ? "logo_dark_ka_url" : "logo_dark_en_url"];
}

function getAppRoute(): AppRouteState {
  const unitRoute = getUnitCatalogRoute();

  if (unitRoute.name === "home" || unitRoute.name === "unitList" || unitRoute.name === "unitDetail") {
    return unitRoute;
  }

  const path = window.location.pathname;
  const normalized = path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
  const newsMatch = normalized.match(/^\/news\/([^/]+)$/);
  if (newsMatch) {
    return { name: "newsDetail", slug: decodeURIComponent(newsMatch[1]) };
  }

  const explorerRoute = getExplorerRoute();
  if (explorerRoute.name !== "unknown" && explorerRoute.name !== "home") {
    return explorerRoute;
  }

  return unitRoute;
}

function App() {
  const [routeState, setRouteState] = useState<AppRouteState>(getAppRoute);
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [openFooterSection, setOpenFooterSection] = useState<FooterSection | null>(null);
  const [isWidgetVisible, setIsWidgetVisible] = useState(false);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [headerShrunk, setHeaderShrunk] = useState(false);
  const [heroUnitFilters, setHeroUnitFilters] = useState<UnitFilterOptions | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [selectedPropertyType, setSelectedPropertyType] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [currency, setCurrency] = useState<SupportedCurrency>("USD");
  const [currencyRates, setCurrencyRates] = useState<CurrencyRates | null>(null);
  const [newsItems, setNewsItems] = useState<NewsCard[]>([]);
  const [newsDetail, setNewsDetail] = useState<NewsApiItem | null>(null);
  const [isNewsDetailLoading, setIsNewsDetailLoading] = useState(false);
  const [newsDetailError, setNewsDetailError] = useState("");
  const [featuredUnits, setFeaturedUnits] = useState<ExplorerUnit[]>([]);
  const [isFeaturedUnitsLoading, setIsFeaturedUnitsLoading] = useState(true);
  const [featuredUnitsFilter, setFeaturedUnitsFilter] = useState<FeaturedUnitsFilter>("all");
  const [apiBuildingVisual, setApiBuildingVisual] = useState<ExplorerPropertyDetail | null>(null);
  const [isBuildingVisualLoading, setIsBuildingVisualLoading] = useState(true);
  const [availableUnitsByFloorSlug, setAvailableUnitsByFloorSlug] = useState<Record<string, number>>({});
  const [apiGalleryItems, setApiGalleryItems] = useState<GalleryApiItem[]>([]);
  const [isGalleryLoading, setIsGalleryLoading] = useState(true);
  const [apiInfrastructureItems, setApiInfrastructureItems] = useState<InfrastructureApiItem[]>([]);
  const [apiBiohackingData, setApiBiohackingData] = useState<{ description: string; background_image: string; items: BiohackingApiItem[] } | null>(null);
  const [apiOrigamiHoldingData, setApiOrigamiHoldingData] = useState<{ title: string; background_image: string; items: OrigamiHoldingApiItem[] } | null>(null);
  const [apiChooseData, setApiChooseData] = useState<{ title: string; items: ChooseApiItem[] } | null>(null);
  const [apiFinanceData, setApiFinanceData] = useState<{ title: string; description: string; items: FinanceApiItem[] } | null>(null);
  const [apiCompanyProjectsData, setApiCompanyProjectsData] = useState<{ title: string; items: CompanyProjectApiItem[] } | null>(null);
  const [apiSection3Data, setApiSection3Data] = useState<{ title: string; background_image: string } | null>(null);
  const [apiFooterMenuItems, setApiFooterMenuItems] = useState<FooterMenuApiItem[]>([]);
  const [apiFooterLegalItems, setApiFooterLegalItems] = useState<SectionGridCardItem[]>([]);
  const [apiContactSettings, setApiContactSettings] = useState<ContactSettings | null>(null);
  const [apiSocialNetworks, setApiSocialNetworks] = useState<SocialNetworkItem[]>([]);
  const [branding, setBranding] = useState<BrandingSettings | null>(null);
  const [isCompanyProjectsLoading, setIsCompanyProjectsLoading] = useState(true);
  const [apiAboutData, setApiAboutData] = useState<AboutUsApiItem | null>(null);
  const [apiAboutInfoItems, setApiAboutInfoItems] = useState<SectionGridCardItem[]>([]);
  const [isAboutLoading, setIsAboutLoading] = useState(true);
  const [isAboutInfoLoading, setIsAboutInfoLoading] = useState(true);
  const [selectedChooseItem, setSelectedChooseItem] = useState<ChooseApiItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessState, setShowSuccessState] = useState(false);

  useEffect(() => {
    const widgetTimer = window.setTimeout(() => {
      setIsWidgetVisible(true);
    }, 8000);

    return () => {
      window.clearTimeout(widgetTimer);
    };
  }, []);
  const [submitError, setSubmitError] = useState("");
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [countryCodeOptions, setCountryCodeOptions] = useState<PhoneCountryCodeOption[]>(phoneCountryCodeFallbackOptions);
  const [formCountryCode, setFormCountryCode] = useState(defaultPhoneCountryCode);
  const [formPhone, setFormPhone] = useState("");
  const [galleryPageCount, setGalleryPageCount] = useState(1);
  const [galleryCurrentPage, setGalleryCurrentPage] = useState(0);
  const galleryTrackRef = useRef<HTMLDivElement | null>(null);
  const infrastructureSectionRef = useRef<HTMLElement | null>(null);
  const t = (key: TranslationKey) => translations[language][key];
  const featuredUnitsCopy = language === "ka"
    ? {
      cta: "დეტალები",
      priceFrom: "ფასი იწყება",
      floor: "სართული",
      loading: "იტვირთება...",
      empty: "ბინები ვერ მოიძებნა",
      bedrooms: "საძინებელი",
      rooms: "ოთახი",
      bathrooms: "სველი წერტილი",
      priceOnRequest: "ფასი შეთანხმებით",
      hotelRooms: "სასტუმროს ნომრები",
      apartments: "აპარტამენტები",
      all: "ყველა"
    }
    : {
      cta: "View details",
      priceFrom: "Starting from",
      floor: "Floor",
      loading: "Loading...",
      empty: "No units found",
      bedrooms: "Bedroom",
      rooms: "Room",
      bathrooms: "Bathroom",
      priceOnRequest: "Price on request",
      hotelRooms: "Hotel Rooms",
      apartments: "Apartments",
      all: "All"
    };
  const primaryNavItems = apiFooterMenuItems.map((item) => {
    const rawTarget = item.link || item.slug;
    const anchor = rawTarget.replace(/^#+/, "");
    return {
      href: `#${anchor}`,
      label: item.title,
      isModalAction: anchor === "consultation"
    };
  });
  const resolvedGalleryItems: GalleryItem[] = apiGalleryItems.map((item, index) => ({
    id: item.id,
    title: item.title?.trim() || "",
    subtitle: item.subtitle?.trim() || "",
    description: item.description?.trim() || "",
    image: normalizeApiImageUrl(item.image),
    badge: String(index + 1).padStart(2, "0")
  }));
  const darkThemeLogoSrc = resolveBrandingLogo(branding, language, "dark");
  const lightThemeLogoSrc = resolveBrandingLogo(branding, language, "default");

  useEffect(() => {
    GA4React.initialize("G-QYSDYT7YGN");
  }, []);

  useEffect(() => {
    const handleRouteChange = () => {
      setRouteState(getAppRoute());
    };

    window.addEventListener("popstate", handleRouteChange);

    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("origami_theme", theme);

    const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
    if (metaColorScheme) {
      metaColorScheme.setAttribute("content", theme);
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("origami_language", language);
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    let cancelled = false;

    fetchCurrencyRates()
      .then((rates) => {
        if (!cancelled) {
          setCurrencyRates(rates);
        }
      })
      .catch((error) => {
        console.error("Failed to load currency rates:", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchUnitFilters(DEFAULT_BUILDING_SLUG, language)
      .then((filters) => {
        if (!cancelled) {
          setHeroUnitFilters(filters);
        }
      })
      .catch((error) => {
        console.error("Failed to load hero unit filters:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [language]);

  useEffect(() => {
    let cancelled = false;

    setIsFeaturedUnitsLoading(true);
    setFeaturedUnitsFilter("all");

    fetchUnits(
      DEFAULT_BUILDING_SLUG,
      {
        page: 1,
        perPage: 9,
        floors: [],
        types: [],
        statuses: [],
        roomTypes: [],
        rooms: [],
        bedrooms: [],
        bathrooms: [],
        areaMin: "",
        areaMax: "",
        condition: "",
        sort: "rank",
        view: "grid"
      },
      language
    )
      .then((response) => {
        if (!cancelled) {
          setFeaturedUnits(response.data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Failed to load featured units:", error);
          setFeaturedUnits([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsFeaturedUnitsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [language]);

  useEffect(() => {
    const handleScroll = () => {
      setHeaderShrunk(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    const handleThemePreference = (event: MediaQueryListEvent) => {
      if (!localStorage.getItem("origami_theme")) {
        setTheme(event.matches ? "light" : "dark");
      }
    };

    mediaQuery.addEventListener("change", handleThemePreference);
    return () => mediaQuery.removeEventListener("change", handleThemePreference);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isModalOpen || isLanguageModalOpen || mobileMenuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen, isLanguageModalOpen, mobileMenuOpen]);

  useEffect(() => {
    const controller = new AbortController();

    const loadBranding = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/settings/branding`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`Branding request failed with status ${response.status}`);
        }

        const result = (await response.json()) as BrandingSettingsResponse;
        if (result?.data) {
          setBranding(result.data);
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Failed to load branding settings:", error);
        }
      }
    };

    const loadCountryCodes = async () => {
      try {
        const response = await fetch("https://api.foodlyapp.ge/api/settings/country_codes", {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`Country code request failed with status ${response.status}`);
        }

        const result = (await response.json()) as CountryCodesResponse;
        const nextOptions = (Array.isArray(result.data) ? result.data : [])
          .flatMap<PhoneCountryCodeOption>((item) => {
            const dialCode = item.dial_code?.trim() || item.code?.trim();
            const label = item.label?.trim();
            const code = item.iso?.trim() || dialCode;

            if (!dialCode || !label || !code) {
              return [];
            }

            return [{
              code,
              dialCode,
              label
            }];
          })
          .sort((left, right) => left.label.localeCompare(right.label))
          .filter((option, index, options) => options.findIndex((candidate) => candidate.code === option.code && candidate.dialCode === option.dialCode) === index);

        if (nextOptions.length > 0) {
          setCountryCodeOptions(nextOptions);

          setFormCountryCode((currentValue) => {
            if (nextOptions.some((option) => option.dialCode === currentValue)) {
              return currentValue;
            }

            if (nextOptions.some((option) => option.dialCode === defaultPhoneCountryCode)) {
              return defaultPhoneCountryCode;
            }

            return nextOptions[0].dialCode;
          });
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Failed to load country codes:", error);
        }
      }
    };

    void loadBranding();
    void loadCountryCodes();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    const track = galleryTrackRef.current;
    if (!track) {
      return;
    }

    const syncGalleryPagination = () => {
      const viewportWidth = track.clientWidth;
      if (!viewportWidth) {
        setGalleryPageCount(1);
        setGalleryCurrentPage(0);
        return;
      }

      const totalPages = Math.max(1, Math.ceil(track.scrollWidth / viewportWidth));
      const nextPage = Math.min(totalPages - 1, Math.round(track.scrollLeft / viewportWidth));
      setGalleryPageCount(totalPages);
      setGalleryCurrentPage(nextPage);
    };

    syncGalleryPagination();
    track.addEventListener("scroll", syncGalleryPagination, { passive: true });
    window.addEventListener("resize", syncGalleryPagination);

    return () => {
      track.removeEventListener("scroll", syncGalleryPagination);
      window.removeEventListener("resize", syncGalleryPagination);
    };
  }, [resolvedGalleryItems.length]);

  useEffect(() => {
    const section = infrastructureSectionRef.current;
    if (!section || typeof window === "undefined") {
      return;
    }

    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotionQuery.matches) {
      section.querySelectorAll<HTMLElement>(".infrastructure-card").forEach((card) => {
        card.style.setProperty("--infra-parallax", "0px");
      });
      return;
    }

    let frameId = 0;

    const updateInfrastructureParallax = () => {
      frameId = 0;
      const cards = section.querySelectorAll<HTMLElement>(".infrastructure-card");
      const viewportHeight = window.innerHeight || 1;

      cards.forEach((card) => {
        const speed = Number(card.dataset.speed || "0");
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.top + rect.height / 2;
        const distanceFromViewportCenter = (cardCenter - viewportHeight / 2) / viewportHeight;
        const offset = Math.max(-120, Math.min(120, distanceFromViewportCenter * speed * -128));
        card.style.setProperty("--infra-parallax", `${offset.toFixed(2)}px`);
      });
    };

    const requestUpdate = () => {
      if (!frameId) {
        frameId = window.requestAnimationFrame(updateInfrastructureParallax);
      }
    };

    updateInfrastructureParallax();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [apiInfrastructureItems.length]);

  useEffect(() => {
    const controller = new AbortController();

    const loadFooterMenu = async () => {
      try {
        const locale = getNewsLocale(language);
        const response = await fetch(`${API_BASE_URL}/sections/menu?locale=${locale}`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Footer menu request failed: ${response.status}`);
        }

        const payload: FooterMenuSectionResponse = await response.json();
        setApiFooterMenuItems(
          payload.data.items
            .filter((item) => item.status)
            .sort((a, b) => a.rank - b.rank)
        );
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Failed to load footer menu data:", error);
        setApiFooterMenuItems([]);
      }
    };

    loadFooterMenu();
    return () => controller.abort();
  }, [language]);

  useEffect(() => {
    const controller = new AbortController();

    const loadFooterLegalMenu = async () => {
      try {
        const locale = getNewsLocale(language);
        const response = await fetch(`${API_BASE_URL}/sections/footer-menu?locale=${locale}`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Footer legal menu request failed: ${response.status}`);
        }

        const payload: WebsiteSectionResponse = await response.json();
        setApiFooterLegalItems(
          payload.data.items
            .filter((item) => item.status)
            .sort((a, b) => a.rank - b.rank)
        );
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Failed to load footer legal menu:", error);
        setApiFooterLegalItems([]);
      }
    };

    loadFooterLegalMenu();
    return () => controller.abort();
  }, [language]);

  useEffect(() => {
    const controller = new AbortController();

    const loadContactSettings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/settings/contact`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Contact settings request failed: ${response.status}`);
        }

        const payload: ContactSettingsResponse = await response.json();
        setApiContactSettings(payload.data);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Failed to load contact settings:", error);
        setApiContactSettings(null);
      }
    };

    loadContactSettings();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadSocialNetworks = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/social-networks`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Social networks request failed: ${response.status}`);
        }

        const payload: SocialNetworksResponse = await response.json();
        setApiSocialNetworks(
          payload.data
            .filter((item) => item.status)
            .sort((a, b) => a.rank - b.rank)
        );
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Failed to load social networks data:", error);
        setApiSocialNetworks([]);
      }
    };

    loadSocialNetworks();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadSection3 = async () => {
      try {
        const locale = getNewsLocale(language);
        const response = await fetch(`${API_BASE_URL}/sections/section-3?locale=${locale}`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Section 3 request failed: ${response.status}`);
        }

        const payload: WebsiteSectionResponse = await response.json();
        setApiSection3Data({
          title: payload.data.title,
          background_image: payload.data.background_image
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Failed to load section 3 fallback data:", error);
        setApiSection3Data(null);
      }
    };

    loadSection3();
    return () => controller.abort();
  }, [language]);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const loadBuildingVisual = async () => {
      setIsBuildingVisualLoading(true);
      setAvailableUnitsByFloorSlug({});

      const loadAvailableUnitCounts = async (floors: ExplorerFloor[]) => {
        const counts = await Promise.all(
          floors.map(async (floor) => {
            try {
              const response = await fetchUnits(
                DEFAULT_BUILDING_SLUG,
                {
                  page: 1,
                  perPage: 1,
                  floors: [floor.slug],
                  types: [],
                  statuses: ["available"],
                  roomTypes: [],
                  rooms: [],
                  bedrooms: [],
                  bathrooms: [],
                  areaMin: "",
                  areaMax: "",
                  condition: "",
                  sort: "rank",
                  view: "grid"
                },
                language
              );
              return [floor.slug, response.meta.total] as const;
            } catch (countError) {
              console.error(`Failed to load available units count for floor ${floor.slug}:`, countError);
              return [floor.slug, 0] as const;
            }
          })
        );

        if (!cancelled) {
          setAvailableUnitsByFloorSlug(Object.fromEntries(counts));
        }
      };

      try {
        const locale = getNewsLocale(language);
        const response = await fetch(`${API_BASE_URL}/buildings?locale=${locale}`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Building visual request failed: ${response.status}`);
        }

        const payload: ExplorerPropertyListResponse = await response.json();
        const selectedBuilding = payload.data.find((building) => building.slug.toLowerCase() === DEFAULT_BUILDING_SLUG.toLowerCase()) || payload.data[0];
        if (!selectedBuilding) {
          throw new Error("Building visual request returned no buildings");
        }

        try {
          const detailResponse = await fetch(`${API_BASE_URL}/buildings/${selectedBuilding.slug}?locale=${locale}`, { signal: controller.signal });
          if (!detailResponse.ok) {
            throw new Error(`Building detail request failed: ${detailResponse.status}`);
          }

          const detailPayload: ExplorerPropertyResponse = await detailResponse.json();
          if (!cancelled) {
            setApiBuildingVisual(detailPayload.data);
          }
          await loadAvailableUnitCounts(detailPayload.data.floors);
        } catch (detailError) {
          if (detailError instanceof DOMException && detailError.name === "AbortError") {
            return;
          }
          console.error("Failed to load building floor details:", detailError);
          const fallbackBuilding = { ...selectedBuilding, floors: [] };
          if (!cancelled) {
            setApiBuildingVisual(fallbackBuilding);
          }
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Failed to load building visual:", error);
        if (!cancelled) {
          setApiBuildingVisual(null);
        }
      } finally {
        if (!cancelled && !controller.signal.aborted) {
          setIsBuildingVisualLoading(false);
        }
      }
    };

    loadBuildingVisual();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [language]);

  useEffect(() => {
    const controller = new AbortController();

    const loadGallery = async () => {
      setIsGalleryLoading(true);
      try {
        const locale = getNewsLocale(language);
        const response = await fetch(`${API_BASE_URL}/sections/gallery?locale=${locale}`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Gallery request failed: ${response.status}`);
        }

        const payload: GallerySectionResponse = await response.json();
        setApiGalleryItems(
          payload.data.items
            .filter((item) => item.status && item.image)
            .sort((a, b) => a.rank - b.rank)
        );
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Failed to load gallery data:", error);
        setApiGalleryItems([]);
      } finally {
        setIsGalleryLoading(false);
      }
    };

    loadGallery();
    return () => controller.abort();
  }, [language]);

  useEffect(() => {
    if (CSS.supports("(animation-timeline: view()) and (animation-range: entry)")) {
      return;
    }

    const revealElements = document.querySelectorAll(".reveal-scroll");
    revealElements.forEach((element) => element.classList.add("reveal-hidden"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("reveal-hidden");
            entry.target.classList.add("reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealElements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadNews = async () => {
      try {
        const locale = getNewsLocale(language);
        const response = await fetch(`${API_BASE_URL}/news?locale=${locale}`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`News request failed: ${response.status}`);
        }

        const payload: { data: NewsApiItem[] } = await response.json();
        const nextNews = payload.data
          .filter((item) => item.image_url && item.status !== "inactive")
          .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
          .slice(0, 3)
          .map((item) => ({
            id: item.id,
            slug: item.slug,
            title: item.title?.trim() || formatNewsFallbackTitle(item.slug),
            excerpt: item.excerpt?.trim() || "",
            image: item.image_url,
            date: formatNewsDate(item.published_at, language),
            category: item.category?.name || t("news_category")
          }));

        setNewsItems(nextNews);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    };

    loadNews();
    return () => controller.abort();
  }, [language]);

  useEffect(() => {
    if (routeState.name !== "newsDetail") {
      setNewsDetail(null);
      setNewsDetailError("");
      return;
    }

    const controller = new AbortController();

    const loadNewsDetail = async () => {
      setIsNewsDetailLoading(true);
      setNewsDetailError("");

      try {
        const locale = getNewsLocale(language);
        const response = await fetch(`${API_BASE_URL}/news/${routeState.slug}?locale=${locale}`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`News detail request failed: ${response.status}`);
        }

        const payload: { data: NewsApiItem } = await response.json();
        setNewsDetail(payload.data);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Failed to load news detail:", error);
        setNewsDetail(null);
        setNewsDetailError(language === "ka" ? "სიახლე ვერ მოიძებნა" : "News article was not found");
      } finally {
        if (!controller.signal.aborted) {
          setIsNewsDetailLoading(false);
        }
      }
    };

    loadNewsDetail();
    return () => controller.abort();
  }, [routeState, language]);

  useEffect(() => {
    const controller = new AbortController();

    const loadInfrastructure = async () => {
      try {
        const locale = getNewsLocale(language);
        const response = await fetch(`${API_BASE_URL}/sections/infrastructure?locale=${locale}`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Infrastructure request failed: ${response.status}`);
        }

        const payload: InfrastructureSectionResponse = await response.json();
        setApiInfrastructureItems(
          payload.data.items
            .filter((item) => item.status)
            .sort((a, b) => a.rank - b.rank)
        );
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Failed to load infrastructure data:", error);
      }
    };

    loadInfrastructure();
    return () => controller.abort();
  }, [language]);

  useEffect(() => {
    const controller = new AbortController();

    const loadBiohacking = async () => {
      try {
        const locale = getNewsLocale(language);
        const response = await fetch(`${API_BASE_URL}/sections/biohacking?locale=${locale}`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Biohacking request failed: ${response.status}`);
        }

        const payload: BiohackingSectionResponse = await response.json();
        setApiBiohackingData({
          description: payload.data.description,
          background_image: payload.data.background_image,
          items: payload.data.items
            .filter((item) => item.status)
            .sort((a, b) => a.rank - b.rank)
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Failed to load biohacking data:", error);
      }
    };

    loadBiohacking();
    return () => controller.abort();
  }, [language]);

  useEffect(() => {
    const controller = new AbortController();

    const loadOrigamiHolding = async () => {
      try {
        const locale = getNewsLocale(language);
        const response = await fetch(`${API_BASE_URL}/sections/origami-holding?locale=${locale}`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Origami Holding request failed: ${response.status}`);
        }

        const payload: OrigamiHoldingSectionResponse = await response.json();
        setApiOrigamiHoldingData({
          title: payload.data.title,
          background_image: payload.data.background_image,
          items: payload.data.items
            .filter((item) => item.status)
            .sort((a, b) => a.rank - b.rank)
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Failed to load origami holding data:", error);
      }
    };

    loadOrigamiHolding();
    return () => controller.abort();
  }, [language]);

  useEffect(() => {
    const controller = new AbortController();

    const loadChoose = async () => {
      try {
        const locale = getNewsLocale(language);
        const response = await fetch(`${API_BASE_URL}/sections/choose/compact?locale=${locale}`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Choose request failed: ${response.status}`);
        }

        const payload: ChooseSectionResponse = await response.json();
        setApiChooseData({
          title: payload.data.title,
          items: payload.data.items
            .filter((item) => item.status !== false)
            .sort((a, b) => a.rank - b.rank)
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Failed to load choose data:", error);
        setApiChooseData(null);
      }
    };

    loadChoose();
    return () => controller.abort();
  }, [language]);

  useEffect(() => {
    const controller = new AbortController();

    const loadFinance = async () => {
      try {
        const locale = getNewsLocale(language);
        const response = await fetch(`${API_BASE_URL}/sections/finances?locale=${locale}`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Finance request failed: ${response.status}`);
        }

        const payload: FinanceSectionResponse = await response.json();
        setApiFinanceData({
          title: payload.data.title,
          description: payload.data.description,
          items: payload.data.items
            .filter((item) => item.status)
            .sort((a, b) => a.rank - b.rank)
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Failed to load finance data:", error);
      }
    };

    loadFinance();
    return () => controller.abort();
  }, [language]);

  useEffect(() => {
    const controller = new AbortController();

    const loadCompanyProjects = async () => {
      setIsCompanyProjectsLoading(true);
      try {
        const locale = getNewsLocale(language);
        const response = await fetch(`${API_BASE_URL}/sections/projects?locale=${locale}`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Company projects request failed: ${response.status}`);
        }

        const payload: CompanyProjectsSectionResponse = await response.json();
        setApiCompanyProjectsData({
          title: payload.data.title,
          items: payload.data.items
            .filter((item) => item.status && item.image)
            .sort((a, b) => a.rank - b.rank)
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Failed to load company projects data:", error);
      } finally {
        setIsCompanyProjectsLoading(false);
      }
    };

    loadCompanyProjects();
    return () => controller.abort();
  }, [language]);

  useEffect(() => {
    const controller = new AbortController();

    const loadAboutUs = async () => {
      setIsAboutLoading(true);
      try {
        const locale = getNewsLocale(language);
        const response = await fetch(`${API_BASE_URL}/about-us?locale=${locale}&platform=origamisland`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`About us request failed: ${response.status}`);
        }

        const payload: AboutUsResponse = await response.json();
        const aboutItem = payload.data
          .filter((item) => item.status && item.platform_identifier === "origamisland")
          .sort((a, b) => a.rank - b.rank)[0] || null;

        setApiAboutData(aboutItem);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Failed to load about us data:", error);
        setApiAboutData(null);
      } finally {
        if (!controller.signal.aborted) {
          setIsAboutLoading(false);
        }
      }
    };

    loadAboutUs();
    return () => controller.abort();
  }, [language]);

  useEffect(() => {
    const controller = new AbortController();

    const loadAboutInfoItems = async () => {
      setIsAboutInfoLoading(true);
      try {
        const locale = getNewsLocale(language);
        const response = await fetch(`${API_BASE_URL}/sections/about?locale=${locale}`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`About section request failed: ${response.status}`);
        }

        const payload: AboutSectionResponse = await response.json();
        setApiAboutInfoItems(
          payload.data.items
            .filter((item) => item.status)
            .sort((a, b) => a.rank - b.rank)
        );
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Failed to load about section cards:", error);
        setApiAboutInfoItems([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsAboutInfoLoading(false);
        }
      }
    };

    loadAboutInfoItems();
    return () => controller.abort();
  }, [language]);

  const getBiohackingIcon = (slug: string) => {
    if (slug.includes("wellness")) return <WellnessIcon />;
    if (slug.includes("longevity")) return <LongevityIcon />;
    if (slug.includes("recovery")) return <RecoveryIcon />;
    if (slug.includes("health")) return <HealthyLivingIcon />;
    if (slug.includes("fitness")) return <FitnessIcon />;
    if (slug.includes("meditation")) return <MeditationIcon />;
    if (slug.includes("spa")) return <SpaIcon />;
    if (slug.includes("energy")) return <EnergyBalanceIcon />;
    return <WellnessIcon />;
  };

  const getOrigamiHoldingIcon = (slug: string) => {
    if (slug.includes("2008")) return <CalendarIcon />;
    if (slug.includes("professional") || slug.includes("600")) return <AudienceOutlineIcon />;
    if (slug.includes("design") || slug.includes("m2")) return <BuildingIcon />;
    if (slug.includes("hospitality")) return <HotelSuiteIcon />;
    return <CalendarIcon />;
  };

  const getOrigamiHoldingOrder = (item: { slug?: string; title?: string; description?: string }) => {
    const content = `${item.slug || ""} ${item.title || ""} ${item.description || ""}`.toLowerCase();

    if (content.includes("2008")) return 0;
    if (content.includes("professional") || content.includes("600")) return 1;
    if (content.includes("design") || content.includes("m2") || content.includes("m²")) return 2;
    if (content.includes("hospitality")) return 3;
    return 99;
  };

  const getFeaturedUnitPriceText = (unit: ExplorerUnit) => {
    const convertedPrice = convertPrice(unit.price, unit.currency || undefined, currency, currencyRates);
    const displayCurrency = convertedPrice != null ? currency : unit.currency || currency;
    const formattedPrice = formatPrice(convertedPrice ?? unit.price, displayCurrency);
    return formattedPrice || featuredUnitsCopy.priceOnRequest;
  };

  const getFeaturedMetricLabel = (count: number | null | undefined, singular: string) => {
    const safeCount = count ?? 0;
    return `${safeCount} ${singular}`;
  };

  const filteredFeaturedUnits = featuredUnitsFilter === "all"
    ? featuredUnits
    : featuredUnits.filter((unit) => unit.type === featuredUnitsFilter);

  const getFloorPolygonPoints = (floor: ExplorerFloor) =>
    floor.building_map_polygon?.map((point) => `${point.x},${point.y}`).join(" ") || "";

  const getBuildingFloorTooltip = (floor: ExplorerFloor) =>
    language === "ka"
      ? `ხელმისაწვდომია ${availableUnitsByFloorSlug[floor.slug] ?? 0} შეთავაზება`
      : `Available ${availableUnitsByFloorSlug[floor.slug] ?? 0} offers`;

  const getBuildingFloorLabel = (floor: ExplorerFloor) =>
    language === "ka" ? `სართული ${floor.number}` : `Floor ${floor.number}`;

  const getBuildingFloorUnitsRoute = (floor: ExplorerFloor) =>
    `/properties/${DEFAULT_BUILDING_SLUG}/units?${buildUnitCatalogSearch({
      page: 1,
      perPage: 9,
      floors: [floor.slug],
      types: [],
      statuses: [],
      roomTypes: [],
      rooms: [],
      bedrooms: [],
      bathrooms: [],
      areaMin: "",
      areaMax: "",
      condition: "",
      sort: "rank",
      view: "grid"
    }, language)}`;
  const buildingVisualFloors = apiBuildingVisual?.floors.filter((floor) => (floor.building_map_polygon?.length || 0) >= 3) || [];
  const renderSectionTitle = apiSection3Data?.title || "";
  const renderSectionImage = apiBuildingVisual?.image || apiSection3Data?.background_image || "";
  const renderSectionImageAlt = apiBuildingVisual?.title || apiSection3Data?.title || "";
  const conceptImage = apiAboutData?.image || "";
  const hasAboutContent = Boolean(apiAboutData?.title || apiAboutData?.body || conceptImage || apiAboutInfoItems.length);
  const hasBiohackingContent = Boolean(apiBiohackingData?.description || apiBiohackingData?.background_image || apiBiohackingData?.items.length);
  const hasInfrastructureContent = apiInfrastructureItems.length > 0;
  const hasFinanceContent = Boolean(apiFinanceData?.title || apiFinanceData?.description || apiFinanceData?.items.length);
  const hasOrigamiHoldingContent = Boolean(apiOrigamiHoldingData?.title || apiOrigamiHoldingData?.background_image || apiOrigamiHoldingData?.items.length);

  const footerContactAddress = apiContactSettings?.address?.trim() || "";
  const footerContactEmail = apiContactSettings?.email?.trim() || "";
  const footerContactPhone = apiContactSettings?.phone?.trim() || "";
  const footerContactSecondaryPhone = apiContactSettings?.secondary_phone;
  const formatTelHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

  const getPlanningUnitsRoute = (types: string[] = []) =>
    `/properties/${DEFAULT_BUILDING_SLUG}/units?${buildUnitCatalogSearch({
      page: 1,
      perPage: 9,
      floors: [],
      types,
      statuses: [],
      roomTypes: [],
      rooms: [],
      bedrooms: [],
      bathrooms: [],
      areaMin: "",
      areaMax: "",
      condition: "",
      sort: "rank",
      view: "grid"
    }, language)}`;

  const openModal = () => {
    setSelectedChooseItem(null);
    setShowSuccessState(false);
    setSubmitError("");
    setIsModalOpen(true);
  };

  const openChooseModal = async (item: ChooseApiItem) => {
    setSelectedChooseItem(item);
    setShowSuccessState(false);
    setSubmitError("");
    setIsModalOpen(true);

    if (!item.description) {
      try {
        const locale = getNewsLocale(language);
        const response = await fetch(`${API_BASE_URL}/sections/choose/item/${item.slug}?locale=${locale}`);
        if (!response.ok) {
          throw new Error(`Choose item request failed: ${response.status}`);
        }

        const payload: { data: ChooseApiItem } = await response.json();
        setSelectedChooseItem((currentItem) => (
          currentItem?.slug === item.slug
            ? { ...currentItem, ...payload.data }
            : currentItem
        ));
      } catch (error) {
        console.error("Failed to load choose item details:", error);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedChooseItem(null);
    setShowSuccessState(false);
    setSubmitError("");
    setIsSubmitting(false);
  };

  const closeLanguageModal = () => {
    setIsLanguageModalOpen(false);
  };

  const handleLanguageSelect = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    setIsLanguageModalOpen(false);
  };

  const closeCurrencyModal = () => {
    setIsCurrencyModalOpen(false);
  };

  const handleCurrencySelect = (nextCurrency: SupportedCurrency) => {
    setCurrency(nextCurrency);
  };

  const handleUnitsLanguageSelect = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
  };

  const handleSearch = () => {
    setMobileFilterOpen(false);
    navigateTo(
      `/properties/${DEFAULT_BUILDING_SLUG}/units?${buildUnitCatalogSearch({
        page: 1,
        perPage: 9,
        floors: [],
        types: selectedPropertyType ? [selectedPropertyType] : [],
        statuses: [],
        roomTypes: selectedRoomType ? [selectedRoomType] : [],
        rooms: [],
        bedrooms: [],
        bathrooms: [],
        areaMin: "",
        areaMax: "",
        condition: selectedCondition,
        sort: "rank",
        view: "grid"
      }, language)}`
    );
  };

  const handleThemeToggle = () => {
    setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));
  };

  const toggleFooterSection = (section: FooterSection) => {
    setOpenFooterSection((currentSection) => (currentSection === section ? null : section));
  };

  const getValidationMessage = (field: "name" | "email" | "phone", validity: ValidityState) => {
    const messages = language === "en"
      ? {
          nameRequired: "Please enter your name.",
          emailRequired: "Please enter your email.",
          emailInvalid: "Please enter a valid email address.",
          phoneRequired: "Please enter your phone number."
        }
      : {
          nameRequired: "შეავსეთ სახელი.",
          emailRequired: "შეიყვანეთ ელ.ფოსტა.",
          emailInvalid: "შეიყვანეთ სწორი ელ.ფოსტა.",
          phoneRequired: "შეიყვანეთ ტელეფონის ნომერი."
        };

    if (validity.valueMissing) {
      if (field === "name") return messages.nameRequired;
      if (field === "email") return messages.emailRequired;
      return messages.phoneRequired;
    }

    if (field === "email" && validity.typeMismatch) {
      return messages.emailInvalid;
    }

    return "";
  };

  const handleFieldInvalid = (field: "name" | "email" | "phone") => (event: InvalidEvent<HTMLInputElement>) => {
    event.target.setCustomValidity(getValidationMessage(field, event.target.validity));
  };

  const clearFieldValidity = (event: FormEvent<HTMLInputElement>) => {
    event.currentTarget.setCustomValidity("");
  };

  const getSubmitErrorMessage = () =>
    language === "en"
      ? "We could not send your request right now. Please try again in a moment."
      : "ამ ეტაპზე მოთხოვნის გაგზავნა ვერ მოხერხდა. გთხოვთ, რამდენიმე წუთში სცადოთ თავიდან.";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    const fullPhoneNumber = `${formCountryCode} ${formPhone}`.trim();

    try {
      const response = await fetch(`${API_BASE_URL}/contact-messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          name: formName.trim(),
          email: formEmail.trim(),
          phone: fullPhoneNumber,
          subject: selectedChooseItem?.title || "consultation",
          message: selectedChooseItem?.description || "Origami Island consultation request",
          source_page: window.location.pathname
        })
      });

      if (!response.ok) {
        throw new Error(`Consultation request failed with status ${response.status}`);
      }

      setShowSuccessState(true);
      setFormName("");
      setFormEmail("");
      setFormCountryCode(defaultPhoneCountryCode);
      setFormPhone("");
    } catch (error) {
      console.error("Consultation submission error:", error);
      setSubmitError(getSubmitErrorMessage());
    } finally {
      setIsSubmitting(false);
    }
  };

  if (routeState.name === "unknown") {
    navigateTo("/");
    return null;
  }

  const isUnitsRoute = routeState.name === "unitList" || routeState.name === "unitDetail";
  const isPropertiesRoute = routeState.name === "properties" || routeState.name === "property" || routeState.name === "floor";

  if (routeState.name === "newsDetail") {
    const detailTitle = newsDetail?.title?.trim() || (isNewsDetailLoading ? "" : formatNewsFallbackTitle(routeState.slug));
    const detailCategory = newsDetail?.category?.name || t("news_category");
    const detailDate = newsDetail?.published_at ? formatNewsDate(newsDetail.published_at, language) : "";
    const detailBody = stripHtmlContent(newsDetail?.content || newsDetail?.excerpt || "");

    return (
      <>
        <Header
          headerShrunk={headerShrunk}
          variant="surface"
          darkThemeLogoSrc={darkThemeLogoSrc}
          lightThemeLogoSrc={lightThemeLogoSrc}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          primaryNavItems={primaryNavItems}
          t={t}
          openModal={openModal}
          isLanguageModalOpen={isLanguageModalOpen}
          setIsLanguageModalOpen={setIsLanguageModalOpen}
          language={language}
          languageOptions={languageOptions}
          handleLanguageSelect={handleLanguageSelect}
          theme={theme}
          handleThemeToggle={handleThemeToggle}
        />

        <main className="news-detail-page">
          <article className="container news-detail-container">
            {isNewsDetailLoading ? (
              <div className="news-detail-state">{language === "ka" ? "იტვირთება..." : "Loading..."}</div>
            ) : newsDetailError ? (
              <div className="news-detail-state">{newsDetailError}</div>
            ) : (
              <>
                <div className="news-detail-hero">
                  <div className="news-detail-copy">
                    <div className="news-detail-meta">
                      <div className="news-detail-meta-info">
                        <span className="news-detail-category">{detailCategory}</span>
                        {detailDate ? (
                          <span className="news-detail-meta-item">
                            <span className="news-detail-meta-label">{language === "ka" ? "თარიღი" : "Date"}</span>
                            <span>{detailDate}</span>
                          </span>
                        ) : null}
                        {newsDetail?.author?.name ? (
                          <span className="news-detail-meta-item">
                            <span className="news-detail-meta-label">{language === "ka" ? "ავტორი" : "Author"}</span>
                            <span>{newsDetail.author.name}</span>
                          </span>
                        ) : null}
                      </div>
                      <button className="news-detail-back" type="button" onClick={() => navigateTo("/")}>
                        <ArrowIcon direction="left" />
                        <span>{language === "ka" ? "უკან" : "Back"}</span>
                      </button>
                    </div>
                    <h1>{detailTitle}</h1>
                    {newsDetail?.excerpt ? <p className="news-detail-excerpt">{newsDetail.excerpt}</p> : null}
                  </div>
                  {newsDetail?.image_url ? (
                    <img src={newsDetail.image_url} alt={detailTitle} />
                  ) : null}
                </div>

                {detailBody ? (
                  <div className="news-detail-body">
                    {detailBody.split("\n").filter(Boolean).map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </article>
        </main>
      </>
    );
  }

  if (isUnitsRoute) {
    return (
      <>
        <UnitCatalogPage
          language={language}
          darkThemeLogoSrc={darkThemeLogoSrc}
          lightThemeLogoSrc={lightThemeLogoSrc}
          isLanguageModalOpen={isLanguageModalOpen}
          setIsLanguageModalOpen={setIsLanguageModalOpen}
          theme={theme}
          handleThemeToggle={handleThemeToggle}
          openModal={openModal}
          propertySlug={routeState.propertySlug}
          unitSlug={routeState.name === "unitDetail" ? routeState.unitSlug : undefined}
          currency={currency}
          currencyRates={currencyRates}
        />
        <ConsultationModal
          active={isModalOpen}
          selectedChooseItem={selectedChooseItem}
          showSuccessState={showSuccessState}
          isSubmitting={isSubmitting}
          submitError={submitError}
          formName={formName}
          formEmail={formEmail}
          formCountryCode={formCountryCode}
          formPhone={formPhone}
          countryCodeOptions={countryCodeOptions}
          language={language}
          closeModal={closeModal}
          handleSubmit={handleSubmit}
          handleFieldInvalid={handleFieldInvalid}
          clearFieldValidity={clearFieldValidity}
          setFormName={setFormName}
          setFormEmail={setFormEmail}
          setFormCountryCode={setFormCountryCode}
          setFormPhone={setFormPhone}
          t={t}
        />
        <UnitsPreferencesModal
          active={isLanguageModalOpen || isCurrencyModalOpen}
          language={language}
          currency={currency}
          languageOptions={languageOptions}
          currencyOptions={currencyOptions}
          closeModal={() => { closeLanguageModal(); closeCurrencyModal(); }}
          handleLanguageSelect={handleUnitsLanguageSelect}
          handleCurrencySelect={handleCurrencySelect}
          t={t}
        />
      </>
    );
  }

  if (isPropertiesRoute) {
    return (
      <>
        <Header
          headerShrunk={headerShrunk}
          darkThemeLogoSrc={darkThemeLogoSrc}
          lightThemeLogoSrc={lightThemeLogoSrc}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          primaryNavItems={primaryNavItems}
          t={t}
          openModal={openModal}
          isLanguageModalOpen={isLanguageModalOpen}
          setIsLanguageModalOpen={setIsLanguageModalOpen}
          language={language}
          languageOptions={languageOptions}
          handleLanguageSelect={handleLanguageSelect}
          theme={theme}
          handleThemeToggle={handleThemeToggle}
        />

        <PropertiesPage
          propertySlug={routeState.name === "property" || routeState.name === "floor" ? routeState.propertySlug : undefined}
          floorSlug={routeState.name === "floor" ? routeState.floorSlug : undefined}
        />
        <LanguageModal
          active={isLanguageModalOpen}
          language={language}
          languageOptions={languageOptions}
          closeModal={closeLanguageModal}
          handleLanguageSelect={handleLanguageSelect}
          t={t}
        />
      </>
    );
  }

  return (
    <>
      <Header
        headerShrunk={headerShrunk}
        darkThemeLogoSrc={darkThemeLogoSrc}
        lightThemeLogoSrc={lightThemeLogoSrc}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        primaryNavItems={primaryNavItems}
        t={t}
        openModal={openModal}
        isLanguageModalOpen={isLanguageModalOpen}
        setIsLanguageModalOpen={setIsLanguageModalOpen}
        language={language}
        languageOptions={languageOptions}
        handleLanguageSelect={handleLanguageSelect}
        theme={theme}
        handleThemeToggle={handleThemeToggle}
      />

      <main>
        <>
      <HeroSection
        t={t}
        unitFilters={heroUnitFilters}
        selectedRoomType={selectedRoomType}
        setSelectedRoomType={setSelectedRoomType}
        selectedPropertyType={selectedPropertyType}
        setSelectedPropertyType={setSelectedPropertyType}
        selectedCondition={selectedCondition}
        setSelectedCondition={setSelectedCondition}
        mobileFilterOpen={mobileFilterOpen}
        setMobileFilterOpen={setMobileFilterOpen}
        handleSearch={handleSearch}
      />

        <AboutSection
          data={apiAboutData}
          infoItems={apiAboutInfoItems}
          image={conceptImage}
          hasContent={hasAboutContent}
          loading={isAboutLoading || isAboutInfoLoading}
          icons={origamiInfoIcons}
        />

        <RenderSection
          title={renderSectionTitle}
          image={renderSectionImage}
          imageAlt={renderSectionImageAlt}
          floors={buildingVisualFloors}
          loading={isBuildingVisualLoading}
          getFloorPolygonPoints={getFloorPolygonPoints}
          getFloorLabel={getBuildingFloorLabel}
          getFloorTooltip={getBuildingFloorTooltip}
          getFloorUnitsRoute={getBuildingFloorUnitsRoute}
          navigateTo={navigateTo}
        />

        <ChooseSection
          data={apiChooseData}
          openChooseModal={openChooseModal}
        />

        {SHOW_FEATURED_UNITS_SECTION && (
          <section className="planning-units-section">
            <div className="container">
              <div className="planning-units-toolbar">
                <div className="planning-units-links">
                  <button
                    type="button"
                    className={`planning-units-link${featuredUnitsFilter === "hotel_room" ? " is-active" : ""}`}
                    onClick={() => setFeaturedUnitsFilter("hotel_room")}
                  >
                    {featuredUnitsCopy.hotelRooms}
                  </button>
                  <button
                    type="button"
                    className={`planning-units-link${featuredUnitsFilter === "apartment" ? " is-active" : ""}`}
                    onClick={() => setFeaturedUnitsFilter("apartment")}
                  >
                    {featuredUnitsCopy.apartments}
                  </button>
                </div>

                <button
                  type="button"
                  className="planning-units-link planning-units-link-all"
                  onClick={() => navigateTo(getPlanningUnitsRoute())}
                >
                  <span>{featuredUnitsCopy.all}</span>
                  <ArrowIcon direction="right" />
                </button>
              </div>

              {isFeaturedUnitsLoading ? (
                <div className="units-state">{featuredUnitsCopy.loading}</div>
              ) : filteredFeaturedUnits.length > 0 ? (
                <div className="planning-units-carousel">
                  <div className="planning-units-grid">
                    {filteredFeaturedUnits.map((unit) => (
                      <article
                        key={unit.id}
                        className="unit-card planning-unit-card"
                        onClick={() => navigateTo(`/properties/${DEFAULT_BUILDING_SLUG}/units/${unit.slug}`)}
                      >
                        <div className="unit-card-topline">
                          <span className={`unit-card-badge unit-card-badge--${unit.status}`}>{mapUnitStatusLabel(unit.status, language)}</span>
                          <span className="unit-card-floor">{featuredUnitsCopy.floor} {unit.floor?.number ?? "-"}</span>
                        </div>

                        <div className="unit-card-image">
                          {unit.image ? <img src={unit.image} alt={getUnitDisplayTitle(unit, language)} /> : <div className="units-image-placeholder" />}
                        </div>

                        <div className="unit-card-body">
                          <p className="unit-card-number">{getUnitDisplayTitle(unit, language)}</p>
                          <h3>{mapUnitTypeLabel(unit.type, language)}</h3>
                          <strong>{formatArea(unit.area)}</strong>

                          <div className="planning-unit-metrics">
                            <span>{getFeaturedMetricLabel(unit.bedrooms_count, featuredUnitsCopy.bedrooms)}</span>
                            <span>{getFeaturedMetricLabel(unit.rooms_count, featuredUnitsCopy.rooms)}</span>
                            <span>{getFeaturedMetricLabel(unit.bathrooms_count, featuredUnitsCopy.bathrooms)}</span>
                          </div>

                          <div className="planning-unit-footer">
                            <button
                              type="button"
                              className="planning-unit-button"
                              onClick={(event) => {
                                event.stopPropagation();
                                navigateTo(`/properties/${DEFAULT_BUILDING_SLUG}/units/${unit.slug}`);
                              }}
                            >
                              <span>{featuredUnitsCopy.cta}</span>
                              <ArrowIcon direction="right" />
                            </button>

                            <div className="planning-unit-price-block">
                              <span>{featuredUnitsCopy.priceFrom}</span>
                              <strong>{getFeaturedUnitPriceText(unit)}</strong>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="units-state">{featuredUnitsCopy.empty}</div>
              )}
            </div>
          </section>
        )}

        <BiohackingSection
          data={apiBiohackingData}
          hasContent={hasBiohackingContent}
          t={t}
          getIcon={getBiohackingIcon}
        />

        <InfrastructureSection
          items={apiInfrastructureItems}
          hasContent={hasInfrastructureContent}
          sectionRef={infrastructureSectionRef}
          t={t}
        />

        <FinanceSection
          data={apiFinanceData}
          hasContent={hasFinanceContent}
        />

        <OrigamiHoldingSection
          data={apiOrigamiHoldingData}
          hasContent={hasOrigamiHoldingContent}
          getIcon={getOrigamiHoldingIcon}
          getOrder={getOrigamiHoldingOrder}
        />

        <CompanyProjectsSection
          data={apiCompanyProjectsData}
          loading={isCompanyProjectsLoading}
          openModal={openModal}
        />

        <NewsSection
          items={newsItems}
          t={t}
          navigateTo={navigateTo}
        />

        <GallerySection
          items={resolvedGalleryItems}
          loading={isGalleryLoading}
          pageCount={galleryPageCount}
          currentPage={galleryCurrentPage}
          trackRef={galleryTrackRef}
          t={t}
        />
        </>

      </main>

      <Footer
        darkThemeLogoSrc={darkThemeLogoSrc}
        lightThemeLogoSrc={lightThemeLogoSrc}
        socialNetworks={apiSocialNetworks}
        primaryNavItems={primaryNavItems}
        companyProjectsData={apiCompanyProjectsData}
        legalItems={apiFooterLegalItems}
        contact={{
          address: footerContactAddress,
          email: footerContactEmail,
          phone: footerContactPhone,
          secondaryPhone: footerContactSecondaryPhone,
          mapLink: apiContactSettings?.map_link
        }}
        openFooterSection={openFooterSection}
        toggleFooterSection={toggleFooterSection}
        openModal={openModal}
        formatTelHref={formatTelHref}
        t={t}
      />
      <FloatingWidget
        visible={isWidgetVisible}
        open={isWidgetOpen}
        setOpen={setIsWidgetOpen}
        openModal={openModal}
        t={t}
      />

      <ConsultationModal
          active={isModalOpen}
          selectedChooseItem={selectedChooseItem}
          showSuccessState={showSuccessState}
          isSubmitting={isSubmitting}
          submitError={submitError}
          formName={formName}
          formEmail={formEmail}
          formCountryCode={formCountryCode}
          formPhone={formPhone}
          countryCodeOptions={countryCodeOptions}
          language={language}
          closeModal={closeModal}
          handleSubmit={handleSubmit}
          handleFieldInvalid={handleFieldInvalid}
          clearFieldValidity={clearFieldValidity}
          setFormName={setFormName}
          setFormEmail={setFormEmail}
          setFormCountryCode={setFormCountryCode}
          setFormPhone={setFormPhone}
          t={t}
        />
        <LanguageModal
        active={isLanguageModalOpen}
        language={language}
        languageOptions={languageOptions}
        closeModal={closeLanguageModal}
        handleLanguageSelect={handleLanguageSelect}
        t={t}
      />
      <Analytics />
    </>
  );
}
export default App;
