---
title: Testing your code
minutes: 9
---
Tests are code that checks other code. They catch regressions the moment you break something and let you refactor with confidence. Every PyPath exercise is graded by tests like these.

## assert

The simplest check. If the condition is false, it raises `AssertionError` with your message:

```python
def slugify(title):
    return "-".join(title.lower().split())

assert slugify("Hello World") == "hello-world"
assert slugify("  Many   spaces ") == "many-spaces", "should collapse whitespace"
print("all good")
```

## unittest (built in)

```python
import unittest

def is_even(n):
    return n % 2 == 0

class IsEvenTests(unittest.TestCase):
    def test_even(self):
        self.assertTrue(is_even(4))

    def test_odd(self):
        self.assertFalse(is_even(7))

    def test_zero(self):
        self.assertEqual(is_even(0), True)

    def test_type_error(self):
        with self.assertRaises(TypeError):
            is_even("4")

unittest.main(argv=["ignored"], exit=False, verbosity=2)
```

In a real project, tests live in a `tests/` folder in files named `test_*.py`, and you run them with `python -m unittest` from the project root.

## pytest

Most Python teams use **pytest**: plain functions and plain `assert`, with excellent failure messages.

```py
# test_slug.py
from slug import slugify

def test_basic():
    assert slugify("Hello World") == "hello-world"
```

```bash
pip install pytest
pytest -q
```

You'll go deeper (fixtures, parametrize, mocking) in the *Testing and Code Quality* career module.

## What to test

- The normal case.
- Edge cases: empty input, zero, one item, very large values, unicode.
- Error cases: the function raises the right exception for bad input.

Linters like **ruff** or **pylint** complement tests by catching unused variables, undefined names and style issues before you even run the code.
