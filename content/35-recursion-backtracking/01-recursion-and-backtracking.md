---
title: Recursion and backtracking
minutes: 12
---
## Recursion

A recursive function solves a problem by calling itself on a **smaller** version of it. Every recursive function needs:

1. A **base case** that returns without recursing.
2. A **recursive case** that moves toward the base case.

```python
def total(nums):
    if not nums:                 # base case
        return 0
    return nums[0] + total(nums[1:])

def flatten(items):
    out = []
    for x in items:
        if isinstance(x, list):
            out.extend(flatten(x))     # same problem, smaller input
        else:
            out.append(x)
    return out

print(total([3, 4, 5]), flatten([1, [2, [3, [4]], 5]]))
```

Each call sits on the **call stack** until it returns. Python limits depth to about 1000, so very deep recursion needs an iterative version (or `sys.setrecursionlimit`, carefully).

## Memoisation

When recursive calls repeat the same subproblems, cache them. That's the bridge to dynamic programming:

```python
from functools import cache

@cache
def ways_to_climb(n):
    if n <= 1:
        return 1
    return ways_to_climb(n - 1) + ways_to_climb(n - 2)

print(ways_to_climb(50))
```

## Backtracking

Backtracking builds candidates one choice at a time and **undoes** each choice after exploring it. It's how you generate subsets, permutations and combinations, or solve puzzles like Sudoku and N-Queens.

The template:

```python
def subsets(nums):
    result, path = [], []

    def backtrack(start):
        result.append(path[:])            # record a copy of the current choice
        for i in range(start, len(nums)):
            path.append(nums[i])          # choose
            backtrack(i + 1)              # explore
            path.pop()                    # un-choose

    backtrack(0)
    return result

print(subsets([1, 2, 3]))
```

Permutations use a "used" set instead of a start index:

```python
def permutations(items):
    result, path, used = [], [], set()

    def backtrack():
        if len(path) == len(items):
            result.append(path[:])
            return
        for i, x in enumerate(items):
            if i in used:
                continue
            used.add(i); path.append(x)
            backtrack()
            path.pop(); used.remove(i)

    backtrack()
    return result

print(permutations("abc"))
```

## Pruning

Stop exploring a branch as soon as it can't lead to a valid answer (e.g. the running sum already exceeds the target). Pruning is what makes backtracking fast enough in practice.

## Complexity

Subsets: O(2ⁿ · n). Permutations: O(n! · n). Interviewers know these are exponential; they want to see the clean template and sensible pruning.

> [!WARNING]
> Append `path[:]` (a copy), not `path`. Otherwise every result is the same list object, which ends up empty after backtracking.
