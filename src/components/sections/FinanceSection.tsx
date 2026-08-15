import type { FinanceApiItem } from "../../types";
import { normalizeApiImageUrl } from "../../utils/media";

type FinanceSectionProps = {
  data: { title: string; description: string; items: FinanceApiItem[] } | null;
  hasContent: boolean;
};

export function FinanceSection({ data, hasContent }: FinanceSectionProps) {
  if (!hasContent) {
    return null;
  }

  return (
    <section className="finance-section">
      <div className="container">
        {hasContent ? (
          <div className="biohacking-heading finance-heading">
            <h2 className="biohacking-title section-title">
              <span className="biohacking-title-highlight">{data?.title || ""}</span>
            </h2>
          </div>
        ) : null}

        {data?.description && data.description !== data.title ? (
          <p className="finance-description">{data.description}</p>
        ) : null}

        <div className="finance-layout reveal-scroll">
          {data?.items.map((item, index) => {
            const image = item.image ? normalizeApiImageUrl(item.image) : "";
            const description = item.description;

            return (
              <article
                key={item.id ?? item.title}
                className={`finance-row${index % 2 === 1 ? " finance-row-reverse" : ""}`}
              >
                <div className="finance-row-content">
                  <h4 className="finance-card-title">{item.title}</h4>
                  {description ? <p className="finance-row-desc">{description}</p> : null}
                </div>
                {image ? (
                  <div className="finance-row-media">
                    <img src={image} alt={item.title} loading="lazy" />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
