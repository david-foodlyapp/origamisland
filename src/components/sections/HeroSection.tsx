import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";
import { TranslationKey } from "../../i18n";
import { UnitFilterOptions } from "../../types";
import { LocationIcon, SearchIcon, FilterAdjustIcon, BuildingIcon, CurrencyIcon, CloseIcon } from "../Icons";

type HeroSectionProps = {
  t: (key: TranslationKey) => string;
  unitFilters: UnitFilterOptions | null;
  selectedRoomType: string;
  setSelectedRoomType: Dispatch<SetStateAction<string>>;
  selectedPropertyType: string;
  setSelectedPropertyType: Dispatch<SetStateAction<string>>;
  selectedCondition: string;
  setSelectedCondition: Dispatch<SetStateAction<string>>;
  mobileFilterOpen: boolean;
  setMobileFilterOpen: Dispatch<SetStateAction<boolean>>;
  handleSearch: () => void;
};

type FilterKey = "room" | "property" | "condition";

type FilterOption = {
  value: string;
  label: string;
};

export function HeroSection({
  t,
  unitFilters,
  selectedRoomType,
  setSelectedRoomType,
  selectedPropertyType,
  setSelectedPropertyType,
  selectedCondition,
  setSelectedCondition,
  mobileFilterOpen,
  setMobileFilterOpen,
  handleSearch
}: HeroSectionProps) {
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);
  const roomTypeOptions = (unitFilters?.room_types || []).map((option) => ({ value: String(option.value), label: option.label }));
  const propertyTypeOptions = (unitFilters?.property_types || []).map((option) => ({ value: String(option.value), label: option.label }));
  const conditionOptions = (unitFilters?.conditions || []).map((option) => ({ value: String(option.value), label: option.label }));
  const hasFilterOptions = roomTypeOptions.length > 0 || propertyTypeOptions.length > 0 || conditionOptions.length > 0;
  const selectedRoomLabel = roomTypeOptions.find((option) => option.value === selectedRoomType)?.label || t("filter_room_all");
  const hasActiveFilters = Boolean(selectedRoomType || selectedPropertyType || selectedCondition);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target as Element | null)?.closest(".filter-dropdown")) {
        setOpenFilter(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenFilter(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleResetFilters = () => {
    setSelectedRoomType("");
    setSelectedPropertyType("");
    setSelectedCondition("");
    setOpenFilter(null);
  };

  if (!hasFilterOptions) {
    return null;
  }

  return (
        <section className="hero">
          <div className="hero-bg">
            <video autoPlay loop muted playsInline poster="/assets/hero_bg_2.png" className="hero-video">
              <source src="https://origam.ge/Origami-m.mp4" media="(max-width: 650px)" type="video/mp4" />
              <source src="https://origam.ge/Origami-Holding.mp4" type="video/mp4" />
            </video>
          </div>

          <div className="hero-content">
          </div>

          <div className="filter-wrapper">
            <div className="mobile-filter-dock">
              <div className="mobile-filter-summary">
                <span className="filter-icon">
                  <LocationIcon />
                </span>
                <span>{selectedRoomLabel}</span>
              </div>
              <button
                className="mobile-filter-search"
                type="button"
                aria-label="Search properties"
                onClick={handleSearch}
              >
                <SearchIcon />
              </button>
              <button
                className={`mobile-filter-toggle ${mobileFilterOpen ? "active" : ""}`}
                type="button"
                aria-label={mobileFilterOpen ? "Hide property filters" : "Show property filters"}
                aria-expanded={mobileFilterOpen}
                onClick={() => setMobileFilterOpen((open) => !open)}
              >
                <FilterAdjustIcon />
              </button>
            </div>
            <div className={`filter-container ${mobileFilterOpen ? "mobile-open" : ""}`}>
              <FilterDropdown
                id="room"
                icon={<LocationIcon />}
                value={selectedRoomType}
                fallbackLabel={t("filter_room_all")}
                options={roomTypeOptions}
                openFilter={openFilter}
                setOpenFilter={setOpenFilter}
                onChange={setSelectedRoomType}
              />
              <div className="filter-divider"></div>

              <FilterDropdown
                id="property"
                icon={<BuildingIcon />}
                value={selectedPropertyType}
                fallbackLabel={t("filter_kind_all")}
                options={propertyTypeOptions}
                openFilter={openFilter}
                setOpenFilter={setOpenFilter}
                onChange={setSelectedPropertyType}
              />
              <div className="filter-divider"></div>

              <FilterDropdown
                id="condition"
                icon={<CurrencyIcon />}
                value={selectedCondition}
                fallbackLabel={t("filter_condition_all")}
                options={conditionOptions}
                openFilter={openFilter}
                setOpenFilter={setOpenFilter}
                onChange={setSelectedCondition}
              />

              <button id="search-filter-btn" className="gold-button filter-search-btn" type="button" onClick={handleSearch}>
                <SearchIcon />
                <span>{t("filter_search")}</span>
              </button>

              {hasActiveFilters ? (
                <button
                  className="filter-reset-btn"
                  type="button"
                  aria-label={t("filter_reset")}
                  title={t("filter_reset")}
                  onClick={handleResetFilters}
                >
                  <CloseIcon />
                </button>
              ) : null}
            </div>
          </div>
        </section>

  );
}

function FilterDropdown({
  id,
  icon,
  value,
  fallbackLabel,
  options,
  openFilter,
  setOpenFilter,
  onChange
}: {
  id: FilterKey;
  icon: ReactNode;
  value: string;
  fallbackLabel: string;
  options: FilterOption[];
  openFilter: FilterKey | null;
  setOpenFilter: Dispatch<SetStateAction<FilterKey | null>>;
  onChange: Dispatch<SetStateAction<string>>;
}) {
  const isOpen = openFilter === id;
  const allOptions = [{ value: "", label: fallbackLabel }, ...options];
  const selectedLabel = allOptions.find((option) => option.value === value)?.label || fallbackLabel;

  return (
    <div className={`filter-group filter-dropdown ${isOpen ? "is-open" : ""}`}>
      <span className="filter-icon">
        {icon}
      </span>
      <button
        className="filter-select-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setOpenFilter((current) => (current === id ? null : id))}
      >
        <span>{selectedLabel}</span>
        <span className="filter-select-chevron" aria-hidden="true"></span>
      </button>
      {isOpen ? (
        <div className="filter-dropdown-menu" role="listbox">
          {allOptions.map((option) => (
            <button
              key={option.value || "all"}
              className={`filter-dropdown-option ${option.value === value ? "is-selected" : ""}`}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value);
                setOpenFilter(null);
              }}
            >
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
