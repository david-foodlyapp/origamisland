import {
  type ExplorerFloorDetail,
  type ExplorerFloorResponse,
  type ExplorerPropertyDetail,
  type ExplorerPropertyResponse,
  type UnitDetailResponse,
  type UnitFilterResponse,
  type UnitListResponse
} from "./types";
import type { Language } from "./i18n";

export const DEFAULT_BUILDING_SLUG = "Origami-Island";

const API_BASE_URL = "https://admin.origamiholding.com/api";

export type UnitViewMode = "grid" | "table";

export type UnitCatalogQueryState = {
  page: number;
  perPage: number;
  floors: string[];
  types: string[];
  statuses: string[];
  rooms: string[];
  bedrooms: string[];
  bathrooms: string[];
  sort: string;
  view: UnitViewMode;
};

export type UnitCatalogRoute =
  | { name: "home" }
  | { name: "legacyProperties" }
  | { name: "unitList"; propertySlug: string }
  | { name: "unitDetail"; propertySlug: string; unitSlug: string }
  | { name: "unknown" };

async function fetchJson<T>(path: string) {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getUnitCatalogRoute(): UnitCatalogRoute {
  const path = window.location.pathname;
  const normalized = path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;

  if (normalized === "/" || normalized === "") {
    return { name: "home" };
  }

  if (normalized === "/properties") {
    return { name: "legacyProperties" };
  }

  const detailMatch = normalized.match(/^\/properties\/([^/]+)\/units\/([^/]+)$/);
  if (detailMatch) {
    return {
      name: "unitDetail",
      propertySlug: decodeURIComponent(detailMatch[1]),
      unitSlug: decodeURIComponent(detailMatch[2])
    };
  }

  const listMatch = normalized.match(/^\/properties\/([^/]+)\/units$/);
  if (listMatch) {
    return {
      name: "unitList",
      propertySlug: decodeURIComponent(listMatch[1])
    };
  }

  return { name: "unknown" };
}

export function navigateTo(path: string) {
  if (`${window.location.pathname}${window.location.search}` === path) {
    return;
  }

  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function getApiLocale(language: Language) {
  return language === "ka" ? "ka" : "en";
}

export function readUnitCatalogQuery(): UnitCatalogQueryState {
  const params = new URLSearchParams(window.location.search);

  return {
    page: normalizePositiveInt(params.get("page"), 1),
    perPage: normalizePositiveInt(params.get("per_page"), 9),
    floors: readCsv(params.get("floor")),
    types: readCsv(params.get("type")),
    statuses: readCsv(params.get("status")),
    rooms: readCsv(params.get("rooms")),
    bedrooms: readCsv(params.get("bedrooms")),
    bathrooms: readCsv(params.get("bathrooms")),
    sort: params.get("sort") || "rank",
    view: params.get("view") === "table" ? "table" : "grid"
  };
}

export function buildUnitCatalogSearch(state: UnitCatalogQueryState, language: Language) {
  const params = new URLSearchParams({
    locale: getApiLocale(language),
    page: String(state.page),
    per_page: String(state.perPage),
    sort: state.sort,
    view: state.view
  });

  if (state.floors.length) params.set("floor", state.floors.join(","));
  if (state.types.length) params.set("type", state.types.join(","));
  if (state.statuses.length) params.set("status", state.statuses.join(","));
  if (state.rooms.length) params.set("rooms", state.rooms.join(","));
  if (state.bedrooms.length) params.set("bedrooms", state.bedrooms.join(","));
  if (state.bathrooms.length) params.set("bathrooms", state.bathrooms.join(","));

  return params.toString();
}

export async function fetchUnitFilters(propertySlug: string, language: Language) {
  const locale = getApiLocale(language);
  const response = await fetchJson<UnitFilterResponse>(`/properties/${propertySlug}/units/filters?locale=${locale}`);
  return response.data;
}

export async function fetchUnits(propertySlug: string, state: UnitCatalogQueryState, language: Language) {
  const query = buildUnitCatalogSearch(state, language);
  return fetchJson<UnitListResponse>(`/properties/${propertySlug}/units?${query}`);
}

export async function fetchUnit(propertySlug: string, unitSlug: string, language: Language) {
  const locale = getApiLocale(language);
  const response = await fetchJson<UnitDetailResponse>(`/properties/${propertySlug}/units/${unitSlug}?locale=${locale}`);
  return response.data;
}

export async function fetchProperty(propertySlug: string) {
  const response = await fetchJson<ExplorerPropertyResponse>(`/properties/${propertySlug}`);
  return response.data as ExplorerPropertyDetail;
}

export async function fetchFloor(propertySlug: string, floorSlug: string) {
  const response = await fetchJson<ExplorerFloorResponse>(`/properties/${propertySlug}/floors/${floorSlug}`);
  return response.data as ExplorerFloorDetail;
}

export function getUnitDisplayTitle(unit: { title?: string; unit_number?: string; slug: string }, language: Language) {
  if (unit.title?.trim()) {
    return unit.title.trim();
  }

  if (unit.unit_number?.trim()) {
    return language === "ka" ? `ბინა №${unit.unit_number}` : `Unit #${unit.unit_number}`;
  }

  return unit.slug;
}

export function formatArea(value: string | number | null | undefined) {
  if (value == null || value === "") {
    return "0 მ²";
  }

  const numeric = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numeric)) {
    return `${value} მ²`;
  }

  return `${Number(numeric.toFixed(2)).toLocaleString("en-US")} მ²`;
}

export function formatPrice(value: string | number | null | undefined, currency = "USD") {
  if (value == null || value === "") {
    return "";
  }

  const numeric = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numeric)) {
    return `${value} ${currency}`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(numeric);
}

export type SupportedCurrency = "USD" | "EUR" | "GEL";

export type CurrencyRates = Record<SupportedCurrency, number>;

const NBG_RATES_URL = "https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/en/json";

export async function fetchCurrencyRates(): Promise<CurrencyRates> {
  const response = await fetch(NBG_RATES_URL);

  if (!response.ok) {
    throw new Error(`NBG API request failed with status ${response.status}`);
  }

  const data = await response.json() as Array<{
    currencies: Array<{ code: string; quantity: number; rate: number }>;
  }>;

  const currencies = data[0]?.currencies || [];
  const rates: CurrencyRates = { GEL: 1, USD: 0, EUR: 0 };

  for (const entry of currencies) {
    if (entry.code === "USD" || entry.code === "EUR") {
      rates[entry.code] = entry.rate / entry.quantity;
    }
  }

  return rates;
}

export function convertPrice(
  value: string | number | null | undefined,
  fromCurrency: string | undefined,
  toCurrency: SupportedCurrency,
  rates: CurrencyRates | null
) {
  if (value == null || value === "") {
    return null;
  }

  const numeric = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numeric)) {
    return null;
  }

  const from = (fromCurrency || "USD").toUpperCase() as SupportedCurrency;

  if (from === toCurrency || !rates) {
    return numeric;
  }

  if (!rates[from] || !rates[toCurrency]) {
    return numeric;
  }

  const inGel = numeric * rates[from];
  return inGel / rates[toCurrency];
}

export function mapUnitTypeLabel(type: string, language: Language) {
  const kaMap: Record<string, string> = {
    apartment: "აპარტამენტი",
    hotel_room: "სასტუმროს ნომერი",
    commercial: "კომერციული",
    parking: "პარკინგი",
    penthouse: "პენტჰაუსი",
    storage: "სათავსო"
  };

  const enMap: Record<string, string> = {
    apartment: "Apartment",
    hotel_room: "Hotel Room",
    commercial: "Commercial",
    parking: "Parking",
    penthouse: "Penthouse",
    storage: "Storage"
  };

  return (language === "ka" ? kaMap[type] : enMap[type]) || type;
}

export function mapUnitStatusLabel(status: string, language: Language) {
  const kaMap: Record<string, string> = {
    available: "ხელმისაწვდომი",
    reserved: "დაჯავშნილი",
    sold: "გაყიდული",
    rented: "გაქირავებული",
    unavailable: "მიუწვდომელი"
  };

  const enMap: Record<string, string> = {
    available: "Available",
    reserved: "Reserved",
    sold: "Sold",
    rented: "Rented",
    unavailable: "Unavailable"
  };

  return (language === "ka" ? kaMap[status] : enMap[status]) || status;
}

function readCsv(value: string | null) {
  return value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];
}

function normalizePositiveInt(value: string | null, fallback: number) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}
