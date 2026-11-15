---
title: Dataclasses and enums
minutes: 9
---
## dataclasses

A **dataclass** writes the boring parts of a class for you: `__init__`, `__repr__` and `__eq__`, all from type-annotated fields.

```python
from dataclasses import dataclass, field

@dataclass
class Product:
    name: str
    price: float
    qty: int = 1
    tags: list[str] = field(default_factory=list)   # never a bare [] default

    @property
    def total(self) -> float:
        return self.price * self.qty

p = Product("Keyboard", 2499.0, 2)
print(p, p.total, p == Product("Keyboard", 2499.0, 2))
```

Useful options:

```python
from dataclasses import dataclass, asdict, replace

@dataclass(frozen=True, order=True)
class Version:
    major: int
    minor: int
    patch: int = 0

versions = [Version(3, 12), Version(3, 9, 7), Version(3, 12, 1)]
print(sorted(versions)[-1])               # order=True compares fields in order
v = Version(1, 0)
print(asdict(v), replace(v, minor=1))     # frozen: make modified copies instead
```

`frozen=True` makes instances immutable (and hashable, so they can be dict keys). Use dataclasses for most "record" classes. Pydantic models (in the FastAPI module) look similar but also validate data.

## enums

An `Enum` gives names to a fixed set of values, so you don't scatter magic strings through your code:

```python
from enum import Enum, auto

class Status(Enum):
    TODO = "todo"
    DOING = "doing"
    DONE = "done"

s = Status("doing")              # look up by value
print(s, s.name, s.value, s is Status.DOING)
print([st.value for st in Status])

class Priority(Enum):
    LOW = auto()
    HIGH = auto()
print(Priority.HIGH.value)
```

`StrEnum` (3.11+) members also behave like plain strings, which is handy for JSON and APIs.

Enums pair well with `match`:

```python
from enum import Enum

class Light(Enum):
    RED = 1
    GREEN = 2

def action(light: Light) -> str:
    match light:
        case Light.RED:
            return "stop"
        case Light.GREEN:
            return "go"

print(action(Light.GREEN))
```
