import type { ReactNode } from "react";
import type { AboutUsApiItem, SectionGridCardItem } from "../../types";
import { getOptimizedImageUrl, getResponsiveImageSrcSet, normalizeApiImageUrl } from "../../utils/media";

type AboutSectionProps = {
  data: AboutUsApiItem | null;
  infoItems: SectionGridCardItem[];
  image: string;
  hasContent: boolean;
  loading: boolean;
  icons: ReactNode[];
};

export function AboutSection({ data, infoItems, image, hasContent, loading, icons }: AboutSectionProps) {
  if (!loading && !hasContent) {
    return null;
  }

  return (
    <section id="about-us" className="concept-section">
      <div className="container">
        <div className="about-grid-container">
          {/* Left Column: Image Card */}
          <div className="about-grid-left">
            {loading ? (
              <div className="about-image-card concept-render-skeleton">
                <div className="concept-render-skeleton-shimmer" />
              </div>
            ) : image ? (
              <div className="about-image-card">
                <img
                  src={getOptimizedImageUrl(image, { width: 1000, height: 1200, crop: "fill", gravity: "auto" })}
                  srcSet={getResponsiveImageSrcSet(image, [480, 720, 960, 1200], { crop: "limit" })}
                  sizes="(max-width: 900px) 100vw, 45vw"
                  alt={data?.title || ""}
                  className="about-image"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ) : null}
          </div>

          {/* Right Column: Text Card (Top) + Stats Grid (Bottom) */}
          <div className="about-grid-right">
            {loading ? (
              <div className="concept-card about-text-card concept-card-skeleton" aria-hidden="true">
                <div className="concept-content concept-content-skeleton">
                  <div className="concept-title-skeleton" />
                  <div className="concept-line-skeleton wide" />
                  <div className="concept-line-skeleton" />
                  <div className="concept-line-skeleton medium" />
                </div>
              </div>
            ) : hasContent ? (
              <div className="concept-card about-text-card">
                <div className="concept-content">
                  {data?.title ? <h2 className="concept-title">{data.title}</h2> : null}
                  {data?.body ? (
                    <div className="concept-desc" dangerouslySetInnerHTML={{ __html: data.body }} />
                  ) : null}
                </div>
              </div>
            ) : null}

            {loading ? (
              <div className="origami-info-section">
                <div className="origami-info-grid">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <article key={`about-info-skeleton-${index}`} className="origami-info-card origami-info-card-skeleton" aria-hidden="true">
                      <span className="origami-info-icon-skeleton" />
                      <span className="origami-info-value-skeleton" />
                      <span className="origami-info-label-skeleton" />
                    </article>
                  ))}
                </div>
              </div>
            ) : infoItems.length > 0 ? (
              <div className="origami-info-section reveal-scroll">
                <div className="origami-info-grid">
                  {infoItems.map((item, index) => (
                    <article key={item.id} className="origami-info-card">
                      <span className="origami-info-icon">
                        {item.image ? (
                          <img src={normalizeApiImageUrl(item.image)} alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        ) : (
                          icons[index % icons.length]
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
        </div>
      </div>
    </section>
  );
}
