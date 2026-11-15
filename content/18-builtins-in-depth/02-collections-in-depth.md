---
title: Advanced lists, dicts and sets
minutes: 9
---
## Sorting like a pro

`sorted` is **stable**: items that compare equal keep their original order. That lets you sort by several keys, or sort by one key ascending and another descending:

```python
people = [("Ana", 31, "Pune"), ("Bo", 25, "Kochi"), ("Cy", 31, "Delhi"), ("Di", 25, "Agra")]
print(sorted(people, key=lambda p: (-p[1], p[0])))      # age desc, name asc

from operator import itemgetter
print(sorted(people, key=itemgetter(2)))                # by city
```

`min`, `max`, `sorted` and `list.sort` all take `key`.

## Dicts

```python
inventory = {"apple": 3}
inventory.setdefault("pear", 0)          # set only if missing, returns the value
inventory.update(apple=5, plum=2)
print(inventory)

defaults = {"theme": "dark", "font": 14}
user = {"font": 16}
print(defaults | user)                    # merge (3.9+)
settings = dict(defaults)
settings |= user                          # in-place merge
print(settings)

print(dict.fromkeys(["a", "b"], 0))
print({v: k for k, v in {"x": 1, "y": 2}.items()})     # invert
print(sorted(inventory.items(), key=lambda kv: kv[1], reverse=True))
```

## Sets

```python
a, b = {1, 2, 3, 4}, {3, 4, 5}
print(a <= {1, 2, 3, 4, 5}, a.isdisjoint({9}), a ^ b)
a.update([10, 11])
a -= {1}
print(a)
```

## Lists

```python
nums = [5, 3, 8, 1]
nums[1:3] = [30, 80, 90]                 # slice assignment can change the length
print(nums)
del nums[::2]
print(nums)
print([0] * 3, [[0] * 2 for _ in range(2)])
```

> [!WARNING]
> `[[0] * 2] * 2` creates two references to the **same** inner list. Changing one row changes both. Use the comprehension form above for grids.

## zip, any, all, enumerate revisited

```python
names, ages = ["a", "b"], [1, 2]
print(dict(zip(names, ages, strict=True)))
pairs = [("a", 1), ("b", 2)]
letters, numbers = zip(*pairs)           # "unzip"
print(letters, numbers)
```
