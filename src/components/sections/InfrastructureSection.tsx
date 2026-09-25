import { useEffect, useRef, useState, type RefObject } from "react";
import type { TranslationKey } from "../../i18n";
import type { InfrastructureApiItem } from "../../types";
import { getOptimizedImageUrl, getResponsiveImageSrcSet } from "../../utils/media";

type InfrastructureSectionProps = {
  items: InfrastructureApiItem[];
  hasContent: boolean;
  sectionRef: RefObject<HTMLElement>;
  t: (key: TranslationKey) => string;
};

export function InfrastructureSection({ items, hasContent, sectionRef, t }: InfrastructureSectionProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const updateScrollMetrics = () => {
      const { scrollLeft, scrollWidth, clientWidth } = track;
      const maxScroll = Math.max(0, scrollWidth - clientWidth);

      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft < maxScroll - 4);

      const ratio = maxScroll > 0 ? scrollLeft / maxScroll : 0;
      setProgress(ratio);

      const cards = track.querySelectorAll<HTMLElement>(".infrastructure-card");
      if (cards.length > 0) {
        const firstCard = cards[0];
        const cardWidth = firstCard.offsetWidth;
        const gap = parseFloat(window.getComputedStyle(track).gap || "20") || 20;
        const itemStep = cardWidth + gap;
        const idx = Math.min(cards.length - 1, Math.max(0, Math.round(scrollLeft / itemStep)));
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
  }, [items.length]);

  if (!hasContent || items.length === 0) {
    return null;
  }

  const scrollCarousel = (direction: "left" | "right") => {
    const track = trackRef.current;
    if (!track) return;

    const firstCard = track.querySelector<HTMLElement>(".infrastructure-card");
    const gap = parseFloat(window.getComputedStyle(track).gap || "20") || 20;
    const step = firstCard ? firstCard.offsetWidth + gap : track.clientWidth * 0.8;

    track.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth"
    });
  };

  const totalCountFormatted = String(items.length).padStart(2, "0");
  const currentIndexFormatted = String(Math.min(items.length, activeIndex + 1)).padStart(2, "0");

  return (
    <section id="infrastructure" className="infrastructure-section" ref={sectionRef}>
      <div className="container infrastructure-container">
        <div className="infrastructure-header-modern">
          <div className="infrastructure-header-left">
            <h2 className="infrastructure-main-title">{t("infra_title")}</h2>
          </div>
        </div>

        <div className="infrastructure-carousel-wrapper">
          <button
            type="button"
            className="infrastructure-nav-btn infrastructure-nav-prev"
            onClick={() => scrollCarousel("left")}
            disabled={!canScrollLeft}
            aria-label="Previous items"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="infrastructure-track" ref={trackRef}>
            {items.map((item, index) => (
              <article
                key={item.id || index}
                className="infrastructure-card"
              >
                <div className="infrastructure-card-media">
                  <img
                    src={getOptimizedImageUrl(item.image, { width: 720, height: 900, crop: "fill", gravity: "auto" })}
                    srcSet={getResponsiveImageSrcSet(item.image, [360, 520, 720, 960], { crop: "limit" })}
                    sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 22vw"
                    alt={item.title || item.description}
                    loading="lazy"
                    decoding="async"
                  />
                  {item.badge ? (
                    <span className="infrastructure-card-badge">{item.badge}</span>
                  ) : null}
                </div>

                <div className="infrastructure-card-body">
                  <h3 className="infrastructure-card-title">{item.title}</h3>
                  {item.description ? (
                    <p className="infrastructure-card-desc">{item.description}</p>
                  ) : item.subtitle ? (
                    <p className="infrastructure-card-desc">{item.subtitle}</p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>

          <button
            type="button"
            className="infrastructure-nav-btn infrastructure-nav-next"
            onClick={() => scrollCarousel("right")}
            disabled={!canScrollRight}
            aria-label="Next items"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <div className="infrastructure-footer">
          <div className="infrastructure-progress-track" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
            <div
              className="infrastructure-progress-bar"
              style={{
                width: `${Math.max(15, 20 + progress * 80)}%`
              }}
            />
          </div>

          <div className="infrastructure-counter">
            <span className="current">{currentIndexFormatted}</span>
            <span className="sep"> / </span>
            <span className="total">{totalCountFormatted}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
