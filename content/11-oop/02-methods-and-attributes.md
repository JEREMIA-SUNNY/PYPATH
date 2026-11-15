---
title: Methods, class attributes and properties
minutes: 9
---
## Instance vs class attributes

Attributes set on `self` belong to one instance. Attributes defined in the class body are **shared** by all instances.

```python
class Employee:
    company = "Wysbryx"          # class attribute, shared
    raise_pct = 0.05

    def __init__(self, name, salary):
        self.name = name         # instance attributes
        self.salary = salary

    def apply_raise(self):
        self.salary = round(self.salary * (1 + self.raise_pct))

e = Employee("Ana", 100_000)
e.apply_raise()
print(e.name, e.company, e.salary)
```

## Properties: computed attributes

`@property` lets a method be read like an attribute. Use it for values derived from other data, or to validate on assignment:

```python
class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    @property
    def area(self):
        return self.width * self.height

    @property
    def width(self):
        return self._width

    @width.setter
    def width(self, value):
        if value <= 0:
            raise ValueError("width must be positive")
        self._width = value

r = Rectangle(3, 4)
print(r.area)        # no parentheses
r.width = 10
print(r.area)
```

## classmethod and staticmethod

- A `@classmethod` receives the class (`cls`) instead of an instance. It's ideal for alternative constructors.
- A `@staticmethod` receives neither; it's a plain function that lives in the class's namespace.

```python
class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius

    @classmethod
    def from_fahrenheit(cls, f):
        return cls((f - 32) * 5 / 9)

    @staticmethod
    def is_freezing(celsius):
        return celsius <= 0

t = Temperature.from_fahrenheit(212)
print(t.celsius, Temperature.is_freezing(-3))
```
