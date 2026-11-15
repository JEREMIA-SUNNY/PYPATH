---
title: Special (dunder) methods
minutes: 9
---
Methods with double underscores ("dunder" methods) hook your class into Python's built-in syntax: `print()`, `len()`, `+`, `==`, `in`, `for` loops and more.

## __str__ and __repr__

`__str__` is the friendly text for users (`print`, `str()`). `__repr__` is the unambiguous text for developers (the REPL, debugging, lists of objects). If you only write one, write `__repr__`.

```python
class Money:
    def __init__(self, amount, currency="INR"):
        self.amount = amount
        self.currency = currency

    def __repr__(self):
        return f"Money({self.amount!r}, {self.currency!r})"

    def __str__(self):
        return f"₹{self.amount:,.2f}" if self.currency == "INR" else f"{self.amount:.2f} {self.currency}"

m = Money(149999.5)
print(m)
print([m])
```

## Comparison and arithmetic

```python
class Vector:
    def __init__(self, x, y):
        self.x, self.y = x, y

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

    def __mul__(self, k):
        return Vector(self.x * k, self.y * k)

    def __eq__(self, other):
        return isinstance(other, Vector) and (self.x, self.y) == (other.x, other.y)

    def __abs__(self):
        return (self.x ** 2 + self.y ** 2) ** 0.5

    def __repr__(self):
        return f"Vector({self.x}, {self.y})"

v = Vector(3, 4) + Vector(1, 1)
print(v, v * 2, abs(Vector(3, 4)), Vector(1, 2) == Vector(1, 2))
```

## Containers

```python
class Playlist:
    def __init__(self, songs):
        self.songs = list(songs)

    def __len__(self):
        return len(self.songs)

    def __getitem__(self, i):
        return self.songs[i]

    def __contains__(self, song):
        return song in self.songs

p = Playlist(["Intro", "Kaattu", "Outro"])
print(len(p), p[1], "Outro" in p)
for song in p:          # __getitem__ makes it iterable too
    print(song)
```

| Method | Triggered by |
| --- | --- |
| `__init__` | `Class(...)` |
| `__str__` / `__repr__` | `print(obj)` / REPL, `repr(obj)` |
| `__len__` | `len(obj)` |
| `__eq__`, `__lt__` | `==`, `<` (and sorting) |
| `__add__`, `__mul__` | `+`, `*` |
| `__getitem__` | `obj[i]`, iteration |
| `__contains__` | `x in obj` |
