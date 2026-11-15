---
title: Mocking and dependency injection
minutes: 9
---
Unit tests shouldn't send real emails, call real APIs or depend on today's date. You replace those dependencies with **test doubles**.

## The easiest way: inject the dependency

Design functions to **receive** their collaborators instead of creating them. Then tests can pass a fake:

```python
def send_welcome(user: dict, mailer) -> bool:
    if not user.get("email"):
        return False
    mailer.send(user["email"], "Welcome to PyPath!")
    return True

class FakeMailer:
    def __init__(self):
        self.sent = []
    def send(self, to, subject):
        self.sent.append((to, subject))

fake = FakeMailer()
assert send_welcome({"email": "a@b.c"}, fake) is True
assert fake.sent == [("a@b.c", "Welcome to PyPath!")]
assert send_welcome({}, fake) is False
print("fake mailer works:", fake.sent)
```

## unittest.mock

`Mock` objects accept any call and record it, so you can assert afterwards:

```python
from unittest.mock import Mock

mailer = Mock()
mailer.send("x@y.z", "Hello")
mailer.send.assert_called_once_with("x@y.z", "Hello")
print(mailer.send.call_count, mailer.send.call_args)

api = Mock()
api.get_price.return_value = 499          # canned answer
api.get_stock.side_effect = TimeoutError  # simulate a failure
print(api.get_price("SKU1"))
try:
    api.get_stock("SKU1")
except TimeoutError:
    print("simulated timeout")
```

## patch: replace something where it's used

When code imports a function directly, `patch` swaps it out during the test:

```py
# weather.py
import requests

def temperature(city):
    data = requests.get(f"https://api.example.com/{city}", timeout=5).json()
    return data["temp_c"]
```

```py
# test_weather.py
from unittest.mock import patch
import weather

def test_temperature():
    with patch("weather.requests.get") as fake_get:
        fake_get.return_value.json.return_value = {"temp_c": 27}
        assert weather.temperature("bengaluru") == 27
        fake_get.assert_called_once()
```

Patch the name **where it's looked up** (`weather.requests.get`), not where it's defined.

## monkeypatch (pytest)

```py
def test_reads_api_key(monkeypatch):
    monkeypatch.setenv("API_KEY", "test-123")
    assert load_settings().api_key == "test-123"
```

> [!TIP]
> If something is hard to test, that's design feedback. Pass dependencies in, keep I/O at the edges, and keep the core logic pure.
