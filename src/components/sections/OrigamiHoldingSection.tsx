import type { CSSProperties, ReactNode } from "react";
import type { OrigamiHoldingApiItem } from "../../types";

type OrigamiHoldingSectionProps = {
  data: { title: string; background_image: string; items: OrigamiHoldingApiItem[] } | null;
  hasContent: boolean;
  getIcon: (slug: string) => ReactNode;
  getOrder: (item: { slug?: string; title?: string; description?: string }) => number;
};

export function OrigamiHoldingSection({ data, hasContent, getIcon, getOrder }: OrigamiHoldingSectionProps) {
  if (!hasContent) {
    return null;
  }

  return (
    <section
      className="biohacking-section origami-holding-section"
      style={data?.background_image ? { "--biohacking-bg": `url(${data.background_image})` } as CSSProperties : undefined}
    >
      <div className="container">
        {hasContent ? (
          <div className="biohacking-heading">
            <h2 className="biohacking-title section-title">
              <span className="biohacking-title-highlight">{data?.title || ""}</span>
            </h2>
          </div>
        ) : null}

        <div className="biohacking-layout origami-holding-layout reveal-scroll">
          {data?.items.length ? (
            [...data.items]
              .sort((a, b) => getOrder(a) - getOrder(b))
              .map((item) => {
                const content = (
                  <>
                    <span className="biohacking-list-icon" aria-hidden="true">
                      {item.logo ? <img src={item.logo} alt={item.title} style={{ width: "24px", height: "24px", objectFit: "contain" }} /> : getIcon(item.slug)}
                    </span>
                    <h4 className="biohacking-pillar-title">{item.title}</h4>
                  </>
                );
                const link = item.link?.trim();

                return link ? (
                  <a className="biohacking-pillar-card origami-holding-card" key={item.id} href={link} target="_blank" rel="noreferrer">
                    {content}
                  </a>
                ) : (
                  <article className="biohacking-pillar-card origami-holding-card" key={item.id}>
                    {content}
                  </article>
                );
              })
          ) : null}
        </div>
      </div>
    </section>
  );
}
