---
title: Stacks, queues and binary search
minutes: 13
---
## Stacks (last in, first out)

A Python list is a perfect stack: `append` to push, `pop` to pop, `stack[-1]` to peek, all O(1). Reach for a stack when the most recent unmatched item matters, as in brackets, undo, or parsing.

```python
def is_balanced(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in "([{":
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
    return not stack

print(is_balanced("{[()()]}"), is_balanced("(]"), is_balanced("(("))
```

## Monotonic stack: "next greater element"

Keep a stack of indices whose values are **decreasing**. When a bigger value arrives, it is the answer for everything smaller on the stack:

```python
def next_greater(nums):
    result = [-1] * len(nums)
    stack = []                                  # indices with no answer yet
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            result[stack.pop()] = x
        stack.append(i)
    return result

print(next_greater([2, 1, 2, 4, 3]))
```

Each index is pushed and popped once: O(n).

## Queues (first in, first out)

Use `collections.deque`: `append` and `popleft` are both O(1). (A list's `pop(0)` is O(n).) Queues power breadth-first search, coming up in *Graphs and Heaps*.

```python
from collections import deque
q = deque(["a", "b"])
q.append("c")
print(q.popleft(), q)
```

## Binary search

On **sorted** data, compare with the middle and discard half each step: O(log n).

```python
def binary_search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

print(binary_search([1, 3, 5, 7, 9, 11], 7), binary_search([1, 3, 5], 4))
```

The standard library's `bisect` module does this for you: `bisect_left(nums, x)` returns the leftmost index where `x` could be inserted while keeping the list sorted.

## Binary search on the answer

Many "find the minimum X such that…" problems have a yes/no check that flips from false to true exactly once as X grows. Binary-search **X**, not the array:

```python
import math

def min_speed(piles, hours):
    def can_finish(speed):
        return sum(math.ceil(p / speed) for p in piles) <= hours
    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        if can_finish(mid):
            hi = mid             # mid works; try slower
        else:
            lo = mid + 1         # too slow
    return lo

print(min_speed([3, 6, 7, 11], 8))
```

> [!TIP]
> Off-by-one errors are the classic binary search bug. Decide whether your range is inclusive (`lo <= hi`) or half-open (`lo < hi`), and check it on a 1- and 2-element input.
