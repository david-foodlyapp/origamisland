# Building Visual API Endpoints

ეს დოკუმენტი აღწერს შენობა -> სართული -> ბინა/ოთახი visual selector-ისთვის საჭირო public API endpoint-ებს.

კოორდინატები ყველა visual field-ში ინახება პროცენტებში, არა pixel-ებში. `x: 25` ნიშნავს სურათის სიგანის 25%-ს, `y: 40` ნიშნავს სიმაღლის 40%-ს. Frontend-ზე polygon უნდა დაიხატოს იმავე 0-100 coordinate system-ით, რომ responsive ზომებზე სწორად დაჯდეს.

## Flow

1. Building detail გვერდი აჩვენებს შენობის cover image-ს და სართულების hotspots-ს.
2. სართულზე click გადადის Floor detail-ზე.
3. Floor detail აჩვენებს floor plan image-ს და ამ სართულზე არსებული units-ის polygons-ს.
4. Unit polygon-ზე click გადადის Unit detail-ზე.

## Status Colors

Frontend-ს ფერები API-დანაც მოყვება `hotspot_color` ან filters endpoint-ის `statuses.color` field-ით.

| Status | Label | Color |
| --- | --- | --- |
| `available` | Available | `#16a34a` |
| `reserved` | Reserved | `#2563eb` |
| `sold` | Sold | `#dc2626` |
| `rented` | Rented | `#9333ea` |
| `unavailable` | Unavailable | `#6b7280` |

## 1. Buildings List

```http
GET /api/buildings?locale=ka
```

Returns active buildings.

Important fields:

```json
{
  "data": [
    {
      "id": 1,
      "slug": "building-3",
      "title": "Building 3",
      "image": "https://example.com/building.jpg",
      "floors_count": 20,
      "units_count": 120
    }
  ]
}
```

## 2. Building Detail

```http
GET /api/buildings/{buildingSlug}?locale=ka
```

Use this endpoint for the first visual screen: building image with clickable floors.

Important fields:

```json
{
  "data": {
    "id": 1,
    "slug": "building-3",
    "title": "Building 3",
    "image": "https://example.com/building.jpg",
    "floors": [
      {
        "id": 1,
        "slug": "floor-20",
        "number": 20,
        "title": "Floor 20",
        "building_map_polygon": [
          {"x": 31.2, "y": 22.4},
          {"x": 44.8, "y": 22.6},
          {"x": 44.8, "y": 25.1},
          {"x": 31.2, "y": 25.0}
        ],
        "building_map_label_position": {"x": 38, "y": 23.7},
        "units_count": 8
      }
    ]
  }
}
```

Frontend behavior:

- Render `data.image` as the base building image.
- Draw each `floor.building_map_polygon` as a clickable polygon.
- Use `floor.building_map_label_position` for floor number/title label.
- On click, navigate to the floor detail route using `floor.slug`.

Example navigation:

```text
/buildings/{buildingSlug}/floors/{floorSlug}
```

## 3. Building Floors List

```http
GET /api/buildings/{buildingSlug}/floors?locale=ka
```

Returns active floors for a building. Useful for side lists, dropdowns, or fallback navigation.

Important fields are the same floor fields from Building Detail:

```json
{
  "data": [
    {
      "slug": "floor-20",
      "number": 20,
      "title": "Floor 20",
      "building_map_polygon": [],
      "building_map_label_position": {},
      "units_count": 8
    }
  ]
}
```

## 4. Floor Detail

```http
GET /api/buildings/{buildingSlug}/floors/{floorSlug}?locale=ka
```

Use this endpoint for the second visual screen: floor plan image with clickable units.

Important fields:

```json
{
  "data": {
    "id": 1,
    "slug": "floor-20",
    "number": 20,
    "title": "Floor 20",
    "floor_plan_image": "https://example.com/floor-plan.jpg",
    "units": [
      {
        "id": 3,
        "slug": "room-3",
        "unit_number": "3",
        "title": "Room 3",
        "status": "reserved",
        "status_label": "Reserved",
        "hotspot_color": "#2563eb",
        "area": "34.80",
        "price": "3220.00",
        "currency": "USD",
        "image": "https://example.com/unit-render.jpg",
        "plan_polygon": [
          {"x": 38.1, "y": 21.7},
          {"x": 45.2, "y": 21.7},
          {"x": 45.2, "y": 38.4},
          {"x": 38.1, "y": 38.4}
        ],
        "plan_label_position": {"x": 41.6, "y": 30.2}
      }
    ]
  }
}
```

Frontend behavior:

- Render `data.floor_plan_image` as the base floor image.
- Draw each `unit.plan_polygon` as a clickable polygon.
- Polygon fill/stroke should use `unit.hotspot_color`.
- Use `unit.plan_label_position` for unit number/title label.
- On click, navigate to the unit detail route using `unit.slug`.

Example navigation:

```text
/buildings/{buildingSlug}/units/{unitSlug}
```

## 5. Units List

```http
GET /api/buildings/{buildingSlug}/units?locale=ka
```

Optional query filters:

```http
GET /api/buildings/{buildingSlug}/units?floor=floor-20&status=available,reserved&type=apartment&rooms=1,2&area_min=30&area_max=80&sort=area_asc
```

Supported query params:

| Param | Description |
| --- | --- |
| `floor` | Floor slug or comma-separated floor slugs |
| `type` | Unit type or comma-separated types |
| `status` | Unit status or comma-separated statuses |
| `area_min` | Minimum area |
| `area_max` | Maximum area |
| `price_min` | Minimum price |
| `price_max` | Maximum price |
| `rooms` | Rooms count list |
| `bedrooms` | Bedrooms count list |
| `bathrooms` | Bathrooms count list |
| `sort` | `rank`, `area_asc`, `area_desc`, `price_asc`, `price_desc`, `rooms_asc`, `rooms_desc` |
| `per_page` | Optional pagination size |

Each unit includes visual fields:

```json
{
  "slug": "room-3",
  "status": "reserved",
  "status_label": "Reserved",
  "hotspot_color": "#2563eb",
  "image": "https://example.com/unit-render.jpg",
  "plan_polygon": [],
  "plan_label_position": {}
}
```

## 6. Unit Detail

```http
GET /api/buildings/{buildingSlug}/units/{unitSlug}?locale=ka
```

Use this endpoint for the third screen: unit detail.

Important fields:

```json
{
  "data": {
    "id": 3,
    "slug": "room-3",
    "unit_number": "3",
    "title": "Room 3",
    "description": "Room 3",
    "type": "apartment",
    "condition": "green",
    "status": "reserved",
    "status_label": "Reserved",
    "hotspot_color": "#2563eb",
    "area": "34.80",
    "rooms_count": 1,
    "bedrooms_count": null,
    "bathrooms_count": 1,
    "price": "3220.00",
    "currency": "USD",
    "image": "https://example.com/unit-render.jpg",
    "plan_polygon": [],
    "plan_label_position": {},
    "floor": {
      "id": 1,
      "slug": "floor-20",
      "number": 20,
      "title": "Floor 20"
    },
    "media": []
  }
}
```

## 7. Filters And Legend

```http
GET /api/buildings/{buildingSlug}/units/filters?locale=ka
```

Use this endpoint for filters and status legend.

Important fields:

```json
{
  "data": {
    "floors": [
      {
        "id": 1,
        "slug": "floor-20",
        "number": 20,
        "title": "Floor 20",
        "units_count": 8
      }
    ],
    "statuses": [
      {"value": "available", "label": "Available", "color": "#16a34a"},
      {"value": "reserved", "label": "Reserved", "color": "#2563eb"},
      {"value": "sold", "label": "Sold", "color": "#dc2626"}
    ],
    "area": {"min": 30, "max": 250},
    "price": {"min": 100000, "max": 300000}
  }
}
```

## Media Endpoints

Building media:

```http
GET /api/buildings/{buildingSlug}/media
GET /api/buildings/{buildingSlug}/media?type=image
```

Floor media:

```http
GET /api/buildings/{buildingSlug}/floors/{floorSlug}/media
GET /api/buildings/{buildingSlug}/floors/{floorSlug}/media?type=floor_plan
```

Unit media:

```http
GET /api/buildings/{buildingSlug}/units/{unitSlug}/media
GET /api/buildings/{buildingSlug}/units/{unitSlug}/media?type=render
```

## Drawing Rules

- Treat all polygon points as percentages in a 100x100 viewBox.
- Recommended SVG setup:

```html
<svg viewBox="0 0 100 100" preserveAspectRatio="none">
  <polygon points="31.2,22.4 44.8,22.6 44.8,25.1 31.2,25.0" />
</svg>
```

- Use the same rendered image container for the image and overlay SVG.
- Do not convert values to pixels before drawing.
- A polygon is valid when it has at least 3 points.
- Label position is optional. If it is missing, fallback to polygon center or hide label.

## URL Aliases

The same property endpoints are available under both prefixes:

```text
/api/buildings/...
/api/properties/...
```

For new frontend work, prefer `/api/buildings/...` because it matches the admin module naming.
