# Backend-ისთვის მოთხოვნა Unit Filter API-ზე

გამარჯობა,

Frontend-ზე ვამზადებთ Origami Island-ის unit filter/search სექციას. გვჭირდება ორი endpoint, რომ filter dropdown-ები დინამიურად შეივსოს და Search ღილაკზე units წამოვიღოთ არჩეული ფილტრებით.

## 1. Filter Options Endpoint

გვჭირდება endpoint:

```http
GET /api/properties/{slug}/units/filters?locale=ka
```

ალტერნატიულად თუ backend-ში buildings route გამოიყენება:

```http
GET /api/buildings/{slug}/units/filters?locale=ka
```

მაგალითი:

```http
GET /api/properties/origami-island/units/filters?locale=ka
```

სასურველი response:

```json
{
  "data": {
    "floor_options": [
      {
        "value": "floor-5",
        "label": "სართული 5",
        "id": 1,
        "number": 5,
        "units_count": 12
      }
    ],
    "room_types": [
      { "value": 0, "label": "სტუდიო" },
      { "value": 1, "label": "1 საძინებელი" },
      { "value": 2, "label": "2 საძინებელი" }
    ],
    "property_types": [
      { "value": "hotel_room", "label": "სასტუმროს ნომერი" },
      { "value": "apartment", "label": "რეზიდენცია" }
    ],
    "conditions": [
      { "value": "green", "label": "Green" },
      { "value": "turn_key", "label": "Turn Key" }
    ]
  }
}
```

მნიშვნელოვანია:

- `label` უნდა დაბრუნდეს `locale`-ის მიხედვით (`ka` ან `en`).
- `value` უნდა იყოს სტაბილური მნიშვნელობა, რომელსაც შემდეგ search endpoint მიიღებს query param-ში.
- Studio-ს `value` აუცილებლად იყოს `0`.
- თუ response-ში `types` ველიც რჩება, კარგია, მაგრამ frontend-ისთვის სასურველია `property_types`.

## 2. Units Search Endpoint

გვჭირდება endpoint:

```http
GET /api/properties/{slug}/units
```

ან:

```http
GET /api/buildings/{slug}/units
```

Frontend გააგზავნის ასეთ query params-ს:

```txt
locale=ka
page=1
per_page=9
floor=floor-5
room_type=0
type=apartment
condition=green
sort=rank
```

მაგალითი:

```http
GET /api/properties/origami-island/units?locale=ka&page=1&per_page=9&room_type=0&type=apartment&condition=green
```

რამდენიმე value ერთ filter-ში სასურველია comma-separated ფორმატით:

```http
GET /api/properties/origami-island/units?floor=floor-5,floor-6&room_type=0,1&type=hotel_room,apartment&condition=green,turn_key
```

## Query Params Mapping

```txt
room_type=0        Studio
room_type=1        1 Bedroom
room_type=2        2 Bedroom

floor=floor-5      Floor 5
floor=floor-6      Floor 6

type=hotel_room    Hotel Room
type=apartment     Residence

condition=green
condition=turn_key
```

## Units Response

Units endpoint-მა სასურველია დააბრუნოს არსებული pagination სტრუქტურით:

```json
{
  "data": [
    {
      "id": 10,
      "slug": "unit-501",
      "unit_number": "501",
      "title": "ბინა №501",
      "status": "available",
      "condition": "green",
      "type": "apartment",
      "area": "48.5",
      "rooms_count": 1,
      "bedrooms_count": 0,
      "bathrooms_count": 1,
      "price": "2500",
      "currency": "USD",
      "image": "https://...",
      "floor": {
        "id": 1,
        "slug": "floor-5",
        "number": 5,
        "title": "სართული 5"
      },
      "media": [],
      "updated_at": "2026-08-10T10:00:00Z"
    }
  ],
  "links": {
    "first": "...",
    "last": "...",
    "prev": null,
    "next": "..."
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 4,
    "per_page": 9,
    "to": 9,
    "total": 34
  }
}
```

მოკლედ: `filters` endpoint-ში დაბრუნებული თითოეული option-ის `value` ზუსტად იგივე უნდა მიიღოს `/units` endpoint-მა შესაბამის query param-ში. ასე frontend-ს hardcode აღარ დასჭირდება და filter სექცია სრულად დინამიური იქნება.
