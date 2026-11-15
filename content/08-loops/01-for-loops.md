---
title: for loops
minutes: 7
---
A `for` loop runs its block once for each item in any **iterable**: lists, strings, tuples, dicts, files, ranges and more.

```python
for lang in ["Python", "SQL", "Git"]:
    print(f"Learning {lang}")

for ch in "abc":
    print(ch.upper(), end=" ")
print()
```

## range

`range(stop)`, `range(start, stop)` and `range(start, stop, step)` produce numbers lazily. Like slicing, `stop` is excluded.

```python
print(list(range(5)))
print(list(range(2, 10, 3)))
for i in range(3, 0, -1):
    print(i)
print("Liftoff!")
```

## Accumulating results

Most loops build something up: a total, a list, a dict.

```python
prices = [120, 45, 300, 80]
total = 0
expensive = []
for p in prices:
    total += p
    if p > 100:
        expensive.append(p)
print(total, expensive)
```

## Looping over dictionaries

```python
stock = {"apples": 4, "pears": 0, "plums": 9}
for fruit, qty in stock.items():
    status = "out" if qty == 0 else qty
    print(f"{fruit:<8}{status}")
```

## Nested loops

```python
for row in range(1, 4):
    for col in range(1, 4):
        print(row * col, end="\t")
    print()
```

> [!WARNING]
> Don't add or remove items from a list while looping over it. Loop over a copy (`for x in items[:]`) or build a new list instead.
