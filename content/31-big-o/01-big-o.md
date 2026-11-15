---
title: Big-O in practice
minutes: 12
---
Big-O describes how an algorithm's running time (or memory) **grows** as the input size `n` grows, ignoring constants. Interviewers expect you to state it for every solution.

| Big-O | Name | Example | n = 1,000,000 |
| --- | --- | --- | --- |
| O(1) | constant | dict lookup | instant |
| O(log n) | logarithmic | binary search | ~20 steps |
| O(n) | linear | one loop over the list | 1M steps |
| O(n log n) | linearithmic | `sorted()` | ~20M steps |
| O(n²) | quadratic | nested loops over the list | 10¹² steps: **too slow** |
| O(2ⁿ) | exponential | all subsets | impossible beyond n ≈ 30 |

## What Python's built-ins cost

| Operation | list | dict / set |
| --- | --- | --- |
| index `x[i]` / lookup `d[k]` | O(1) | O(1) average |
| `x in container` | **O(n)** | **O(1)** average |
| append / add | O(1) amortised | O(1) |
| insert or pop at the **front** | **O(n)** (use `deque`) | n/a |
| pop from the end | O(1) | n/a |
| sort | O(n log n) | n/a |
| slice `x[a:b]` | O(b − a), it copies | n/a |
| `min`, `max`, `sum` | O(n) | O(n) |

String concatenation in a loop (`s += piece`) can degrade to O(n²); build a list and `"".join` it.

## Analysing code

```python
def has_duplicate_slow(nums):          # O(n²) time, O(1) extra space
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] == nums[j]:
                return True
    return False

def has_duplicate_fast(nums):          # O(n) time, O(n) space
    seen = set()
    for x in nums:
        if x in seen:
            return True
        seen.add(x)
    return False

import time
data = list(range(5_000))
for fn in (has_duplicate_slow, has_duplicate_fast):
    t = time.perf_counter(); fn(data); print(fn.__name__, f"{time.perf_counter() - t:.4f}s")
```

Trading memory for speed (a set, a dict, a cache) is the most common interview optimisation.

## Rules of thumb

- Sequential steps **add**: O(n) + O(n log n) = O(n log n), since the biggest term wins.
- Nested loops **multiply**: a loop inside a loop over the same data is O(n²).
- Halving the problem each step gives O(log n).
- Recursion: (number of calls) × (work per call). Naive Fibonacci makes ~2ⁿ calls.
- **Space** counts the extra memory you allocate, plus the recursion stack depth.

## How to talk about it in an interview

1. Say the brute force and its complexity first.
2. Identify the bottleneck ("the inner loop is a search, so let's make it O(1) with a set").
3. State the final time **and** space complexity, and mention trade-offs.
