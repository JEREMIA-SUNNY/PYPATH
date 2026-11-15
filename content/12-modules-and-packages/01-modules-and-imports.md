---
title: Modules and imports
minutes: 8
---
A **module** is just a `.py` file. A **package** is a folder of modules (traditionally with an `__init__.py`). Importing lets you use code from other files, the standard library, and installed packages.

## Import styles

```python
import math
print(math.sqrt(16), math.pi)

from math import floor, ceil
print(floor(2.7), ceil(2.1))

import statistics as stats
print(stats.mean([2, 4, 9]))

from datetime import date
print(date.today().year)
```

Prefer `import module` or `from module import name`. Avoid `from module import *`: it dumps every name into your file and hides where things came from.

## Your own modules

Given two files in the same folder:

```py
# pricing.py
GST = 0.18

def with_gst(amount):
    return round(amount * (1 + GST), 2)
```

```py
# app.py
from pricing import with_gst
print(with_gst(1000))
```

Running `python app.py` prints `1180.0`. Python finds `pricing.py` because the script's folder is on the import path (`sys.path`).

## Packages

```text
shop/
├── __init__.py
├── pricing.py
└── cart.py
```

Then `from shop.pricing import with_gst`. Inside the package, modules can use relative imports: `from .pricing import with_gst`.

## `if __name__ == "__main__":`

Every module has a `__name__`. When you run a file directly it's `"__main__"`; when it's imported, it's the module's name. This guard lets one file be both a reusable module and a runnable script:

```python
def main():
    print("running as a script")

if __name__ == "__main__":
    main()
```

## The standard library

Python ships with modules for almost everything: `json`, `csv`, `datetime`, `pathlib`, `re`, `random`, `collections`, `itertools`, `http`, `sqlite3`, `unittest`, `logging`… Check the standard library before installing a package.
