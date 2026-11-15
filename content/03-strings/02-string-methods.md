---
title: String methods
minutes: 8
---
Strings are **immutable**: you can't change a character in place. `word[0] = "J"` raises `TypeError`. Every method returns a *new* string, so remember to keep the result.

```python
name = "  ada lovelace  "
clean = name.strip().title()
print(repr(name), "->", repr(clean))
```

## The methods you'll use every day

| Method | What it does | Example | Result |
| --- | --- | --- | --- |
| `upper()` / `lower()` | change case | `"Hi".lower()` | `'hi'` |
| `title()` | capitalise words | `"ada lovelace".title()` | `'Ada Lovelace'` |
| `strip()` | trim whitespace (also `lstrip`, `rstrip`) | `"  x ".strip()` | `'x'` |
| `split(sep)` | break into a list | `"a,b,c".split(",")` | `['a', 'b', 'c']` |
| `sep.join(list)` | glue a list together | `"-".join(["a", "b"])` | `'a-b'` |
| `replace(old, new)` | substitute | `"2024".replace("4", "5")` | `'2025'` |
| `find(sub)` | index or -1 | `"hello".find("l")` | `2` |
| `count(sub)` | occurrences | `"banana".count("a")` | `3` |
| `startswith` / `endswith` | prefix / suffix test | `"main.py".endswith(".py")` | `True` |
| `isdigit()` / `isalpha()` | content checks | `"123".isdigit()` | `True` |

`split()` with no argument splits on any run of whitespace and drops empty pieces, which is usually what you want for user text:

```python
sentence = "  the   quick brown  fox "
words = sentence.split()
print(words, len(words))
print(" ".join(reversed(words)))
```

## Chaining

Because each method returns a string, you can chain them:

```python
raw = "  Hello, World!  "
print(raw.strip().lower().replace(",", "").replace("!", ""))
```

## Building strings in a loop

Collect pieces in a list and `join` once at the end. It's cleaner and faster than repeated `+=`:

```python
parts = []
for n in range(1, 6):
    parts.append(str(n))
print(", ".join(parts))
```
