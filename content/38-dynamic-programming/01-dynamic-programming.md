---
title: Dynamic programming, step by step
minutes: 15
---
Dynamic programming (DP) applies when a problem:

1. Can be broken into **subproblems** whose answers combine into the full answer, and
2. Those subproblems **overlap**: the same ones come up again and again.

Then you solve each subproblem **once** and reuse it.

## The recipe

1. **Define the state**: "`dp[i]` = the answer for the first `i` items" (or `dp[i][j]` for two inputs).
2. **Write the recurrence**: how `dp[i]` follows from smaller states.
3. **Base cases**: the smallest states you know directly.
4. **Order**: compute states so dependencies are ready (or recurse with memoisation).
5. **Answer**: which state holds the final result?

## Example: climbing stairs

You can climb 1 or 2 steps at a time. How many ways reach step n? To land on step n, your last move came from n-1 or n-2, so `ways(n) = ways(n-1) + ways(n-2)`.

Top-down (memoised recursion):

```python
from functools import cache

@cache
def ways(n):
    if n <= 1:
        return 1
    return ways(n - 1) + ways(n - 2)

print(ways(40))
```

Bottom-up (tabulation), with O(1) space since only the last two values matter:

```python
def ways_iter(n):
    a, b = 1, 1           # ways(0), ways(1)
    for _ in range(n - 1):
        a, b = b, a + b
    return b if n > 0 else 1

print(ways_iter(40))
```

Without caching, the recursion makes about 2ⁿ calls; with it, n.

## Example: coin change (minimum coins)

`dp[a]` = the fewest coins that make amount `a`. For each coin, `dp[a] = min(dp[a], dp[a - coin] + 1)`.

```python
def min_coins(coins, amount):
    INF = float("inf")
    dp = [0] + [INF] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and dp[a - c] + 1 < dp[a]:
                dp[a] = dp[a - c] + 1
    return dp[amount] if dp[amount] != INF else -1

print(min_coins([1, 5, 10, 20], 63), min_coins([2], 3))
```

Note that greedy (always take the biggest coin) fails for coins like `[1, 3, 4]` and amount 6: greedy gives 4+1+1, while DP finds 3+3.

## Example: two-string DP

The **longest common subsequence** of two strings uses a 2D table: `dp[i][j]` = the LCS length of `a[:i]` and `b[:j]`.

- If `a[i-1] == b[j-1]`: `dp[i][j] = dp[i-1][j-1] + 1`
- Otherwise: `dp[i][j] = max(dp[i-1][j], dp[i][j-1])`

The same shape solves edit distance (spell-checkers, diff tools).

## Spotting DP

Phrases like "number of ways", "minimum/maximum cost", "longest/shortest … subsequence", "can you reach / make…" combined with choices at each step. Start by writing the brute-force recursion, notice repeated arguments, then add a cache.
