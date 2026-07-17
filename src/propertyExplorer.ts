import {
  type ConditionFilter,
  type ExplorerFloor,
  type ExplorerFloorDetail,
  type ExplorerFloorListResponse,
  type ExplorerFloorResponse,
  type ExplorerMediaItem,
  type ExplorerProperty,
  type ExplorerPropertyDetail,
  type ExplorerPropertyListResponse,
  type ExplorerPropertyResponse,
  type ExplorerQueryState,
  type ExplorerUnit,
  type ExplorerUnitListResponse,
  type RoomFilter,
  type SearchPropertyTypeFilter
} from "./types";

const API_BASE_URL = "https://admin.origamiholding.com/api";

function buildApiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(buildApiUrl(path));

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchProperties() {
  const response = await fetchJson<ExplorerPropertyListResponse>("/properties");
  return response.data;
}

export async function fetchProperty(slug: string) {
  const response = await fetchJson<ExplorerPropertyResponse>(`/properties/${slug}`);
  return response.data;
}

export async function fetchPropertyFloors(slug: string) {
  const response = await fetchJson<ExplorerFloorListResponse>(`/properties/${slug}/floors`);
  return response.data;
}

export async function fetchFloor(slug: string, floorSlug: string) {
  const response = await fetchJson<ExplorerFloorResponse>(`/properties/${slug}/floors/${floorSlug}`);
  return response.data;
}

export async function fetchPropertyUnits(slug: string) {
  const response = await fetchJson<ExplorerUnitListResponse>(`/properties/${slug}/units`);
  return response.data;
}

export type ExplorerRoute =
  | { name: "home" }
  | { name: "properties" }
  | { name: "property"; propertySlug: string }
  | { name: "floor"; propertySlug: string; floorSlug: string }
  | { name: "unknown" };

export function getExplorerRoute(): ExplorerRoute {
  const path = window.location.pathname;
  const normalized = path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;

  if (normalized === "/" || normalized === "") {
    return { name: "home" as const };
  }

  const floorMatch = normalized.match(/^\/properties\/([^/]+)\/floors\/([^/]+)$/);
  if (floorMatch) {
    return {
      name: "floor" as const,
      propertySlug: decodeURIComponent(floorMatch[1]),
      floorSlug: decodeURIComponent(floorMatch[2])
    };
  }

  const propertyMatch = normalized.match(/^\/properties\/([^/]+)$/);
  if (propertyMatch) {
    return {
      name: "property" as const,
      propertySlug: decodeURIComponent(propertyMatch[1])
    };
  }

  if (normalized === "/properties") {
    return { name: "properties" as const };
  }

  return { name: "unknown" as const };
}

export function navigateTo(path: string) {
  if (window.location.pathname === path) {
    return;
  }

  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function readExplorerQuery(): ExplorerQueryState {
  const params = new URLSearchParams(window.location.search);
  const room = params.get("room");
  const kind = params.get("kind");
  const condition = params.get("condition");

  return {
    room: isRoomFilter(room) ? room : "all",
    propertyType: isPropertyTypeFilter(kind) ? kind : "all",
    condition: isConditionFilter(condition) ? condition : "all"
  };
}

export function buildExplorerSearch({
  room,
  propertyType,
  condition
}: {
  room: RoomFilter;
  propertyType: SearchPropertyTypeFilter;
  condition: ConditionFilter;
}) {
  const params = new URLSearchParams();

  if (room !== "all") {
    params.set("room", room);
  }

  if (propertyType !== "all") {
    params.set("kind", propertyType);
  }

  if (condition !== "all") {
    params.set("condition", condition);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export function getPropertyCoverImage(property: ExplorerProperty | ExplorerPropertyDetail) {
  return property.image || getCoverFromMedia(property.media);
}

export function getFloorCoverImage(floor: ExplorerFloor | ExplorerFloorDetail) {
  return getCoverFromMedia(floor.media);
}

export function getUnitCoverImage(unit: ExplorerUnit) {
  return getCoverFromMedia(unit.media);
}

function getCoverFromMedia(media: ExplorerMediaItem[] = []) {
  return media.find((item) => item.is_cover)?.url || media[0]?.url || "";
}

function isRoomFilter(value: string | null): value is RoomFilter {
  return value === "all" || value === "1room" || value === "2room" || value === "3room";
}

function isPropertyTypeFilter(value: string | null): value is SearchPropertyTypeFilter {
  return value === "all" || value === "hotel" || value === "investment";
}

function isConditionFilter(value: string | null): value is ConditionFilter {
  return value === "all" || value === "white" || value === "full" || value === "turnkey";
}
