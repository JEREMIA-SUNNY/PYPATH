---
title: math, statistics, random and decimal
minutes: 7
---
## math

```python
import math

print(math.sqrt(2), math.floor(2.7), math.ceil(2.1))
print(math.pi, math.e, math.inf)
print(math.gcd(84, 36), math.factorial(6), math.comb(5, 2))
print(math.isclose(0.1 + 0.2, 0.3))     # the right way to compare floats
print(math.hypot(3, 4), math.log10(1000))
```

## statistics

```python
import statistics as st

scores = [72, 85, 90, 66, 85, 99]
print(st.mean(scores), st.median(scores), st.mode(scores))
print(round(st.stdev(scores), 2))
```

## random

```python
import random

rng = random.Random(42)        # seeded generator: repeatable
print(rng.randint(1, 6), rng.random(), rng.uniform(1.5, 2.5))
print(rng.choice(["heads", "tails"]), rng.sample(range(100), 3))
items = list("ABCDE")
rng.shuffle(items)
print(items, rng.choices(["win", "lose"], weights=[1, 9], k=5))
```

> [!WARNING]
> `random` is for simulations and games, not security. For passwords, tokens and OTPs use the `secrets` module: `secrets.token_urlsafe(16)`.

## decimal for money

Floats can't represent most decimal fractions exactly. `Decimal` can:

```python
from decimal import Decimal, ROUND_HALF_UP

print(0.1 + 0.2)
print(Decimal("0.1") + Decimal("0.2"))
price = Decimal("199.995")
print(price.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
```

Create Decimals from **strings**, not floats: `Decimal(0.1)` captures the float's error.
