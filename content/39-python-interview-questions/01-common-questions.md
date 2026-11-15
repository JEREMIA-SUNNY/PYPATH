---
title: Questions you will be asked
minutes: 15
---
Language questions check that you understand how Python actually works. For each topic, practise a **two-sentence answer plus a tiny example**.

## Mutable vs immutable

Immutable: `int`, `float`, `str`, `tuple`, `frozenset`. Mutable: `list`, `dict`, `set` and most objects. Variables are **names bound to objects**, so two names can share one mutable object.

```python
a = [1, 2]
b = a
b.append(3)
print(a, a is b)
```

## `is` vs `==`

`==` compares **values** (`__eq__`); `is` compares **identity** (the same object). Use `is` only for singletons like `None`.

## Shallow vs deep copy

```python
import copy
grid = [[0, 0], [0, 0]]
shallow = copy.copy(grid)        # new outer list, same inner lists
deep = copy.deepcopy(grid)       # everything copied
grid[0][0] = 9
print(shallow[0][0], deep[0][0])
```

## Mutable default arguments

Defaults are evaluated **once**, at definition. `def f(x=[])` shares one list across calls; use `None` instead.

## `*args` and `**kwargs`

They collect extra positional arguments into a tuple and keyword arguments into a dict. In calls, `*` and `**` unpack.

## List vs tuple vs set vs dict

Pick by need: ordered and changing (list), fixed record or dict key (tuple), uniqueness and fast membership (set), lookup by key (dict). Know the complexities from the Big-O lesson.

## Generators

Functions with `yield` produce values lazily, one at a time, keeping their state between calls. They save memory and can represent infinite streams. A generator can be iterated only once.

## Decorators

A decorator takes a function and returns a wrapped function; `@d` above `def f` means `f = d(f)`. Use `functools.wraps`. Typical uses: logging, timing, caching, auth checks, registering routes.

## The GIL and concurrency

CPython's **Global Interpreter Lock** lets only one thread run Python bytecode at a time.

| Work type | Use |
| --- | --- |
| I/O-bound, many waits (HTTP, DB) | `asyncio`, or threads |
| CPU-bound (number crunching) | `multiprocessing`, or C-backed libraries like NumPy that release the GIL |

Python 3.13 introduced an experimental free-threaded build without the GIL, but the standard build still has it.

## Context managers

`with` guarantees cleanup. Implement `__enter__` and `__exit__`, or use `@contextlib.contextmanager` with a generator:

```python
from contextlib import contextmanager
import time

@contextmanager
def timer(label):
    start = time.perf_counter()
    try:
        yield
    finally:
        print(f"{label}: {time.perf_counter() - start:.4f}s")

with timer("sum"):
    sum(range(1_000_000))
```

## Classes

- `__init__` initialises an instance; `__new__` creates it (rarely overridden).
- `@classmethod` gets `cls` (alternative constructors); `@staticmethod` gets nothing.
- **MRO** (method resolution order) decides which parent's method runs in multiple inheritance; see `Class.__mro__`. `super()` follows the MRO.
- Dunder methods (`__repr__`, `__eq__`, `__hash__`, `__len__`, `__iter__`) integrate classes with built-in syntax. If you define `__eq__`, define `__hash__` too if instances must go in sets or dict keys.

## Memory and performance quick hits

- Python manages memory with **reference counting** plus a cycle-detecting garbage collector.
- `"".join(parts)` beats repeated `+=` for strings.
- Prefer built-ins and comprehensions; use `collections`, `itertools` and `functools.lru_cache` before hand-rolling.
