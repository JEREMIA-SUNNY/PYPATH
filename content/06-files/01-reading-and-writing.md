---
title: Reading and writing files
minutes: 10
---
Programs need to save and load data. Python's built-in `open()` gives you a file object; the `with` statement makes sure it's closed even if something goes wrong.

```python
with open("notes.txt", "w", encoding="utf-8") as f:
    f.write("first line\n")
    f.write("second line\n")

with open("notes.txt", encoding="utf-8") as f:
    print(f.read())
```

> [!TIP]
> Always pass `encoding="utf-8"`. Without it, Windows may use a different default encoding, and text with ₹ or Malayalam characters can break.

## Modes

| Mode | Meaning |
| --- | --- |
| `"r"` | read (default); error if the file doesn't exist |
| `"w"` | write; **creates or empties** the file |
| `"a"` | append to the end; creates if needed |
| `"x"` | create; error if the file already exists |
| `"b"` | add to any mode for binary data, e.g. `"rb"` for images |

## Reading styles

```python
with open("lines.txt", "w", encoding="utf-8") as f:
    f.write("alpha\nbeta\ngamma\n")

with open("lines.txt", encoding="utf-8") as f:
    for line in f:                      # memory-friendly, one line at a time
        print(line.rstrip("\n"))

with open("lines.txt", encoding="utf-8") as f:
    print(f.readlines())                # list of lines, newlines included
```

Use `f.read()` for small files, a `for` loop for big ones. Lines keep their trailing `\n`, so `strip()` or `rstrip("\n")` them.

## Writing several lines

```python
names = ["Ana", "Bo", "Cy"]
with open("names.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(names) + "\n")
print(open("names.txt", encoding="utf-8").read())
```

## pathlib: paths as objects

`pathlib.Path` is the modern way to work with paths. It joins paths with `/` and works on every OS:

```python
from pathlib import Path

folder = Path("reports")
folder.mkdir(exist_ok=True)
report = folder / "summary.txt"
report.write_text("All good\n", encoding="utf-8")
print(report.exists(), report.name, report.suffix)
print(report.read_text(encoding="utf-8"))
```

## Handling missing files

```python
try:
    with open("missing.txt", encoding="utf-8") as f:
        data = f.read()
except FileNotFoundError:
    data = ""
print(repr(data))
```

You'll learn `try`/`except` properly in *Errors and Testing*.
