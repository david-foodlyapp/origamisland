import type { CSSProperties } from "react";
import type { ExplorerFloor } from "../../types";

type RenderSectionProps = {
  title: string;
  image: string;
  imageAlt: string;
  floors: ExplorerFloor[];
  loading: boolean;
  getFloorPolygonPoints: (floor: ExplorerFloor) => string;
  getFloorLabel: (floor: ExplorerFloor) => string;
  getFloorTooltip: (floor: ExplorerFloor) => string;
  getFloorUnitsRoute: (floor: ExplorerFloor) => string;
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
                    <img src={image} alt={imageAlt} />
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
                      floor.building_map_label_position ? (
                        <button
                          key={floor.id}
                          type="button"
                          className="building-floor-label"
                          style={{
                            "--floor-label-x": `${floor.building_map_label_position.x}%`,
                            "--floor-label-y": `${floor.building_map_label_position.y}%`
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
