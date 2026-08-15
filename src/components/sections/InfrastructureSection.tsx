import type { RefObject } from "react";
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
  if (!hasContent) {
    return null;
  }

  return (
    <section id="infrastructure" className="infrastructure-section" ref={sectionRef}>
      <div className="container">
        {hasContent ? (
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
          {items.length > 0 ? (
            items.map((item, index) => (
              <article
                key={item.id}
                className="infrastructure-card"
                data-speed={(0.95 + (index % 4) * 0.28).toFixed(2)}
              >
                <div className="infrastructure-media">
                  <img
                    src={getOptimizedImageUrl(item.image, { width: 640, height: 760, crop: "fill", gravity: "auto" })}
                    srcSet={getResponsiveImageSrcSet(item.image, [360, 520, 720, 900], { crop: "limit" })}
                    sizes="(max-width: 760px) 78vw, (max-width: 1100px) 44vw, 22vw"
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                  />
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
  );
}
