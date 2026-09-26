import type { ReactNode } from "react";
import type { TranslationKey } from "../../i18n";
import type { CompanyProjectApiItem, OrigamiHoldingApiItem } from "../../types";
import { getOptimizedImageUrl, getResponsiveImageSrcSet } from "../../utils/media";

type OrigamiHoldingProjectsSectionProps = {
  holdingData: { title: string; background_image?: string; items: OrigamiHoldingApiItem[] } | null;
  projectsData: { title: string; items: CompanyProjectApiItem[] } | null;
  loadingProjects?: boolean;
  hasContent: boolean;
  getIcon: (slug: string) => ReactNode;
  getOrder: (item: { slug?: string; title?: string; description?: string }) => number;
  openModal: (style?: "consultation" | "request_call") => void;
  navigateTo?: (path: string) => void;
  t: (key: TranslationKey) => string;
};

// Default fallback icons for stats
function StatIconFallback({ index }: { index: number }) {
  if (index === 0) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12h20M2 17h20M2 7h20" />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 9h1M9 13h1M9 17h1M14 9h1M14 13h1M14 17h1" />
      </svg>
    );
  }
  if (index === 2) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

export function OrigamiHoldingSection({
  holdingData,
  projectsData,
  loadingProjects,
  hasContent,
  getIcon,
  getOrder,
  openModal,
  t
}: OrigamiHoldingProjectsSectionProps) {
  if (!hasContent && !projectsData?.items.length) {
    return null;
  }

  // Fallback default holding stats matching reference
  const defaultHoldingStats = [
    { value: "28 ha", label: "TOTAL ISLAND AREA" },
    { value: "600+", label: "RESIDENCES & HOTEL KEYS" },
    { value: "1,000,000+", label: "ANNUAL VISITORS (EST.)" },
    { value: "1,400,000 m²", label: "TOTAL DEVELOPMENT" }
  ];

  // Holding stats list
  const holdingItems =
    holdingData?.items && holdingData.items.length > 0
      ? [...holdingData.items].sort((a, b) => getOrder(a) - getOrder(b)).slice(0, 4)
      : null;

  // Fallback default company projects matching reference
  const defaultProjects: CompanyProjectApiItem[] = [
    {
      id: 1,
      slug: "origami-island",
      title: "ORIGAMI ISLAND",
      subtitle: "BEYOND THE HORIZON",
      description: "Beyond the horizon",
      image: "/assets/hero_bg_2.png",
      logo: "",
      link: "",
      badge: "Flagship",
      rank: 1,
      status: true
    },
    {
      id: 2,
      slug: "wellhome",
      title: "WELLHOME",
      subtitle: "A BETTER WAY TO LIVE",
      description: "A better way to live",
      image: "/assets/property_cavalli.png",
      logo: "",
      link: "",
      badge: "Residential",
      rank: 2,
      status: true
    },
    {
      id: 3,
      slug: "white-sails",
      title: "TOWN",
      subtitle: "CONNECTED TO A CALMER LIFE",
      description: "Connected to a calmer life",
      image: "/assets/property_lagoons.png",
      logo: "",
      link: "",
      badge: "Completed",
      rank: 3,
      status: true
    }
  ];

  const projectsList =
    projectsData?.items && projectsData.items.length > 0
      ? projectsData.items.slice(0, 3)
      : defaultProjects;

  const holdingTitle = holdingData?.title || "THE ISLAND";
  const projectsTitle = projectsData?.title || t("projects_title");

  return (
    <section id="holding" className="origami-holding-combined-section">
      <div className="container holding-combined-container">
        {/* ================= TOP BLOCK: THE ISLAND / STATS ================= */}
        <div className="holding-top-block">
          <div className="holding-block-header">
            <div className="holding-block-header-left">
              <h2 className="holding-main-title">{holdingTitle}</h2>
            </div>
          </div>

          {/* 4 Outline Metric Boxes Row */}
          <div className="holding-stats-grid">
            {holdingItems && holdingItems.length > 0
              ? holdingItems.map((item, idx) => {
                  const link = item.link?.trim();
                  const iconElement = item.logo ? (
                    <img src={item.logo} alt={item.title} className="holding-stat-img-icon" />
                  ) : item.slug ? (
                    getIcon(item.slug)
                  ) : (
                    <StatIconFallback index={idx} />
                  );

                  const content = (
                    <>
                      <div className="holding-stat-icon-wrapper" aria-hidden="true">
                        {iconElement}
                      </div>
                      <div className="holding-stat-text-wrapper">
                        <span className="holding-stat-value">{item.title}</span>
                        {item.description ? (
                          <span className="holding-stat-label">{item.description}</span>
                        ) : null}
                      </div>
                    </>
                  );

                  return link ? (
                    <a
                      key={item.id}
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="holding-stat-card"
                    >
                      {content}
                    </a>
                  ) : (
                    <div key={item.id} className="holding-stat-card">
                      {content}
                    </div>
                  );
                })
              : defaultHoldingStats.map((st, idx) => (
                  <div key={idx} className="holding-stat-card">
                    <div className="holding-stat-icon-wrapper" aria-hidden="true">
                      <StatIconFallback index={idx} />
                    </div>
                    <div className="holding-stat-text-wrapper">
                      <span className="holding-stat-value">{st.value}</span>
                      <span className="holding-stat-label">{st.label}</span>
                    </div>
                  </div>
                ))}
          </div>
        </div>

        {/* ================= BOTTOM BLOCK: OUR PROJECTS ================= */}
        <div className="holding-bottom-block">
          <div className="holding-block-header">
            <div className="holding-block-header-left">
              <h2 className="holding-main-title">{projectsTitle}</h2>
            </div>
          </div>

          {/* 3 Project Cards Grid */}
          <div className="holding-projects-grid">
            {loadingProjects
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="holding-project-card holding-project-skeleton" aria-hidden="true" />
                ))
              : projectsList.map((project) => {
                  const imageSrc = project.image || "/assets/property_paramount.png";
                  const desc = project.subtitle || project.description || "";

                  return (
                    <article
                      key={project.id}
                      className="holding-project-card"
                      onClick={() => openModal("consultation")}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openModal("consultation");
                        }
                      }}
                    >
                      <div className="holding-project-media">
                        <img
                          src={getOptimizedImageUrl(imageSrc, { width: 780, height: 600, crop: "fill", gravity: "auto" })}
                          srcSet={getResponsiveImageSrcSet(imageSrc, [420, 640, 860, 1100], { crop: "limit" })}
                          sizes="(max-width: 768px) 92vw, 32vw"
                          alt={project.title}
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="holding-project-overlay" />
                      </div>

                      <div className="holding-project-content">
                        <div className="holding-project-text">
                          <h3 className="holding-project-title">{project.title}</h3>
                          {desc ? <p className="holding-project-subtitle">{desc}</p> : null}
                        </div>

                        <div className="holding-project-circle-btn" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                        </div>
                      </div>
                    </article>
                  );
                })}
          </div>
        </div>
      </div>
    </section>
  );
}
