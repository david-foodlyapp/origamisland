import { useEffect, useMemo, useRef, useState } from "react";
import type { TranslationKey } from "../../i18n";
import type { FinanceApiItem } from "../../types";
import { getOptimizedImageUrl, normalizeApiImageUrl } from "../../utils/media";

type SlideItem = {
  id: string | number;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  image: string;
  ctaText?: string;
};

type FinanceSectionProps = {
  data: { title: string; description: string; background_image?: string; items: FinanceApiItem[] } | null;
  hasContent: boolean;
  t?: (key: TranslationKey) => string;
  openModal?: (style?: "consultation" | "request_call") => void;
};

export function FinanceSection({ data, hasContent, t }: FinanceSectionProps) {
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
  const mainTitle = currentSlide?.title || data?.title || (t ? t("finance_title") : "INVESTMENT");
  const mainSubtitle =
    currentSlide?.subtitle && currentSlide.subtitle.toLowerCase() !== mainTitle.toLowerCase()
      ? currentSlide.subtitle
      : data?.description && data.description !== mainTitle
      ? data.description
      : "";

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

              <h2 className="finance-hero-heading">{mainTitle}</h2>

              {mainSubtitle ? <p className="finance-hero-subheading">{mainSubtitle}</p> : null}
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

                  {/* Description */}
                  <p className="finance-card-description">{slide.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
