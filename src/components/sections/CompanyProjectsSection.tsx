import type { CompanyProjectApiItem } from "../../types";
import { getOptimizedImageUrl, getResponsiveImageSrcSet } from "../../utils/media";

type CompanyProjectsSectionProps = {
  data: { title: string; items: CompanyProjectApiItem[] } | null;
  loading: boolean;
  openModal: () => void;
};

export function CompanyProjectsSection({ data, loading, openModal }: CompanyProjectsSectionProps) {
  if (!loading && !data?.title && !data?.items.length) {
    return null;
  }

  return (
    <section id="communities">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          {loading ? (
            <div className="community-title-skeleton" aria-hidden="true" />
          ) : (
            data?.title ? <h2 className="section-title">{data.title}</h2> : null
          )}
        </div>

        <div className="community-slider reveal-scroll">
          {loading ? Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="community-card community-card-skeleton" aria-hidden="true">
              <div className="community-skeleton-overlay">
                <div className="community-skeleton-title" />
                <div className="community-skeleton-text" />
                <div className="community-skeleton-text short" />
              </div>
            </div>
          )) : data?.items.map((community) => {
            const title = community.title;
            const description = community.description?.trim() || community.subtitle?.trim() || "";
            const image = community.image;

            return (
              <button
                key={community.id}
                type="button"
                className="community-card trigger-modal"
                onClick={() => openModal()}
              >
                <img
                  src={getOptimizedImageUrl(image, { width: 760, height: 640, crop: "fill", gravity: "auto" })}
                  srcSet={getResponsiveImageSrcSet(image, [420, 640, 860, 1100], { crop: "limit" })}
                  sizes="(max-width: 760px) 84vw, 32vw"
                  alt={title}
                  loading="lazy"
                  decoding="async"
                />
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
  );
}
