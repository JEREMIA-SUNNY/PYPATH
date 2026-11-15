---
title: Sets
minutes: 6
---
A set is an unordered collection of **unique** items. Use it to remove duplicates and to test membership quickly.

```python
tags = {"python", "api", "python", "sql"}
print(tags)                     # duplicates vanish, order isn't guaranteed
print(len(set([1, 1, 2, 3, 3])))
empty = set()                   # {} would be an empty dict!
```

## Adding and removing

```python
s = {1, 2}
s.add(3)
s.discard(10)    # no error if missing
s.remove(1)      # KeyError if missing
print(s)
```

## Set algebra

| Operation | Operator | Meaning |
| --- | --- | --- |
| union | `a \| b` | in either |
| intersection | `a & b` | in both |
| difference | `a - b` | in `a` but not `b` |
| symmetric difference | `a ^ b` | in exactly one |

```python
backend = {"python", "sql", "docker", "git"}
data = {"python", "sql", "pandas", "statistics"}
print(backend & data)     # shared skills
print(data - backend)     # extra skills for data roles
print(backend | data)
```

## Fast membership

`x in some_list` checks every item one by one. `x in some_set` jumps straight to it. For large collections that you check often, convert to a set first:

```python
banned = set(["spam", "scam", "free money"])
print("scam" in banned)
```

> [!TIP]
> Sets can only hold hashable items: numbers, strings and tuples, but not lists or dicts. A `frozenset` is an immutable set that can itself go inside a set or be a dict key.
