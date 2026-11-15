---
title: Regular expressions
minutes: 10
---
A regular expression (regex) is a pattern for matching text. Use the `re` module, and write patterns as raw strings (`r"..."`) so backslashes reach the regex engine untouched.

```python
import re

text = "Call 98450 12345 or 080-4123-9876 before 5pm."
print(re.findall(r"\d+", text))
print(re.search(r"\d{3}-\d{4}-\d{4}", text).group())
```

## The building blocks

| Pattern | Matches |
| --- | --- |
| `.` | any character except newline |
| `\d` / `\w` / `\s` | digit / word char (letter, digit, `_`) / whitespace |
| `\D` / `\W` / `\S` | the opposites |
| `[aeiou]` / `[^0-9]` | one of these / not one of these |
| `*` / `+` / `?` | 0+ / 1+ / 0 or 1 of the previous item |
| `{3}` / `{2,4}` | exactly 3 / between 2 and 4 |
| `^` / `$` | start / end of the string (or line with `re.M`) |
| `\b` | word boundary |
| `( )` | capture group |
| `a\|b` | a or b |

## Main functions

```python
import re

log = "2026-11-14 ERROR db timeout | 2026-11-15 INFO ok | 2026-11-16 ERROR disk"
print(re.findall(r"(\d{4}-\d{2}-\d{2}) ERROR (\w+)", log))   # groups -> tuples
m = re.search(r"INFO (\w+)", log)
print(m.group(0), m.group(1), m.start())
print(re.sub(r"\d{4}-\d{2}-\d{2}", "<date>", log))
print(re.split(r"\s*\|\s*", log))
print(bool(re.fullmatch(r"[A-Z]{5}\d{4}[A-Z]", "ABCDE1234F")))   # PAN format
```

- `search` finds the first match anywhere; `match` only at the start; `fullmatch` requires the whole string to match.
- `findall` returns all matches (or tuples of groups).
- `sub` replaces; `split` splits on a pattern.

## Named groups and flags

```python
import re

pattern = re.compile(r"(?P<user>[\w.+-]+)@(?P<domain>[\w-]+\.[\w.]+)", re.IGNORECASE)
for m in pattern.finditer("Mail Jerry@Example.com or help@pypath.dev"):
    print(m.group("user"), "at", m.group("domain").lower())
```

`re.compile` is worthwhile when a pattern is reused many times.

> [!TIP]
> Regexes are powerful but hard to read. If plain string methods (`split`, `startswith`, `in`) can do the job, use those. And never parse HTML with regex; use an HTML parser.
