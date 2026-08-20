import { useRef } from "react";
import type { TranslationKey } from "../../i18n";
import type { NewsCard } from "../../types";
import { getOptimizedImageUrl, getResponsiveImageSrcSet } from "../../utils/media";
import { ArrowIcon } from "../Icons";

type NewsSectionProps = {
  items: NewsCard[];
  t: (key: TranslationKey) => string;
  navigateTo: (path: string) => void;
};

export function NewsSection({ items, t, navigateTo }: NewsSectionProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  if (!items.length) {
    return null;
  }

  const carouselItems = items.length <= 3 ? [...items, ...items] : items;

  const scrollNews = (direction: "left" | "right") => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const firstCard = track.querySelector<HTMLElement>(".news-card");
    const gap = parseFloat(window.getComputedStyle(track).columnGap || "0");
    const step = firstCard ? firstCard.offsetWidth + gap : track.clientWidth * 0.85;
    const maxScroll = track.scrollWidth - track.clientWidth;

    if (direction === "left" && track.scrollLeft <= 2) {
      track.scrollTo({ left: maxScroll, behavior: "smooth" });
      return;
    }

    if (direction === "right" && track.scrollLeft >= maxScroll - 2) {
      track.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }

    track.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth"
    });
  };

  return (
    <section className="news-section">
      <div className="container">
        <div className="news-header">
          <h2 className="section-title">{t("news_title")}</h2>
          <div className="news-carousel-controls" aria-label="News carousel controls">
            <button
              type="button"
              className="news-carousel-button"
              onClick={() => scrollNews("left")}
              aria-label="Previous news"
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button"
              className="news-carousel-button"
              onClick={() => scrollNews("right")}
              aria-label="Next news"
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
        </div>

        <div className="news-grid reveal-scroll" ref={trackRef}>
          {carouselItems.map((item, index) => (
            <article className="news-card" key={`${item.id}-${index}`}>
              <div className="news-card-media">
                <span className="news-card-badge">{item.category}</span>
                <img
                  src={getOptimizedImageUrl(item.image, { width: 640, height: 420, crop: "fill", gravity: "auto" })}
                  srcSet={getResponsiveImageSrcSet(item.image, [360, 520, 720, 900], { crop: "limit" })}
                  sizes="(max-width: 760px) 92vw, 30vw"
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                />
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
  );
}
