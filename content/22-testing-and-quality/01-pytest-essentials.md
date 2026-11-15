---
title: pytest essentials
minutes: 11
---
pytest is the de facto testing tool for Python. Tests are plain functions whose names start with `test_`, in files named `test_*.py`. Run everything with `pytest` from the project root.

```py
# src/pricing.py
def apply_discount(price: float, pct: float) -> float:
    if not 0 <= pct <= 100:
        raise ValueError("pct must be between 0 and 100")
    return round(price * (1 - pct / 100), 2)
```

```py
# tests/test_pricing.py
import pytest
from pricing import apply_discount

def test_ten_percent_off():
    assert apply_discount(200, 10) == 180

def test_rejects_bad_percentage():
    with pytest.raises(ValueError, match="between 0 and 100"):
        apply_discount(100, 120)
```

Plain `assert` is enough: when it fails, pytest shows both sides of the comparison.

## parametrize: many cases, one test

```py
@pytest.mark.parametrize(
    ("price", "pct", "expected"),
    [(100, 0, 100), (100, 100, 0), (99.99, 15, 84.99)],
)
def test_discounts(price, pct, expected):
    assert apply_discount(price, pct) == expected
```

Each tuple becomes its own test in the report.

## Fixtures: reusable setup

A fixture is a function that prepares something a test needs. Tests request fixtures by naming them as parameters:

```py
import sqlite3
import pytest

@pytest.fixture
def db():
    conn = sqlite3.connect(":memory:")
    conn.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT)")
    yield conn                # the test runs here
    conn.close()              # teardown

def test_insert_user(db):
    db.execute("INSERT INTO users (email) VALUES ('a@b.c')")
    assert db.execute("SELECT COUNT(*) FROM users").fetchone()[0] == 1
```

Built-in fixtures you'll use constantly: `tmp_path` (a fresh temporary folder as a `Path`), `monkeypatch` (temporarily change env vars or attributes), `capsys` (capture printed output).

```py
def test_writes_report(tmp_path):
    out = tmp_path / "report.txt"
    write_report(out, ["a", "b"])
    assert out.read_text() == "a\nb\n"
```

## Useful commands

| Command | Does |
| --- | --- |
| `pytest -q` | quiet output |
| `pytest -k discount` | run tests whose names match |
| `pytest -x` | stop at the first failure |
| `pytest --lf` | rerun only last failures |
| `pytest --cov=src` | coverage (with `pytest-cov`) |

## What makes a good test

- **Arrange, act, assert**: set up, call once, check.
- Test behaviour, not implementation details.
- One reason to fail per test, with a descriptive name: `test_rejects_negative_quantity`.
- Fast and independent: no shared state, no real network.
