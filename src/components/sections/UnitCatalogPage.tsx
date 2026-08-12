import { useEffect, useMemo, useState } from "react";
import type { Language } from "../../i18n";
import type { Theme } from "../../types";
import {
  DEFAULT_BUILDING_SLUG,
  type CurrencyRates,
  type SupportedCurrency,
  type UnitCatalogQueryState,
  buildUnitCatalogSearch,
  convertPrice,
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
  type UnitFilterOption,
  type UnitFilterOptions,
  type UnitListMeta
} from "../../types";
import {
  ArrowIcon,
  BuildingIcon,
  CheckIcon,
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
  currency: SupportedCurrency;
  currencyRates: CurrencyRates | null;
};

type PaginationItem = number | "ellipsis";

const copyKa = {
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
  sort: "სორტირება",
  sortRank: "რანკი",
  view: "ხედი",
  grid: "ვიზუალური",
  table: "სია",
  all: "ყველა",
  pageLoading: "იტვირთება...",
  noResults: "მონაცემები ვერ მოიძებნა",
  floorLabel: "სართული",
  fromPrice: "ფასი",
  pricePerSqmSuffix: "კვ.მ დან",
  roomLabel: "ოთახი",
  bedroomLabel: "საძინებელი",
  studio: "სტუდიო",
  condition: "კონდიცია",
  conditionWhite: "თეთრი კარკასი",
  conditionFull: "რემონტით",
  conditionTurnkey: "თურნ ქეი",
  typeHotelRoom: "სასტუმროს ნომერი",
  typeBrandedResidence: "ბრენდული რეზიდენცია",
  bathroomLabel: "სველი წერტილი",
  detailContact: "დაგვიკავშირდით",
  available: "ხელმისაწვდომი",
  unitOverview: "მოკლე აღწერა",
  totalArea: "საერთო ფართი",
  indoorArea: "შიდა ფართი",
  summerArea: "საზაფხულო ფართი",
  area: "ფართი",
  number: "ბინა",
  image: "სურათი",
  image2d: "2D",
  floorPlan: "Floor Plan",
  detailBack: "ყველა ბინა",
  details: "დეტალები",
  floorPlanTitle: "სართულის გეგმარება",
  viewUnits: "ბინების ნახვა",
  updated: "განახლდა",
  total: "სულ",
  page: "გვერდი",
  defaultBuildingTitle: "Origami Island",
  priceOnRequest: "ფასი შეთანხმებით",
  pdf: "PDF",
  favorite: "რჩეულებში",
  compare: "შედარება",
  homeAriaLabel: "მთავარ გვერდზე",
  changeLanguage: "ენის შეცვლა",
  changeCurrency: "ვალუტის შეცვლა",
  switchToDark: "მუქ რეჟიმზე გადართვა",
  switchToLight: "ღია რეჟიმზე გადართვა"
};

const areaRangeOptions = [
  { value: "30-40", min: "30", max: "40" },
  { value: "40-60", min: "40", max: "60" },
  { value: "60-", min: "60", max: "" }
];

const copyEn: typeof copyKa = {
  listingTitle: "Choose an apartment",
  floor: "Floor",
  type: "Type",
  rooms: "Rooms",
  bedrooms: "Bedrooms",
  status: "Status",
  search: "Search",
  reset: "Reset",
  filters: "Filters",
  filtersClose: "Close filters",
  activeFilters: "active filters",
  sort: "Sort",
  sortRank: "Rank",
  view: "View",
  grid: "Grid",
  table: "List",
  all: "All",
  pageLoading: "Loading...",
  noResults: "No results found",
  floorLabel: "Floor",
  fromPrice: "Price",
  pricePerSqmSuffix: "sq.m from",
  roomLabel: "Room",
  bedroomLabel: "Bedroom",
  studio: "Studio",
  condition: "Condition",
  conditionWhite: "White frame",
  conditionFull: "Renovated",
  conditionTurnkey: "Turn key",
  typeHotelRoom: "Hotel Room",
  typeBrandedResidence: "Branded Residence",
  bathroomLabel: "Bathroom",
  detailContact: "Contact us",
  available: "Available",
  unitOverview: "Overview",
  totalArea: "Total area",
  indoorArea: "Indoor area",
  summerArea: "Summer area",
  area: "Area",
  number: "Unit",
  image: "Image",
  image2d: "2D",
  floorPlan: "Floor Plan",
  detailBack: "All units",
  details: "Details",
  floorPlanTitle: "Floor plan",
  viewUnits: "View units",
  updated: "Updated",
  total: "Total",
  page: "Page",
  defaultBuildingTitle: "Origami Island",
  priceOnRequest: "Price on request",
  pdf: "PDF",
  favorite: "Favorites",
  compare: "Compare",
  homeAriaLabel: "Go to homepage",
  changeLanguage: "Change language",
  changeCurrency: "Change currency",
  switchToDark: "Switch to dark mode",
  switchToLight: "Switch to light mode"
};

function getCopy(language: Language) {
  return language === "ka" ? copyKa : copyEn;
}

function sanitizeCatalogQueryState(state: UnitCatalogQueryState): UnitCatalogQueryState {
  return {
    ...state,
    roomTypes: state.roomTypes.length ? state.roomTypes : state.bedrooms,
    rooms: [],
    bedrooms: [],
    condition: state.condition || ""
  };
}

function getPaginationItems(currentPage: number, lastPage: number): PaginationItem[] {
  if (lastPage <= 7) {
    return Array.from({ length: lastPage }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, lastPage]);
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(lastPage - 1, currentPage + 1);

  for (let page = start; page <= end; page += 1) {
    pages.add(page);
  }

  const sortedPages = Array.from(pages).sort((a, b) => a - b);
  const items: PaginationItem[] = [];

  sortedPages.forEach((page, index) => {
    const previousPage = sortedPages[index - 1];
    if (previousPage && page - previousPage > 1) {
      items.push("ellipsis");
    }
    items.push(page);
  });

  return items;
}

function getAreaRangeLabel(option: { min: string; max: string }) {
  return option.max ? `${option.min}-${option.max} მ²` : `${option.min}+ მ²`;
}

function getAreaRangeValue(query: UnitCatalogQueryState) {
  return areaRangeOptions.find((option) => option.min === query.areaMin && option.max === query.areaMax)?.value || "";
}

function getAreaRangeFromValue(value: string) {
  return areaRangeOptions.find((option) => option.value === value) || null;
}

function formatOptionalArea(value: string | number | null | undefined) {
  if (value == null || value === "") {
    return "-";
  }

  return formatArea(value);
}

function getConditionOptions(copy: typeof copyKa) {
  return [
    { value: "white", label: copy.conditionWhite },
    { value: "full", label: copy.conditionFull },
    { value: "turnkey", label: copy.conditionTurnkey }
  ];
}

function getTypeOptions(copy: typeof copyKa) {
  return [
    { value: "hotel_room", label: copy.typeHotelRoom },
    { value: "apartment", label: copy.typeBrandedResidence }
  ];
}

function normalizeFilterOptions(options: UnitFilterOption[] | undefined) {
  return (options || []).map((option) => ({
    ...option,
    value: String(option.value),
    label: option.label
  }));
}

function getRoomTypeOptions(filters: UnitFilterOptions | null, copy: typeof copyKa) {
  const apiOptions = normalizeFilterOptions(filters?.room_types);

  return apiOptions.length
    ? apiOptions
    : [
      { value: "0", label: copy.studio },
      { value: "1", label: `1 ${copy.bedroomLabel}` },
      { value: "2", label: `2 ${copy.bedroomLabel}` }
    ];
}

function getPropertyTypeOptions(filters: UnitFilterOptions | null, copy: typeof copyKa) {
  const apiOptions = normalizeFilterOptions(filters?.property_types || filters?.types);

  return apiOptions.length ? apiOptions : getTypeOptions(copy);
}

function getConditionFilterOptions(filters: UnitFilterOptions | null, copy: typeof copyKa) {
  const apiOptions = normalizeFilterOptions(filters?.conditions);

  return apiOptions.length ? apiOptions : getConditionOptions(copy);
}

function getFloorFilterOptions(filters: UnitFilterOptions | null, copy: typeof copyKa) {
  const apiOptions = normalizeFilterOptions(filters?.floor_options);

  return apiOptions.length
    ? apiOptions
    : (filters?.floors || []).map((item) => ({
      ...item,
      value: item.slug,
      label: item.title?.trim() || `${copy.floorLabel} ${item.number}`
    }));
}

function normalizePlanPoint(point: { x: number; y: number }) {
  const x = point.x <= 1 ? point.x * 100 : point.x;
  const y = point.y <= 1 ? point.y * 100 : point.y;

  return {
    x: Math.min(100, Math.max(0, x)),
    y: Math.min(100, Math.max(0, y))
  };
}

function getPolygonCentroid(points: Array<{ x: number; y: number }>) {
  if (!points.length) {
    return { x: 50, y: 50 };
  }

  return points.reduce((sum, point) => ({
    x: sum.x + point.x / points.length,
    y: sum.y + point.y / points.length
  }), { x: 0, y: 0 });
}

function getFloorRailLabel(option: { number?: number; label: string }) {
  if (option.number != null) {
    return String(option.number);
  }

  return option.label.replace(/\D/g, "") || option.label;
}

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
  unitSlug,
  currency,
  currencyRates
}: UnitCatalogPageProps) {
  const copy = getCopy(language);
  const initialQuery = useMemo(() => sanitizeCatalogQueryState(readUnitCatalogQuery()), []);
  const [query, setQuery] = useState<UnitCatalogQueryState>(initialQuery);
  const [draftQuery, setDraftQuery] = useState<UnitCatalogQueryState>(initialQuery);
  const [filters, setFilters] = useState<UnitFilterOptions | null>(null);
  const [units, setUnits] = useState<ExplorerUnit[]>([]);
  const [floorPlanUnits, setFloorPlanUnits] = useState<ExplorerUnit[]>([]);
  const [meta, setMeta] = useState<UnitListMeta | null>(null);
  const [unit, setUnit] = useState<ExplorerUnit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mediaMode, setMediaMode] = useState<"2d" | "3d" | "floorPlan">("2d");
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const roomTypeOptions = useMemo(() => getRoomTypeOptions(filters, copy), [filters, copy]);
  const typeOptions = useMemo(() => getPropertyTypeOptions(filters, copy), [filters, copy]);
  const conditionOptions = useMemo(() => getConditionFilterOptions(filters, copy), [filters, copy]);
  const floorOptions = useMemo(() => getFloorFilterOptions(filters, copy), [filters, copy]);
  const paginationItems = useMemo(
    () => getPaginationItems(meta?.current_page || 1, meta?.last_page || 1),
    [meta?.current_page, meta?.last_page]
  );

  useEffect(() => {
    const nextQuery = sanitizeCatalogQueryState(readUnitCatalogQuery());
    setQuery(nextQuery);
    setDraftQuery(nextQuery);
  }, [propertySlug, unitSlug]);

  useEffect(() => {
    if (!mobileFilterOpen && !mobileSortOpen) {
      document.body.style.removeProperty("overflow");
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [mobileFilterOpen, mobileSortOpen]);

  useEffect(() => {
    if (!mobileFilterOpen && !mobileSortOpen) {
      return;
    }

    const handleResize = () => {
      if (window.innerWidth > 840) {
        setMobileFilterOpen(false);
        setMobileSortOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileFilterOpen, mobileSortOpen]);

  useEffect(() => {
    let cancelled = false;

    async function loadListing() {
      setLoading(true);
      setError("");

      try {
        const floorPlanQuery = query.floors[0]
          ? { ...query, page: 1, perPage: 500 }
          : null;
        const [filterData, unitsData, floorPlanUnitsData] = await Promise.all([
          fetchUnitFilters(propertySlug, language),
          fetchUnits(propertySlug, query, language),
          floorPlanQuery ? fetchUnits(propertySlug, floorPlanQuery, language) : Promise.resolve(null)
        ]);

        if (cancelled) {
          return;
        }

        setFilters(filterData);
        setUnits(unitsData.data);
        setFloorPlanUnits(floorPlanUnitsData?.data || []);
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
        setFloorPlanUnits([]);
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

  const unitImage2d = unit?.media?.find((item) => item.type === "image" && item.url)?.url || unit?.image || "";
  const unitImage3d = unit?.media?.find((item) => item.type === "render" && item.url)?.url || unitImage2d;
  const unitFloorPlanImage = unit?.media?.find((item) => item.type === "floor_plan" && item.url)?.url || "";
  const unitPdfUrl = unit?.media?.find((item) => item.type === "document" && item.url)?.url || "";
  const unitBackSearch = unit?.floor?.slug
    ? buildUnitCatalogSearch({ ...query, page: 1, floors: [unit.floor.slug] }, language)
    : "";
  const unitBackPath = unitBackSearch
    ? `/properties/${propertySlug}/units?${unitBackSearch}`
    : `/properties/${propertySlug}/units`;
  const getUnitPriceText = (price?: string | number | null, priceCurrency?: string | null) => {
    const convertedPrice = convertPrice(price, priceCurrency || undefined, currency, currencyRates);
    const formattedPrice = formatPrice(convertedPrice, currency);
    return formattedPrice ? `${copy.fromPrice}: ${formattedPrice}/${copy.pricePerSqmSuffix}` : `${copy.fromPrice}:`;
  };

  const applyQuery = (nextQuery: UnitCatalogQueryState) => {
    const sanitizedQuery = sanitizeCatalogQueryState(nextQuery);
    const search = buildUnitCatalogSearch(sanitizedQuery, language);
    setQuery(sanitizedQuery);
    setDraftQuery(sanitizedQuery);
    setMobileFilterOpen(false);
    setMobileSortOpen(false);
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

  const unitIndoorArea = unit?.living_area ?? unit?.indoor_area ?? unit?.indor_area;
  const detailSpecs = unit ? [
    { icon: <HomeIcon />, label: copy.totalArea, value: formatArea(unit.area) },
    { icon: <HomeIcon />, label: copy.indoorArea, value: formatOptionalArea(unitIndoorArea) },
    { icon: <HomeIcon />, label: copy.summerArea, value: formatOptionalArea(unit.summer_area) },
    { icon: <BuildingIcon />, label: copy.floorLabel, value: unit.floor?.number ? String(unit.floor.number) : "-" },
    { icon: <BedIcon />, label: copy.bedroomLabel, value: unit.bedrooms_count ?? 0 },
    { icon: <BathIcon />, label: copy.bathroomLabel, value: unit.bathrooms_count ?? 0 },
    { icon: <KeyIcon />, label: copy.status, value: mapUnitStatusLabel(unit.status, language) }
  ] : [];
  const filterUnitsForView = (sourceUnits: ExplorerUnit[]) => {
    const shouldFilterByCondition = Boolean(query.condition) && sourceUnits.some((item) => Boolean(item.condition));
    const conditionUnits = shouldFilterByCondition
      ? sourceUnits.filter((item) => item.condition === query.condition)
      : sourceUnits;
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return conditionUnits;
    }

    return conditionUnits.filter((item) => {
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
  };
  const filteredUnits = useMemo(() => filterUnitsForView(units), [language, query.condition, searchTerm, units, currency, currencyRates]);
  const filteredFloorPlanUnits = useMemo(
    () => filterUnitsForView(floorPlanUnits.length ? floorPlanUnits : units),
    [floorPlanUnits, language, query.condition, searchTerm, units, currency, currencyRates]
  );

  const activeFilterCount = [
    draftQuery.floors.length,
    draftQuery.types.length,
    draftQuery.roomTypes.length,
    draftQuery.areaMin || draftQuery.areaMax ? 1 : 0,
    draftQuery.condition ? 1 : 0,
    searchTerm.trim() ? 1 : 0
  ].reduce((sum, value) => sum + value, 0);

  const selectedFloorLabel = draftQuery.floors[0]
    ? floorOptions.find((item) => item.value === draftQuery.floors[0])?.label || `${copy.floorLabel} ${draftQuery.floors[0]}`
    : "";
  const selectedFloor = query.floors[0]
    ? floorOptions.find((item) => item.value === query.floors[0])
      || filters?.floors?.find((item) => item.slug === query.floors[0])
      || null
    : null;
  const selectedFloorPlanImage = selectedFloor?.floor_plan_image || selectedFloor?.image || "";
  const selectedFloorTitle = selectedFloor
    ? ("label" in selectedFloor ? selectedFloor.label : selectedFloor.title)
    : selectedFloorLabel;
  const shouldShowFloorPlan = Boolean(!unitSlug && query.floors[0] && selectedFloorPlanImage);
  const selectedTypeLabel = draftQuery.types[0]
    ? typeOptions.find((item) => item.value === draftQuery.types[0])?.label || draftQuery.types[0]
    : "";
  const selectedRoomTypeLabel = draftQuery.roomTypes[0]
    ? roomTypeOptions.find((item) => item.value === draftQuery.roomTypes[0])?.label || draftQuery.roomTypes[0]
    : "";
  const selectedAreaRange = areaRangeOptions.find((option) => option.value === getAreaRangeValue(draftQuery));
  const selectedAreaLabel = selectedAreaRange ? getAreaRangeLabel(selectedAreaRange) : "";
  const selectedConditionLabel = draftQuery.condition
    ? conditionOptions.find((item) => item.value === draftQuery.condition)?.label || draftQuery.condition
    : "";
  const sortOptions = filters?.sorts || [
    { value: "rank", label: copy.sortRank },
    { value: "updated", label: copy.updated }
  ];
  const selectedSortLabel = sortOptions.find((item) => item.value === draftQuery.sort)?.label || draftQuery.sort;

  const mobileFilterSummary = [
    selectedAreaLabel ? `${copy.area}: ${selectedAreaLabel}` : "",
    selectedRoomTypeLabel ? `${copy.rooms}: ${selectedRoomTypeLabel}` : "",
    selectedTypeLabel ? `${copy.type}: ${selectedTypeLabel}` : "",
    selectedConditionLabel ? `${copy.condition}: ${selectedConditionLabel}` : "",
    selectedFloorLabel ? `${copy.floor}: ${selectedFloorLabel}` : "",
    searchTerm.trim() ? `${copy.search}: ${searchTerm.trim()}` : ""
  ].filter(Boolean).join(" • ") || copy.all;

  const resetFilters = () => {
    setSearchTerm("");
    applyQuery({
      ...draftQuery,
      floors: [],
      types: [],
      roomTypes: [],
      bedrooms: [],
      areaMin: "",
      areaMax: "",
      condition: "",
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
                      <button type="button" className={mediaMode === "2d" ? "active" : ""} onClick={() => setMediaMode("2d")}>{copy.image2d}</button>
                      <button type="button" className={mediaMode === "3d" ? "active" : ""} onClick={() => setMediaMode("3d")}>
                        3D
                      </button>
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
                      <button className="units-back-btn" type="button" onClick={() => navigateTo(unitBackPath)}>
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
                    {mediaMode === "floorPlan" ? (
                      unitFloorPlanImage ? <img src={unitFloorPlanImage} alt={`${getUnitDisplayTitle(unit, language)} floor plan`} /> : <div className="units-image-placeholder" />
                    ) : mediaMode === "3d" ? (
                      unitImage3d ? <img src={unitImage3d} alt={`${getUnitDisplayTitle(unit, language)} 3D render`} /> : <div className="units-image-placeholder" />
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
                        aria-label={copy.homeAriaLabel}
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
                      aria-label={copy.changeLanguage}
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
                          aria-label={copy.changeLanguage}
                          aria-haspopup="dialog"
                          aria-expanded={isLanguageModalOpen}
                          onClick={() => setIsLanguageModalOpen(true)}
                        >
                          <GlobeOutlineIcon />
                        </button>
                        <div className="controls-pill units-theme-pill">
                          <button
                            className="theme-pill-btn"
                            aria-label={theme === "light" ? copy.switchToDark : copy.switchToLight}
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
                    className={`units-filter-backdrop ${mobileFilterOpen || mobileSortOpen ? "active" : ""}`}
                    onClick={() => {
                      setMobileFilterOpen(false);
                      setMobileSortOpen(false);
                    }}
                    aria-hidden={!mobileFilterOpen && !mobileSortOpen}
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
                        label={copy.rooms}
                        value={draftQuery.roomTypes[0] || ""}
                        options={roomTypeOptions}
                        allLabel={copy.all}
                        onChange={(value) => updateDraftQuery((current) => ({ ...current, roomTypes: value ? [value] : [] }), true)}
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
                        value={draftQuery.condition}
                        options={conditionOptions}
                        allLabel={copy.all}
                        onChange={(value) => updateDraftQuery((current) => ({ ...current, condition: value }), true)}
                      />
                      <FilterSelect
                        label={copy.floor}
                        value={draftQuery.floors[0] || ""}
                        options={floorOptions}
                        allLabel={copy.all}
                        onChange={(value) => updateDraftQuery((current) => ({ ...current, floors: value ? [value] : [] }), true)}
                      />
                      <FilterSelect
                        label={copy.area}
                        value={getAreaRangeValue(draftQuery)}
                        options={areaRangeOptions.map((option) => ({ value: option.value, label: getAreaRangeLabel(option) }))}
                        allLabel={copy.all}
                        onChange={(value) => {
                          const range = getAreaRangeFromValue(value);
                          updateDraftQuery((current) => ({
                            ...current,
                            areaMin: range?.min || "",
                            areaMax: range?.max || ""
                          }), true);
                        }}
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

                  <div
                    id="units-mobile-sort-sheet"
                    className={`units-sort-sheet ${mobileSortOpen ? "mobile-open" : ""}`}
                    aria-hidden={!mobileSortOpen}
                  >
                    <div className="units-filter-mobile-sheet-head">
                      <div>
                        <strong>{copy.sort}</strong>
                        <span>{selectedSortLabel}</span>
                      </div>
                      <button
                        type="button"
                        className="units-filter-mobile-close"
                        aria-label={copy.filtersClose}
                        onClick={() => setMobileSortOpen(false)}
                      >
                        <CloseIcon />
                      </button>
                    </div>
                    <div className="units-sort-options">
                      {sortOptions.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          className={draftQuery.sort === item.value ? "active" : ""}
                          onClick={() => updateDraftQuery((current) => ({ ...current, sort: item.value, page: 1 }), true)}
                        >
                          <span>{item.label}</span>
                          {draftQuery.sort === item.value ? <CheckIcon /> : null}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="units-mobile-actionbar">
                    <button
                      type="button"
                      onClick={() => setMobileFilterOpen(true)}
                      aria-expanded={mobileFilterOpen}
                      aria-controls="units-mobile-filter-sheet"
                    >
                      <FilterAdjustIcon />
                      <span>{copy.filters}</span>
                      {activeFilterCount ? <strong>{activeFilterCount}</strong> : null}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileSortOpen(true)}
                      aria-expanded={mobileSortOpen}
                      aria-controls="units-mobile-sort-sheet"
                    >
                      <SortIcon />
                      <span>{copy.sort}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateDraftQuery((current) => ({ ...current, view: current.view === "grid" ? "table" : "grid" }), true)}
                    >
                      {draftQuery.view === "grid" ? <GridViewIcon /> : <ListViewIcon />}
                      <span>{copy.view}</span>
                    </button>
                  </div>
                </section>

                {loading ? <div className="units-state">{copy.pageLoading}</div> : null}
                {error ? <div className="units-state units-error">{error}</div> : null}

                {!loading && !error && shouldShowFloorPlan ? (
                  <section className="floor-plan-view">
                    <div className="floor-plan-stage">
                      <div className="floor-plan-stage-head">
                        <div>
                          <p>{copy.floorPlanTitle}</p>
                          <h2>{selectedFloorTitle}</h2>
                        </div>
                        <span>{copy.total}: {filteredFloorPlanUnits.length}</span>
                      </div>

                      <div className="floor-plan-media">
                        <div className="floor-plan-image-map">
                          <img src={selectedFloorPlanImage} alt={selectedFloorTitle || copy.floorPlanTitle} />
                          <svg className="floor-plan-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                            {filteredFloorPlanUnits.map((item) => {
                              const points = (item.plan_polygon || []).map(normalizePlanPoint);
                              if (!points.length) {
                                return null;
                              }

                              return (
                                <polygon
                                  key={item.id}
                                  points={points.map((point) => `${point.x},${point.y}`).join(" ")}
                                  className={`floor-plan-unit-shape floor-plan-unit-shape--${item.status}`}
                                  onClick={() => navigateTo(`/properties/${propertySlug}/units/${item.slug}`)}
                                />
                              );
                            })}
                          </svg>

                          {filteredFloorPlanUnits.map((item) => {
                            const points = (item.plan_polygon || []).map(normalizePlanPoint);
                            if (!points.length) {
                              return null;
                            }

                            const labelPoint = item.plan_label_position
                              ? normalizePlanPoint(item.plan_label_position)
                              : getPolygonCentroid(points);

                            return (
                              <button
                                key={`label-${item.id}`}
                                type="button"
                                className={`floor-plan-unit-label floor-plan-unit-label--${item.status}`}
                                style={{ left: `${labelPoint.x}%`, top: `${labelPoint.y}%` }}
                                onClick={() => navigateTo(`/properties/${propertySlug}/units/${item.slug}`)}
                              >
                                <span>{item.unit_number ? `#${item.unit_number}` : getUnitDisplayTitle(item, language)}</span>
                                <strong>{formatArea(item.area)}</strong>
                                <em>{mapUnitStatusLabel(item.status, language)}</em>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="floor-plan-rail" aria-label={copy.floor}>
                      <span>{copy.floorLabel}</span>
                      <button
                        type="button"
                        className="floor-plan-rail-arrow"
                        onClick={() => {
                          const currentIndex = floorOptions.findIndex((item) => item.value === query.floors[0]);
                          const nextFloor = floorOptions[Math.max(0, currentIndex - 1)];
                          if (nextFloor) {
                            applyQuery({ ...query, floors: [nextFloor.value], page: 1 });
                          }
                        }}
                      >
                        ‹
                      </button>
                      {floorOptions.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          className={item.value === query.floors[0] ? "active" : ""}
                          onClick={() => applyQuery({ ...query, floors: [item.value], page: 1 })}
                        >
                          {getFloorRailLabel(item)}
                        </button>
                      ))}
                      <button
                        type="button"
                        className="floor-plan-rail-arrow"
                        onClick={() => {
                          const currentIndex = floorOptions.findIndex((item) => item.value === query.floors[0]);
                          const nextFloor = floorOptions[Math.min(floorOptions.length - 1, Math.max(0, currentIndex + 1))];
                          if (nextFloor) {
                            applyQuery({ ...query, floors: [nextFloor.value], page: 1 });
                          }
                        }}
                      >
                        ›
                      </button>
                    </div>
                  </section>
                ) : null}

                {!loading && !error && !shouldShowFloorPlan && draftQuery.view === "grid" ? (
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

                {!loading && !error && !shouldShowFloorPlan && draftQuery.view === "table" ? (
                  <section className="units-table-wrap">
                    <table className="units-table">
                      <thead>
                        <tr>
                          <th>{copy.image}</th>
                          <th>{copy.number}</th>
                          <th>{copy.type}</th>
                          <th>{copy.totalArea}</th>
                          <th>{copy.bedrooms}</th>
                          <th>{copy.floor}</th>
                          <th>{copy.fromPrice}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUnits.map((item) => (
                          <tr key={item.id} onClick={() => navigateTo(`/properties/${propertySlug}/units/${item.slug}`)}>
                            <td className="units-table-image-cell">
                              {item.image ? (
                                <img className="units-table-image" src={item.image} alt={getUnitDisplayTitle(item, language)} />
                              ) : (
                                <div className="units-table-image-placeholder" />
                              )}
                            </td>
                            <td>{getUnitDisplayTitle(item, language)}</td>
                            <td>{mapUnitTypeLabel(item.type, language)}</td>
                            <td>{formatArea(item.area)}</td>
                            <td>{item.bedrooms_count ?? 0}</td>
                            <td>{item.floor?.number ?? "-"}</td>
                            <td>{getUnitPriceText(item.price, item.currency)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="units-mobile-list">
                      {filteredUnits.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="units-mobile-list-item"
                          onClick={() => navigateTo(`/properties/${propertySlug}/units/${item.slug}`)}
                        >
                          <span className="units-mobile-list-media">
                            {item.image ? (
                              <img src={item.image} alt={getUnitDisplayTitle(item, language)} />
                            ) : (
                              <span className="units-table-image-placeholder" />
                            )}
                          </span>
                          <span className="units-mobile-list-copy">
                            <span className="units-mobile-list-topline">
                              <span className={`unit-card-badge unit-card-badge--${item.status}`}>{mapUnitStatusLabel(item.status, language)}</span>
                              <span className="unit-card-floor">{copy.floorLabel} {item.floor?.number ?? "-"}</span>
                            </span>
                            <strong>{getUnitDisplayTitle(item, language)}</strong>
                            <span>{mapUnitTypeLabel(item.type, language)}</span>
                            <span className="units-mobile-list-meta">
                              <span>{formatArea(item.area)}</span>
                              <span>{item.bedrooms_count ?? 0} {copy.bedroomLabel}</span>
                            </span>
                            <span className="unit-card-price">{getUnitPriceText(item.price, item.currency)}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                    {!filteredUnits.length ? <div className="units-state">{copy.noResults}</div> : null}
                  </section>
                ) : null}

                {!loading && !error && !shouldShowFloorPlan && meta?.last_page && meta.last_page > 1 ? (
                  <div className="units-pagination">
                    <button
                      type="button"
                      className="units-pagination-arrow"
                      disabled={meta.current_page <= 1}
                      onClick={() => applyQuery({ ...query, page: Math.max(1, meta.current_page - 1) })}
                    >
                      ‹
                    </button>
                    {paginationItems.map((item, index) => item === "ellipsis" ? (
                      <span key={`ellipsis-${index}`} className="units-pagination-ellipsis">…</span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        className={meta.current_page === item ? "active" : ""}
                        onClick={() => applyQuery({ ...query, page: item })}
                      >
                        {item}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="units-pagination-arrow"
                      disabled={meta.current_page >= meta.last_page}
                      onClick={() => applyQuery({ ...query, page: Math.min(meta.last_page, meta.current_page + 1) })}
                    >
                      ›
                    </button>
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

function SortIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h10" />
      <path d="M4 12h7" />
      <path d="M4 17h4" />
      <path d="M17 6v12" />
      <path d="M14 15l3 3 3-3" />
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
