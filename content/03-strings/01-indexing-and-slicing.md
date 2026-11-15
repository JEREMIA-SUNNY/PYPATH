---
title: Strings, indexing and slicing
minutes: 8
---
A string is an ordered sequence of characters. Single and double quotes are equivalent; triple quotes span lines.

```python
a = 'single'
b = "double, with 'quotes' inside"
c = """multi
line"""
print(a, b, c, sep="\n")
print(len("Python"))
```

Escape characters start with a backslash: `\n` newline, `\t` tab, `\\` backslash, `\"` quote. A raw string `r"C:\new"` turns escapes off, which is handy for Windows paths and regular expressions.

## Indexing

Each character has a position starting at **0**. Negative indexes count from the end.

```text
 P  y  t  h  o  n
 0  1  2  3  4  5
-6 -5 -4 -3 -2 -1
```

```python
word = "Python"
print(word[0], word[5], word[-1], word[-2])
```

Indexing past the end raises `IndexError`.

## Slicing

`s[start:stop:step]` returns a new string from `start` up to **but not including** `stop`. Any part can be omitted.

```python
word = "Python"
print(word[0:2])   # 'Py'
print(word[2:])    # 'thon'  (to the end)
print(word[:4])    # 'Pyth'  (from the start)
print(word[-3:])   # 'hon'   (last three)
print(word[::2])   # 'Pto'   (every second char)
print(word[::-1])  # 'nohtyP' (reversed)
```

Slices never raise `IndexError`; out-of-range bounds are clipped. `"abc"[1:100]` is just `"bc"`.

> [!TIP]
> Think of slice indexes as pointing *between* characters. `s[2:5]` means "cut at gap 2 and gap 5", which is why it has `5 - 2 = 3` characters.

## Membership and repetition

```python
print("th" in "Python")
print("-" * 20)
print("py" + "thon")
```
