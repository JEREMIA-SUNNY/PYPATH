---
title: Scope and the LEGB rule
minutes: 7
---
**Scope** decides where a name is visible. When Python looks up a name, it searches four places in order, known as **LEGB**:

1. **Local**: names assigned inside the current function
2. **Enclosing**: names in any outer function (for nested functions)
3. **Global**: names at the top level of the module
4. **Built-in**: names like `print`, `len`, `range`

```python
x = "global"

def outer():
    x = "enclosing"
    def inner():
        x = "local"
        print(x)
    inner()
    print(x)

outer()
print(x)
```

## Assignment creates a local

Assigning to a name anywhere inside a function makes it local for the **whole** function:

```python
count = 0

def bump():
    try:
        count += 1        # UnboundLocalError: count is local here
    except UnboundLocalError as e:
        print("Error:", e)

bump()
```

## global and nonlocal

You *can* rebind outer names, but use this sparingly. Passing values in and returning results is almost always clearer.

```python
count = 0

def bump():
    global count
    count += 1

bump(); bump()
print(count)

def make_counter():
    n = 0
    def increment():
        nonlocal n
        n += 1
        return n
    return increment

counter = make_counter()
print(counter(), counter(), counter())
```

`make_counter` returns a function that remembers `n` even after `make_counter` has finished. That's a **closure**, and it's the key idea behind decorators.

> [!TIP]
> Don't name variables after built-ins. `list = [1, 2]` hides the built-in `list()` for the rest of that scope, which causes confusing errors later.
