---
title: Classes and objects
minutes: 9
---
A **class** is a blueprint; an **object** (instance) is one thing built from it. Classes bundle data (**attributes**) with the behaviour that works on it (**methods**).

```python
class Dog:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def bark(self):
        return f"{self.name} says woof"

rex = Dog("Rex", 3)
luna = Dog("Luna", 5)
print(rex.bark(), luna.age)
```

- `__init__` runs when you create an instance. It sets up the object's attributes.
- `self` is the instance the method was called on. Python passes it automatically: `rex.bark()` is really `Dog.bark(rex)`.
- Class names use `PascalCase`.

## Every instance has its own data

```python
class Counter:
    def __init__(self):
        self.count = 0

    def increment(self, by=1):
        self.count += by
        return self.count

a, b = Counter(), Counter()
a.increment(); a.increment(5)
print(a.count, b.count)
```

## Objects are everywhere

You've been using objects all along. `"text".upper()` calls the `upper` method on a `str` object; `[].append(1)` calls `append` on a `list`. Classes let you create your own types that work the same way.

## When to reach for a class

Use a class when you have **data plus the operations that belong to it**, especially when you'll have several instances: users, orders, cards, bank accounts. For a few related functions with no shared state, plain functions in a module are simpler, and that's perfectly Pythonic.

> [!NOTE]
> Coming from TypeScript: Python has no `private` keyword. A leading underscore (`self._balance`) is a convention meaning "internal, don't touch from outside".
