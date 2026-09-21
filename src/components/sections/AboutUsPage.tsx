import type { ReactNode } from "react";
import type { AboutUsApiItem, SectionGridCardItem } from "../../types";
import type { Language, TranslationKey } from "../../i18n";
import { getOptimizedImageUrl, getResponsiveImageSrcSet, normalizeApiImageUrl } from "../../utils/media";
import { ArrowIcon } from "../Icons";

type AboutUsPageProps = {
  data: AboutUsApiItem | null;
  infoItems: SectionGridCardItem[];
  loading: boolean;
  icons: ReactNode[];
  language: Language;
  openModal: (style?: "consultation" | "request_call") => void;
  navigateTo: (path: string) => void;
  t: (key: TranslationKey) => string;
};

export function AboutUsPage({
  data,
  infoItems,
  loading,
  icons,
  language,
  openModal,
  navigateTo,
  t
}: AboutUsPageProps) {
  const title = data?.title?.trim() || (loading ? "" : (language === "ka" ? "ჩვენ შესახებ" : "About Us"));
  const image = data?.image || "";
  const body = data?.body || "";

  return (
    <main className="about-us-page">
      <div className="container about-us-container">
        {/* Navigation / Kicker */}
        <div className="about-us-kicker">
          <button className="about-us-back" type="button" onClick={() => navigateTo("/")}>
            <ArrowIcon direction="left" />
            <span>{language === "ka" ? "მთავარი" : "Home"}</span>
          </button>
          <div className="about-us-meta">
            <span className="about-us-category">{language === "ka" ? "ჩვენ შესახებ" : "About Us"}</span>
          </div>
        </div>

        {loading ? (
          <div className="about-us-state">
            {language === "ka" ? "იტვირთება..." : "Loading..."}
          </div>
        ) : (
          <article className="about-us-article">
            {/* Hero Card */}
            <div className="about-us-hero concept-card">
              <div className="about-us-hero-content">
                <h1 className="about-us-title">{title}</h1>
                {body ? (
                  <div
                    className="about-us-desc"
                    dangerouslySetInnerHTML={{ __html: body }}
                  />
                ) : null}

                <div className="about-us-action">
                  <button
                    type="button"
                    className="about-us-cta-btn"
                    onClick={() => openModal("request_call")}
                  >
                    <span>{t("request_call_button")}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {image ? (
                <div className="about-us-hero-media">
                  <img
                    src={getOptimizedImageUrl(image, { width: 1200, height: 900, crop: "fill", gravity: "auto" })}
                    srcSet={getResponsiveImageSrcSet(image, [480, 720, 960, 1200], { crop: "limit" })}
                    sizes="(max-width: 900px) 100vw, 50vw"
                    alt={title}
                    className="about-us-hero-image"
                    loading="eager"
                  />
                </div>
              ) : null}
            </div>

            {/* Info Cards / Stats Grid */}
            {infoItems.length > 0 ? (
              <div className="about-us-stats-section">
                <div className="origami-info-grid">
                  {infoItems.map((item, index) => (
                    <article key={item.id} className="origami-info-card">
                      <span className="origami-info-icon">
                        {item.image ? (
                          <img
                            src={normalizeApiImageUrl(item.image)}
                            alt=""
                            aria-hidden="true"
                            loading="lazy"
                            decoding="async"
                          />
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
          </article>
        )}
      </div>
    </main>
  );
}
