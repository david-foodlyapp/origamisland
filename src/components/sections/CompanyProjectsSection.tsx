import type { CompanyProjectApiItem } from "../../types";

type CompanyProjectsSectionProps = {
  data: { title: string; items: CompanyProjectApiItem[] } | null;
  loading: boolean;
  openModal: () => void;
};

export function CompanyProjectsSection({ data, loading, openModal }: CompanyProjectsSectionProps) {
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
                <img src={image} alt={title} />
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
