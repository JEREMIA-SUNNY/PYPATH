---
title: Variables and types
minutes: 7
---
A variable is a **name that points to a value**. You create one by assigning to it; there's no `let`, `const` or type declaration.

```python
city = "Bengaluru"
population = 13_600_000   # underscores make big numbers readable
is_raining = False
print(city, population, is_raining)
```

## Naming rules

- Letters, digits and underscores; can't start with a digit.
- Case-sensitive: `total` and `Total` are different.
- Convention is `snake_case` for variables and functions, `UPPER_CASE` for constants.
- Don't shadow built-ins: avoid names like `list`, `str`, `sum`, `id`.

## Dynamic typing

The *value* has a type, not the name. The same name can point to different types over time (though doing that on purpose is usually confusing):

```python
x = 10
print(type(x))
x = "ten"
print(type(x))
```

## Reassignment and augmented assignment

```python
score = 10
score = score + 5
score += 5      # same as score = score + 5
score *= 2
print(score)
```

Python has no `++`. Use `count += 1`.

## Multiple assignment and swapping

```python
a, b = 1, 2
a, b = b, a     # swap without a temp variable
print(a, b)
```

## Converting between types

Input from users and files arrives as text. Convert it explicitly:

```python
age_text = "29"
age = int(age_text)
print(age + 1)
print(str(age) + " years")
print(float("2.5") * 2)
```

Mixing types without converting is an error: `"29" + 1` raises `TypeError`. Python won't guess what you meant, unlike JavaScript's `"29" + 1 === "291"`.

> [!NOTE]
> `None` is Python's "no value", like `null`. It's the only value of type `NoneType`.
