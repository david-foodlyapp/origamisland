import { useState, type CSSProperties } from "react";
import type { TranslationKey } from "../../i18n";
import type { BuildingVisualFloor, ChooseApiItem } from "../../types";
import { DEFAULT_BUILDING_SLUG } from "../../unitCatalog";
import { getOptimizedImageUrl, getResponsiveImageSrcSet } from "../../utils/media";

type UnifiedPropertiesSectionProps = {
  chooseData: { title: string; items: ChooseApiItem[] } | null;
  openChooseModal: (item: ChooseApiItem) => void;
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
  openChooseModal,
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

  const defaultOptionItems: ChooseApiItem[] = [
    {
      id: 1,
      slug: "hotel-rooms",
      title: "Hotel-style Residences",
      subtitle: "Hotel Service",
      description: "Turnkey living with hotel services",
      image: "/assets/property_lagoons.png",
      logo: "",
      link: "",
      badge: "Hotel",
      rank: 1,
      status: true
    },
    {
      id: 2,
      slug: "branded-residences",
      title: "Residential Residences",
      subtitle: "Private Living",
      description: "A home for your next chapter",
      image: "/assets/property_cavalli.png",
      logo: "",
      link: "",
      badge: "Residential",
      rank: 2,
      status: true
    }
  ];

  const optionItems =
    chooseData?.items && chooseData.items.length > 0
      ? chooseData.items.map((item, idx) => ({
          ...item,
          description: item.description || defaultOptionItems[idx % defaultOptionItems.length].description,
          image: item.image || item.image_preview || defaultOptionItems[idx % defaultOptionItems.length].image
        }))
      : defaultOptionItems;

  const eyebrow = t("available_properties_eyebrow");
  const sectionTitle = t("available_properties_title");
  const tagline = t("available_properties_tagline");
  const exploreText = t("available_properties_explore");

  return (
    <section id="properties" className="available-properties-section">
      <div className="container available-properties-container">
        {/* Section Header */}
        <div className="available-properties-header">
          <div className="available-properties-header-left">
            <div className="available-properties-eyebrow">
              <span className="available-properties-eyebrow-line" aria-hidden="true" />
              <span className="available-properties-eyebrow-text">{eyebrow}</span>
            </div>
            <h2 className="available-properties-main-title">{sectionTitle}</h2>
          </div>

          <div className="available-properties-header-right">
            <p className="available-properties-tagline">{tagline}</p>
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
                  onClick={() => openChooseModal(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openChooseModal(item);
                    }
                  }}
                >
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
                      {item.description ? (
                        <p className="available-option-desc">{item.description}</p>
                      ) : null}
                    </div>

                    <div className="available-option-action" aria-hidden="true">
                      <div className="available-option-circle-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
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
                <span className="available-building-explore-text">{exploreText}</span>
                <span className="available-building-explore-line" aria-hidden="true" />
              </div>

              <button
                type="button"
                className="available-building-nav-btn"
                onClick={() => navigateTo(`/properties/${DEFAULT_BUILDING_SLUG}/units`)}
                aria-label="Explore all units"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
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
