---
title: Robust API clients
minutes: 9
---
Real networks fail. Professional clients expect it.

## Retry with exponential backoff

Retry **transient** failures (timeouts, 429, 502, 503, 504), but not client errors like 400 or 404. Wait longer each time so you don't hammer a struggling server: 0.5s, 1s, 2s, 4s…

```python
import time

def retry(func, retries=4, base_delay=0.5, sleep=time.sleep):
    for attempt in range(retries + 1):
        try:
            return func()
        except ConnectionError:
            if attempt == retries:
                raise
            delay = base_delay * 2 ** attempt
            print(f"attempt {attempt + 1} failed, waiting {delay}s")
            sleep(delay)

calls = iter([ConnectionError, ConnectionError, "ok"])
def flaky():
    result = next(calls)
    if result is ConnectionError:
        raise ConnectionError("reset by peer")
    return result

print(retry(flaky, sleep=lambda s: None))
```

Taking `sleep` as a parameter makes the function testable without real waiting, which is dependency injection again. Production code often adds random **jitter** to the delay, and honours a `Retry-After` header on 429 responses.

## Pagination

APIs return big collections in pages. Two common styles:

- **Page/offset**: `?page=2&per_page=50` or `?offset=100&limit=50`
- **Cursor**: each response includes a `next` cursor or URL; keep going until it's empty

```python
def fetch_all(fetch_page):
    items, cursor = [], None
    while True:
        page = fetch_page(cursor)
        items.extend(page["items"])
        cursor = page.get("next")
        if not cursor:
            return items

fake_pages = {None: {"items": [1, 2], "next": "c2"}, "c2": {"items": [3], "next": None}}
print(fetch_all(lambda c: fake_pages[c]))
```

## Rate limits and caching

- Respect `429 Too Many Requests`: back off, and space calls out.
- Cache responses that rarely change (`functools.lru_cache` for simple cases).
- Log the request ID header from failed responses; API providers ask for it.

## Validate what you receive

APIs change. Check that the fields you rely on exist and have the right types, ideally with a Pydantic model (next module), so a surprise shows up as a clear error at the boundary rather than a `KeyError` deep in your code.
