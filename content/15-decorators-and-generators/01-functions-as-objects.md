---
title: Functions as objects and closures
minutes: 7
---
In Python, a function is an ordinary object. You can assign it, store it in a list or dict, pass it as an argument and return it from another function.

```python
def shout(text):
    return text.upper() + "!"

yell = shout                  # no parentheses: the function itself
print(yell("hi"), yell.__name__)

handlers = {"upper": str.upper, "title": str.title, "shout": shout}
for name, fn in handlers.items():
    print(name, "->", fn("python rocks"))
```

## Returning functions

A function defined inside another function can use the outer function's variables. When the inner function is returned, it **keeps** those variables alive. That's a **closure**.

```python
def make_multiplier(factor):
    def multiply(n):
        return n * factor
    return multiply

double = make_multiplier(2)
triple = make_multiplier(3)
print(double(10), triple(10))
```

`double` and `triple` are two functions with the same code but different remembered `factor`s.

## Why this matters

Closures let you build configured behaviour without a class:

```python
def make_formatter(currency):
    symbol = {"INR": "₹", "USD": "$", "EUR": "€"}[currency]
    def fmt(amount):
        return f"{symbol}{amount:,.2f}"
    return fmt

inr = make_formatter("INR")
print(inr(1234567.891))
```

And they're the building block of **decorators**, which wrap one function inside another. That's next.
