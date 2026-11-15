---
title: Lambdas, map, filter and sort keys
minutes: 7
---
Functions are objects. You can store them in variables and pass them to other functions. A **lambda** is a tiny anonymous function written as a single expression:

```python
square = lambda x: x * x
print(square(7))
```

Lambdas shine as short arguments to other functions, not as named functions (use `def` for those).

## Sorting with a key

`sorted` and `list.sort` take a `key` function that says what to compare:

```python
people = [("Ana", 31), ("Bo", 25), ("Cy", 35)]
print(sorted(people, key=lambda p: p[1]))            # by age
print(sorted(people, key=lambda p: p[1], reverse=True))
words = ["banana", "Apple", "cherry"]
print(sorted(words, key=str.lower))                   # case-insensitive
print(max(words, key=len))
```

To sort by several things, return a tuple: `key=lambda p: (p.age, p.name)`.

## map and filter

`map` applies a function to every item; `filter` keeps items where the function returns truthy. Both are lazy, so wrap them in `list()` to see results.

```python
nums = [1, 2, 3, 4, 5, 6]
print(list(map(lambda n: n * 10, nums)))
print(list(filter(lambda n: n % 2 == 0, nums)))
print(list(map(str.upper, ["a", "b"])))
```

In modern Python, comprehensions are usually clearer than `map`/`filter` with a lambda:

```python
nums = [1, 2, 3, 4, 5, 6]
print([n * 10 for n in nums])
print([n for n in nums if n % 2 == 0])
```

## Functions that take functions

```python
def apply_twice(func, value):
    return func(func(value))

print(apply_twice(lambda s: s + "!", "hi"))
print(apply_twice(lambda n: n * 3, 2))
```

Functions that take or return other functions are called **higher-order functions**. They're the foundation of decorators, which you'll build later.
