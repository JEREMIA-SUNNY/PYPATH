---
title: Booleans, truthiness and None
minutes: 6
---
`True` and `False` are Python's booleans (note the capitals). Comparisons produce them:

```python
print(3 > 2, "a" == "b", type(True))
```

## Truthiness

Every value can be used where a boolean is expected. These are **falsy**; almost everything else is truthy:

- `False`, `None`
- zero: `0`, `0.0`
- empty collections: `""`, `[]`, `()`, `{}`, `set()`

```python
cart = []
if not cart:
    print("Your cart is empty")
name = ""
print(bool(name), bool("Jerry"), bool([0]))
```

That last one surprises people: `[0]` is a non-empty list, so it's truthy.

## None

`None` represents "no value". Functions that don't `return` anything return `None`. Check for it with `is`, not `==`:

```python
result = None
if result is None:
    print("nothing yet")
```

`is` checks whether two names point to the **same object**; `==` checks whether values are **equal**. There is only one `None` object, so `is None` is both correct and idiomatic.

## and / or return values

`and` and `or` don't just return `True`/`False`; they return one of their operands. That enables a neat default pattern:

```python
nickname = ""
display = nickname or "Anonymous"
print(display)
```

Be careful: if `0` or `""` are valid values, `or` will replace them too. In that case use an explicit `if x is None`.
