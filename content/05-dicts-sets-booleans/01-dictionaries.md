---
title: Dictionaries
minutes: 9
---
A dictionary maps **keys** to **values**. Lookups by key are fast no matter how big the dict gets. If you know JavaScript objects or JSON, you already know the shape.

```python
user = {"name": "Jerry", "city": "Bengaluru", "skills": ["TypeScript", "SQL"]}
print(user["name"])
user["role"] = "Full-stack developer"   # add or update
user["skills"].append("Python")
print(user)
```

Keys must be hashable (strings, numbers, tuples). Values can be anything, including other dicts.

## Safe access

`user["age"]` raises `KeyError` if the key is missing. `get` returns a default instead:

```python
user = {"name": "Jerry"}
print(user.get("age"))          # None
print(user.get("age", "unknown"))
print("name" in user)           # membership checks keys
```

## Removing

```python
cart = {"apple": 3, "milk": 1, "bread": 2}
del cart["milk"]
qty = cart.pop("bread")        # remove and return
print(cart, qty)
```

## Looping

```python
prices = {"coffee": 180, "tea": 60, "cake": 220}
for item in prices:                 # keys
    print(item)
for item, price in prices.items():  # key/value pairs
    print(f"{item}: ₹{price}")
print(list(prices.values()), sum(prices.values()))
```

Dicts remember insertion order (guaranteed since Python 3.7).

## The counting pattern

Counting things is one of the most common jobs a dict does:

```python
votes = ["py", "js", "py", "go", "py", "js"]
counts = {}
for v in votes:
    counts[v] = counts.get(v, 0) + 1
print(counts)
```

## Nesting and merging

```python
config = {"db": {"host": "localhost", "port": 5432}}
print(config["db"]["port"])
defaults = {"theme": "dark", "lang": "en"}
mine = {"lang": "ml"}
print(defaults | mine)          # later keys win (Python 3.9+)
```
