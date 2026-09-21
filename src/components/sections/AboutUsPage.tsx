import type { AboutUsApiItem } from "../../types";
import type { Language } from "../../i18n";
import { getOptimizedImageUrl, getResponsiveImageSrcSet } from "../../utils/media";
import { ArrowIcon } from "../Icons";

type AboutUsPageProps = {
  data: AboutUsApiItem | null;
  loading: boolean;
  language: Language;
  navigateTo: (path: string) => void;
};

export function AboutUsPage({
  data,
  loading,
  language,
  navigateTo
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
          </article>
        )}
      </div>
    </main>
  );
}
