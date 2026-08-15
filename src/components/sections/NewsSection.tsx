import type { TranslationKey } from "../../i18n";
import type { NewsCard } from "../../types";

type NewsSectionProps = {
  items: NewsCard[];
  t: (key: TranslationKey) => string;
  navigateTo: (path: string) => void;
};

export function NewsSection({ items, t, navigateTo }: NewsSectionProps) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="news-section">
      <div className="container">
        <div className="news-header">
          <h2 className="section-title">{t("news_title")}</h2>
          <a
            href="#"
            className="news-all-link"
            onClick={(event) => event.preventDefault()}
          >
            <span>{t("news_all")}</span>
            <span className="news-all-arrow">{">"}</span>
          </a>
        </div>

        <div className="news-grid reveal-scroll">
          {items.map((item) => (
            <article className="news-card" key={item.id}>
              <div className="news-card-media">
                <span className="news-card-badge">{item.category}</span>
                <img src={item.image} alt={item.title} />
              </div>

              <div className="news-card-content">
                <div className="news-card-meta">
                  <span>{item.category}</span>
                  <span className="news-card-divider">|</span>
                  <span>{item.date}</span>
                </div>

                <h3 className="news-card-title">{item.title}</h3>

                <a
                  href={`/news/${item.slug}`}
                  className="news-card-link"
                  onClick={(event) => {
                    event.preventDefault();
                    navigateTo(`/news/${item.slug}`);
                  }}
                >
                  <span>{t("news_read_more")}</span>
                  <span className="news-all-arrow">{">"}</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
