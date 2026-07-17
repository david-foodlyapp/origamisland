import { Dispatch, SetStateAction } from "react";
import { TranslationKey } from "../../i18n";
import { RoomFilter, SearchPropertyTypeFilter, ConditionFilter } from "../../types";
import { LocationIcon, SearchIcon, FilterAdjustIcon, BuildingIcon, CurrencyIcon } from "../Icons";

type HeroSectionProps = {
  t: (key: TranslationKey) => string;
  selectedRoom: RoomFilter;
  setSelectedRoom: Dispatch<SetStateAction<RoomFilter>>;
  selectedPropertyType: SearchPropertyTypeFilter;
  setSelectedPropertyType: Dispatch<SetStateAction<SearchPropertyTypeFilter>>;
  selectedCondition: ConditionFilter;
  setSelectedCondition: Dispatch<SetStateAction<ConditionFilter>>;
  getRoomLabel: (room: RoomFilter) => string;
  mobileFilterOpen: boolean;
  setMobileFilterOpen: Dispatch<SetStateAction<boolean>>;
  handleSearch: () => void;
};

export function HeroSection({
  t,
  selectedRoom,
  setSelectedRoom,
  selectedPropertyType,
  setSelectedPropertyType,
  selectedCondition,
  setSelectedCondition,
  getRoomLabel,
  mobileFilterOpen,
  setMobileFilterOpen,
  handleSearch
}: HeroSectionProps) {
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
                <span>{getRoomLabel(selectedRoom)}</span>
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
                  value={selectedRoom}
                  onChange={(event) => setSelectedRoom(event.target.value as RoomFilter)}
                >
                  <option value="all">{t("filter_room_all")}</option>
                  <option value="1room">{t("filter_room_1")}</option>
                  <option value="2room">{t("filter_room_2")}</option>
                  <option value="3room">{t("filter_room_3")}</option>
                </select>
              </div>
              <div className="filter-divider"></div>

              <div className="filter-group">
                <span className="filter-icon">
                  <BuildingIcon />
                </span>
                <select
                  value={selectedPropertyType}
                  onChange={(event) => setSelectedPropertyType(event.target.value as SearchPropertyTypeFilter)}
                >
                  <option value="all">{t("filter_kind_all")}</option>
                  <option value="hotel">{t("filter_kind_hotel")}</option>
                  <option value="investment">{t("filter_kind_investment")}</option>
                </select>
              </div>
              <div className="filter-divider"></div>

              <div className="filter-group">
                <span className="filter-icon">
                  <CurrencyIcon />
                </span>
                <select
                  value={selectedCondition}
                  onChange={(event) => setSelectedCondition(event.target.value as ConditionFilter)}
                >
                  <option value="all">{t("filter_condition_all")}</option>
                  <option value="white">{t("filter_condition_white")}</option>
                  <option value="full">{t("filter_condition_full")}</option>
                  <option value="turnkey">{t("filter_condition_turnkey")}</option>
                </select>
              </div>

              <button id="search-filter-btn" className="gold-button filter-search-btn" type="button" onClick={handleSearch}>
                <SearchIcon />
                <span>{t("filter_search")}</span>
              </button>
            </div>
          </div>
        </section>

  );
}
