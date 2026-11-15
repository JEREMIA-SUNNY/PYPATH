---
title: Tuples and unpacking
minutes: 7
---
A tuple is like a list that can't change. Use parentheses, or just commas:

```python
point = (3, 4)
rgb = 255, 128, 0        # the commas make the tuple
single = ("only",)       # one-item tuples need a trailing comma
print(point[0], len(rgb), type(single))
```

Trying `point[0] = 10` raises `TypeError`.

## Why use tuples?

- They signal "this is a fixed record", like coordinates or an RGB colour.
- They can be dictionary keys and set members (lists can't, because they're mutable).
- Functions use them to return several values.

```python
def min_max(values):
    return min(values), max(values)   # returns a tuple

low, high = min_max([4, 1, 9])
print(low, high)
```

## Unpacking

Python can unpack any sequence into variables, as long as the counts match:

```python
name, age, city = ("Jerry", 29, "Bengaluru")
print(name, city)

first, *rest = [1, 2, 3, 4]        # star collects the remainder
*init, last = [1, 2, 3, 4]
print(first, rest, init, last)

for name, score in [("Ana", 91), ("Bo", 78)]:
    print(f"{name}: {score}")
```

Use `_` for values you don't need: `_, month, _ = "2026-11-14".split("-")`.

## List or tuple?

| | List | Tuple |
| --- | --- | --- |
| Mutable | yes | no |
| Typical use | a collection of similar items that grows | a fixed record of related values |
| Hashable (usable as dict key) | no | yes, if its items are |
| Syntax | `[1, 2]` | `(1, 2)` or `1, 2` |
