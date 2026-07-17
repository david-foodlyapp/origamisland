import { useEffect, useMemo, useState } from "react";
import { ArrowIcon, BuildingIcon, ChevronIcon, HomeIcon, LocationIcon, SearchIcon } from "../Icons";
import {
  buildExplorerSearch,
  fetchFloor,
  fetchProperties,
  fetchProperty,
  fetchPropertyFloors,
  fetchPropertyUnits,
  getFloorCoverImage,
  getPropertyCoverImage,
  getUnitCoverImage,
  navigateTo,
  readExplorerQuery
} from "../../propertyExplorer";
import {
  type ConditionFilter,
  type ExplorerFloor,
  type ExplorerFloorDetail,
  type ExplorerProperty,
  type ExplorerPropertyDetail,
  type ExplorerQueryState,
  type ExplorerUnit,
  type RoomFilter,
  type SearchPropertyTypeFilter
} from "../../types";

type PropertyExplorerProps = {
  propertySlug?: string;
  floorSlug?: string;
};

type ExplorerView = "properties" | "property" | "floor";

type FilterCopy = {
  title: string;
  subtitle: string;
  room: string;
  propertyType: string;
  condition: string;
  sort: string;
  allProperties: string;
  allFloors: string;
  search: string;
  reset: string;
  activeFilters: string;
  noMatches: string;
  noUnits: string;
  emptyUnitsHint: string;
  floorsLabel: string;
  unitsLabel: string;
  updatedLabel: string;
  viewProperty: string;
  viewFloor: string;
  availableUnits: string;
  backHome: string;
  backProperties: string;
  backProperty: string;
  overview: string;
  planTitle: string;
  exploreTitle: string;
  sortLatest: string;
  sortRank: string;
  roomAll: string;
  room1: string;
  room2: string;
  room3: string;
  kindAll: string;
  kindHotel: string;
  kindInvestment: string;
  conditionAll: string;
  conditionWhite: string;
  conditionFull: string;
  conditionTurnkey: string;
};

const copy: FilterCopy = {
  title: "აირჩიე შენობა ან სართული",
  subtitle: "ფილტრების მიხედვით ნახე პროექტები, სართულები და ხელმისაწვდომი ბინების ინფორმაცია.",
  room: "ფართი",
  propertyType: "ტიპი",
  condition: "კონდიცია",
  sort: "სორტირება",
  allProperties: "ყველა შენობა",
  allFloors: "ყველა სართული",
  search: "ძიება",
  reset: "გასუფთავება",
  activeFilters: "აქტიური ფილტრები",
  noMatches: "შესაბამისი შედეგი ვერ მოიძებნა.",
  noUnits: "ამ სართულზე ბინები ჯერ არ არის დამატებული.",
  emptyUnitsHint: "როგორც კი `units` endpoint შეივსება, შესაბამისი ბინის ბარათები და დეტალები ავტომატურად გამოჩნდება.",
  floorsLabel: "სართული",
  unitsLabel: "ბინა",
  updatedLabel: "განახლდა",
  viewProperty: "შენობის ნახვა",
  viewFloor: "სართულის ნახვა",
  availableUnits: "ხელმისაწვდომი ბინები",
  backHome: "მთავარზე დაბრუნება",
  backProperties: "ყველა შენობა",
  backProperty: "შენობაზე დაბრუნება",
  overview: "მიმოხილვა",
  planTitle: "სართულის გეგმა",
  exploreTitle: "Origami Explorer",
  sortLatest: "უახლესი",
  sortRank: "რანკი",
  roomAll: "ფართი",
  room1: "სტუდიოს ტიპის",
  room2: "1 საძინებლიანი",
  room3: "2 საძინებლიანი",
  kindAll: "ტიპი",
  kindHotel: "სასტუმროს ნომერი",
  kindInvestment: "ბრენდული რეზიდენცია",
  conditionAll: "კონდიცია",
  conditionWhite: "თეთრი კარკასი",
  conditionFull: "რემონტით",
  conditionTurnkey: "თურნ ქეი"
};

export function PropertyExplorer({ propertySlug, floorSlug }: PropertyExplorerProps) {
  const initialQuery = useMemo(() => readExplorerQuery(), []);
  const view: ExplorerView = floorSlug ? "floor" : propertySlug ? "property" : "properties";
  const [query, setQuery] = useState<ExplorerQueryState>(initialQuery);
  const [sortBy, setSortBy] = useState<"rank" | "updated">("rank");
  const [properties, setProperties] = useState<ExplorerProperty[]>([]);
  const [property, setProperty] = useState<ExplorerPropertyDetail | null>(null);
  const [floors, setFloors] = useState<ExplorerFloor[]>([]);
  const [floor, setFloor] = useState<ExplorerFloorDetail | null>(null);
  const [units, setUnits] = useState<ExplorerUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const nextQuery = readExplorerQuery();
    setQuery(nextQuery);
  }, [propertySlug, floorSlug]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        if (view === "properties") {
          const data = await fetchProperties();
          if (!cancelled) {
            setProperties(data);
            setProperty(null);
            setFloors([]);
            setFloor(null);
            setUnits([]);
          }
          return;
        }

        if (view === "property" && propertySlug) {
          const [propertyData, floorData, unitData] = await Promise.all([
            fetchProperty(propertySlug),
            fetchPropertyFloors(propertySlug),
            fetchPropertyUnits(propertySlug)
          ]);

          if (!cancelled) {
            setProperty(propertyData);
            setFloors(floorData);
            setUnits(unitData);
            setProperties([]);
            setFloor(null);
          }
          return;
        }

        if (view === "floor" && propertySlug && floorSlug) {
          const [propertyData, floorData] = await Promise.all([
            fetchProperty(propertySlug),
            fetchFloor(propertySlug, floorSlug)
          ]);

          if (!cancelled) {
            setProperty(propertyData);
            setFloor(floorData);
            setUnits(floorData.units);
            setProperties([]);
            setFloors([]);
          }
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unknown error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [view, propertySlug, floorSlug]);

  const filteredProperties = useMemo(() => {
    const normalized = [...properties];

    if (sortBy === "updated") {
      normalized.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    } else {
      normalized.sort((a, b) => a.rank - b.rank);
    }

    if (query.propertyType === "hotel") {
      return normalized.filter((item) => item.type === "hotel");
    }

    if (query.propertyType === "investment") {
      return normalized.filter((item) => item.type === "apartment");
    }

    return normalized;
  }, [properties, query.propertyType, sortBy]);

  const filteredFloors = useMemo(() => {
    const source = view === "property" ? floors : floor ? [floor] : [];
    const normalized = [...source];

    if (sortBy === "updated") {
      normalized.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    } else {
      normalized.sort((a, b) => a.rank - b.rank);
    }

    return normalized;
  }, [floors, floor, sortBy, view]);

  const breadcrumbs = getBreadcrumbs({ property, floor });
  const activeFilterTags = getActiveFilterTags(query);

  const handleFilterChange = <T extends keyof ExplorerQueryState>(key: T, value: ExplorerQueryState[T]) => {
    const nextQuery = { ...query, [key]: value };
    setQuery(nextQuery);

    const path = window.location.pathname;
    const search = buildExplorerSearch({
      room: nextQuery.room,
      propertyType: nextQuery.propertyType,
      condition: nextQuery.condition
    });

    window.history.replaceState({}, "", `${path}${search}`);
  };

  return (
    <main className="explorer-page">
      <section className="explorer-shell">
        <div className="container explorer-container">
          <div className="explorer-filterbar">
            <label className="explorer-select">
              <span>{copy.room}</span>
              <select value={query.room} onChange={(event) => handleFilterChange("room", event.target.value as RoomFilter)}>
                <option value="all">{copy.roomAll}</option>
                <option value="1room">{copy.room1}</option>
                <option value="2room">{copy.room2}</option>
                <option value="3room">{copy.room3}</option>
              </select>
              <ChevronIcon direction="down" />
            </label>

            <label className="explorer-select">
              <span>{copy.propertyType}</span>
              <select
                value={query.propertyType}
                onChange={(event) => handleFilterChange("propertyType", event.target.value as SearchPropertyTypeFilter)}
              >
                <option value="all">{copy.kindAll}</option>
                <option value="hotel">{copy.kindHotel}</option>
                <option value="investment">{copy.kindInvestment}</option>
              </select>
              <ChevronIcon direction="down" />
            </label>

            <label className="explorer-select">
              <span>{copy.condition}</span>
              <select
                value={query.condition}
                onChange={(event) => handleFilterChange("condition", event.target.value as ConditionFilter)}
              >
                <option value="all">{copy.conditionAll}</option>
                <option value="white">{copy.conditionWhite}</option>
                <option value="full">{copy.conditionFull}</option>
                <option value="turnkey">{copy.conditionTurnkey}</option>
              </select>
              <ChevronIcon direction="down" />
            </label>

            <label className="explorer-select explorer-select-sort">
              <span>{copy.sort}</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value as "rank" | "updated")}>
                <option value="rank">{copy.sortRank}</option>
                <option value="updated">{copy.sortLatest}</option>
              </select>
              <ChevronIcon direction="down" />
            </label>

            <button
              className="explorer-searchcta"
              type="button"
              onClick={() =>
                navigateTo(
                  `/properties${buildExplorerSearch({
                    room: query.room,
                    propertyType: query.propertyType,
                    condition: query.condition
                  })}`
                )
              }
            >
              <SearchIcon />
              <span>{copy.search}</span>
            </button>

            <button
              className="explorer-reset"
              type="button"
              onClick={() => {
                setQuery({ room: "all", propertyType: "all", condition: "all" });
                window.history.replaceState({}, "", window.location.pathname);
              }}
            >
              {copy.reset}
            </button>
          </div>

          {activeFilterTags.length ? (
            <div className="explorer-activefilters">
              <span>{copy.activeFilters}</span>
              <div className="explorer-taglist">
                {activeFilterTags.map((tag) => (
                  <span key={tag} className="explorer-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {!loading && !error && (view !== "properties" || breadcrumbs.length > 1) ? (
            <nav className="explorer-inline-breadcrumbs" aria-label="Breadcrumb">
              {view === "properties" ? null : (
                <button type="button" className="explorer-backlink" onClick={() => navigateTo("/")}>
                  <ArrowIcon direction="left" />
                  <span>{copy.backHome}</span>
                </button>
              )}
              {breadcrumbs.map((item, index) => (
                <button
                  key={`${item.label}-${index}`}
                  type="button"
                  className={`explorer-crumb ${item.active ? "active" : ""}`}
                  onClick={() => item.href && navigateTo(item.href)}
                  disabled={!item.href}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          ) : null}

          {error ? <div className="explorer-state explorer-error">{error}</div> : null}
          {loading ? <div className="explorer-state">იტვირთება...</div> : null}

          {!loading && !error && view === "properties" ? (
            <section className="explorer-grid">
              {filteredProperties.length ? (
                filteredProperties.map((item) => (
                  <article key={item.id} className="explorer-card explorer-property-card">
                    <div className="explorer-card-media">
                      {getPropertyCoverImage(item) ? <img src={getPropertyCoverImage(item)} alt={item.title} /> : <div className="explorer-placeholder" />}
                      <span className="explorer-badge">{item.construction_type}</span>
                    </div>
                    <div className="explorer-card-body">
                      <h2>{item.title}</h2>
                      <p>{item.description}</p>
                      <div className="explorer-metrics">
                        <span><BuildingIcon /> {item.floors_count} {copy.floorsLabel}</span>
                        <span><HomeIcon /> {item.units_count} {copy.unitsLabel}</span>
                      </div>
                      <button className="explorer-card-link" type="button" onClick={() => navigateTo(`/properties/${item.slug}`)}>
                        <span>{copy.viewProperty}</span>
                        <ArrowIcon direction="right" />
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="explorer-state">{copy.noMatches}</div>
              )}
            </section>
          ) : null}

          {!loading && !error && view !== "properties" && property ? (
            <section className="explorer-detail">
              <div className="explorer-featured">
                <div className="explorer-featured-copy">
                  <p className="explorer-kicker">{copy.overview}</p>
                  <h2>{property.title}</h2>
                  <p>{property.description}</p>
                  <div className="explorer-statrow">
                    <div>
                      <strong>{property.floors_count}</strong>
                      <span>{copy.floorsLabel}</span>
                    </div>
                    <div>
                      <strong>{view === "floor" ? units.length : property.units_count}</strong>
                      <span>{copy.availableUnits}</span>
                    </div>
                    <div>
                      <strong>{new Date(property.updated_at).toLocaleDateString("ka-GE")}</strong>
                      <span>{copy.updatedLabel}</span>
                    </div>
                  </div>
                </div>
                <div className="explorer-featured-media">
                  {getPropertyCoverImage(property) ? <img src={getPropertyCoverImage(property)} alt={property.title} /> : <div className="explorer-placeholder" />}
                </div>
              </div>

              {view === "property" ? (
                <section className="explorer-grid">
                  {filteredFloors.length ? (
                    filteredFloors.map((item) => (
                      <article key={item.id} className="explorer-card explorer-floor-card">
                        <div className="explorer-card-media explorer-card-media-floor">
                          {getFloorCoverImage(item) ? <img src={getFloorCoverImage(item)} alt={item.title} /> : <div className="explorer-placeholder" />}
                          <span className="explorer-badge">#{item.number}</span>
                        </div>
                        <div className="explorer-card-body">
                          <h3>{item.title}</h3>
                          <p>{item.description}</p>
                          <div className="explorer-metrics">
                            <span><LocationIcon /> {item.number} {copy.floorsLabel}</span>
                            <span><HomeIcon /> {item.units_count} {copy.unitsLabel}</span>
                          </div>
                          <button
                            className="explorer-card-link"
                            type="button"
                            onClick={() => navigateTo(`/properties/${property.slug}/floors/${item.slug}`)}
                          >
                            <span>{copy.viewFloor}</span>
                            <ArrowIcon direction="right" />
                          </button>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="explorer-state">{copy.noMatches}</div>
                  )}
                </section>
              ) : null}

              {view === "floor" && floor ? (
                <section className="explorer-floor-layout">
                  <div className="explorer-plan-card">
                    <div className="explorer-plan-head">
                      <div>
                        <p className="explorer-kicker">{copy.planTitle}</p>
                        <h3>{floor.title}</h3>
                      </div>
                      <div className="explorer-floor-chip">#{floor.number}</div>
                    </div>
                    <div className="explorer-plan-media">
                      {getFloorCoverImage(floor) ? <img src={getFloorCoverImage(floor)} alt={floor.title} /> : <div className="explorer-placeholder" />}
                    </div>
                  </div>

                  <div className="explorer-units-panel">
                    <div className="explorer-plan-head">
                      <div>
                        <p className="explorer-kicker">{copy.availableUnits}</p>
                        <h3>{units.length} {copy.unitsLabel}</h3>
                      </div>
                    </div>

                    {units.length ? (
                      <div className="explorer-unit-list">
                        {units.map((unit) => (
                          <article key={unit.id} className="explorer-unit-card">
                            <div className="explorer-unit-thumb">
                              {getUnitCoverImage(unit) ? <img src={getUnitCoverImage(unit)} alt={unit.title} /> : <div className="explorer-placeholder" />}
                            </div>
                            <div>
                              <h4>{unit.title}</h4>
                              <p>{unit.description}</p>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <div className="explorer-state explorer-empty">
                        <strong>{copy.noUnits}</strong>
                        <p>{copy.emptyUnitsHint}</p>
                      </div>
                    )}
                  </div>
                </section>
              ) : null}
            </section>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function getActiveFilterTags(query: ExplorerQueryState) {
  const tags: string[] = [];

  if (query.room === "1room") tags.push(copy.room1);
  if (query.room === "2room") tags.push(copy.room2);
  if (query.room === "3room") tags.push(copy.room3);
  if (query.propertyType === "hotel") tags.push(copy.kindHotel);
  if (query.propertyType === "investment") tags.push(copy.kindInvestment);
  if (query.condition === "white") tags.push(copy.conditionWhite);
  if (query.condition === "full") tags.push(copy.conditionFull);
  if (query.condition === "turnkey") tags.push(copy.conditionTurnkey);

  return tags;
}

function getBreadcrumbs({
  property,
  floor
}: {
  property: ExplorerPropertyDetail | null;
  floor: ExplorerFloorDetail | null;
}) {
  const items: Array<{ label: string; href?: string; active?: boolean }> = [
    { label: copy.backProperties, href: "/properties", active: !property }
  ];

  if (property) {
    items.push({
      label: property.title,
      href: floor ? `/properties/${property.slug}` : undefined,
      active: !floor
    });
  }

  if (floor) {
    items.push({ label: floor.title, active: true });
  }

  return items;
}
