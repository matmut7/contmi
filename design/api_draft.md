First draft for some API routes.

For data insertions, this would be very similar but without giving `id`s because they will be incremental.

# **GET** `/api/expenses`

query parameters:

- `budget` the budget's token

response:

```json
{
  "data": [
    {
      "id": 123,
      "category": {
        "id": 678,
        "name": "food"
      },
      "amount": 35
    },
    {
      "id": 7,
      "category": {
        "id": 890,
        "name": "hobbies"
      },
      "amount": 150
    }
    // [...]
  ]
}
```

# **GET** `/api/expense`

query parameters:

- `budget`: the budget's token
- `id`: the expense's id

response:

```json
{
  "data": {
    "id": 123,
    "category": {
      "id": 678,
      "name": "food"
    },
    "amount": 35,
    "payer": "Matéo",
    "participants": [
      {
        "id": 234,
        "name": "Matéo",
        "coef": 1
      },
      {
        "id": 345,
        "name": "Marine",
        "coef": 0.5
      }
      // [..]
      // All participants MUST be here
    ]
  }
}
```

# **GET** `/api/participants`

query parameters:

- `budget`: the budget's token

response:

```json
{
  "data": [
    {
      "id": 234,
      "name": "Matéo",
      "categories": [
        {
          "id": 678,
          "name": "food",
          "coef": 1
        },
        {
          "id": 890,
          "name": "hobbies",
          "coef": 0.8
        }
      ]
    }
    // [...]
  ]
}
```

# **GET** `/api/categories`

query parameters:

- `budget`: the budget's token

response:

```json
{
  "data": [
    {
      "id": 678,
      "name": "food",
      "participants": [
        {
          "id": 234,
          "name": "Matéo",
          "coef": 1
        },
        {
          "id": 345,
          "name": "Marine",
          "coef": 0.2
        }
      ]
    }
    // [...]
  ]
}
```
