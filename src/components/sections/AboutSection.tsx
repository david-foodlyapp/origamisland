import type { ReactNode } from "react";
import type { AboutUsApiItem, SectionGridCardItem } from "../../types";
import { normalizeApiImageUrl } from "../../utils/media";

type AboutSectionProps = {
  data: AboutUsApiItem | null;
  infoItems: SectionGridCardItem[];
  image: string;
  hasContent: boolean;
  icons: ReactNode[];
};

export function AboutSection({ data, infoItems, image, hasContent, icons }: AboutSectionProps) {
  return (
    <section id="about-us" className="concept-section">
      <div className="container">
        {hasContent ? (
          <div className="concept-card">
            <div className="concept-content">
              {data?.title ? <h2 className="concept-title">{data.title}</h2> : null}
              {data?.body ? (
                <div className="concept-desc" dangerouslySetInnerHTML={{ __html: data.body }} />
              ) : null}
            </div>
            {image ? (
              <div className="concept-render">
                <img
                  src={normalizeApiImageUrl(image)}
                  alt={data?.title || ""}
                  className="concept-render-image"
                />
              </div>
            ) : null}
          </div>
        ) : null}
        {infoItems.length > 0 ? (
          <div className="origami-info-section reveal-scroll">
            <div className="origami-info-grid">
              {infoItems.map((item, index) => (
                <article key={item.id} className="origami-info-card">
                  <span className="origami-info-icon">
                    {item.image ? (
                      <img src={item.image} alt="" aria-hidden="true" />
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
    </section>
  );
}
