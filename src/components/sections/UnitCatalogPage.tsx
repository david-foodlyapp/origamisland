import { useEffect, useMemo, useState } from "react";
import type { Language } from "../../i18n";
import type { Theme } from "../../types";
import {
  DEFAULT_BUILDING_SLUG,
  type UnitCatalogQueryState,
  buildUnitCatalogSearch,
  fetchUnit,
  fetchUnitFilters,
  fetchUnits,
  formatArea,
  formatPrice,
  getUnitDisplayTitle,
  mapUnitStatusLabel,
  mapUnitTypeLabel,
  navigateTo,
  readUnitCatalogQuery
} from "../../unitCatalog";
import {
  type ExplorerUnit,
  type UnitFilterOptions,
  type UnitListMeta
} from "../../types";
import {
  ArrowIcon,
  BuildingIcon,
  ChevronIcon,
  CloseIcon,
  FilterAdjustIcon,
  GlobeOutlineIcon,
  HomeIcon,
  MoonIcon,
  SearchIcon,
  SunIcon
} from "../Icons";

type UnitCatalogPageProps = {
  language: Language;
  darkThemeLogoSrc: string;
  lightThemeLogoSrc: string;
  isLanguageModalOpen: boolean;
  setIsLanguageModalOpen: (open: boolean) => void;
  theme: Theme;
  handleThemeToggle: () => void;
  openModal: () => void;
  propertySlug?: string;
  unitSlug?: string;
};

const copy = {
  listingTitle: "ბინების არჩევა",
  floor: "სართული",
  type: "ტიპი",
  rooms: "ოთახები",
  bedrooms: "საძინებლები",
  status: "სტატუსი",
  search: "ძიება",
  reset: "გასუფთავება",
  filters: "ფილტრი",
  filtersClose: "ფილტრების დახურვა",
  activeFilters: "აქტიური ფილტრი",
  grid: "ვიზუალური",
  table: "სია",
  all: "ყველა",
  pageLoading: "იტვირთება...",
  noResults: "მონაცემები ვერ მოიძებნა",
  floorLabel: "სართული",
  fromPrice: "ფასი",
  roomLabel: "ოთახი",
  bedroomLabel: "საძინებელი",
  studio: "სტუდიო",
  condition: "კონდიცია",
  conditionWhite: "თეთრი კარკასი",
  conditionFull: "რემონტით",
  typeHotelRoom: "სასტუმროს ნომერი",
  typeBrandedResidence: "ბრენდული რეზიდენცია",
  bathroomLabel: "სველი წერტილი",
  detailContact: "დაგვიკავშირდით",
  available: "ხელმისაწვდომი",
  unitOverview: "მოკლე აღწერა",
  totalArea: "საერთო ფართი",
  area: "ფართი",
  number: "ბინა",
  image3d: "3D",
  image2d: "2D",
  floorPlan: "Floor Plan",
  detailBack: "ყველა ბინა",
  details: "დეტალები",
  updated: "განახლდა",
  total: "სულ",
  page: "გვერდი",
  defaultBuildingTitle: "Origami Island",
  priceOnRequest: "ფასი შეთანხმებით",
  pdf: "PDF",
  favorite: "რჩეულებში",
  compare: "შედარება"
};

function sanitizeCatalogQueryState(state: UnitCatalogQueryState): UnitCatalogQueryState {
  return {
    ...state,
    rooms: []
  };
}

function bedroomOptionLabel(count: number) {
  return count === 0 ? copy.studio : `${count} ${copy.bedroomLabel}`;
}

const conditionOptions = [
  { value: "white", label: copy.conditionWhite },
  { value: "full", label: copy.conditionFull }
];

const typeOptions = [
  { value: "hotel_room", label: copy.typeHotelRoom },
  { value: "apartment", label: copy.typeBrandedResidence }
];

export function UnitCatalogPage({
  language,
  darkThemeLogoSrc,
  lightThemeLogoSrc,
  isLanguageModalOpen,
  setIsLanguageModalOpen,
  theme,
  handleThemeToggle,
  openModal,
  propertySlug = DEFAULT_BUILDING_SLUG,
  unitSlug
}: UnitCatalogPageProps) {
  const initialQuery = useMemo(() => sanitizeCatalogQueryState(readUnitCatalogQuery()), []);
  const [query, setQuery] = useState<UnitCatalogQueryState>(initialQuery);
  const [draftQuery, setDraftQuery] = useState<UnitCatalogQueryState>(initialQuery);
  const [filters, setFilters] = useState<UnitFilterOptions | null>(null);
  const [units, setUnits] = useState<ExplorerUnit[]>([]);
  const [meta, setMeta] = useState<UnitListMeta | null>(null);
  const [unit, setUnit] = useState<ExplorerUnit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mediaMode, setMediaMode] = useState<"3d" | "2d" | "floorPlan">("3d");
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [condition, setCondition] = useState("");

  useEffect(() => {
    const nextQuery = sanitizeCatalogQueryState(readUnitCatalogQuery());
    setQuery(nextQuery);
    setDraftQuery(nextQuery);
  }, [propertySlug, unitSlug]);

  useEffect(() => {
    if (!mobileFilterOpen) {
      document.body.style.removeProperty("overflow");
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [mobileFilterOpen]);

  useEffect(() => {
    if (!mobileFilterOpen) {
      return;
    }

    const handleResize = () => {
      if (window.innerWidth > 840) {
        setMobileFilterOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileFilterOpen]);

  useEffect(() => {
    let cancelled = false;

    async function loadListing() {
      setLoading(true);
      setError("");

      try {
        const [filterData, unitsData] = await Promise.all([
          fetchUnitFilters(propertySlug, language),
          fetchUnits(propertySlug, query, language)
        ]);

        if (cancelled) {
          return;
        }

        setFilters(filterData);
        setUnits(unitsData.data);
        setMeta(unitsData.meta);
        setUnit(null);
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

    async function loadDetail() {
      setLoading(true);
      setError("");

      try {
        const [unitData] = await Promise.all([
          fetchUnit(propertySlug, unitSlug!, language)
        ]);

        if (cancelled) {
          return;
        }

        setUnit(unitData);
        setUnits([]);
        setMeta(null);
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

    if (unitSlug) {
      loadDetail();
    } else {
      loadListing();
    }

    return () => {
      cancelled = true;
    };
  }, [propertySlug, unitSlug, query, language]);

  const unitImage3d = unit?.media?.find((item) => item.type === "model_3d" && item.url)?.url || "";
  const unitImage2d = unit?.media?.find((item) => item.type === "image" && item.url)?.url || unit?.image || "";
  const unitFloorPlanImage = unit?.media?.find((item) => item.type === "floor_plan" && item.url)?.url || "";
  const unitPdfUrl = unit?.media?.find((item) => item.type === "document" && item.url)?.url || "";
  const getUnitPriceText = (price?: string | number | null, currency?: string | null) => {
    const formattedPrice = formatPrice(price, currency || "USD");
    return formattedPrice ? `${copy.fromPrice}: ${formattedPrice}` : `${copy.fromPrice}:`;
  };

  const applyQuery = (nextQuery: UnitCatalogQueryState) => {
    const sanitizedQuery = sanitizeCatalogQueryState(nextQuery);
    const search = buildUnitCatalogSearch(sanitizedQuery, language);
    setQuery(sanitizedQuery);
    setDraftQuery(sanitizedQuery);
    setMobileFilterOpen(false);
    window.history.replaceState({}, "", `${window.location.pathname}?${search}`);
  };

  const updateDraftQuery = (updater: (current: UnitCatalogQueryState) => UnitCatalogQueryState, autoApply = false) => {
    const nextQuery = updater(draftQuery);

    if (autoApply) {
      applyQuery({ ...nextQuery, page: 1 });
      return;
    }

    setDraftQuery(nextQuery);
  };

  const detailSpecs = unit ? [
    { icon: <HomeIcon />, label: copy.totalArea, value: formatArea(unit.area) },
    { icon: <BuildingIcon />, label: copy.floorLabel, value: unit.floor?.number ? String(unit.floor.number) : "-" },
    { icon: <BedIcon />, label: copy.bedroomLabel, value: unit.bedrooms_count ?? 0 },
    { icon: <BathIcon />, label: copy.bathroomLabel, value: unit.bathrooms_count ?? 0 },
    { icon: <DoorIcon />, label: copy.roomLabel, value: unit.rooms_count ?? 0 },
    { icon: <KeyIcon />, label: copy.status, value: mapUnitStatusLabel(unit.status, language) }
  ] : [];
  const filteredUnits = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return units;
    }

    return units.filter((item) => {
      const displayTitle = getUnitDisplayTitle(item, language).toLowerCase();
      const typeLabel = mapUnitTypeLabel(item.type, language).toLowerCase();
      const unitNumber = item.unit_number?.toLowerCase() || "";
      const slug = item.slug.toLowerCase();
      const area = item.area != null ? String(item.area).toLowerCase() : "";
      const formattedArea = formatArea(item.area).toLowerCase();
      const floorNumber = item.floor?.number != null ? String(item.floor.number).toLowerCase() : "";
      const statusLabel = mapUnitStatusLabel(item.status, language).toLowerCase();
      const priceText = getUnitPriceText(item.price, item.currency).toLowerCase();

      return [
        displayTitle,
        typeLabel,
        unitNumber,
        slug,
        area,
        formattedArea,
        floorNumber,
        statusLabel,
        priceText
      ].some((value) => value.includes(normalizedSearch));
    });
  }, [language, searchTerm, units]);

  const activeFilterCount = [
    draftQuery.floors.length,
    draftQuery.types.length,
    draftQuery.statuses.length,
    draftQuery.bedrooms.length,
    condition ? 1 : 0,
    searchTerm.trim() ? 1 : 0
  ].reduce((sum, value) => sum + value, 0);

  const selectedFloorLabel = draftQuery.floors[0]
    ? (filters?.floors || []).find((item) => item.slug === draftQuery.floors[0])?.title?.trim() || `${copy.floorLabel} ${draftQuery.floors[0]}`
    : "";
  const selectedTypeLabel = draftQuery.types[0]
    ? typeOptions.find((item) => item.value === draftQuery.types[0])?.label || draftQuery.types[0]
    : "";
  const selectedStatusLabel = draftQuery.statuses[0]
    ? mapUnitStatusLabel(draftQuery.statuses[0], language)
    : "";
  const selectedBedroomsLabel = draftQuery.bedrooms[0]
    ? bedroomOptionLabel(Number(draftQuery.bedrooms[0]))
    : "";
  const selectedConditionLabel = condition
    ? conditionOptions.find((item) => item.value === condition)?.label || condition
    : "";

  const mobileFilterSummary = [
    selectedBedroomsLabel ? `${copy.area}: ${selectedBedroomsLabel}` : "",
    selectedTypeLabel ? `${copy.type}: ${selectedTypeLabel}` : "",
    selectedConditionLabel ? `${copy.condition}: ${selectedConditionLabel}` : "",
    selectedFloorLabel ? `${copy.floor}: ${selectedFloorLabel}` : "",
    selectedStatusLabel ? `${copy.status}: ${selectedStatusLabel}` : "",
    searchTerm.trim() ? `${copy.search}: ${searchTerm.trim()}` : ""
  ].filter(Boolean).join(" • ") || copy.all;

  const resetFilters = () => {
    setSearchTerm("");
    setCondition("");
    applyQuery({
      ...draftQuery,
      floors: [],
      types: [],
      statuses: [],
      bedrooms: [],
      page: 1
    });
  };

  return (
    <main className="units-page">
      <section className="units-shell">
        <div className="container units-container">
          <div className="units-panel">
            {unitSlug && unit ? (
              <section className="unit-detail-layout">
                <div className="unit-detail-header">
                  <h1 className="units-title">{getUnitDisplayTitle(unit, language)}</h1>

                  <div className="unit-detail-toolbar">
                    <div className="unit-mode-switch">
                      <button type="button" className={mediaMode === "3d" ? "active" : ""} onClick={() => setMediaMode("3d")}>{copy.image3d}</button>
                      <button type="button" className={mediaMode === "2d" ? "active" : ""} onClick={() => setMediaMode("2d")}>{copy.image2d}</button>
                      <button
                        type="button"
                        className={mediaMode === "floorPlan" ? "active" : ""}
                        onClick={() => setMediaMode("floorPlan")}
                        disabled={!unitFloorPlanImage}
                      >
                        {copy.floorPlan}
                      </button>
                    </div>

                    <div className="unit-action-strip">
                      <button
                        type="button"
                        className="unit-action-button"
                        onClick={() => {
                          if (unitPdfUrl) {
                            window.open(unitPdfUrl, "_blank", "noopener,noreferrer");
                          }
                        }}
                        disabled={!unitPdfUrl}
                      >
                        <PdfIcon />
                        {copy.pdf}
                      </button>
                      <button className="units-back-btn" type="button" onClick={() => navigateTo(`/properties/${propertySlug}/units`)}>
                        <ArrowIcon direction="left" />
                        <span>{copy.detailBack}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="unit-detail-copy">

                  <div className="unit-spec-card">
                    <div className="unit-top-stats">
                      <div>
                        <strong>{unit.floor?.number || 0}</strong>
                        <span>{copy.floorLabel}</span>
                      </div>
                      <div>
                        <strong>{unit.bedrooms_count ?? 0}</strong>
                        <span>{copy.bedroomLabel}</span>
                      </div>
                      <div>
                        <strong>{formatArea(unit.area)}</strong>
                        <span>{copy.area}</span>
                      </div>
                    </div>

                    <div className="unit-spec-list">
                      {detailSpecs.map((item) => (
                        <div key={item.label} className="unit-spec-row">
                          <span className="unit-spec-icon">{item.icon}</span>
                          <span>{item.label}</span>
                          <strong>{item.value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button className="unit-contact-btn" type="button" onClick={openModal}>
                    {copy.detailContact}
                  </button>
                </div>

                <div className="unit-detail-visual">
                  <div className="unit-image-stage">
                    {mediaMode === "3d" ? (
                      unitImage3d ? <img src={unitImage3d} alt={getUnitDisplayTitle(unit, language)} /> : <div className="units-image-placeholder" />
                    ) : mediaMode === "floorPlan" ? (
                      unitFloorPlanImage ? <img src={unitFloorPlanImage} alt={`${getUnitDisplayTitle(unit, language)} floor plan`} /> : <div className="units-image-placeholder" />
                    ) : (
                      unitImage2d ? <img src={unitImage2d} alt={`${getUnitDisplayTitle(unit, language)} plan`} /> : <div className="units-image-placeholder" />
                    )}
                  </div>
                </div>
              </section>
            ) : (
              <>
                <section className="units-listing-shell">
                  <div className="units-heading-row">
                    <div className="units-heading-copy">
                      <a
                        className="theme-aware-logo units-heading-logo-wrap"
                        href="/"
                        aria-label="მთავარ გვერდზე"
                        onClick={(event) => {
                          event.preventDefault();
                          navigateTo("/");
                        }}
                      >
                        <img
                          className="units-heading-logo logo-dark"
                          src={darkThemeLogoSrc}
                          alt="ORIGAMI"
                        />
                        <img
                          className="units-heading-logo logo-light"
                          src={lightThemeLogoSrc}
                          alt="ORIGAMI"
                        />
                      </a>
                    </div>
                    <button
                      className="nav-language-btn header-language-btn units-language-btn-mobile"
                      type="button"
                      aria-label="Change language"
                      aria-haspopup="dialog"
                      aria-expanded={isLanguageModalOpen}
                      onClick={() => setIsLanguageModalOpen(true)}
                    >
                      <GlobeOutlineIcon />
                    </button>

                    <div className="units-heading-aside">
                      <div className="units-utility-controls">
                        <button
                          className="nav-language-btn header-language-btn units-language-btn"
                          type="button"
                          aria-label="Change language"
                          aria-haspopup="dialog"
                          aria-expanded={isLanguageModalOpen}
                          onClick={() => setIsLanguageModalOpen(true)}
                        >
                          <GlobeOutlineIcon />
                        </button>
                        <div className="controls-pill units-theme-pill">
                          <button
                            className="theme-pill-btn"
                            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                            aria-pressed={theme === "light"}
                            data-theme-state={theme}
                            type="button"
                            onClick={handleThemeToggle}
                          >
                            <span className="theme-pill-option theme-pill-option-dark" aria-hidden="true">
                              <MoonIcon />
                            </span>
                            <span className="theme-pill-option theme-pill-option-light" aria-hidden="true">
                              <SunIcon />
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="units-view-toggle">
                        <button
                          type="button"
                          className={draftQuery.view === "grid" ? "active" : ""}
                          aria-label={copy.grid}
                          onClick={() => updateDraftQuery((current) => ({ ...current, view: "grid" }), true)}
                        >
                          <GridViewIcon />
                        </button>
                        <button
                          type="button"
                          className={draftQuery.view === "table" ? "active" : ""}
                          aria-label={copy.table}
                          onClick={() => updateDraftQuery((current) => ({ ...current, view: "table" }), true)}
                        >
                          <ListViewIcon />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="units-filter-mobile-trigger">
                    <button
                      type="button"
                      className={`units-filter-mobile-bar ${mobileFilterOpen ? "active" : ""}`}
                      aria-expanded={mobileFilterOpen}
                      aria-controls="units-mobile-filter-sheet"
                      onClick={() => setMobileFilterOpen(true)}
                    >
                      <span className="units-filter-mobile-icon">
                        <FilterAdjustIcon />
                      </span>
                      <span className="units-filter-mobile-copy">
                        <strong>{copy.filters}</strong>
                        {activeFilterCount ? <small>{`${activeFilterCount} ${copy.activeFilters}`}</small> : null}
                      </span>
                      <span className="units-filter-mobile-meta">
                        <span className="units-filter-mobile-count">{activeFilterCount || copy.all}</span>
                        <ChevronIcon direction="down" />
                      </span>
                    </button>
                  </div>

                  <div
                    className={`units-filter-backdrop ${mobileFilterOpen ? "active" : ""}`}
                    onClick={() => setMobileFilterOpen(false)}
                    aria-hidden={!mobileFilterOpen}
                  />

                  <div
                    id="units-mobile-filter-sheet"
                    className={`units-filter-panel ${mobileFilterOpen ? "mobile-open" : ""}`}
                    aria-hidden={!mobileFilterOpen}
                  >
                    <div className="units-filter-mobile-sheet-head">
                      <div>
                        <strong>{copy.filters}</strong>
                        <span>{mobileFilterSummary}</span>
                      </div>
                      <button
                        type="button"
                        className="units-filter-mobile-close"
                        aria-label={copy.filtersClose}
                        onClick={() => setMobileFilterOpen(false)}
                      >
                        <CloseIcon />
                      </button>
                    </div>

                    <div className="units-filterbar">
                      <FilterSelect
                        label={copy.area}
                        value={draftQuery.bedrooms[0] || ""}
                        options={(filters?.bedrooms || []).map((count) => ({ value: String(count), label: bedroomOptionLabel(count) }))}
                        allLabel={copy.all}
                        onChange={(value) => updateDraftQuery((current) => ({ ...current, bedrooms: value ? [value] : [] }), true)}
                      />
                      <FilterSelect
                        label={copy.type}
                        value={draftQuery.types[0] || ""}
                        options={typeOptions}
                        allLabel={copy.all}
                        onChange={(value) => updateDraftQuery((current) => ({ ...current, types: value ? [value] : [] }), true)}
                      />
                      <FilterSelect
                        label={copy.condition}
                        value={condition}
                        options={conditionOptions}
                        allLabel={copy.all}
                        onChange={(value) => setCondition(value)}
                      />
                      <FilterSelect
                        label={copy.floor}
                        value={draftQuery.floors[0] || ""}
                        options={(filters?.floors || []).map((item) => ({
                          value: item.slug,
                          label: item.title?.trim() || `${copy.floorLabel} ${item.number}`
                        }))}
                        allLabel={copy.all}
                        onChange={(value) => updateDraftQuery((current) => ({ ...current, floors: value ? [value] : [] }), true)}
                      />
                      <FilterSelect
                        label={copy.status}
                        value={draftQuery.statuses[0] || ""}
                        options={["available", "reserved", "sold"].map((value) => ({ value, label: mapUnitStatusLabel(value, language) }))}
                        allLabel={copy.all}
                        onChange={(value) => updateDraftQuery((current) => ({ ...current, statuses: value ? [value] : [] }), true)}
                      />
                      <label className="units-filter-control units-filter-search">
                        <span>{copy.search}</span>
                        <div className="units-search-input-wrap">
                          <SearchIcon />
                          <input
                            type="search"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder={copy.search}
                          />
                        </div>
                      </label>
                      <div className="units-filter-actions">
                        <button
                          className="units-reset-button units-reset-button-mobile"
                          type="button"
                          onClick={resetFilters}
                        >
                          <CloseIcon />
                          <span>{copy.reset}</span>
                        </button>
                        <button
                          className="units-search-button"
                          type="button"
                          onClick={() => applyQuery({ ...draftQuery, page: 1 })}
                          aria-label={copy.search}
                        >
                          <SearchIcon />
                        </button>
                        <div className="units-view-toggle units-view-toggle-mobile">
                          <button
                            type="button"
                            className={draftQuery.view === "grid" ? "active" : ""}
                            aria-label={copy.grid}
                            onClick={() => updateDraftQuery((current) => ({ ...current, view: "grid" }), true)}
                          >
                            <GridViewIcon />
                          </button>
                          <button
                            type="button"
                            className={draftQuery.view === "table" ? "active" : ""}
                            aria-label={copy.table}
                            onClick={() => updateDraftQuery((current) => ({ ...current, view: "table" }), true)}
                          >
                            <ListViewIcon />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {loading ? <div className="units-state">{copy.pageLoading}</div> : null}
                {error ? <div className="units-state units-error">{error}</div> : null}

                {!loading && !error && draftQuery.view === "grid" ? (
                  <section className="units-grid">
                    {filteredUnits.length ? filteredUnits.map((item) => (
                      <article key={item.id} className="unit-card" onClick={() => navigateTo(`/properties/${propertySlug}/units/${item.slug}`)}>
                        <div className="unit-card-topline">
                          <span className={`unit-card-badge unit-card-badge--${item.status}`}>{mapUnitStatusLabel(item.status, language)}</span>
                          <span className="unit-card-floor">{copy.floorLabel} {item.floor?.number ?? "-"}</span>
                        </div>
                        <div className="unit-card-image">
                          {item.image ? <img src={item.image} alt={getUnitDisplayTitle(item, language)} /> : <div className="units-image-placeholder" />}
                        </div>
                        <div className="unit-card-body">
                          <p className="unit-card-number">{getUnitDisplayTitle(item, language)}</p>
                          <h3>{mapUnitTypeLabel(item.type, language)}</h3>
                          <strong>{formatArea(item.area)}</strong>
                          <div className="unit-card-metrics">
                            <span><BedIcon /> {item.bedrooms_count ?? 0}</span>
                            <span><DoorIcon /> {item.rooms_count ?? 0}</span>
                            <span><BathIcon /> {item.bathrooms_count ?? 0}</span>
                          </div>
                          <div className="unit-card-footer">
                            <span className="unit-card-price">{getUnitPriceText(item.price, item.currency)}</span>
                            <span className="unit-card-link">{copy.details}</span>
                          </div>
                        </div>
                      </article>
                    )) : <div className="units-state">{copy.noResults}</div>}
                  </section>
                ) : null}

                {!loading && !error && draftQuery.view === "table" ? (
                  <section className="units-table-wrap">
                    <table className="units-table">
                      <thead>
                        <tr>
                          <th>{copy.number}</th>
                          <th>{copy.type}</th>
                          <th>{copy.totalArea}</th>
                          <th>{copy.bedrooms}</th>
                          <th>{copy.floor}</th>
                          <th>{copy.status}</th>
                          <th>{copy.fromPrice}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUnits.map((item) => (
                          <tr key={item.id} onClick={() => navigateTo(`/properties/${propertySlug}/units/${item.slug}`)}>
                            <td>{getUnitDisplayTitle(item, language)}</td>
                            <td>{mapUnitTypeLabel(item.type, language)}</td>
                            <td>{formatArea(item.area)}</td>
                            <td>{item.bedrooms_count ?? 0}</td>
                            <td>{item.floor?.number ?? "-"}</td>
                            <td>{mapUnitStatusLabel(item.status, language)}</td>
                            <td>{getUnitPriceText(item.price, item.currency)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!filteredUnits.length ? <div className="units-state">{copy.noResults}</div> : null}
                  </section>
                ) : null}

                {!loading && !error && meta?.last_page && meta.last_page > 1 ? (
                  <div className="units-pagination">
                    {Array.from({ length: meta.last_page }, (_, index) => index + 1).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        className={meta.current_page === pageNumber ? "active" : ""}
                        onClick={() => applyQuery({ ...query, page: pageNumber })}
                      >
                        {pageNumber}
                      </button>
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function FilterSelect({
  label,
  value,
  options,
  allLabel,
  onChange
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  allLabel: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="units-filter-control">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function BedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 18v-5.5A2.5 2.5 0 0 1 5.5 10h13A2.5 2.5 0 0 1 21 12.5V18" />
      <path d="M3 14h18" />
      <path d="M6 10V8.5A2.5 2.5 0 0 1 8.5 6h2A2.5 2.5 0 0 1 13 8.5V10" />
      <path d="M3 18v2M21 18v2" />
    </svg>
  );
}

function BathIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 13h16" />
      <path d="M5 13v2a5 5 0 0 0 5 5h4a5 5 0 0 0 5-5v-2" />
      <path d="M7 13V8a3 3 0 0 1 6 0v1" />
      <path d="M13 9h2a2 2 0 1 1 0 4" />
    </svg>
  );
}

function DoorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 20V5.5A1.5 1.5 0 0 1 7.5 4h8A1.5 1.5 0 0 1 17 5.5V20" />
      <path d="M4 20h16" />
      <path d="M14 12h.01" />
    </svg>
  );
}

function GridViewIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="4" width="6" height="6" rx="1.2" />
      <rect x="14" y="4" width="6" height="6" rx="1.2" />
      <rect x="4" y="14" width="6" height="6" rx="1.2" />
      <rect x="14" y="14" width="6" height="6" rx="1.2" />
    </svg>
  );
}

function ListViewIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 7h12" />
      <path d="M8 12h12" />
      <path d="M8 17h12" />
      <path d="M4 7h.01" />
      <path d="M4 12h.01" />
      <path d="M4 17h.01" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="8.5" cy="15.5" r="3.5" />
      <path d="M11 13l8-8" />
      <path d="M16 5l3 3" />
      <path d="M14 7l3 3" />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 3H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9Z" />
      <path d="M14 3v6h6" />
      <path d="M9 15h1.5a1.5 1.5 0 0 0 0-3H9v6" />
      <path d="M14 18h1a2 2 0 0 0 0-4h-1v4Z" />
    </svg>
  );
}
