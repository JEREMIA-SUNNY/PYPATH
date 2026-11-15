---
title: f-strings and formatting
minutes: 7
---
f-strings (formatted string literals) are the modern way to put values into text. Prefix the string with `f` and write expressions in `{}`.

```python
name, score = "Jerry", 92.456
print(f"{name} scored {score}")
print(f"{name.upper()} scored {score:.1f}%")
print(f"2 + 2 = {2 + 2}")
```

## The format mini-language

After a colon inside the braces you can control how the value is shown:

| Spec | Meaning | Example | Output |
| --- | --- | --- | --- |
| `.2f` | 2 decimal places | `f"{3.14159:.2f}"` | `3.14` |
| `,` | thousands separator | `f"{1234567:,}"` | `1,234,567` |
| `%` | percentage | `f"{0.256:.1%}"` | `25.6%` |
| `>10` | right-align in 10 chars | `f"{'hi':>10}"` | `        hi` |
| `<10` | left-align | `f"{'hi':<10}"` | `hi        ` |
| `^10` | centre | `f"{'hi':^10}"` | `    hi    ` |
| `05d` | zero-pad integer | `f"{7:05d}"` | `00007` |

Alignment makes neat tables:

```python
items = [("Coffee", 180), ("Sandwich", 245.5), ("Water", 20)]
for item, price in items:
    print(f"{item:<10}{price:>8.2f}")
print(f"{'Total':<10}{sum(p for _, p in items):>8.2f}")
```

## Debugging shortcut

Add `=` to print both the expression and its value:

```python
x, y = 3, 4
print(f"{x=} {y=} {x * y=}")
```

## Older styles you'll still see

```python
print("{} is {} years old".format("Ada", 36))
print("%s is %d years old" % ("Ada", 36))
```

Both still work, and you'll meet them in older codebases, but prefer f-strings in new code.
