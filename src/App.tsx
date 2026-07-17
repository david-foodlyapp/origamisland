import { FormEvent, InvalidEvent, useEffect, useRef, useState } from "react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { translations, type Language, type TranslationKey } from "./i18n";

import { Header } from "./components/sections/Header";
import { HeroSection } from "./components/sections/HeroSection";
import { PropertiesPage } from "./components/sections/PropertiesPage";
import { UnitCatalogPage } from "./components/sections/UnitCatalogPage";
import {
  HomeIcon, CalendarIcon, BuildingIcon,
  FacebookIcon, InstagramIcon, LinkedInIcon, CloseIcon, ChatIcon, CheckIcon,
  ChevronIcon, LifestyleIcon, WellnessIcon, ParkingIcon, RestaurantsIcon, RetailIcon,
  WaterfrontIcon, LoungeIcon, FamilyIcon, LongevityIcon, RecoveryIcon, HealthyLivingIcon,
  FitnessIcon, MeditationIcon, SpaIcon, EnergyBalanceIcon, GlobeOutlineIcon,
  AudienceOutlineIcon, PriceTagIcon, InstallmentIcon, ResidenceIcon, HotelSuiteIcon, PenthouseIcon
} from "./components/Icons";
import {
  type Theme,
  type BrandingSettings,
  type BrandingSettingsResponse,
  type RoomFilter,
  type SearchPropertyTypeFilter,
  type ConditionFilter,
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
  type MainMenuApiItem,
  type MainMenuSectionResponse,
  type CompanyProjectApiItem,
  type CompanyProjectsSectionResponse,
  type AboutUsApiItem,
  type AboutUsResponse,
  type Community
} from "./types";
import {
  DEFAULT_BUILDING_SLUG,
  buildUnitCatalogSearch,
  getUnitCatalogRoute,
  navigateTo
} from "./unitCatalog";
import { getExplorerRoute, type ExplorerRoute } from "./propertyExplorer";

const communities: Community[] = [
  {
    area: "Origami Lagoons",
    image: "/assets/property_lagoons.png",
    alt: "Crystal blue beaches at Origami Lagoons",
    titleKey: "comm_lagoons_title",
    descKey: "comm_lagoons_desc"
  },
  {
    area: "Origami Hills",
    image: "/assets/property_paramount.png",
    alt: "Luxury golf residential towers at Origami Hills",
    titleKey: "comm_hills_title",
    descKey: "comm_hills_desc"
  },
  {
    area: "Dubai Marina",
    image: "/assets/property_cavalli.png",
    alt: "High-rise modern towers at Dubai Marina Heights",
    titleKey: "comm_marina_title",
    descKey: "comm_marina_desc"
  }
];

const serviceLinks = [
  "VIP Private Viewings",
  "Investment Advisory",
  "Property Valuation"
];

const origamiInfoItems: Array<{ valueKey: TranslationKey; labelKey: TranslationKey; icon: JSX.Element }> = [
  { valueKey: "origami_info_1_value", labelKey: "origami_info_1_label", icon: <PriceTagIcon /> },
  { valueKey: "origami_info_2_value", labelKey: "origami_info_2_label", icon: <CalendarIcon /> },
  { valueKey: "origami_info_3_value", labelKey: "origami_info_3_label", icon: <InstallmentIcon /> },
  { valueKey: "origami_info_4_value", labelKey: "origami_info_4_label", icon: <ResidenceIcon /> },
  { valueKey: "origami_info_5_value", labelKey: "origami_info_5_label", icon: <HotelSuiteIcon /> },
  { valueKey: "origami_info_6_value", labelKey: "origami_info_6_label", icon: <PenthouseIcon /> }
];

const languageOptions: Array<{ code: Language; label: string; shortLabel: string }> = [
  { code: "ka", label: "ქართული", shortLabel: "KA" },
  { code: "en", label: "English", shortLabel: "EN" },
  // { code: "ru", label: "Русский", shortLabel: "RUS" },
  // { code: "pl", label: "Polski", shortLabel: "POL" }
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

type AppRouteState = ReturnType<typeof getUnitCatalogRoute> | ExplorerRoute;

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
  const [isWidgetOpen, setIsWidgetOpen] = useState(true);
  const [headerShrunk, setHeaderShrunk] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomFilter>("all");
  const [selectedPropertyType, setSelectedPropertyType] = useState<SearchPropertyTypeFilter>("all");
  const [selectedCondition, setSelectedCondition] = useState<ConditionFilter>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [newsItems, setNewsItems] = useState<NewsCard[]>([]);
  const [apiGalleryItems, setApiGalleryItems] = useState<GalleryApiItem[]>([]);
  const [isGalleryLoading, setIsGalleryLoading] = useState(true);
  const [apiInfrastructureItems, setApiInfrastructureItems] = useState<InfrastructureApiItem[]>([]);
  const [apiBiohackingData, setApiBiohackingData] = useState<{ description: string; background_image: string; items: BiohackingApiItem[] } | null>(null);
  const [apiOrigamiHoldingData, setApiOrigamiHoldingData] = useState<{ title: string; background_image: string; items: OrigamiHoldingApiItem[] } | null>(null);
  const [apiChooseData, setApiChooseData] = useState<{ title: string; items: ChooseApiItem[] } | null>(null);
  const [apiFinanceData, setApiFinanceData] = useState<{ title: string; description: string; items: FinanceApiItem[] } | null>(null);
  const [apiCompanyProjectsData, setApiCompanyProjectsData] = useState<{ title: string; items: CompanyProjectApiItem[] } | null>(null);
  const [apiMainMenuItems, setApiMainMenuItems] = useState<MainMenuApiItem[]>([]);
  const [branding, setBranding] = useState<BrandingSettings | null>(null);
  const [isCompanyProjectsLoading, setIsCompanyProjectsLoading] = useState(true);
  const [apiAboutData, setApiAboutData] = useState<AboutUsApiItem | null>(null);
  const [selectedChooseItem, setSelectedChooseItem] = useState<ChooseApiItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessState, setShowSuccessState] = useState(false);
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
  const infrastructureItems = [
    {
      title: t("infra_lifestyle"),
      description: t("infra_lifestyle_desc"),
      image: "/assets/property_cavalli.png",
      alt: "Lifestyle spaces",
      mediaType: "Render",
      icon: <LifestyleIcon />
    },
    {
      title: t("infra_wellness"),
      description: t("infra_wellness_desc"),
      image: "/assets/3d/1.png",
      alt: "Wellness studio render",
      mediaType: "Render",
      icon: <WellnessIcon />
    },
    {
      title: t("infra_parking"),
      description: t("infra_parking_desc"),
      image: "/assets/hero_bg_2.png",
      alt: "Parking arrival zone",
      mediaType: "Render",
      icon: <ParkingIcon />
    },
    {
      title: t("infra_restaurants"),
      description: t("infra_restaurants_desc"),
      image: "/assets/property_paramount.png",
      alt: "Restaurants and dining",
      mediaType: "Render",
      icon: <RestaurantsIcon />
    },
    {
      title: t("infra_retail"),
      description: t("infra_retail_desc"),
      image: "/assets/property_lagoons.png",
      alt: "Retail promenade",
      mediaType: "Render",
      icon: <RetailIcon />
    },
    {
      title: t("infra_waterfront"),
      description: t("infra_waterfront_desc"),
      image: "/assets/hero_bg.png",
      alt: "Waterfront walkway",
      mediaType: "Render",
      icon: <WaterfrontIcon />
    },
    {
      title: t("infra_lounge"),
      description: t("infra_lounge_desc"),
      image: "/assets/3d/2.png",
      alt: "Lounge spaces",
      mediaType: "Render",
      icon: <LoungeIcon />
    },
    {
      title: t("infra_family"),
      description: t("infra_family_desc"),
      image: "/assets/property_lagoons.png",
      alt: "Family activity area",
      mediaType: "Render",
      icon: <FamilyIcon />
    }
  ];
  const biohackingPillars = [
    { label: t("bio_pillar_wellness"), icon: <WellnessIcon /> },
    { label: t("bio_pillar_longevity"), icon: <LongevityIcon /> },
    { label: t("bio_pillar_recovery"), icon: <RecoveryIcon /> },
    { label: t("bio_pillar_healthy"), icon: <HealthyLivingIcon /> },
    { label: t("bio_pillar_fitness"), icon: <FitnessIcon /> },
    { label: t("bio_pillar_meditation"), icon: <MeditationIcon /> },
    { label: t("bio_pillar_spa"), icon: <SpaIcon /> },
    { label: t("bio_pillar_energy"), icon: <EnergyBalanceIcon /> }
  ];
  const aboutHoldingStats: Array<{ value: string; label: string; icon: JSX.Element }> = [
    { value: t("about_stat1_value"), label: t("about_stat1_label"), icon: <CalendarIcon /> },
    { value: t("about_stat3_value"), label: t("about_stat3_label"), icon: <AudienceOutlineIcon /> },
    { value: t("about_stat2_value"), label: t("about_stat2_label"), icon: <BuildingIcon /> },
    { value: t("about_stat4_value"), label: t("about_stat4_label"), icon: <HotelSuiteIcon /> }
  ];
  const financeHighlights: Array<{ title: string; description?: string; icon: JSX.Element }> = [
    { title: t("finance_why_batumi"), icon: <GlobeOutlineIcon /> },
    { title: t("finance_island_investment"), icon: <ResidenceIcon /> },
    { title: t("finance_tourism"), icon: <AudienceOutlineIcon /> },
    { title: t("finance_rental_model"), icon: <CalendarIcon /> }
  ];
  const primaryNavItems = (apiMainMenuItems.length > 0
    ? apiMainMenuItems
    : [
      { id: 1, slug: "about-us", title: t("nav_about"), subtitle: "", description: "", image: "", logo: "", link: "about-us", badge: "", rank: 1, status: true },
      { id: 2, slug: "biohacking", title: t("nav_biohacking"), subtitle: "", description: "", image: "", logo: "", link: "biohacking", badge: "", rank: 2, status: true },
      { id: 3, slug: "consultation", title: t("utility_schedule"), subtitle: "", description: "", image: "", logo: "", link: "consultation", badge: "", rank: 3, status: true }
    ] satisfies MainMenuApiItem[]
  ).map((item) => ({
    href: `#${item.link || item.slug}`,
    label: item.title,
    isModalAction: (item.link || item.slug) === "consultation"
  }));
  const resolvedGalleryItems: GalleryItem[] = apiGalleryItems.map((item, index) => ({
    id: item.id,
    title: item.title?.trim() || "",
    subtitle: item.subtitle?.trim() || "",
    description: item.description?.trim() || "",
    image: normalizeApiImageUrl(item.image),
    badge: String(index + 1).padStart(2, "0")
  }));
  const getRoomLabel = (room: RoomFilter) => {
    switch (room) {
      case "1room":
        return t("filter_room_1");
      case "2room":
        return t("filter_room_2");
      case "3room":
        return t("filter_room_3");
      default:
        return t("filter_room_all");
    }
  };
  const darkThemeLogoSrc = resolveBrandingLogo(branding, language, "dark");
  const lightThemeLogoSrc = resolveBrandingLogo(branding, language, "default");

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
        const response = await fetch("https://admin.origamiholding.com/api/settings/branding", {
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
        const offset = Math.max(-64, Math.min(64, distanceFromViewportCenter * speed * -68));
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

    const loadMainMenu = async () => {
      try {
        const locale = getNewsLocale(language);
        const response = await fetch(`https://admin.origamiholding.com/api/sections/main-menu?locale=${locale}`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Main menu request failed: ${response.status}`);
        }

        const payload: MainMenuSectionResponse = await response.json();
        setApiMainMenuItems(
          payload.data.items
            .filter((item) => item.status)
            .sort((a, b) => a.rank - b.rank)
        );
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Failed to load main menu data:", error);
        setApiMainMenuItems([]);
      }
    };

    loadMainMenu();
    return () => controller.abort();
  }, [language]);

  useEffect(() => {
    const controller = new AbortController();

    const loadGallery = async () => {
      setIsGalleryLoading(true);
      try {
        const locale = getNewsLocale(language);
        const response = await fetch(`https://admin.origamiholding.com/api/sections/gallery?locale=${locale}`, { signal: controller.signal });
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
        const response = await fetch(`https://admin.origamiholding.com/api/news?locale=${locale}`, { signal: controller.signal });
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
    const controller = new AbortController();

    const loadInfrastructure = async () => {
      try {
        const locale = getNewsLocale(language);
        const response = await fetch(`https://admin.origamiholding.com/api/sections/infrastructure?locale=${locale}`, { signal: controller.signal });
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
        const response = await fetch(`https://admin.origamiholding.com/api/sections/biohacking?locale=${locale}`, { signal: controller.signal });
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
        const response = await fetch(`https://admin.origamiholding.com/api/sections/origami-holding?locale=${locale}`, { signal: controller.signal });
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
        const response = await fetch(`https://admin.origamiholding.com/api/sections/choose?locale=${locale}`, { signal: controller.signal });
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
        const response = await fetch(`https://admin.origamiholding.com/api/sections/finances?locale=${locale}`, { signal: controller.signal });
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
        const response = await fetch(`https://admin.origamiholding.com/api/sections/company-projects?locale=${locale}`, { signal: controller.signal });
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
        const response = await fetch(`https://admin.origamiholding.com/api/about-us?locale=${locale}`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`About us request failed: ${response.status}`);
        }

        const payload: AboutUsResponse = await response.json();
        const aboutItem = payload.data
          .filter((item) => item.status && item.type === "Origami Island")
          .sort((a, b) => a.rank - b.rank)[0] || null;

        setApiAboutData(aboutItem);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Failed to load about us data:", error);
      }
    };

    loadAboutUs();
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

  const getFinanceIcon = (slug: string) => {
    if (slug.includes("batumi")) return <GlobeOutlineIcon />;
    if (slug.includes("island") || slug.includes("investment")) return <ResidenceIcon />;
    if (slug.includes("roi")) return <PriceTagIcon />;
    if (slug.includes("tour")) return <AudienceOutlineIcon />;
    if (slug.includes("rental")) return <CalendarIcon />;
    return <PriceTagIcon />;
  };

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

  const handleSearch = () => {
    setMobileFilterOpen(false);
    navigateTo(
      `/properties/${DEFAULT_BUILDING_SLUG}/units?${buildUnitCatalogSearch({
        page: 1,
        perPage: 9,
        floors: [],
        types: selectedPropertyType === "all" ? [] : [selectedPropertyType === "investment" ? "apartment" : "hotel_room"],
        statuses: [],
        rooms: selectedRoom === "all" ? [] : [selectedRoom === "1room" ? "1" : selectedRoom === "2room" ? "2" : "3"],
        bedrooms: selectedRoom === "all" ? [] : [selectedRoom === "1room" ? "0" : selectedRoom === "2room" ? "1" : "2"],
        bathrooms: [],
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
      const response = await fetch("https://admin.origamiholding.com/api/contact-messages", {
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
        selectedRoom={selectedRoom}
        setSelectedRoom={setSelectedRoom}
        selectedPropertyType={selectedPropertyType}
        setSelectedPropertyType={setSelectedPropertyType}
        selectedCondition={selectedCondition}
        setSelectedCondition={setSelectedCondition}
        getRoomLabel={getRoomLabel}
        mobileFilterOpen={mobileFilterOpen}
        setMobileFilterOpen={setMobileFilterOpen}
        handleSearch={handleSearch}
      />
        <section id="about-us" className="concept-section">
          <div className="container">
            <div className="concept-card">
              <div className="concept-content">
                <h2 className="concept-title">{apiAboutData?.title || t("concept_title")}</h2>
                <p className="concept-desc">{apiAboutData?.body ? stripHtmlContent(apiAboutData.body) : t("concept_desc")}</p>
              </div>
              <div className="concept-render">
                <img
                  src={apiAboutData?.image || "/assets/3d/4.png"}
                  alt={apiAboutData?.title || "Origami Island render"}
                  className="concept-render-image"
                />
              </div>
            </div>
            <div className="origami-info-section reveal-scroll">
              <div className="origami-info-grid">
                {origamiInfoItems.map((item) => (
                  <article key={item.valueKey} className="origami-info-card">
                    <span className="origami-info-icon">{item.icon}</span>
                    <span className="origami-info-value">{t(item.valueKey)}</span>
                    <span className="origami-info-label">{t(item.labelKey)}</span>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/*
        <section className="render-section">
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <span className="section-tag">{t("render_tag")}</span>
              <h2 className="section-title">{t("render_title")}</h2>
            </div>
            <div className="render-gallery reveal-scroll">
              <div className="render-main">
                <img src="/assets/3d/1.png" alt="3D Render 1" />
              </div>
              <div className="render-secondary">
                <img src="/assets/3d/2.png" alt="3D Render 2" />
              </div>
            </div>
          </div>
        </section>
        */}

        <section className="directions-section">
          <div className="container">
            <h2 className="section-title" style={{ textAlign: "center", marginBottom: "4rem" }}>
              {apiChooseData?.title || t("directions_title")}
            </h2>
            
            <div className="directions-grid">
              {apiChooseData && apiChooseData.items.length > 0 ? (
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
              ) : (
                <>
                  <div className="direction-card">
                    <div className="direction-card-media">
                      <img src="/assets/property_cavalli.png" alt="სასტუმროს ნომრები" />
                    </div>
                    <div className="direction-card-copy">
                      <h3 className="direction-title">{t("directions_hotel")}</h3>
                    </div>
                  </div>
                  <div className="direction-card">
                    <div className="direction-card-media">
                      <img src="/assets/3d/5.png" alt="ბრენდული რეზიდენციები" />
                    </div>
                    <div className="direction-card-copy">
                      <h3 className="direction-title">{t("directions_investment")}</h3>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/*
            <div className="directions-search-banner">
              <div className="search-banner-bg">
                <img src="/assets/hero_bg_2.png" alt="Search properties background" />
              </div>
              <div className="search-banner-content">
                <div className="banner-filter-group">
                  <label>PROPERTY TYPE <ChevronIcon direction="down" /></label>
                </div>
                <div className="banner-filter-divider"></div>
                <div className="banner-filter-group">
                  <label>BEDROOMS <ChevronIcon direction="down" /></label>
                </div>
                <div className="banner-filter-divider"></div>
                <div className="banner-filter-group">
                  <label>PRICE RANGE <ChevronIcon direction="down" /></label>
                </div>
                <div className="banner-filter-divider"></div>
                <div className="banner-filter-group">
                  <label>COMMUNITY <ChevronIcon direction="down" /></label>
                </div>
                <button className="banner-search-btn" type="button">SEARCH PROPERTIES</button>
              </div>
            </div>
            */}
          </div>
        </section>

        <section id="infrastructure" className="infrastructure-section" ref={infrastructureSectionRef}>
          <div className="container">
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
              ) : (
                infrastructureItems.map((item, index) => (
                  <article
                    key={item.title}
                    className="infrastructure-card"
                    data-speed={(0.95 + (index % 4) * 0.28).toFixed(2)}
                  >
                    <div className="infrastructure-media">
                      <img src={item.image} alt={item.alt} />
                    </div>

                    <div className="infrastructure-content">
                      <p className="infrastructure-desc">{item.description}</p>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

        <section id="biohacking" className="biohacking-section" style={apiBiohackingData?.background_image ? { "--biohacking-bg": `url(${apiBiohackingData.background_image})` } as React.CSSProperties : undefined}>
          <div className="container">
            <div className="biohacking-heading">
              <h2 className="biohacking-title section-title">
                <span className="biohacking-title-highlight">{t("bio_title")}</span>
              </h2>
            </div>
            {apiBiohackingData?.description ? (
              <p className="biohacking-description">{apiBiohackingData.description}</p>
            ) : null}

            <div className="biohacking-layout reveal-scroll">
              {apiBiohackingData && apiBiohackingData.items.length > 0 ? (
                apiBiohackingData.items.map((item) => (
                  <article key={item.id} className="biohacking-pillar-card">
                    <span className="biohacking-list-icon">
                      {item.logo ? <img src={item.logo} alt={item.title} style={{ width: "24px", height: "24px", objectFit: "contain" }} /> : getBiohackingIcon(item.slug)}
                    </span>
                    <h4 className="biohacking-pillar-title">{item.title}</h4>
                  </article>
                ))
              ) : (
                biohackingPillars.map((item) => (
                  <article key={item.label} className="biohacking-pillar-card">
                    <span className="biohacking-list-icon">{item.icon}</span>
                    <h4 className="biohacking-pillar-title">{item.label}</h4>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="finance-section">
          <div className="container">
            <div className="biohacking-heading finance-heading">
              <h2 className="biohacking-title section-title">
                <span className="biohacking-title-highlight">{t("finance_title")}</span>
              </h2>
            </div>

            {apiFinanceData?.description && apiFinanceData.description !== apiFinanceData.title ? (
              <p className="finance-description">{apiFinanceData.description}</p>
            ) : null}

            <div className="finance-layout reveal-scroll">
              {(apiFinanceData?.items.length ? apiFinanceData.items : financeHighlights).map((item) => {
                const iconContent = "id" in item
                  ? item.logo
                    ? <img src={item.logo} alt={item.title} style={{ width: "24px", height: "24px", objectFit: "contain" }} />
                    : getFinanceIcon(item.slug)
                  : item.icon;

                return (
                  <article key={"id" in item ? item.id : item.title} className="finance-card">
                    <span className="biohacking-list-icon finance-card-icon">
                      {iconContent}
                    </span>
                    <h4 className="finance-card-title">{item.title}</h4>
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
            <div className="biohacking-heading">
              <h2 className="biohacking-title section-title">
                <span className="biohacking-title-highlight">{apiOrigamiHoldingData?.title || t("about_holding_title")}</span>
              </h2>
            </div>

            <div className="biohacking-layout origami-holding-layout reveal-scroll">
                {apiOrigamiHoldingData && apiOrigamiHoldingData.items.length > 0 ? (
                  [...apiOrigamiHoldingData.items]
                    .sort((a, b) => getOrigamiHoldingOrder(a) - getOrigamiHoldingOrder(b))
                    .map((item) => (
                    <article className="biohacking-pillar-card origami-holding-card" key={item.id}>
                      <span className="biohacking-list-icon" aria-hidden="true">
                        {item.logo ? <img src={item.logo} alt={item.title} style={{ width: "24px", height: "24px", objectFit: "contain" }} /> : getOrigamiHoldingIcon(item.slug)}
                      </span>
                      <h4 className="biohacking-pillar-title">{item.title}</h4>
                    </article>
                  ))
                ) : (
                  aboutHoldingStats.map((item) => (
                    <article className="biohacking-pillar-card origami-holding-card" key={item.label}>
                      <span className="biohacking-list-icon" aria-hidden="true">
                        {item.icon}
                      </span>
                      <h4 className="biohacking-pillar-title">{item.label}</h4>
                    </article>
                  ))
                )}
            </div>
          </div>
        </section>

        <section id="communities">
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              {isCompanyProjectsLoading ? (
                <div className="community-title-skeleton" aria-hidden="true" />
              ) : (
                <h2 className="section-title">{apiCompanyProjectsData?.title || t("comm_title")}</h2>
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
              )) : (apiCompanyProjectsData?.items.length ? apiCompanyProjectsData.items : communities).map((community) => {
                const title = "title" in community ? community.title : t(community.titleKey);
                const description = "title" in community
                  ? community.description?.trim() || community.subtitle?.trim() || ""
                  : t(community.descKey);
                const image = "title" in community ? community.image : community.image;
                const alt = "title" in community ? community.title : community.alt;

                return (
                  <button
                    key={"id" in community ? community.id : community.area}
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
                        href="#"
                        className="news-card-link"
                        onClick={(event) => event.preventDefault()}
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
            <div className="gallery-header">
              <div className="gallery-heading-copy">
                <h2 className="section-title gallery-title">{t("gallery_title")}</h2>
              </div>
            </div>

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
                <a href="#" aria-label="Facebook Page">
                  <FacebookIcon />
                </a>
                <a href="#" aria-label="Instagram Profile">
                  <InstagramIcon />
                </a>
                <a href="#" aria-label="LinkedIn Company Page">
                  <LinkedInIcon />
                </a>
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
                      href={item.isModalAction ? "#" : item.href}
                      onClick={(event) => {
                        if (!item.isModalAction) {
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
                <span className="footer-column-title">{t("footer_col_services")}</span>
                <ChevronIcon direction={openFooterSection === "services" ? "up" : "down"} />
              </button>
              <ul>
                {serviceLinks.map((service) => (
                  <li key={service}>
                    <a
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        openModal();
                      }}
                    >
                      {service}
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
                <span className="footer-column-title">{t("footer_col_legal")}</span>
                <ChevronIcon direction={openFooterSection === "legal" ? "up" : "down"} />
              </button>
              <ul>
                <li>
                  <a href="#">{t("footer_privacy")}</a>
                </li>
                <li>
                  <a href="#">{t("footer_terms")}</a>
                </li>
                <li>
                  <a href="#">{t("footer_cookies")}</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>
              {t("footer_copyright")} {t("footer_author_label")} :{" "}
              <a href="https://github.com/david-gakhokia/" target="_blank" rel="noreferrer">
                {"<D/G>"}
              </a>
              .
            </p>
            <div className="footer-legal">
              <a href="#">{t("footer_privacy")}</a>
              <a href="#">{t("footer_terms")}</a>
            </div>
          </div>
        </div>
      </footer>

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

    </>
  );
}
export default App;
