import type { CSSProperties } from "react";
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
                      <svg className="building-visual-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                        {floors.map((floor) => (
                          <g key={floor.id} className="building-floor-hotspot">
                            <polygon
                              points={getFloorPolygonPoints(floor)}
                              onClick={() => navigateTo(getFloorUnitsRoute(floor))}
                            />
                          </g>
                        ))}
                      </svg>
                    ) : null}
                    {floors.map((floor) => (
                      floor.label_position ? (
                        <button
                          key={floor.id}
                          type="button"
                          className="building-floor-label"
                          style={{
                            "--floor-label-x": `${floor.label_position.x}%`,
                            "--floor-label-y": `${floor.label_position.y}%`
                          } as CSSProperties}
                          onClick={() => navigateTo(getFloorUnitsRoute(floor))}
                        >
                          <span className="building-floor-label-number">{floor.number}</span>
                          <span className="building-floor-tooltip" role="tooltip">
                            <span className="building-floor-tooltip-title">{getFloorLabel(floor)}</span>
                            <span className="building-floor-tooltip-meta">{getFloorTooltip(floor)}</span>
                          </span>
                        </button>
                      ) : null
                    ))}
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
