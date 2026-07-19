import { TranslationKey } from "./i18n";

export type Theme = "light" | "dark";
export type BrandingSettings = {
  logo_url: string | null;
  logo_en_url: string | null;
  logo_ka_url: string | null;
  logo_dark_url: string | null;
  logo_dark_en_url: string | null;
  logo_dark_ka_url: string | null;
  favicon_url: string | null;
};
export type BrandingSettingsResponse = {
  data: BrandingSettings;
};
export type RoomFilter = "all" | "1room" | "2room" | "3room";
export type SearchPropertyTypeFilter = "all" | "hotel" | "investment";
export type ConditionFilter = "all" | "white" | "full" | "turnkey";
export type FooterSection = "links" | "services" | "legal";
export type ExplorerQueryState = {
  room: RoomFilter;
  propertyType: SearchPropertyTypeFilter;
  condition: ConditionFilter;
};

export type ExplorerMediaItem = {
  id: number;
  type: string;
  url: string;
  resource_type: string;
  format: string;
  width: number;
  height: number;
  size: number;
  is_cover: boolean;
  rank: number;
  title: string;
  description: string;
  alt: string;
};

export type ExplorerUnit = {
  id: number;
  slug: string;
  unit_number?: string;
  title: string;
  description: string;
  status: string;
  rank: number;
  type: string;
  area?: string;
  rooms_count?: number | null;
  bedrooms_count?: number | null;
  bathrooms_count?: number | null;
  price?: string | number | null;
  currency?: string;
  image?: string;
  meta_title?: string;
  meta_description?: string;
  floor?: UnitFloorSummary;
  media: ExplorerMediaItem[];
  updated_at: string;
};

export type ExplorerFloor = {
  id: number;
  slug: string;
  number: number;
  status: string;
  rank: number;
  title: string;
  description: string;
  units_count: number;
  media: ExplorerMediaItem[];
  updated_at: string;
};

export type ExplorerFloorDetail = ExplorerFloor & {
  units: ExplorerUnit[];
};

export type ExplorerProperty = {
  id: number;
  slug: string;
  type: string;
  construction_type: string;
  status: string;
  rank: number;
  title: string;
  description: string;
  meta_title: string;
  meta_description: string;
  image: string;
  floors_count: number;
  units_count: number;
  media: ExplorerMediaItem[];
  updated_at: string;
};

export type ExplorerPropertyDetail = ExplorerProperty & {
  floors: ExplorerFloor[];
};

export type ExplorerPropertyListResponse = {
  data: ExplorerProperty[];
};

export type ExplorerPropertyResponse = {
  data: ExplorerPropertyDetail;
};

export type ExplorerFloorListResponse = {
  data: ExplorerFloor[];
};

export type ExplorerFloorResponse = {
  data: ExplorerFloorDetail;
};

export type ExplorerUnitListResponse = {
  data: ExplorerUnit[];
};

export type UnitFloorSummary = {
  id: number;
  slug: string;
  number: number;
  title: string;
  units_count?: number;
};

export type UnitTypeOption = {
  value: string;
  label: string;
};

export type UnitStatusOption = {
  value: string;
  label: string;
};

export type UnitSortOption = {
  value: string;
  label: string;
};

export type UnitFilterOptions = {
  floors: UnitFloorSummary[];
  types: UnitTypeOption[];
  statuses: UnitStatusOption[];
  rooms: number[];
  bedrooms: number[];
  bathrooms: number[];
  area: {
    min: number | null;
    max: number | null;
  };
  price: {
    min: number | null;
    max: number | null;
  };
  sorts: UnitSortOption[];
};

export type UnitFilterResponse = {
  data: UnitFilterOptions;
};

export type UnitListLinks = {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
};

export type UnitPaginationLink = {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
};

export type UnitListMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  links: UnitPaginationLink[];
  path: string;
  per_page: number;
  to: number | null;
  total: number;
};

export type UnitListResponse = {
  data: ExplorerUnit[];
  links: UnitListLinks;
  meta: UnitListMeta;
};

export type UnitDetailResponse = {
  data: ExplorerUnit;
};

export type GalleryItem = {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  badge: string;
};

export type GalleryApiItem = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  logo: string;
  link: string;
  badge: string;
  rank: number;
  status: boolean;
};

export type GallerySectionResponse = {
  data: {
    title: string;
    items: GalleryApiItem[];
  };
};

export type NewsApiItem = {
  id: number;
  slug: string;
  title: string | null;
  excerpt: string | null;
  image_url: string;
  published_at: string;
  status: string;
  category: {
    name: string;
  };
};

export type NewsCard = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
};

export type InfrastructureApiItem = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  logo: string;
  link: string;
  badge: string;
  rank: number;
  status: boolean;
};

export type BiohackingApiItem = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  logo: string;
  link: string;
  badge: string;
  rank: number;
  status: boolean;
};

export type BiohackingSectionResponse = {
  data: {
    description: string;
    background_image: string;
    items: BiohackingApiItem[];
  };
};

export type OrigamiHoldingApiItem = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  logo: string;
  link: string;
  badge: string;
  rank: number;
  status: boolean;
};

export type OrigamiHoldingSectionResponse = {
  data: {
    title: string;
    background_image: string;
    items: OrigamiHoldingApiItem[];
  };
};

export type ChooseApiItem = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  logo: string;
  link: string;
  badge: string;
  rank: number;
  status: boolean;
};

export type ChooseSectionResponse = {
  data: {
    title: string;
    items: ChooseApiItem[];
  };
};

export type FinanceApiItem = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  logo: string;
  link: string;
  badge: string;
  rank: number;
  status: boolean;
};

export type FinanceSectionResponse = {
  data: {
    title: string;
    description: string;
    background_image: string;
    items: FinanceApiItem[];
  };
};

export type InfrastructureSectionResponse = {
  data: {
    items: InfrastructureApiItem[];
  };
};

export type CompanyProjectApiItem = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  logo: string;
  link: string;
  badge: string;
  rank: number;
  status: boolean;
};

export type CompanyProjectsSectionResponse = {
  data: {
    title: string;
    items: CompanyProjectApiItem[];
  };
};

export type FooterMenuApiItem = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  logo: string;
  link: string;
  badge: string;
  rank: number;
  status: boolean;
};

export type FooterMenuSectionResponse = {
  data: {
    title: string;
    items: FooterMenuApiItem[];
  };
};

export type AboutUsApiItem = {
  id: number;
  type: string;
  title: string;
  body: string;
  image: string;
  rank: number;
  status: boolean;
  updated_at: string;
};

export type AboutUsResponse = {
  data: AboutUsApiItem[];
};

export type Community = {
  area: string;
  image: string;
  alt: string;
  titleKey: TranslationKey;
  descKey: TranslationKey;
};
