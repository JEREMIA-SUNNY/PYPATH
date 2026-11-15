---
title: Advanced numbers and strings
minutes: 8
---
## Numbers

```python
print(bin(10), hex(255), oct(8))           # '0b1010' '0xff' '0o10'
print(int("1010", 2), int("ff", 16))        # parse other bases
print(divmod(17, 5))                        # (quotient, remainder) in one go
print(pow(3, 4), pow(3, 4, 5))              # 81, and 81 % 5 computed efficiently
print((255).bit_length(), (10).bit_count()) # bits needed, number of 1-bits
print(round(2.5), round(3.5))               # banker's rounding: to the even neighbour
print(1_000_000, 1e3, 7 // -2)              # underscores, scientific notation, floor toward -inf
```

`round` uses "round half to even" to avoid bias in large sums; use `Decimal` with `ROUND_HALF_UP` when you need school-style rounding.

```python
from fractions import Fraction
print(Fraction(1, 3) + Fraction(1, 6))      # exact rational arithmetic
```

## Strings

```python
s = "invoice-2026-11.pdf"
print(s.partition("-"))                      # ('invoice', '-', '2026-11.pdf')
print(s.rpartition("."))                     # split at the LAST dot
print(s.removesuffix(".pdf"), s.removeprefix("invoice-"))
print("7".zfill(3), "ab".center(6, "*"), "x".ljust(3, ".") + "|")
print("Hello World".swapcase(), "hello world".capitalize())
print("a\tb".expandtabs(4), "  ".isspace(), "Ab12".isalnum())
```

## translate for character mapping

```python
table = str.maketrans({"a": "4", "e": "3", "o": "0"})
print("leet code made easy".translate(table))
remove_digits = str.maketrans("", "", "0123456789")
print("r2d2 and c3po".translate(remove_digits))
```

## Multi-line strings without the indentation

```python
from textwrap import dedent, shorten, wrap

msg = dedent("""\
    Hi team,
      The build is green.
    Thanks""")
print(msg)
print(shorten("Python is a great first and last language", width=25, placeholder="…"))
print(wrap("one two three four five six", width=10))
```
