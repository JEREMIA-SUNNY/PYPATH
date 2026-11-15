---
title: Type hints
minutes: 9
---
Type hints document what a function expects and returns. Python doesn't enforce them at runtime, but editors use them for autocomplete and error highlighting, tools like **mypy** check them, and frameworks like FastAPI and Pydantic use them to validate data.

```python
def greet(name: str, times: int = 1) -> str:
    return " ".join([f"Hi {name}!"] * times)

print(greet("Jerry", 2))
print(greet.__annotations__)
```

If you've used TypeScript, this will feel familiar. The syntax differs a bit:

| TypeScript | Python |
| --- | --- |
| `string`, `number`, `boolean` | `str`, `int` / `float`, `bool` |
| `string[]` | `list[str]` |
| `Record<string, number>` | `dict[str, int]` |
| `[string, number]` | `tuple[str, int]` |
| `string \| null` | `str \| None` |
| `any` | `Any` (from `typing`) |

## Collections and optionals

```python
def average(scores: list[float]) -> float | None:
    if not scores:
        return None
    return sum(scores) / len(scores)

def index_by_id(users: list[dict[str, str]]) -> dict[str, dict[str, str]]:
    return {u["id"]: u for u in users}

print(average([80, 90.5]), average([]))
```

## More from typing

```python
from typing import Callable, Literal, TypedDict

Mode = Literal["r", "w", "a"]

class User(TypedDict):
    id: int
    name: str

def apply(fn: Callable[[int], int], value: int) -> int:
    return fn(value)

def open_mode(mode: Mode) -> str:
    return f"opening with {mode}"

u: User = {"id": 1, "name": "Ana"}
print(apply(lambda x: x * 2, 21), open_mode("w"), u)
```

## Checking types

```bash
pip install mypy
mypy app.py
```

mypy reads the hints and reports mistakes like passing a `str` where an `int` is expected, before you run anything. Add hints to function signatures first; that's where they pay off most.
