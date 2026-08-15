import type { ChooseApiItem } from "../../types";
import { normalizeApiImageUrl } from "../../utils/media";

type ChooseSectionProps = {
  data: { title: string; items: ChooseApiItem[] } | null;
  loading: boolean;
  openChooseModal: (item: ChooseApiItem) => void;
};

export function ChooseSection({ data, loading, openChooseModal }: ChooseSectionProps) {
  if (!loading && !data?.title && !data?.items.length) {
    return null;
  }

  return (
    <section className="directions-section">
      <div className="container">
        {loading ? (
          <div className="directions-title-skeleton" aria-hidden="true" />
        ) : (
          <h2 className="section-title" style={{ textAlign: "center", marginBottom: "4rem" }}>
            {data?.title || ""}
          </h2>
        )}

        <div className="directions-grid">
          {loading ? (
            Array.from({ length: 2 }).map((_, index) => (
              <div key={`choose-skeleton-${index}`} className="direction-card direction-card-skeleton" aria-hidden="true">
                <div className="direction-card-skeleton-media">
                  <div className="direction-card-skeleton-shimmer" />
                </div>
                <div className="direction-card-skeleton-copy">
                  <div className="direction-card-skeleton-title" />
                  <div className="direction-card-skeleton-text" />
                </div>
              </div>
            ))
          ) : data?.items.length ? (
            data.items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="direction-card trigger-modal"
                onClick={() => openChooseModal(item)}
              >
                <span className="direction-card-inner">
                  <span className="direction-card-face direction-card-front">
                    <span className="direction-card-media">
                      <img src={normalizeApiImageUrl(item.image_preview || item.image || "")} alt={item.title} />
                    </span>
                    <span className="direction-card-copy">
                      <h3 className="direction-title">{item.title}</h3>
                    </span>
                  </span>
                  <span className="direction-card-face direction-card-back">
                    <span className="direction-card-back-inner">
                      <span className="direction-card-back-title">{item.title}</span>
                      {item.description ? <span className="direction-card-description">{item.description}</span> : null}
                    </span>
                  </span>
                </span>
              </button>
            ))
          ) : null}
        </div>
      </div>
    </section>
  );
}
