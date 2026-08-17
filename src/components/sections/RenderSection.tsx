import { useState, type CSSProperties } from "react";
import type { BuildingVisualFloor } from "../../types";
import { getOptimizedImageUrl, getResponsiveImageSrcSet } from "../../utils/media";

type RenderSectionProps = {
  title: string;
  image: string;
  imageAlt: string;
  floors: BuildingVisualFloor[];
  loading: boolean;
  getFloorPolygonPoints: (floor: BuildingVisualFloor) => string;
  getFloorLabel: (floor: BuildingVisualFloor) => string;
  getFloorTooltip: (floor: BuildingVisualFloor) => string;
  getFloorUnitsRoute: (floor: BuildingVisualFloor) => string;
  navigateTo: (path: string) => void;
};

export function RenderSection({
  title,
  image,
  imageAlt,
  floors,
  loading,
  getFloorPolygonPoints,
  getFloorLabel,
  getFloorTooltip,
  getFloorUnitsRoute,
  navigateTo
}: RenderSectionProps) {
  const [activeFloorId, setActiveFloorId] = useState<number | null>(null);

  if (!loading && !title && !image) {
    return null;
  }

  return (
    <section className="render-section">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          {title ? <h2 className="section-title">{title}</h2> : null}
        </div>
        <div className="render-gallery reveal-scroll">
          <div className="render-main">
            <div className="building-visual-map">
              {loading ? (
                <div className="building-visual-skeleton" aria-hidden="true">
                  <div className="building-visual-skeleton-shimmer" />
                </div>
              ) : (
                image ? (
                  <div className="building-visual-frame">
                    <img
                      src={getOptimizedImageUrl(image, { width: 1100, height: 1320, crop: "fill", gravity: "auto" })}
                      srcSet={getResponsiveImageSrcSet(image, [720, 980, 1280, 1600], { crop: "limit" })}
                      sizes="(max-width: 900px) 92vw, min(92vw, 1480px)"
                      alt={imageAlt}
                      decoding="async"
                      loading="eager"
                    />
                    {floors.length > 0 ? (
                      <svg className="building-visual-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" role="group" aria-label={title}>
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
    </section>
  );
}
