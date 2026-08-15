import { FormEvent, InvalidEvent, useEffect, useRef, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import GA4React from "react-ga4";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { translations, type Language, type TranslationKey } from "./i18n";
import { API_BASE_URL } from "./config";

import { Header } from "./components/sections/Header";
import { HeroSection } from "./components/sections/HeroSection";
import { PropertiesPage } from "./components/sections/PropertiesPage";
import { UnitCatalogPage } from "./components/sections/UnitCatalogPage";
import {
  HomeIcon, CalendarIcon, BuildingIcon,
  FacebookIcon, InstagramIcon, LinkedInIcon, CloseIcon, ChatIcon, CheckIcon,
  ChevronIcon, WellnessIcon, LongevityIcon, RecoveryIcon, HealthyLivingIcon,
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

function normalizeApiImageUrl(image: string) {
  const markdownMatch = image.match(/\((https?:\/\/[^)]+)\)/);
  if (markdownMatch?.[1]) {
    return markdownMatch[1];
  }

  return image.trim();
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
  const primaryNavItems = (apiFooterMenuItems.length > 0
    ? apiFooterMenuItems
    : [
      { id: 1, slug: "about-us", title: t("nav_about"), subtitle: "", description: "", image: "", logo: "", link: "about-us", badge: "", rank: 1, status: true },
      { id: 2, slug: "biohacking", title: t("nav_biohacking"), subtitle: "", description: "", image: "", logo: "", link: "biohacking", badge: "", rank: 2, status: true },
      { id: 3, slug: "consultation", title: t("utility_schedule"), subtitle: "", description: "", image: "", logo: "", link: "consultation", badge: "", rank: 3, status: true }
    ] satisfies FooterMenuApiItem[]
  ).map((item) => {
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
        const response = await fetch(`${API_BASE_URL}/sections/choose?locale=${locale}`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Choose request failed: ${response.status}`);
        }

        const payload: ChooseSectionResponse = await response.json();
        setApiChooseData({
          title: payload.data.title,
          items: payload.data.items
            .filter((item) => item.status)
            .sort((a, b) => a.rank - b.rank)
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Failed to load choose data:", error);
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
      }
    };

    loadAboutUs();
    return () => controller.abort();
  }, [language]);

  useEffect(() => {
    const controller = new AbortController();

    const loadAboutInfoItems = async () => {
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

  const openChooseModal = (item: ChooseApiItem) => {
    setSelectedChooseItem(item);
    setShowSuccessState(false);
    setSubmitError("");
    setIsModalOpen(true);
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

        <div id="vip-modal" className={`modal ${isModalOpen ? "active" : ""}`}>
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
                  {isSubmitting ? (language === "en" ? "Securing Access..." : "წვდომა მუშავდება...") : t("form_send")}
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

        <div className={`modal ${isLanguageModalOpen || isCurrencyModalOpen ? "active" : ""}`}>
          <div className="modal-overlay" onClick={() => { closeLanguageModal(); closeCurrencyModal(); }}></div>

          <div className="modal-content language-modal-content">
            <button
              className="modal-close"
              aria-label="Close language and currency modal"
              type="button"
              onClick={() => { closeLanguageModal(); closeCurrencyModal(); }}
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
                  onClick={() => handleUnitsLanguageSelect(option.code)}
                >
                  <span>{option.label}</span>
                  {language === option.code ? <span className="language-option-check">•</span> : null}
                </button>
              ))}
            </div>

            <h3 className="modal-title language-modal-title currency-modal-title">{language === "ka" ? "აირჩიეთ ვალუტა" : "Choose currency"}</h3>
            <div className="language-options" role="list">
              {currencyOptions.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  className={`language-option ${currency === option.code ? "is-active" : ""}`}
                  onClick={() => handleCurrencySelect(option.code)}
                >
                  <span>{option.label}</span>
                  {currency === option.code ? <span className="language-option-check">•</span> : null}
                </button>
              ))}
            </div>
          </div>
        </div>
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

        <div className={`modal ${isLanguageModalOpen ? "active" : ""}`}>
          <div className="modal-overlay" onClick={closeLanguageModal}></div>

          <div className="modal-content language-modal-content">
            <button className="modal-close" aria-label="Close language modal" type="button" onClick={closeLanguageModal}>
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
                  {language === option.code ? <span className="language-option-check">•</span> : null}
                </button>
              ))}
            </div>
          </div>
        </div>
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
        <section id="about-us" className="concept-section">
          <div className="container">
            {hasAboutContent ? (
              <div className="concept-card">
                <div className="concept-content">
                  {apiAboutData?.title ? <h2 className="concept-title">{apiAboutData.title}</h2> : null}
                  {apiAboutData?.body ? (
                    <div className="concept-desc" dangerouslySetInnerHTML={{ __html: apiAboutData.body }} />
                  ) : null}
                </div>
                {conceptImage ? (
                  <div className="concept-render">
                    <img
                      src={normalizeApiImageUrl(conceptImage)}
                      alt={apiAboutData?.title || ""}
                      className="concept-render-image"
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
            {apiAboutInfoItems.length > 0 ? (
              <div className="origami-info-section reveal-scroll">
                <div className="origami-info-grid">
	                  {apiAboutInfoItems.map((item, index) => (
	                    <article key={item.id} className="origami-info-card">
	                      <span className="origami-info-icon">
	                        {item.image ? (
	                          <img src={item.image} alt="" aria-hidden="true" />
	                        ) : (
	                          origamiInfoIcons[index % origamiInfoIcons.length]
	                        )}
	                      </span>
	                      <span className="origami-info-value">{item.title}</span>
	                      <span className="origami-info-label">{item.subtitle}</span>
	                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="render-section">
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              {renderSectionTitle ? <h2 className="section-title">{renderSectionTitle}</h2> : null}
            </div>
            <div className="render-gallery reveal-scroll">
              <div className="render-main">
                <div className="building-visual-map">
                  {isBuildingVisualLoading ? (
                    <div className="building-visual-skeleton" aria-hidden="true">
                      <div className="building-visual-skeleton-shimmer" />
                    </div>
                  ) : (
                    renderSectionImage ? (
                      <div className="building-visual-frame">
                        <img
                          src={renderSectionImage}
                          alt={renderSectionImageAlt}
                        />
                        {buildingVisualFloors.length > 0 ? (
                          <svg className="building-visual-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                            {buildingVisualFloors.map((floor) => (
                              <g key={floor.id} className="building-floor-hotspot">
                                <polygon
                                  points={getFloorPolygonPoints(floor)}
                                  onClick={() => navigateTo(`/properties/${DEFAULT_BUILDING_SLUG}/units?${buildUnitCatalogSearch({
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
                                  }, language)}`)}
                                />
                              </g>
                            ))}
                          </svg>
                        ) : null}
                        {buildingVisualFloors.map((floor) => (
                          floor.building_map_label_position ? (
                            <button
                              key={floor.id}
                              type="button"
                              className="building-floor-label"
                              style={{
                                "--floor-label-x": `${floor.building_map_label_position.x}%`,
                                "--floor-label-y": `${floor.building_map_label_position.y}%`
                              } as React.CSSProperties}
                              onClick={() => navigateTo(`/properties/${DEFAULT_BUILDING_SLUG}/units?${buildUnitCatalogSearch({
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
                              }, language)}`)}
                            >
                              <span className="building-floor-label-number">{floor.number}</span>
                              <span className="building-floor-tooltip" role="tooltip">
                                <span className="building-floor-tooltip-title">{getBuildingFloorLabel(floor)}</span>
                                <span className="building-floor-tooltip-meta">{getBuildingFloorTooltip(floor)}</span>
                              </span>
                            </button>
                          ) : null
                        ))}
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="directions-section">
          <div className="container">
            <h2 className="section-title" style={{ textAlign: "center", marginBottom: "4rem" }}>
              {apiChooseData?.title || ""}
            </h2>
            
            <div className="directions-grid">
              {apiChooseData?.items.length ? (
                apiChooseData.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="direction-card trigger-modal"
                    onClick={() => openChooseModal(item)}
                  >
                    <span className="direction-card-inner">
                      <span className="direction-card-face direction-card-front">
                        <span className="direction-card-media">
                          <img src={normalizeApiImageUrl(item.image)} alt={item.title} />
                        </span>
                        <span className="direction-card-copy">
                          <h3 className="direction-title">{item.title}</h3>
                        </span>
                      </span>
                      <span className="direction-card-face direction-card-back">
                        <span className="direction-card-back-inner">
                          <span className="direction-card-back-title">{item.title}</span>
                          <span className="direction-card-description">{item.description}</span>
                        </span>
                      </span>
                    </span>
                  </button>
                ))
              ) : null}
            </div>

          </div>
        </section>

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

        <section id="biohacking" className="biohacking-section" style={apiBiohackingData?.background_image ? { "--biohacking-bg": `url(${apiBiohackingData.background_image})` } as React.CSSProperties : undefined}>
          <div className="container">
            {hasBiohackingContent ? (
              <div className="biohacking-heading">
                <h2 className="biohacking-title section-title">
                  <span className="biohacking-title-highlight">{t("bio_title")}</span>
                </h2>
              </div>
            ) : null}
            {apiBiohackingData?.description ? (
              <p className="biohacking-description">{apiBiohackingData.description}</p>
            ) : null}

            <div className="biohacking-layout reveal-scroll">
              {apiBiohackingData?.items.length ? (
                apiBiohackingData.items.map((item) => (
                  <article key={item.id} className="biohacking-pillar-card">
                    <span className="biohacking-list-icon">
                      {item.logo ? <img src={item.logo} alt={item.title} style={{ width: "24px", height: "24px", objectFit: "contain" }} /> : getBiohackingIcon(item.slug)}
                    </span>
                    <h4 className="biohacking-pillar-title">{item.title}</h4>
                  </article>
                ))
              ) : null}
            </div>
          </div>
        </section>

        <section id="infrastructure" className="infrastructure-section" ref={infrastructureSectionRef}>
          <div className="container">
            {hasInfrastructureContent ? (
              <div className="infrastructure-header">
                <h2 className="section-title">{t("infra_title")}</h2>
                <a
                  href="#"
                  className="infrastructure-presentation-btn"
                  onClick={(event) => event.preventDefault()}
                >
                  {t("infra_presentation")}
                </a>
              </div>
            ) : null}

            <div className="infrastructure-grid reveal-scroll">
              {apiInfrastructureItems.length > 0 ? (
                apiInfrastructureItems.map((item, index) => (
                  <article
                    key={item.id}
                    className="infrastructure-card"
                    data-speed={(0.95 + (index % 4) * 0.28).toFixed(2)}
                  >
                    <div className="infrastructure-media">
                      <img src={item.image} alt={item.title} />
                    </div>

                    <div className="infrastructure-content">
                      <p className="infrastructure-desc">{item.description}</p>
                    </div>
                  </article>
                ))
              ) : null}
            </div>
          </div>
        </section>

        <section className="finance-section">
          <div className="container">
            {hasFinanceContent ? (
              <div className="biohacking-heading finance-heading">
                <h2 className="biohacking-title section-title">
                  <span className="biohacking-title-highlight">{apiFinanceData?.title || ""}</span>
                </h2>
              </div>
            ) : null}

            {apiFinanceData?.description && apiFinanceData.description !== apiFinanceData.title ? (
              <p className="finance-description">{apiFinanceData.description}</p>
            ) : null}

            <div className="finance-layout reveal-scroll">
              {apiFinanceData?.items.map((item, index) => {
                const image = item.image ? normalizeApiImageUrl(item.image) : "";
                const description = item.description;

                return (
                  <article
                    key={item.id ?? item.title}
                    className={`finance-row${index % 2 === 1 ? " finance-row-reverse" : ""}`}
                  >
                    <div className="finance-row-content">
                      <h4 className="finance-card-title">{item.title}</h4>
                      {description ? <p className="finance-row-desc">{description}</p> : null}
                    </div>
                    {image ? (
                      <div className="finance-row-media">
                        <img src={image} alt={item.title} loading="lazy" />
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          className="biohacking-section origami-holding-section"
          style={apiOrigamiHoldingData?.background_image
            ? { "--biohacking-bg": `url(${apiOrigamiHoldingData.background_image})` } as React.CSSProperties
            : undefined}
        >
          <div className="container">
            {hasOrigamiHoldingContent ? (
              <div className="biohacking-heading">
                <h2 className="biohacking-title section-title">
                  <span className="biohacking-title-highlight">{apiOrigamiHoldingData?.title || ""}</span>
                </h2>
              </div>
            ) : null}

            <div className="biohacking-layout origami-holding-layout reveal-scroll">
                {apiOrigamiHoldingData?.items.length ? (
                  [...apiOrigamiHoldingData.items]
                    .sort((a, b) => getOrigamiHoldingOrder(a) - getOrigamiHoldingOrder(b))
                    .map((item) => {
                      const CardTag = item.link?.trim() ? "a" : "article";
                      return (
                        <CardTag
                          className="biohacking-pillar-card origami-holding-card"
                          key={item.id}
                          {...(item.link?.trim()
                            ? { href: item.link, target: "_blank", rel: "noreferrer" }
                            : {})}
                        >
                          <span className="biohacking-list-icon" aria-hidden="true">
                            {item.logo ? <img src={item.logo} alt={item.title} style={{ width: "24px", height: "24px", objectFit: "contain" }} /> : getOrigamiHoldingIcon(item.slug)}
                          </span>
                          <h4 className="biohacking-pillar-title">{item.title}</h4>
                        </CardTag>
                      );
                    })
                ) : null}
            </div>
          </div>
        </section>

        <section id="communities">
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              {isCompanyProjectsLoading ? (
                <div className="community-title-skeleton" aria-hidden="true" />
              ) : (
                apiCompanyProjectsData?.title ? <h2 className="section-title">{apiCompanyProjectsData.title}</h2> : null
              )}
            </div>

            <div className="community-slider reveal-scroll">
              {isCompanyProjectsLoading ? Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="community-card community-card-skeleton" aria-hidden="true">
                  <div className="community-skeleton-overlay">
                    <div className="community-skeleton-title" />
                    <div className="community-skeleton-text" />
                    <div className="community-skeleton-text short" />
                  </div>
                </div>
              )) : apiCompanyProjectsData?.items.map((community) => {
                const title = community.title;
                const description = community.description?.trim() || community.subtitle?.trim() || "";
                const image = community.image;
                const alt = community.title;

                return (
                  <button
                    key={community.id}
                    type="button"
                    className="community-card trigger-modal"
                    onClick={() => openModal()}
                  >
                    <img src={image} alt={alt} />
                    <div className="community-overlay">
                      <h3 className="comm-title">{title}</h3>
                      {description ? <p className="comm-desc">{description}</p> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {newsItems.length > 0 ? (
          <section className="news-section">
            <div className="container">
              <div className="news-header">
                <h2 className="section-title">{t("news_title")}</h2>
                <a
                  href="#"
                  className="news-all-link"
                  onClick={(event) => event.preventDefault()}
                >
                  <span>{t("news_all")}</span>
                  <span className="news-all-arrow">{">"}</span>
                </a>
              </div>

              <div className="news-grid reveal-scroll">
                {newsItems.map((item) => (
                  <article className="news-card" key={item.id}>
                    <div className="news-card-media">
                      <span className="news-card-badge">{item.category}</span>
                      <img src={item.image} alt={item.title} />
                    </div>

                    <div className="news-card-content">
                      <div className="news-card-meta">
                        <span>{item.category}</span>
                        <span className="news-card-divider">|</span>
                        <span>{item.date}</span>
                      </div>

                      <h3 className="news-card-title">{item.title}</h3>

                      <a
                        href={`/news/${item.slug}`}
                        className="news-card-link"
                        onClick={(event) => {
                          event.preventDefault();
                          navigateTo(`/news/${item.slug}`);
                        }}
                      >
                        <span>{t("news_read_more")}</span>
                        <span className="news-all-arrow">{">"}</span>
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="gallery-section">
          <div className="container">
            {isGalleryLoading || resolvedGalleryItems.length > 0 ? (
              <div className="gallery-header">
                <div className="gallery-heading-copy">
                  <h2 className="section-title gallery-title">{t("gallery_title")}</h2>
                </div>
              </div>
            ) : null}

            <div className="gallery-carousel reveal-scroll">
              <div className="gallery-grid" ref={galleryTrackRef}>
                {isGalleryLoading ? (
                  Array.from({ length: 3 }, (_, index) => (
                    <div
                      key={`gallery-skeleton-${index}`}
                      className="gallery-media-card gallery-media-card-skeleton"
                      aria-hidden="true"
                    >
                      <div className="gallery-media-skeleton-shimmer" />
                      <div className="gallery-media-overlay" />
                    </div>
                  ))
                ) : (
                  resolvedGalleryItems.map((item) => (
                    <div key={item.id} className="gallery-media-card">
                      <div className="gallery-zoom-frame">
                        <Zoom wrapElement="div">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="gallery-zoom-image"
                          />
                        </Zoom>
                      </div>
                      <div className="gallery-media-overlay">
                        {item.subtitle || item.title || item.description ? (
                          <div className="gallery-media-copy">
                            {item.subtitle ? <p className="gallery-media-kicker">{item.subtitle}</p> : null}
                            {item.title ? <h3 className="gallery-media-title">{item.title}</h3> : null}
                            {item.description ? <p className="gallery-media-description">{item.description}</p> : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {!isGalleryLoading && resolvedGalleryItems.length > 0 ? (
                <div className="gallery-pagination" aria-label="Gallery pages">
                  {Array.from({ length: galleryPageCount }, (_, index) => (
                    <button
                      key={`gallery-page-${index}`}
                      type="button"
                      className={`gallery-pagination-dot${index === galleryCurrentPage ? " is-active" : ""}`}
                      onClick={() => {
                        const track = galleryTrackRef.current;
                        if (!track) {
                          return;
                        }

                        track.scrollTo({
                          left: track.clientWidth * index,
                          behavior: "smooth"
                        });
                      }}
                      aria-label={`Go to gallery page ${index + 1}`}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
        </>

      </main>

      <footer>
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <a href="#" className="logo-container" style={{ marginBottom: "1.5rem" }}>
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
              <p>{t("footer_desc")}</p>

              <div className="social-links">
                {apiSocialNetworks.length > 0 ? (
                  apiSocialNetworks.map((network) => (
                    <a key={network.id} href={network.link} target="_blank" rel="noreferrer" aria-label={network.name}>
                      {network.image_url ? (
                        <img src={network.image_url} alt={network.name} width={18} height={18} />
                      ) : network.name.toLowerCase() === "facebook" ? (
                        <FacebookIcon />
                      ) : network.name.toLowerCase() === "instagram" ? (
                        <InstagramIcon />
                      ) : (
                        <LinkedInIcon />
                      )}
                    </a>
                  ))
                ) : null}
              </div>
            </div>

            <div className={`footer-column ${openFooterSection === "links" ? "is-open" : ""}`}>
              <button
                className="footer-column-toggle"
                type="button"
                aria-expanded={openFooterSection === "links"}
                onClick={() => toggleFooterSection("links")}
              >
                <span className="footer-column-title">{t("footer_col_links")}</span>
                <ChevronIcon direction={openFooterSection === "links" ? "up" : "down"} />
              </button>
              <ul>
                {primaryNavItems.map((item) => (
                  <li key={item.href}>
                    <a
                      href={"isModalAction" in item && item.isModalAction ? "#" : item.href}
                      onClick={(event) => {
                        if (!("isModalAction" in item) || !item.isModalAction) {
                          return;
                        }

                        event.preventDefault();
                        openModal();
                      }}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className={`footer-column ${openFooterSection === "services" ? "is-open" : ""}`}>
              <button
                className="footer-column-toggle"
                type="button"
                aria-expanded={openFooterSection === "services"}
                onClick={() => toggleFooterSection("services")}
              >
                <span className="footer-column-title">{apiCompanyProjectsData?.title || ""}</span>
                <ChevronIcon direction={openFooterSection === "services" ? "up" : "down"} />
              </button>
              <ul>
                {apiCompanyProjectsData?.items.map((service) => (
                  <li key={service.id}>
                    <a href={service.link || "#0"}>
                      {service.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className={`footer-column ${openFooterSection === "legal" ? "is-open" : ""}`}>
              <button
                className="footer-column-toggle"
                type="button"
                aria-expanded={openFooterSection === "legal"}
                onClick={() => toggleFooterSection("legal")}
              >
                <span className="footer-column-title">{t("footer_col_contact")}</span>
                <ChevronIcon direction={openFooterSection === "legal" ? "up" : "down"} />
              </button>
              <ul className="footer-contact-list">
                {footerContactAddress ? (
                  <li>
                    {apiContactSettings?.map_link ? (
                    <a href={apiContactSettings.map_link} target="_blank" rel="noreferrer">
                      {footerContactAddress}
                    </a>
                    ) : (
                      footerContactAddress
                    )}
                  </li>
                ) : null}
                {footerContactEmail ? (
                  <li>
                    <a href={`mailto:${footerContactEmail}`}>{footerContactEmail}</a>
                  </li>
                ) : null}
                {footerContactPhone ? (
                  <li>
                    <a href={formatTelHref(footerContactPhone)}>{footerContactPhone}</a>
                  </li>
                ) : null}
                {footerContactSecondaryPhone ? (
                  <li>
                    <a href={formatTelHref(footerContactSecondaryPhone)}>{footerContactSecondaryPhone}</a>
                  </li>
                ) : null}
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>{t("footer_copyright")}</p>
            <div className="footer-legal">
              {apiFooterLegalItems.map((item) => (
                <a key={`${item.id}-${item.link || item.title}`} href={item.link || "#0"}>
                  {item.title}
                </a>
              ))}
            </div>
            <p>
              {t("footer_author_label")} :{" "}
              <a href="https://github.com/david-gakhokia/" target="_blank" rel="noreferrer">
                {"<D/G>"}
              </a>
              .
            </p>
          </div>
        </div>
      </footer>

      {isWidgetVisible ? (
        <div className={`floating-widget ${isWidgetOpen ? "is-open" : "is-collapsed"}`}>
          {isWidgetOpen ? (
            <div className="floating-widget-card" role="complementary" aria-label="Origami quick enquiry widget">
              <div className="floating-widget-brand">
                <div className="floating-widget-badge">
                  <HomeIcon />
                </div>
                <div className="floating-widget-copy">
                  <span className="floating-widget-kicker">{t("widget_badge")}</span>
                  <h3>{t("widget_title")}</h3>
                  <p>{t("widget_desc")}</p>
                </div>
              </div>

              <div className="floating-widget-body">
                <div className="floating-widget-actions">
                  <button type="button" className="floating-widget-chip floating-widget-chip-accent" onClick={() => openModal()}>
                    {t("widget_consult")}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <button
            type="button"
            className="floating-widget-toggle"
            aria-label={isWidgetOpen ? t("widget_toggle_close") : t("widget_toggle_open")}
            onClick={() => setIsWidgetOpen((open) => !open)}
          >
            {isWidgetOpen ? <CloseIcon /> : <ChatIcon />}
          </button>
        </div>
      ) : null}

      <div id="vip-modal" className={`modal ${isModalOpen ? "active" : ""}`}>
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
                {isSubmitting ? (language === "en" ? "Securing Access..." : "წვდომა მუშავდება...") : t("form_send")}
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

      <div className={`modal ${isLanguageModalOpen ? "active" : ""}`}>
        <div className="modal-overlay" onClick={closeLanguageModal}></div>

        <div className="modal-content language-modal-content">
          <button className="modal-close" aria-label="Close language modal" type="button" onClick={closeLanguageModal}>
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
                {language === option.code ? <span className="language-option-check">•</span> : null}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Analytics />
    </>
  );
}
export default App;
