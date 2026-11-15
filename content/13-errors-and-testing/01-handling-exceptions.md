---
title: Handling exceptions
minutes: 9
---
When something goes wrong at runtime, Python **raises an exception**. If nothing handles it, the program stops and prints a traceback.

## Reading a traceback

Read it from the **bottom up**: the last line names the exception and message; the lines above show the chain of calls that led there, ending with the exact line that failed.

```python
def average(nums):
    return sum(nums) / len(nums)

try:
    average([])
except ZeroDivisionError as e:
    print("Caught:", type(e).__name__, "-", e)
```

Common exceptions: `ValueError` (right type, bad value: `int("abc")`), `TypeError` (wrong type: `"a" + 1`), `KeyError`, `IndexError`, `AttributeError`, `FileNotFoundError`, `ZeroDivisionError`.

## try / except / else / finally

```python
def parse_quantity(text):
    try:
        qty = int(text)
    except ValueError:
        print(f"{text!r} is not a whole number")
        return None
    else:
        print("parsed fine")       # runs only if no exception
        return qty
    finally:
        print("done checking")     # always runs

print(parse_quantity("3"))
print(parse_quantity("three"))
```

- Put only the risky line(s) inside `try`.
- Catch **specific** exceptions. A bare `except:` also catches `KeyboardInterrupt` and hides real bugs.
- `finally` is for cleanup that must happen no matter what (closing connections, releasing locks). A `with` block often does this for you.

## Catching several types

```python
def safe_get(data, key, index):
    try:
        return data[key][index]
    except (KeyError, IndexError):
        return None

print(safe_get({"a": [1, 2]}, "a", 5), safe_get({}, "x", 0), safe_get({"a": [9]}, "a", 0))
```

## EAFP vs LBYL

Python culture prefers **EAFP**: "easier to ask forgiveness than permission". Try the operation and handle failure, rather than checking every precondition first (**LBYL**, "look before you leap"). It's often shorter and avoids race conditions, for example a file being deleted between your `exists()` check and your `open()`.
