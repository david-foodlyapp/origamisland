import { useEffect, useMemo, useRef, useState } from "react";
import type { TranslationKey } from "../../i18n";
import type { FinanceApiItem } from "../../types";
import { getOptimizedImageUrl, normalizeApiImageUrl } from "../../utils/media";

type StatItem = {
  value: string;
  label: string;
  icon: "chart" | "users" | "trending" | "location";
};

type SlideItem = {
  id: string | number;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  image: string;
  stats: StatItem[];
  ctaText?: string;
};

type FinanceSectionProps = {
  data: { title: string; description: string; background_image?: string; items: FinanceApiItem[] } | null;
  hasContent: boolean;
  t?: (key: TranslationKey) => string;
  openModal?: (style?: "consultation" | "request_call") => void;
};

function StatIcon({ type }: { type: StatItem["icon"] }) {
  if (type === "chart") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    );
  }

  if (type === "users") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }

  if (type === "trending") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function FinanceSection({ data, hasContent, t, openModal }: FinanceSectionProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const fallbackSlides: SlideItem[] = useMemo(() => [
    {
      id: "batumi-potential",
      title: "Why Batumi?",
      subtitle: "A DYNAMIC MARKET ON THE RISE",
      description:
        "Batumi combines a strategic location, a growing economy and a year-round tourism industry, creating a strong foundation for real estate investment. Increasing international demand and ongoing infrastructure development continue to drive long-term value.",
      badge: "INVEST IN POTENTIAL",
      image: "/assets/hero_bg_2.png",
      stats: [
        { value: "1.4M+", label: "Annual visitors", icon: "chart" },
        { value: "48%", label: "Foreign buyers", icon: "users" },
        { value: "Growing", label: "real estate market", icon: "trending" },
        { value: "Strategic", label: "Black Sea location", icon: "location" }
      ],
      ctaText: "EXPLORE BATUMI'S POTENTIAL"
    },
    {
      id: "capital-growth",
      title: "High Capital Growth",
      subtitle: "ACCELERATING ASSET VALUATION",
      description:
        "Prime waterfront real estate in Batumi yields consistent annual capital appreciation. Origami Island offers an extraordinary early-stage entry point for investors seeking premium international property appreciation.",
      badge: "CAPITAL APPRECIATION",
      image: "/assets/hero_bg.png",
      stats: [
        { value: "12-16%", label: "Annual appreciation", icon: "trending" },
        { value: "0% Tax", label: "On property transfer", icon: "chart" },
        { value: "High ROI", label: "Strong resale value", icon: "users" },
        { value: "Waterfront", label: "Exclusive coastline", icon: "location" }
      ],
      ctaText: "VIEW CAPITAL PROJECTIONS"
    },
    {
      id: "rental-yield",
      title: "Attractive Rental Yield",
      subtitle: "YEAR-ROUND HOSPITALITY DEMAND",
      description:
        "With fully managed five-star hospitality services, owners enjoy effortless passive rental yields driven by rising four-season tourism and booming international business travel.",
      badge: "PASSIVE INCOME",
      image: "/assets/hero_bg_2.png",
      stats: [
        { value: "9-13%", label: "Net rental yield", icon: "chart" },
        { value: "365 Days", label: "Year-round demand", icon: "trending" },
        { value: "Full Mgmt", label: "Turnkey operations", icon: "users" },
        { value: "Top Tier", label: "Hotel infrastructure", icon: "location" }
      ],
      ctaText: "EXPLORE RENTAL MODEL"
    },
    {
      id: "business-climate",
      title: "Business & Tax Ease",
      subtitle: "FAVORABLE GLOBAL HUB",
      description:
        "Georgia is recognized globally for its business-friendly regulations, fast ownership registration, visa-free access for over 90 countries, and zero property purchase tax.",
      badge: "GLOBAL JURISDICTION",
      image: "/assets/hero_bg.png",
      stats: [
        { value: "Top 7", label: "Ease of doing business", icon: "trending" },
        { value: "1 Day", label: "Registration process", icon: "chart" },
        { value: "Residency", label: "Eligibility path", icon: "users" },
        { value: "0%", label: "Real estate tax", icon: "location" }
      ],
      ctaText: "LEARN ABOUT RESIDENCY"
    },
    {
      id: "origami-island",
      title: "Origami Island Landmark",
      subtitle: "ICONIC ARCHITECTURAL DESTINATION",
      description:
        "A private island luxury retreat combining cutting-edge biohacking, branded residences, world-class dining, and unmatched lifestyle amenities right on the Black Sea coast.",
      badge: "ISLAND INVESTMENT",
      image: "/assets/hero_bg_2.png",
      stats: [
        { value: "Private", label: "Island ecosystem", icon: "location" },
        { value: "Ultra Luxury", label: "Branded residences", icon: "users" },
        { value: "Biohacking", label: "Wellness longevity", icon: "chart" },
        { value: "Landmark", label: "Batumi coastline", icon: "trending" }
      ],
      ctaText: "DISCOVER THE ISLAND"
    }
  ], []);

  const slides: SlideItem[] = useMemo(() => {
    if (data?.items && data.items.length > 0) {
      return data.items.map((item, idx) => {
        const fallback = fallbackSlides[idx % fallbackSlides.length];
        return {
          id: item.id || `finance-item-${idx}`,
          title: item.title || fallback.title,
          subtitle: item.subtitle || fallback.subtitle,
          description: item.description || fallback.description,
          badge: item.badge || fallback.badge,
          image: item.image ? normalizeApiImageUrl(item.image) : fallback.image,
          stats: fallback.stats,
          ctaText: item.link ? undefined : fallback.ctaText
        };
      });
    }
    return fallbackSlides;
  }, [data?.items, fallbackSlides]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const updateScrollMetrics = () => {
      const { scrollLeft, scrollWidth, clientWidth } = track;
      const maxScroll = Math.max(0, scrollWidth - clientWidth);

      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft < maxScroll - 6);

      const card = track.querySelector<HTMLElement>(".finance-investment-card");
      if (card) {
        const cardWidth = card.offsetWidth;
        const gap = parseFloat(window.getComputedStyle(track).gap || "0") || 0;
        const step = cardWidth + gap;
        const idx = Math.min(slides.length - 1, Math.max(0, Math.round(scrollLeft / (step || clientWidth))));
        setActiveIndex(idx);
      }
    };

    updateScrollMetrics();

    let rafId: number;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateScrollMetrics);
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(rafId);
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [slides.length]);

  if (!hasContent && slides.length === 0) {
    return null;
  }

  const scrollSlide = (direction: "left" | "right") => {
    const track = trackRef.current;
    if (!track) return;

    const card = track.querySelector<HTMLElement>(".finance-investment-card");
    const gap = parseFloat(window.getComputedStyle(track).gap || "0") || 0;
    const step = card ? card.offsetWidth + gap : track.clientWidth;

    track.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth"
    });
  };

  const currentSlide = slides[activeIndex] || slides[0];
  const bgImage = currentSlide?.image || "/assets/hero_bg_2.png";
  const totalCountFormatted = String(slides.length).padStart(2, "0");
  const currentIndexFormatted = String(Math.min(slides.length, activeIndex + 1)).padStart(2, "0");

  const eyebrowText = t ? t("finance_eyebrow") : "INVESTMENT";
  const heroTitle1 = t ? t("finance_hero_title_1") : "A BRIGHTER";
  const heroTitle2 = t ? t("finance_hero_title_2") : "TOMORROW";
  const heroSubtitle = t ? t("finance_hero_subtitle") : "BUILT BY A STRONGER LOCATION";
  const kicker1 = t ? t("finance_kicker_1") : "BATUMI";
  const kicker2 = t ? t("finance_kicker_2") : "A GROWING DESTINATION";
  const kicker3 = t ? t("finance_kicker_3") : "A LASTING OPPORTUNITY";

  return (
    <section id="finances" className="finance-investment-section">
      <div className="container finance-container">
        <div className="finance-panorama-frame">
          {/* Background image layer */}
          <div className="finance-bg-layer">
            <img
              key={bgImage}
              src={getOptimizedImageUrl(bgImage, { width: 1920, height: 1080, crop: "fill", gravity: "center" })}
              alt="Batumi panoramic investment background"
              className="finance-bg-image"
              loading="lazy"
            />
            <div className="finance-bg-overlay" />
          </div>

          {/* Left Hero / Brand Content */}
          <div className="finance-left-content">
            <div className="finance-left-top">
              <div className="finance-hero-eyebrow">
                <span className="finance-eyebrow-line" aria-hidden="true" />
                <span className="finance-eyebrow-text">{eyebrowText}</span>
              </div>

              <h2 className="finance-hero-heading">
                <span>{heroTitle1}</span>
                <span>{heroTitle2}</span>
              </h2>

              <p className="finance-hero-subheading">{heroSubtitle}</p>
            </div>

            <div className="finance-left-bottom">
              <span className="finance-kicker-title">{kicker1}</span>
              <span className="finance-kicker-line">{kicker2}</span>
              <span className="finance-kicker-line">{kicker3}</span>
            </div>
          </div>

          {/* Navigation Arrow Buttons */}
          <button
            type="button"
            className="finance-nav-btn finance-nav-prev"
            onClick={() => scrollSlide("left")}
            disabled={!canScrollLeft}
            aria-label="Previous slide"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            type="button"
            className="finance-nav-btn finance-nav-next"
            onClick={() => scrollSlide("right")}
            disabled={!canScrollRight}
            aria-label="Next slide"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Right Floating Card Slider */}
          <div className="finance-card-slider-wrapper">
            <div className="finance-cards-track" ref={trackRef}>
              {slides.map((slide) => (
                <article key={slide.id} className="finance-investment-card">
                  {/* Card Top Indicator & Category */}
                  <div className="finance-card-topbar">
                    <div className="finance-card-counter">
                      <span className="current">{currentIndexFormatted}</span>
                      <span className="sep"> / </span>
                      <span className="total">{totalCountFormatted}</span>
                      <span className="finance-counter-line" />
                    </div>

                    <span className="finance-card-badge">{slide.badge}</span>
                  </div>

                  {/* Card Title & Subtitle */}
                  <div className="finance-card-headline">
                    <h3 className="finance-card-title">{slide.title}</h3>
                    <p className="finance-card-subtitle">{slide.subtitle}</p>
                  </div>

                  {/* Description */}
                  <p className="finance-card-description">{slide.description}</p>

                  {/* Metrics / Key Stats Grid */}
                  <div className="finance-metrics-grid">
                    {slide.stats.map((st, sIdx) => (
                      <div key={sIdx} className="finance-metric-box">
                        <div className="finance-metric-icon">
                          <StatIcon type={st.icon} />
                        </div>
                        <span className="finance-metric-val">{st.value}</span>
                        <span className="finance-metric-label">{st.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Action CTA */}
                  <div className="finance-card-action">
                    <button
                      type="button"
                      className="finance-card-btn"
                      onClick={() => openModal?.("consultation")}
                    >
                      <span>{slide.ctaText || (t ? t("finance_explore_cta") : "EXPLORE BATUMI'S POTENTIAL")}</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
