import type { CSSProperties, ReactNode } from "react";
import type { TranslationKey } from "../../i18n";
import type { BiohackingApiItem } from "../../types";

type BiohackingSectionProps = {
  data: { description: string; background_image: string; items: BiohackingApiItem[] } | null;
  hasContent: boolean;
  t: (key: TranslationKey) => string;
  getIcon: (slug: string) => ReactNode;
};

export function BiohackingSection({ data, hasContent, t, getIcon }: BiohackingSectionProps) {
  if (!hasContent) {
    return null;
  }

  return (
    <section
      id="biohacking"
      className="biohacking-section"
      style={data?.background_image ? { "--biohacking-bg": `url(${data.background_image})` } as CSSProperties : undefined}
    >
      <div className="container">
        {hasContent ? (
          <div className="biohacking-heading">
            <h2 className="biohacking-title section-title">
              <span className="biohacking-title-highlight">{t("bio_title")}</span>
            </h2>
          </div>
        ) : null}
        {data?.description ? <p className="biohacking-description">{data.description}</p> : null}

        <div className="biohacking-layout reveal-scroll">
          {data?.items.length ? (
            data.items.map((item) => (
              <article key={item.id} className="biohacking-pillar-card">
                <span className="biohacking-list-icon">
                  {item.logo ? <img src={item.logo} alt={item.title} style={{ width: "24px", height: "24px", objectFit: "contain" }} /> : getIcon(item.slug)}
                </span>
                <h4 className="biohacking-pillar-title">{item.title}</h4>
              </article>
            ))
          ) : null}
        </div>
      </div>
    </section>
  );
}
