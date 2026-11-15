---
title: Lists
minutes: 9
---
A list is an ordered, **mutable** collection. It can hold any mix of types, though in practice lists usually hold one kind of thing.

```python
langs = ["Python", "TypeScript", "Go"]
print(langs[0], langs[-1], len(langs))
print(langs[1:])
langs[2] = "Rust"          # lists can change in place
print(langs)
```

Indexing and slicing work exactly like strings.

## Adding and removing

| Method | Effect |
| --- | --- |
| `append(x)` | add one item to the end |
| `extend(iterable)` | add every item from another collection |
| `insert(i, x)` | insert at position `i` |
| `pop()` / `pop(i)` | remove and **return** the last item / item at `i` |
| `remove(x)` | remove the first item equal to `x` (error if missing) |
| `clear()` | empty the list |

```python
stack = [1, 2]
stack.append(3)
stack.extend([4, 5])
last = stack.pop()
stack.insert(0, 0)
print(stack, last)
```

## Searching and sorting

```python
nums = [5, 2, 9, 2, 7]
print(2 in nums, nums.index(9), nums.count(2))
print(sorted(nums))        # new sorted list, original unchanged
nums.sort(reverse=True)    # sorts in place, returns None
print(nums, min(nums), max(nums), sum(nums))
```

> [!WARNING]
> `nums = nums.sort()` is a classic bug: `sort()` returns `None`, so you just lost your list. Use `nums.sort()` on its own line, or `nums = sorted(nums)`.

## Nested lists

```python
grid = [[1, 2, 3], [4, 5, 6]]
print(grid[1][2])
```

## Aliasing: two names, one list

Assignment never copies. Both names point at the same list object:

```python
a = [1, 2, 3]
b = a
b.append(4)
print(a)            # a changed too!
c = a.copy()        # or a[:] or list(a)
c.append(5)
print(a, c)
```

This matters when you pass lists into functions: the function can modify the caller's list.
