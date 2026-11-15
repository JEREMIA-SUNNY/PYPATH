---
title: Comparison and logical operators
minutes: 6
---
Comparison operators return `True` or `False`:

| Operator | Meaning |
| --- | --- |
| `==` / `!=` | equal / not equal |
| `<` `<=` `>` `>=` | ordering |
| `in` / `not in` | membership |
| `is` / `is not` | same object (use for `None`) |

```python
print(5 == 5.0, "a" < "b", [1, 2] == [1, 2])
print("py" in "python", 3 not in [1, 2])
```

Strings compare alphabetically by character code, so `"Z" < "a"` is `True` (uppercase letters come first).

## Chaining

Python lets you chain comparisons the way you'd write them in maths:

```python
age = 29
print(18 <= age < 60)          # same as 18 <= age and age < 60
```

## Logical operators

`and`, `or` and `not` combine conditions. They're words, not `&&`, `||` and `!`.

```python
has_ticket, is_vip = True, False
print(has_ticket and not is_vip)
print(has_ticket or is_vip)
```

## Short-circuiting

Python stops evaluating as soon as the answer is known. `and` stops at the first falsy value; `or` stops at the first truthy one. That lets you guard risky checks:

```python
items = []
if items and items[0] == "x":   # items[0] is never evaluated for an empty list
    print("starts with x")
print("safe")
```

## Precedence

`not` binds tighter than `and`, which binds tighter than `or`. When mixing them, add parentheses for the reader's sake:

```python
a, b, c = True, False, True
print(a or b and c)        # a or (b and c)
print((a or b) and c)
```
