import { useEffect, useRef, useState, type ReactNode } from "react";
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
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  const holdingItems = hasContent
    ? [...(holdingData?.items || [])].sort((a, b) => getOrder(a) - getOrder(b)).slice(0, 4)
    : [];
  const projectsList = (projectsData?.items || []).filter((item) => item.status !== false);
  const hasHoldingItems = holdingItems.length > 0;
  const hasProjectItems = projectsList.length > 0;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const updateScrollMetrics = () => {
      const { scrollLeft, scrollWidth, clientWidth } = track;
      const maxScroll = Math.max(0, scrollWidth - clientWidth);

      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft < maxScroll - 4);
    };

    updateScrollMetrics();

    let rafId: number;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateScrollMetrics);
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(rafId);
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [projectsList.length, loadingProjects]);

  const scrollProjects = (direction: "left" | "right") => {
    const track = trackRef.current;
    if (!track) return;

    const firstCard = track.querySelector<HTMLElement>(".holding-project-card");
    const gap = parseFloat(window.getComputedStyle(track).gap || "16") || 16;
    const step = firstCard ? firstCard.offsetWidth + gap : track.clientWidth * 0.8;

    track.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth"
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX - track.offsetLeft;
    scrollLeftRef.current = track.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const track = trackRef.current;
    if (!track) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startXRef.current) * 1.4;
    if (Math.abs(walk) > 6) {
      hasMovedRef.current = true;
    }
    track.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    openModal("consultation");
  };

  if (!hasHoldingItems && !hasProjectItems && !loadingProjects) {
    return null;
  }

  const holdingTitle = holdingData?.title || "";
  const projectsTitle = projectsData?.title || t("projects_title");

  return (
    <section id="holding" className="origami-holding-combined-section">
      <div className="container holding-combined-container">
        {/* ================= TOP BLOCK: THE ISLAND / STATS ================= */}
        {hasHoldingItems ? (
          <div className="holding-top-block">
            <div className="holding-block-header">
              <div className="holding-block-header-left">
                <h2 className="holding-main-title">{holdingTitle}</h2>
              </div>
            </div>

            {/* Outline Metric Boxes Row */}
            <div className="holding-stats-grid">
              {holdingItems.map((item, idx) => {
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
              })}
            </div>
          </div>
        ) : null}

        {/* ================= BOTTOM BLOCK: OUR PROJECTS ================= */}
        {loadingProjects || hasProjectItems ? (
          <div className="holding-bottom-block">
            <div className="holding-block-header">
              <div className="holding-block-header-left">
                <h2 className="holding-main-title">{projectsTitle}</h2>
              </div>
              <div className="holding-projects-header-nav">
                <button
                  type="button"
                  className="holding-projects-nav-btn holding-projects-nav-prev"
                  onClick={() => scrollProjects("left")}
                  disabled={!canScrollLeft}
                  aria-label="Previous projects"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="holding-projects-nav-btn holding-projects-nav-next"
                  onClick={() => scrollProjects("right")}
                  disabled={!canScrollRight}
                  aria-label="Next projects"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Scrollable Project Cards Carousel */}
            <div className="holding-projects-carousel-wrapper">
              <div
                className="holding-projects-track"
                ref={trackRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
              >
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
                          onClick={handleCardClick}
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
                              draggable={false}
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
        ) : null}
      </div>
    </section>
  );
}
