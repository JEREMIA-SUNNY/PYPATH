---
title: Decorators
minutes: 10
---
A decorator is a function that takes a function and returns a new function that usually adds some behaviour before and/or after calling the original.

```python
def announce(func):
    def wrapper(*args, **kwargs):
        print(f"calling {func.__name__}{args}")
        result = func(*args, **kwargs)
        print(f"{func.__name__} returned {result}")
        return result
    return wrapper

@announce
def add(a, b):
    return a + b

add(2, 3)
```

The `@announce` line is shorthand for `add = announce(add)`. `*args, **kwargs` let the wrapper accept any arguments and pass them through unchanged.

## Keep the metadata: functools.wraps

Without help, the wrapped function's name and docstring become the wrapper's. `functools.wraps` copies them over. Always use it:

```python
import functools
import time

def timed(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        try:
            return func(*args, **kwargs)
        finally:
            ms = (time.perf_counter() - start) * 1000
            print(f"{func.__name__} took {ms:.2f} ms")
    return wrapper

@timed
def slow_sum(n):
    """Add up 0..n-1 the slow way."""
    return sum(range(n))

print(slow_sum(1_000_000), slow_sum.__name__, slow_sum.__doc__)
```

## Decorators with arguments

To configure a decorator, add one more layer: a function that returns the decorator.

```python
import functools

def retry(times):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return func(*args, **kwargs)
                except ConnectionError as e:
                    print(f"attempt {attempt} failed: {e}")
            raise ConnectionError(f"gave up after {times} attempts")
        return wrapper
    return decorator

calls = {"n": 0}

@retry(times=3)
def flaky():
    calls["n"] += 1
    if calls["n"] < 3:
        raise ConnectionError("timeout")
    return "ok"

print(flaky())
```

## Decorators you'll meet

- `@property`, `@classmethod`, `@staticmethod` (built in)
- `@functools.lru_cache` / `@functools.cache` for memoisation
- `@app.get("/users")` in FastAPI and `@pytest.fixture` in pytest register functions with a framework

```python
from functools import cache

@cache
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(80))
```
