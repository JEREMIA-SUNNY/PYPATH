---
title: Generators and lazy iteration
minutes: 9
---
A **generator function** uses `yield` instead of `return`. Calling it doesn't run the body; it returns a generator object that produces values **one at a time, on demand**.

```python
def countdown(n):
    while n > 0:
        yield n
        n -= 1

gen = countdown(3)
print(next(gen), next(gen), next(gen))
for x in countdown(5):
    print(x, end=" ")
print()
```

Each `yield` pauses the function, keeping all its local variables, until the next value is requested.

## Why bother? Memory and laziness

A list of a million squares holds a million numbers in memory. A generator holds one at a time:

```python
import sys
as_list = [n * n for n in range(1_000_000)]
as_gen = (n * n for n in range(1_000_000))
print(sys.getsizeof(as_list), "bytes vs", sys.getsizeof(as_gen), "bytes")
print(sum(as_gen))
```

Generators can even be **infinite**, because nothing is computed until it's asked for:

```python
def naturals():
    n = 1
    while True:
        yield n
        n += 1

for n in naturals():
    if n > 5:
        break
    print(n, end=" ")
print()
```

## Pipelines

Chain generators to process a stream step by step, like a Unix pipe, which is great for large log files:

```python
lines = ["INFO start", "ERROR disk full", "INFO ok", "ERROR timeout"]
errors = (l for l in lines if l.startswith("ERROR"))
messages = (l.split(" ", 1)[1] for l in errors)
print(list(messages))
```

## itertools

The `itertools` module is a toolbox of fast iterator building blocks:

```python
from itertools import islice, count, cycle, chain, groupby, combinations

print(list(islice(count(10, 5), 4)))          # first 4 of 10, 15, 20, ...
print(list(islice(cycle("AB"), 5)))
print(list(chain([1, 2], (3, 4))))
print(list(combinations("abc", 2)))
for key, grp in groupby("aaabbc"):
    print(key, len(list(grp)))
```

> [!NOTE]
> A generator can only be consumed **once**. After it's exhausted, looping over it again yields nothing. Convert to a `list` if you need to reuse the values.
