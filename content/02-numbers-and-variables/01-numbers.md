---
title: Numbers and arithmetic
minutes: 7
---
Python has two everyday number types: **int** (whole numbers of any size) and **float** (decimals).

```python
print(type(42), type(3.14))
print(2 ** 100)  # ints never overflow
```

## Operators

| Operator | Meaning | Example | Result |
| --- | --- | --- | --- |
| `+ - *` | add, subtract, multiply | `7 * 3` | `21` |
| `/` | true division (always float) | `7 / 2` | `3.5` |
| `//` | floor division | `7 // 2` | `3` |
| `%` | remainder (modulo) | `7 % 2` | `1` |
| `**` | power | `2 ** 10` | `1024` |

`//` and `%` are a pair: `//` tells you how many whole times something fits, `%` tells you what's left over. That makes them perfect for conversions:

```python
total_seconds = 3725
minutes = total_seconds // 60
seconds = total_seconds % 60
print(minutes, "min", seconds, "sec")
```

`%` is also how you test divisibility: `n % 2 == 0` means `n` is even.

## Precedence

Python follows maths rules: `**` first, then `* / // %`, then `+ -`. Use parentheses whenever it helps a reader.

```python
print(2 + 3 * 4)    # 14
print((2 + 3) * 4)  # 20
print(-2 ** 2)      # -4, because ** binds tighter than unary minus
```

## Floats are approximate

Floats are stored in binary, so some decimals can't be represented exactly:

```python
print(0.1 + 0.2)
print(round(0.1 + 0.2, 2))
```

For display, round. For money, store whole paise or cents as ints, or use the `decimal` module (covered later).

## Handy built-ins

```python
print(abs(-7), round(3.14159, 2), max(3, 9, 4), min(3, 9, 4))
print(int(3.99), float(5), int("42") + 1)
```

`int()` truncates toward zero; it does not round.
