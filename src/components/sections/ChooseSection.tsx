import { useState, type CSSProperties } from "react";
import type { TranslationKey } from "../../i18n";
import type { BuildingVisualFloor, ChooseApiItem } from "../../types";
import { getOptimizedImageUrl, getResponsiveImageSrcSet } from "../../utils/media";

type UnifiedPropertiesSectionProps = {
  chooseData: { title: string; items: ChooseApiItem[] } | null;
  renderTitle?: string;
  renderImage: string;
  renderImageAlt: string;
  floors: BuildingVisualFloor[];
  loadingFloors: boolean;
  getFloorPolygonPoints: (floor: BuildingVisualFloor) => string;
  getFloorLabel: (floor: BuildingVisualFloor) => string;
  getFloorTooltip: (floor: BuildingVisualFloor) => string;
  getFloorUnitsRoute: (floor: BuildingVisualFloor) => string;
  navigateTo: (path: string) => void;
  t: (key: TranslationKey) => string;
};

export function ChooseSection({
  chooseData,
  renderImage,
  renderImageAlt,
  floors,
  loadingFloors,
  getFloorPolygonPoints,
  getFloorLabel,
  getFloorTooltip,
  getFloorUnitsRoute,
  navigateTo,
  t
}: UnifiedPropertiesSectionProps) {
  const [activeFloorId, setActiveFloorId] = useState<number | null>(null);

  const optionItems = (chooseData?.items || [])
    .filter((item) => item.status !== false)
    .sort((a, b) => a.rank - b.rank);

  const sectionTitle = t("available_properties_title");
  const exploreText = t("available_properties_explore");

  return (
    <section id="properties" className="available-properties-section">
      <div className="container available-properties-container">
        {/* Section Header */}
        <div className="available-properties-header">
          <div className="available-properties-header-left">
            <h2 className="available-properties-main-title">{sectionTitle}</h2>
          </div>
        </div>

        {/* Unified Grid: 2 Option Cards + Interactive Building Card */}
        <div className="available-properties-grid">
          {/* Left Option Cards */}
          <div className="available-options-column">
            {optionItems.slice(0, 2).map((item) => {
              const imageSrc = item.image_preview || item.image || "";

              return (
                <article
                  key={item.id}
                  className="available-option-card"
                >
                  <div className="available-option-card-inner">
                    {/* Front Face */}
                    <div className="available-option-card-front">
                      <div className="available-option-media">
                        <img
                          src={getOptimizedImageUrl(imageSrc, { width: 780, height: 960, crop: "fill", gravity: "auto" })}
                          srcSet={getResponsiveImageSrcSet(imageSrc, [380, 560, 780, 960], { crop: "limit" })}
                          sizes="(max-width: 768px) 92vw, (max-width: 1200px) 45vw, 24vw"
                          alt={item.title}
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="available-option-overlay" />
                      </div>

                      <div className="available-option-content">
                        <div className="available-option-text">
                          <h3 className="available-option-title">{item.title}</h3>
                        </div>
                      </div>
                    </div>

                    {/* Back Face (Appears on Flip / Mouse Hover) */}
                    <div className="available-option-card-back">
                      <div className="available-option-back-bg">
                        <img
                          src={getOptimizedImageUrl(imageSrc, { width: 780, height: 960, crop: "fill", gravity: "auto" })}
                          alt=""
                          aria-hidden="true"
                          className="available-option-back-img"
                        />
                        <div className="available-option-back-overlay" />
                      </div>

                      <div className="available-option-back-content">
                        <div className="available-option-back-header">
                          <div className="available-option-back-badge">
                            {item.title}
                          </div>
                          <span className="available-option-back-line" aria-hidden="true" />
                        </div>

                        <div className="available-option-back-body">
                          {item.description ? (
                            <p className="available-option-back-desc">{item.description}</p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Right Featured Building Interactive Explorer Card */}
          <div className="available-building-featured-card">
            {/* Top Bar on Building Card */}
            <div className="available-building-topbar">
              <div className="available-building-explore-tag">
                <span className="available-building-explore-line" aria-hidden="true" />
                <span className="available-building-explore-text">{exploreText}</span>
              </div>
            </div>

            {/* Interactive Visual Map with SVG Hotspots & Floor Labels */}
            <div className="available-building-visual-wrapper">
              <div className="building-visual-map">
                {loadingFloors ? (
                  <div className="building-visual-skeleton" aria-hidden="true">
                    <div className="building-visual-skeleton-shimmer" />
                  </div>
                ) : (
                  renderImage ? (
                    <div className="building-visual-frame">
                      <img
                        src={getOptimizedImageUrl(renderImage, { width: 1200, height: 1400, crop: "fill", gravity: "auto" })}
                        srcSet={getResponsiveImageSrcSet(renderImage, [720, 980, 1280, 1600], { crop: "limit" })}
                        sizes="(max-width: 900px) 92vw, 55vw"
                        alt={renderImageAlt || "Origami Island building model"}
                        decoding="async"
                        loading="eager"
                      />
                      {floors.length > 0 ? (
                        <svg className="building-visual-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" role="group" aria-label="Floor selection">
                          {floors.map((floor) => {
                            const isActive = activeFloorId === floor.id;
                            const floorRoute = getFloorUnitsRoute(floor);

                            return (
                              <g key={floor.id} className="building-floor-hotspot">
                                <polygon
                                  points={getFloorPolygonPoints(floor)}
                                  className={isActive ? "is-active" : ""}
                                  role="link"
                                  tabIndex={0}
                                  aria-label={`${getFloorLabel(floor)} ${getFloorTooltip(floor)}`}
                                  onMouseEnter={() => setActiveFloorId(floor.id)}
                                  onMouseLeave={() => setActiveFloorId(null)}
                                  onFocus={() => setActiveFloorId(floor.id)}
                                  onBlur={() => setActiveFloorId(null)}
                                  onClick={() => navigateTo(floorRoute)}
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                      event.preventDefault();
                                      navigateTo(floorRoute);
                                    }
                                  }}
                                />
                              </g>
                            );
                          })}
                        </svg>
                      ) : null}

                      {floors.map((floor) => {
                        if (!floor.label_position) {
                          return null;
                        }

                        const isActive = activeFloorId === floor.id;

                        return (
                          <button
                            key={floor.id}
                            type="button"
                            className={`building-floor-label${isActive ? " is-active" : ""}`}
                            style={{
                              "--floor-label-x": `${floor.label_position.x}%`,
                              "--floor-label-y": `${floor.label_position.y}%`
                            } as CSSProperties}
                            onMouseEnter={() => setActiveFloorId(floor.id)}
                            onMouseLeave={() => setActiveFloorId(null)}
                            onFocus={() => setActiveFloorId(floor.id)}
                            onBlur={() => setActiveFloorId(null)}
                            onClick={() => navigateTo(getFloorUnitsRoute(floor))}
                          >
                            <span className="building-floor-label-number">{floor.number}</span>
                            <span className="building-floor-tooltip" role="tooltip">
                              <span className="building-floor-tooltip-title">{getFloorLabel(floor)}</span>
                              <span className="building-floor-tooltip-meta">{getFloorTooltip(floor)}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : null
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
