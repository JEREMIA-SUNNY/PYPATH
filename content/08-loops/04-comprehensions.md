---
title: Comprehensions
minutes: 8
---
A comprehension builds a new collection from an iterable in a single readable expression. This loop:

```python
squares = []
for n in range(1, 6):
    squares.append(n * n)
print(squares)
```

becomes:

```python
squares = [n * n for n in range(1, 6)]
print(squares)
```

Read it as "**n squared, for each n in the range**".

## Filtering

Add an `if` at the end to keep only some items:

```python
words = ["api", "Python", "sql", "Django", "git"]
caps = [w for w in words if w[0].isupper()]
lengths = [len(w) for w in words if len(w) > 3]
print(caps, lengths)
```

To transform conditionally (not filter), put the conditional expression at the front:

```python
labels = ["even" if n % 2 == 0 else "odd" for n in range(5)]
print(labels)
```

## Dict and set comprehensions

```python
prices = {"tea": 60, "coffee": 180, "cake": 220}
with_tax = {item: round(p * 1.18) for item, p in prices.items()}
cheap = {item for item, p in prices.items() if p < 100}
print(with_tax, cheap)
```

## Generator expressions

Use parentheses instead of brackets and you get a lazy generator. Pass it straight into functions like `sum` without building a list in memory:

```python
print(sum(n * n for n in range(1_000_000)))
```

## Keep them readable

Comprehensions are great for one transform plus an optional filter. If you need nested loops with several conditions, or side effects like printing, a normal `for` loop is clearer.
