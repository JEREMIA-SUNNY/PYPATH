---
title: Arguments, defaults, *args and **kwargs
minutes: 10
---
Python's argument system is flexible. Here are the forms you'll see, from most to least common.

## Positional and keyword arguments

```python
def book(flight, seat, meal):
    return f"{flight} seat {seat}, meal: {meal}"

print(book("AI-505", "12A", "veg"))                  # positional
print(book(meal="non-veg", flight="6E-21", seat="3C"))  # keyword, any order
```

Keyword arguments make calls self-documenting, especially for booleans: `send(report, urgent=True)` beats `send(report, True)`.

## Default values

```python
def power(base, exp=2):
    return base ** exp

print(power(5), power(2, 10))
```

> [!WARNING]
> Never use a mutable default like `def add(item, bucket=[])`. The list is created **once**, when the function is defined, and shared by every call. Use `None` and create it inside:

```python
def add(item, bucket=None):
    if bucket is None:
        bucket = []
    bucket.append(item)
    return bucket

print(add(1), add(2))
```

## *args: any number of positional arguments

```python
def total(*nums):
    print(type(nums))       # a tuple
    return sum(nums)

print(total(1, 2, 3), total())
```

## **kwargs: any number of keyword arguments

```python
def build_url(base, **params):
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return f"{base}?{query}" if query else base

print(build_url("/search", q="python", page=2))
```

## Unpacking into a call

The same `*` and `**` work in reverse when calling:

```python
point = (3, 4)
opts = {"sep": " | ", "end": "!\n"}
print(*point, **opts)
```

## Keyword-only arguments

Anything after a bare `*` must be passed by name:

```python
def connect(host, *, timeout=5, retries=3):
    return f"{host} t={timeout} r={retries}"

print(connect("db.local", retries=5))
```
