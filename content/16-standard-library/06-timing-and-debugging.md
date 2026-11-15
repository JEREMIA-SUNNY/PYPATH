---
title: Timing and debugging
minutes: 8
---
## Timing code

`time.perf_counter()` is a high-resolution clock for measuring how long something takes:

```python
import time

start = time.perf_counter()
total = sum(i * i for i in range(1_000_000))
print(f"took {time.perf_counter() - start:.3f}s")
```

For fair comparisons of small snippets, `timeit` runs them many times:

```python
import timeit

setup = "data = list(range(10_000)); s = set(data)"
print("list:", timeit.timeit("9999 in data", setup=setup, number=2000))
print("set: ", timeit.timeit("9999 in s", setup=setup, number=2000))
```

That's the list-versus-set membership difference from earlier, measured.

## Debugging with print and logging

`print` debugging works, but `logging` is better: it has levels, timestamps, and you can switch it off without deleting lines.

```python
import logging

logging.basicConfig(level=logging.DEBUG, format="%(levelname)s %(message)s", force=True)
log = logging.getLogger("shop")

def apply_discount(price, pct):
    log.debug("price=%s pct=%s", price, pct)
    if pct > 50:
        log.warning("unusually large discount: %s%%", pct)
    return price * (1 - pct / 100)

print(apply_discount(1000, 60))
```

Levels in order: `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`.

## The debugger: breakpoint()

Put `breakpoint()` on a line and run the script in a terminal. Execution pauses there and you get the `pdb` prompt:

```py
def total(items):
    subtotal = sum(i["price"] * i["qty"] for i in items)
    breakpoint()          # pauses here
    return subtotal * 1.18
```

| pdb command | Does |
| --- | --- |
| `p expr` | print a value |
| `n` | next line |
| `s` | step into a function call |
| `c` | continue to the next breakpoint |
| `l` | show surrounding code |
| `q` | quit |

VS Code's debugger gives you the same thing with a GUI: click in the gutter to set a breakpoint, press F5, and inspect variables in the sidebar. Learn it early; it pays off every day.
