---
title: Calling APIs with requests
minutes: 9
---
`requests` is the most popular HTTP client for Python (`pip install requests`).

```py
import requests

resp = requests.get(
    "https://api.github.com/repos/python/cpython",
    headers={"Accept": "application/vnd.github+json"},
    timeout=10,
)
resp.raise_for_status()
repo = resp.json()
print(repo["full_name"], repo["stargazers_count"])
```

## The essentials

```py
# query parameters
requests.get("https://api.example.com/jobs", params={"q": "python", "page": 2}, timeout=10)

# JSON body (sets Content-Type for you)
requests.post("https://api.example.com/orders", json={"sku": "KB-01", "qty": 2}, timeout=10)

# auth header from an environment variable
import os
headers = {"Authorization": f"Bearer {os.environ['API_TOKEN']}"}
requests.get("https://api.example.com/me", headers=headers, timeout=10)
```

| Attribute | Gives you |
| --- | --- |
| `resp.status_code` | e.g. `200` |
| `resp.ok` | `True` for status < 400 |
| `resp.json()` | parsed JSON body |
| `resp.text` / `resp.content` | body as str / bytes |
| `resp.headers` | case-insensitive dict |

> [!WARNING]
> Always pass a `timeout`. Without one, a stuck server can hang your program forever.

## Sessions

A `Session` reuses connections (faster) and shares headers across calls:

```py
s = requests.Session()
s.headers.update({"Authorization": f"Bearer {token}", "User-Agent": "pypath-demo/1.0"})
for page in range(1, 4):
    data = s.get("https://api.example.com/items", params={"page": page}, timeout=10).json()
```

## Handling errors

```py
try:
    resp = requests.get(url, timeout=5)
    resp.raise_for_status()
except requests.Timeout:
    print("the server took too long")
except requests.HTTPError as e:
    print("bad status:", e.response.status_code)
except requests.RequestException as e:      # base class for everything else
    print("network problem:", e)
```

## httpx: the modern alternative

`httpx` has nearly the same API and also supports **async** (`httpx.AsyncClient`), which pairs well with FastAPI and asyncio for making many calls concurrently.
