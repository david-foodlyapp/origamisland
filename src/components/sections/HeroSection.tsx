import { Dispatch, SetStateAction } from "react";
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
  const roomTypeOptions = (unitFilters?.room_types || []).map((option) => ({ value: String(option.value), label: option.label }));
  const propertyTypeOptions = (unitFilters?.property_types || []).map((option) => ({ value: String(option.value), label: option.label }));
  const conditionOptions = (unitFilters?.conditions || []).map((option) => ({ value: String(option.value), label: option.label }));
  const hasFilterOptions = roomTypeOptions.length > 0 || propertyTypeOptions.length > 0 || conditionOptions.length > 0;
  const selectedRoomLabel = roomTypeOptions.find((option) => option.value === selectedRoomType)?.label || t("filter_room_all");
  const hasActiveFilters = Boolean(selectedRoomType || selectedPropertyType || selectedCondition);

  const handleResetFilters = () => {
    setSelectedRoomType("");
    setSelectedPropertyType("");
    setSelectedCondition("");
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
              <div className="filter-group">
                <span className="filter-icon">
                  <LocationIcon />
                </span>
                <select
                  value={selectedRoomType}
                  onChange={(event) => setSelectedRoomType(event.target.value)}
                >
                  <option value="">{t("filter_room_all")}</option>
                  {roomTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="filter-divider"></div>

              <div className="filter-group">
                <span className="filter-icon">
                  <BuildingIcon />
                </span>
                <select
                  value={selectedPropertyType}
                  onChange={(event) => setSelectedPropertyType(event.target.value)}
                >
                  <option value="">{t("filter_kind_all")}</option>
                  {propertyTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="filter-divider"></div>

              <div className="filter-group">
                <span className="filter-icon">
                  <CurrencyIcon />
                </span>
                <select
                  value={selectedCondition}
                  onChange={(event) => setSelectedCondition(event.target.value)}
                >
                  <option value="">{t("filter_condition_all")}</option>
                  {conditionOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

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
