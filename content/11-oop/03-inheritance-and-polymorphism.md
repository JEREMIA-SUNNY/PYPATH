---
title: Inheritance and polymorphism
minutes: 9
---
**Inheritance** lets a class reuse and extend another. The child gets all the parent's methods and can override or add to them.

```python
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return "..."

    def introduce(self):
        return f"I am {self.name}. {self.speak()}"

class Dog(Animal):
    def speak(self):
        return "Woof!"

class Cat(Animal):
    def speak(self):
        return "Meow."

for pet in [Dog("Rex"), Cat("Tom"), Animal("Blob")]:
    print(pet.introduce())
```

`introduce` lives only in `Animal`, yet each object calls its **own** `speak`. That's **polymorphism**: the same call does the right thing for each type.

## super()

Use `super()` to call the parent's version of a method, most often in `__init__`:

```python
class Account:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

class SavingsAccount(Account):
    def __init__(self, owner, balance=0, rate=0.04):
        super().__init__(owner, balance)
        self.rate = rate

    def add_interest(self):
        self.balance += self.balance * self.rate

s = SavingsAccount("Ana", 1000)
s.add_interest()
print(s.owner, s.balance)
```

## isinstance and duck typing

```python
class Account: pass
class SavingsAccount(Account): pass

s = SavingsAccount()
print(isinstance(s, SavingsAccount), isinstance(s, Account), isinstance(s, str))
```

Python code often doesn't check types at all. If an object has the method you need, you just call it: "if it walks like a duck and quacks like a duck, it's a duck." Any object with a `.speak()` method would work in the pet loop above, related or not.

## Composition over inheritance

Inheritance models "is a" (a `Dog` is an `Animal`). Often "has a" is a better fit: a `Car` *has* an `Engine`, so give it an `engine` attribute rather than inheriting from `Engine`. Keep inheritance hierarchies shallow.
