---
title: Logging like a professional
minutes: 8
---
`print` is for users. **Logs** are for operators: they have levels, timestamps and a source, and can be routed to files or monitoring tools without touching code.

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(name)s: %(message)s",
    datefmt="%H:%M:%S",
    force=True,
)
log = logging.getLogger("orders")

def place_order(order_id, qty):
    log.info("placing order %s qty=%d", order_id, qty)
    if qty > 100:
        log.warning("large order %s", order_id)
    try:
        1 / (qty - qty)
    except ZeroDivisionError:
        log.exception("pricing failed for %s", order_id)   # includes the traceback

place_order("A-17", 120)
```

## Rules of thumb

- Create one logger per module: `log = logging.getLogger(__name__)`.
- Configure logging **once**, at the entry point (`main.py`), never in library code.
- Use `%s` placeholders, not f-strings, in log calls: the formatting is skipped if the level is disabled.
- `log.exception(...)` inside an `except` block records the full traceback.
- Never log secrets, passwords, tokens or full card numbers.

| Level | Use for |
| --- | --- |
| DEBUG | detail useful only while diagnosing |
| INFO | normal milestones ("server started", "job finished in 3.2s") |
| WARNING | something unexpected but handled |
| ERROR | an operation failed |
| CRITICAL | the app can't continue |

## Logging to a file

```py
handler = logging.FileHandler("app.log", encoding="utf-8")
handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
logging.getLogger().addHandler(handler)
```

In production, apps often log **JSON lines** to stdout, and the platform (Docker, Kubernetes, a cloud service) collects them.

## Debugging workflow

1. Reproduce the bug reliably, ideally as a failing test.
2. Read the traceback bottom-up; jump to the first line that's **your** code.
3. Set a breakpoint (VS Code gutter or `breakpoint()`), inspect variables, step.
4. Fix, then keep the test so the bug can't come back.
