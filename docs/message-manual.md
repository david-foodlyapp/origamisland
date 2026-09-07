# Contact Form API — Frontend-ის ინსტრუქცია

ეს endpoint გამოიყენება ვებგვერდიდან საკონტაქტო შეტყობინების გასაგზავნად.

## Endpoint

```http
POST https://api.origamiholding.com/api/contact-messages
```

## Headers

```http
Content-Type: application/json
Accept: application/json
```

## Request body

```json
{
  "name": "User Name",
  "email": "user@example.com",
  "phone": "+995 555123456",
  "subject": "consultation",
  "message": "Origami Island consultation request",
  "source_page": "/coming-soon"
}
```

### ველები

| ველი | ტიპი | აუცილებელი | მაქსიმალური სიგრძე | აღწერა |
|---|---|---:|---:|---|
| `name` | string | კი | 255 | გამომგზავნის სახელი |
| `email` | string | კი | 255 | მოქმედი ელფოსტის მისამართი |
| `message` | string | კი | 5000 | შეტყობინების ტექსტი |
| `phone` | string | არა | 255 | ტელეფონის ნომერი |
| `subject` | string | არა | 255 | შეტყობინების თემა |
| `source_page` | string | არა | 500 | გვერდი, საიდანაც ფორმა გაიგზავნა |

არასავალდებულო ცარიელი ველები შეგიძლიათ საერთოდ არ გააგზავნოთ ან `null` გადასცეთ.

## JavaScript-ის მაგალითი

```js
const response = await fetch(
  'https://api.origamiholding.com/api/contact-messages',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      subject: form.subject || null,
      message: form.message,
      source_page: window.location.pathname,
    }),
  },
);

const result = await response.json();

if (!response.ok) {
  throw result;
}

return result;
```

## წარმატებული პასუხი

წარმატებული მოთხოვნისას API აბრუნებს `201 Created` სტატუსს:

```json
{
  "message": "Contact message submitted successfully.",
  "data": {
    "id": 1,
    "status": "new"
  }
}
```

## Validation error

თუ აუცილებელი ველი გამოტოვებულია ან მონაცემი არასწორია, API აბრუნებს `422 Unprocessable Entity` სტატუსს:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "name": ["The name field is required."],
    "email": ["The email field must be a valid email address."],
    "message": ["The message field is required."]
  }
}
```

Frontend-მა validation შეტყობინებები `errors` ობიექტიდან შესაბამის ველებთან უნდა აჩვენოს.

## მნიშვნელოვანი შენიშვნები

- ფორმის ღილაკი მოთხოვნის მიმდინარეობისას უნდა გაითიშოს, რათა ერთი შეტყობინება რამდენჯერმე არ გაიგზავნოს.
- წარმატებულად გაგზავნილი ფორმა გასუფთავდეს მხოლოდ `201` პასუხის მიღების შემდეგ.
- წარმატების ან შეცდომის შეტყობინება მომხმარებლისთვის გასაგებად გამოჩნდეს.
- `source_page`-ში გამოიყენეთ `window.location.pathname`, რათა გამოჩნდეს, რომელი გვერდიდან გაიგზავნა ფორმა.
- endpoint საჯაროა და ავტორიზაციის token არ სჭირდება.
