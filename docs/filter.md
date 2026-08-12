# Unit Filters API

Frontend-მა filter dropdown-ებისთვის მონაცემები უნდა გამოითხოვოს building/property slug-ის მიხედვით.

## Filter Options Endpoint

```http
GET /api/buildings/{slug}/units/filters
```

ალტერნატიული იგივე endpoint:

```http
GET /api/properties/{slug}/units/filters
```

მაგალითი:

```http
GET /api/buildings/origami-island/units/filters?locale=en
```

`locale` optional არის. გამოიყენე `en` ან `ka`, თუ label-ების თარგმნა გჭირდება.

## Response Fields

Frontend-ის filter UI-სთვის გამოიყენე ეს ველები:

```json
{
  "data": {
    "floors": [
      {
        "id": 1,
        "slug": "floor-5",
        "number": 5,
        "title": "Floor 5",
        "units_count": 12
      }
    ],
    "floor_options": [
      {
        "value": "floor-5",
        "label": "Floor 5",
        "id": 1,
        "number": 5,
        "units_count": 12
      }
    ],
    "room_types": [
      { "value": 0, "label": "Studio" },
      { "value": 1, "label": "1 Bedroom" },
      { "value": 2, "label": "2 Bedroom" }
    ],
    "property_types": [
      { "value": "hotel_room", "label": "Hotel Room" },
      { "value": "apartment", "label": "Residence" }
    ],
    "conditions": [
      { "value": "green", "label": "Green" },
      { "value": "turn_key", "label": "Turn Key" }
    ]
  }
}
```

შენიშვნა: response-ში `types` ველიც მოდის იგივე მნიშვნელობებით, რაც `property_types`, მაგრამ frontend-ისთვის უფრო გასაგებია `property_types` გამოიყენო.

## Search Units Endpoint

როდესაც user დააჭერს Search-ს, units წამოიღე ამ endpoint-ით:

```http
GET /api/buildings/{slug}/units
```

ალტერნატიული იგივე endpoint:

```http
GET /api/properties/{slug}/units
```

## Query Parameters

Room type:

```txt
room_type=0        Studio
room_type=1        1 Bedroom
room_type=2        2 Bedroom
```

Floor:

```txt
floor=floor-5      Floor 5
floor=floor-6      Floor 6
```

Property type:

```txt
type=hotel_room    Hotel Room
type=apartment     Residence
```

Condition:

```txt
condition=green      Green
condition=turn_key   Turn Key
```

მაგალითი ერთი filter-ით:

```http
GET /api/buildings/origami-island/units?room_type=0
```

მაგალითი რამდენიმე filter-ით:

```http
GET /api/buildings/origami-island/units?floor=floor-5&room_type=1&type=apartment&condition=green
```

რამდენიმე value ერთ filter-ში შეიძლება comma-separated ფორმატით:

```http
GET /api/buildings/origami-island/units?floor=floor-5,floor-6&room_type=0,1&type=hotel_room,apartment&condition=green,turn_key
```

## Frontend Example

```js
const buildingSlug = 'origami-island';

async function loadUnitFilters() {
  const response = await fetch(`/api/buildings/${buildingSlug}/units/filters?locale=en`);
  const { data } = await response.json();

  return {
    floors: data.floors,
    floorOptions: data.floor_options,
    roomTypes: data.room_types,
    propertyTypes: data.property_types,
    conditions: data.conditions,
  };
}

async function searchUnits(selectedFilters) {
  const params = new URLSearchParams();

  if (selectedFilters.roomType !== null && selectedFilters.roomType !== undefined) {
    params.set('room_type', selectedFilters.roomType);
  }

  if (selectedFilters.floor) {
    params.set('floor', selectedFilters.floor);
  }

  if (selectedFilters.propertyType) {
    params.set('type', selectedFilters.propertyType);
  }

  if (selectedFilters.condition) {
    params.set('condition', selectedFilters.condition);
  }

  const response = await fetch(`/api/buildings/${buildingSlug}/units?${params.toString()}`);
  const { data } = await response.json();

  return data;
}
```

## Important

Studio-ს value არის `0`, ამიტომ frontend-ში შემოწმებისას არ გამოიყენო მხოლოდ truthy check:

```js
// Wrong: 0 ჩაითვლება false-ად
if (selectedRoomType) {
  params.set('room_type', selectedRoomType);
}

// Correct
if (selectedRoomType !== null && selectedRoomType !== undefined) {
  params.set('room_type', selectedRoomType);
}
```
