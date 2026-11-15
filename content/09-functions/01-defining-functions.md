---
title: Defining functions
minutes: 8
---
A function packages logic behind a name so you can reuse it, test it and reason about it in isolation.

```python
def greet(name):
    """Return a friendly greeting for name."""
    return f"Hello, {name}!"

message = greet("Jerry")
print(message)
print(greet.__doc__)
```

- `def` starts the definition; parameters go in parentheses.
- The triple-quoted string right under `def` is a **docstring**. Editors show it as help text.
- `return` sends a value back to the caller and ends the function immediately.

## No return means None

```python
def log(msg):
    print(f"[log] {msg}")

result = log("started")
print(result)
```

A very common bug is printing inside a function when the caller needed the value returned. Rule of thumb: **compute and return**; let the caller decide whether to print.

## Returning several values

Return a tuple and unpack it:

```python
def divide(a, b):
    return a // b, a % b

quotient, remainder = divide(17, 5)
print(quotient, remainder)
```

## Functions calling functions

Small functions that each do one thing compose well:

```python
def is_vowel(ch):
    return ch.lower() in "aeiou"

def count_vowels(text):
    return sum(1 for ch in text if is_vowel(ch))

print(count_vowels("Programming in Python"))
```

## Early return

Return as soon as you know the answer. It keeps nesting shallow:

```python
def first_negative(nums):
    for n in nums:
        if n < 0:
            return n
    return None

print(first_negative([3, 8, -2, -9]))
```
