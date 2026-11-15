---
title: if, elif, else and match
minutes: 8
---
`if` runs a block only when its condition is truthy. `elif` (else-if) checks further conditions in order; `else` catches everything left. Only the **first** matching branch runs.

```python
temp = 31
if temp >= 35:
    print("Heatwave, stay inside")
elif temp >= 28:
    print("Hot, carry water")
elif temp >= 18:
    print("Pleasant")
else:
    print("Grab a jacket")
```

The colon and the indentation are required. An empty branch needs `pass`.

## Conditional expressions

For simple either/or values, use the one-line form `a if condition else b`:

```python
stock = 0
label = "In stock" if stock > 0 else "Sold out"
print(label)
```

## Guard clauses

Deeply nested `if`s are hard to read. Inside functions, handle the special cases first and return early:

```python
def shipping_cost(total, is_member):
    if is_member:
        return 0
    if total >= 500:
        return 0
    return 40

print(shipping_cost(350, False), shipping_cost(350, True))
```

## match (Python 3.10+)

`match` compares a value against patterns. It's more powerful than a JavaScript `switch`: it can unpack sequences and dicts.

```python
def describe(command):
    match command.split():
        case ["go", direction]:
            return f"Moving {direction}"
        case ["take", item]:
            return f"Picked up {item}"
        case ["quit" | "exit"]:
            return "Bye"
        case _:
            return "Unknown command"

print(describe("go north"))
print(describe("take lamp"))
print(describe("exit"))
print(describe("dance"))
```

`case _:` is the catch-all. For simple value checks, a plain `if/elif` chain is still perfectly fine.
