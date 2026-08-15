import type { RefObject } from "react";
import Zoom from "react-medium-image-zoom";
import type { TranslationKey } from "../../i18n";
import type { GalleryItem } from "../../types";

type GallerySectionProps = {
  items: GalleryItem[];
  loading: boolean;
  pageCount: number;
  currentPage: number;
  trackRef: RefObject<HTMLDivElement>;
  t: (key: TranslationKey) => string;
};

export function GallerySection({ items, loading, pageCount, currentPage, trackRef, t }: GallerySectionProps) {
  if (!loading && !items.length) {
    return null;
  }

  return (
    <section className="gallery-section">
      <div className="container">
        {loading || items.length > 0 ? (
          <div className="gallery-header">
            <div className="gallery-heading-copy">
              <h2 className="section-title gallery-title">{t("gallery_title")}</h2>
            </div>
          </div>
        ) : null}

        <div className="gallery-carousel reveal-scroll">
          <div className="gallery-grid" ref={trackRef}>
            {loading ? (
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
              items.map((item) => (
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

          {!loading && items.length > 0 ? (
            <div className="gallery-pagination" aria-label="Gallery pages">
              {Array.from({ length: pageCount }, (_, index) => (
                <button
                  key={`gallery-page-${index}`}
                  type="button"
                  className={`gallery-pagination-dot${index === currentPage ? " is-active" : ""}`}
                  onClick={() => {
                    const track = trackRef.current;
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
  );
}
