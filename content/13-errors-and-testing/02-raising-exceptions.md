---
title: Raising and defining exceptions
minutes: 7
---
Raise an exception when your function receives something it can't sensibly handle. It's far better than returning a magic value that the caller might forget to check.

```python
def set_age(age):
    if not isinstance(age, int):
        raise TypeError("age must be an int")
    if age < 0:
        raise ValueError(f"age can't be negative, got {age}")
    return age

for value in [29, -1, "x"]:
    try:
        print(set_age(value))
    except (TypeError, ValueError) as e:
        print(type(e).__name__, e)
```

## Custom exceptions

Define your own by subclassing `Exception`. Callers can then catch exactly your error, and the name documents what went wrong:

```python
class InsufficientFundsError(Exception):
    def __init__(self, balance, amount):
        super().__init__(f"tried to withdraw {amount} but balance is {balance}")
        self.balance = balance
        self.amount = amount

def withdraw(balance, amount):
    if amount > balance:
        raise InsufficientFundsError(balance, amount)
    return balance - amount

try:
    withdraw(100, 250)
except InsufficientFundsError as e:
    print("Declined:", e, "| short by", e.amount - e.balance)
```

For a library or app, create one base exception (`class AppError(Exception)`) and derive the specific ones from it, so callers can catch all of them at once.

## Re-raising and chaining

Sometimes you want to log an error and let it continue upward, or translate a low-level error into a domain one:

```python
import json

class ConfigError(Exception):
    pass

def load_config(text):
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        raise ConfigError("config file is not valid JSON") from e

try:
    load_config("{oops")
except ConfigError as e:
    print(e, "| caused by:", type(e.__cause__).__name__)
```

A bare `raise` inside an `except` block re-raises the current exception unchanged.
