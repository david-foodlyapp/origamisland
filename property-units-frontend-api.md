# Property Units Frontend API

This document describes the public API endpoints needed to build an apartment/unit listing page with grid/table views, filters, sorting, and pagination.

## Base URLs

Use the building slug in the URL:

```http
GET /api/buildings/{buildingSlug}/units
GET /api/buildings/{buildingSlug}/units/filters
```

The same endpoints are also available through the properties alias:

```http
GET /api/properties/{buildingSlug}/units
GET /api/properties/{buildingSlug}/units/filters
```

Example building slug:

```txt
origami-district
```

## Recommended Page Flow

1. Fetch filter options when the listing page loads.

```http
GET /api/buildings/origami-district/units/filters?locale=ka
```

2. Fetch the first page of units.

```http
GET /api/buildings/origami-district/units?locale=ka&per_page=9&page=1
```

3. When a filter, sorting option, view mode, or page changes, rebuild the query string and fetch the units endpoint again.

## Units List Endpoint

```http
GET /api/buildings/{buildingSlug}/units
```

### Query Parameters

| Parameter | Type | Example | Description |
| --- | --- | --- | --- |
| `locale` | string | `ka` | Locale for translated fields. |
| `page` | integer | `1` | Current pagination page. |
| `per_page` | integer | `9` | Items per page. If omitted, all matching units are returned. |
| `floor` | string | `floor-1,floor-2` | Comma-separated floor slugs. |
| `type` | string | `apartment,hotel_room` | Comma-separated unit types. |
| `status` | string | `available,reserved` | Comma-separated unit statuses. |
| `area_min` | number | `30` | Minimum unit area. |
| `area_max` | number | `250` | Maximum unit area. |
| `price_min` | number | `100000` | Minimum unit price. |
| `price_max` | number | `300000` | Maximum unit price. |
| `rooms` | string | `1,2,3` | Comma-separated room counts. |
| `bedrooms` | string | `1,2` | Comma-separated bedroom counts. |
| `bathrooms` | string | `1,2` | Comma-separated bathroom counts. |
| `sort` | string | `area_asc` | Sorting mode. |

### Sort Values

```txt
rank
area_asc
area_desc
price_asc
price_desc
rooms_asc
rooms_desc
```

### Example Requests

Basic listing:

```http
GET /api/buildings/origami-district/units?locale=ka&per_page=9&page=1
```

Filtered listing:

```http
GET /api/buildings/origami-district/units?locale=ka&per_page=9&page=1&floor=floor-6,floor-7&type=hotel_room&area_min=30&area_max=250&sort=area_asc
```

Table view with status filter:

```http
GET /api/buildings/origami-district/units?locale=ka&per_page=20&page=1&status=available&sort=rank
```

### Unit Response Shape

Use these fields for the grid/table UI:

```json
{
  "id": 1,
  "slug": "room-12",
  "unit_number": "12",
  "type": "hotel_room",
  "status": "available",
  "area": "101.60",
  "rooms_count": 2,
  "bedrooms_count": 1,
  "bathrooms_count": 1,
  "price": "250000.00",
  "currency": "USD",
  "rank": 1,
  "title": "Room 12",
  "description": "...",
  "meta_title": "...",
  "meta_description": "...",
  "image": "https://res.cloudinary.com/...",
  "floor": {
    "id": 3,
    "slug": "floor-6",
    "number": 6,
    "title": "Floor 6"
  },
  "media": [],
  "updated_at": "2026-07-14T..."
}
```

For cards:

| UI Field | API Field |
| --- | --- |
| Main image | `unit.image` |
| Area | `unit.area` |
| Title/type label | `unit.title` or mapped `unit.type` |
| Rooms | `unit.rooms_count` |
| Bedrooms | `unit.bedrooms_count` |
| Bathrooms | `unit.bathrooms_count` |
| Floor | `unit.floor.number` |
| Detail URL | frontend route using `unit.slug` |

## Filters Endpoint

```http
GET /api/buildings/{buildingSlug}/units/filters?locale=ka
```

### Response Shape

```json
{
  "data": {
    "floors": [
      {
        "id": 3,
        "slug": "floor-6",
        "number": 6,
        "title": "Floor 6",
        "units_count": 12
      }
    ],
    "types": [
      {
        "value": "apartment",
        "label": "Apartment"
      }
    ],
    "statuses": [
      {
        "value": "available",
        "label": "Available"
      }
    ],
    "rooms": [1, 2, 3],
    "bedrooms": [1, 2],
    "bathrooms": [1, 2],
    "area": {
      "min": 30,
      "max": 250
    },
    "price": {
      "min": 100000,
      "max": 300000
    },
    "sorts": [
      {
        "value": "rank",
        "label": "Default"
      }
    ]
  }
}
```

## Frontend Fetch Example

```js
const buildUnitsQuery = ({
  locale = 'ka',
  page = 1,
  perPage = 9,
  floors = [],
  types = [],
  statuses = [],
  areaMin,
  areaMax,
  priceMin,
  priceMax,
  rooms = [],
  bedrooms = [],
  bathrooms = [],
  sort = 'rank',
}) => {
  const params = new URLSearchParams({
    locale,
    page: String(page),
    per_page: String(perPage),
    sort,
  });

  if (floors.length) params.set('floor', floors.join(','));
  if (types.length) params.set('type', types.join(','));
  if (statuses.length) params.set('status', statuses.join(','));
  if (rooms.length) params.set('rooms', rooms.join(','));
  if (bedrooms.length) params.set('bedrooms', bedrooms.join(','));
  if (bathrooms.length) params.set('bathrooms', bathrooms.join(','));
  if (areaMin != null) params.set('area_min', String(areaMin));
  if (areaMax != null) params.set('area_max', String(areaMax));
  if (priceMin != null) params.set('price_min', String(priceMin));
  if (priceMax != null) params.set('price_max', String(priceMax));

  return params;
};

const fetchUnits = async (buildingSlug, filters) => {
  const params = buildUnitsQuery(filters);
  const response = await fetch(`/api/buildings/${buildingSlug}/units?${params}`);

  if (!response.ok) {
    throw new Error('Failed to fetch units');
  }

  return response.json();
};

const fetchUnitFilters = async (buildingSlug, locale = 'ka') => {
  const response = await fetch(`/api/buildings/${buildingSlug}/units/filters?locale=${locale}`);

  if (!response.ok) {
    throw new Error('Failed to fetch unit filters');
  }

  return response.json();
};
```

## Pagination

When `per_page` is present, Laravel API resources include pagination metadata:

```json
{
  "data": [],
  "links": {},
  "meta": {
    "current_page": 1,
    "last_page": 8,
    "per_page": 9,
    "total": 72
  }
}
```

Use `meta.current_page`, `meta.last_page`, and `meta.total` to render pagination controls.

## Notes

- Use `unit.image` for card thumbnails.
- Use `media` only for galleries or detail pages.
- Send multi-select filter values as comma-separated strings.
- Keep the selected filters in URL state so grid/table toggles and pagination are shareable.
- The frontend route for detail pages can be independent from the API route, but it should use `unit.slug`.
