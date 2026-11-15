---
title: HTTP and REST in 10 minutes
minutes: 10
---
Almost every backend, data pipeline and AI app talks to other services over **HTTP**. A request has a **method**, a **URL**, **headers** and sometimes a **body**; a response has a **status code**, headers and a body.

```text
POST /api/v1/orders?notify=true HTTP/1.1
Host: shop.example.com
Authorization: Bearer eyJhbGciOi...
Content-Type: application/json

{"sku": "KB-01", "qty": 2}
```

## REST conventions

A REST API exposes **resources** (nouns) at URLs and uses methods (verbs) to act on them:

| Method | URL | Meaning | Typical success |
| --- | --- | --- | --- |
| GET | `/orders` | list orders | 200 OK |
| GET | `/orders/42` | one order | 200 OK |
| POST | `/orders` | create an order | 201 Created |
| PUT / PATCH | `/orders/42` | replace / partly update | 200 OK |
| DELETE | `/orders/42` | delete | 204 No Content |

GET, PUT and DELETE should be **idempotent**: repeating them has the same effect as doing them once. POST usually isn't.

## Status codes

| Range | Meaning | Common ones |
| --- | --- | --- |
| 2xx | success | 200, 201, 204 |
| 3xx | redirect | 301, 304 |
| 4xx | **client** error, so fix the request | 400 bad request, 401 not authenticated, 403 forbidden, 404 not found, 409 conflict, 422 validation failed, 429 too many requests |
| 5xx | **server** error, so maybe retry | 500, 502, 503, 504 |

## JSON

JSON is the usual body format. Python's `json` module maps it to dicts and lists:

```python
import json

body = '{"id": 42, "items": [{"sku": "KB-01", "qty": 2}], "paid": true, "coupon": null}'
order = json.loads(body)
print(order["items"][0]["sku"], order["paid"], order["coupon"])
print(json.dumps({"ok": True, "total": 4998.0}))
```

| JSON | Python |
| --- | --- |
| object `{}` | `dict` |
| array `[]` | `list` |
| `true` / `false` / `null` | `True` / `False` / `None` |
| number | `int` / `float` |

## Query strings

```python
from urllib.parse import urlencode, urlparse, parse_qs

url = "https://api.example.com/search?" + urlencode({"q": "python jobs", "city": "Bengaluru", "page": 2})
print(url)
print(parse_qs(urlparse(url).query))
```

`urlencode` handles spaces and special characters for you.
