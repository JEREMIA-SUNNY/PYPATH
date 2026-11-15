---
title: Hash map patterns
minutes: 12
---
When a brute-force solution compares every pair (O(n²)), the fix is usually a **dict or set** that remembers what you've seen, turning an inner search into an O(1) lookup.

## Pattern 1: "seen" lookup (two sum)

Find two indices whose values add up to `target`. For each number, the partner you need is `target - x`. Check whether you've already seen it:

```python
def two_sum(nums, target):
    seen = {}                       # value -> index
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i
    return []

print(two_sum([2, 7, 11, 15], 9), two_sum([3, 2, 4], 6))
```

O(n) time, O(n) space, versus O(n²) for checking all pairs.

## Pattern 2: frequency counting

```python
from collections import Counter

def is_anagram(a, b):
    return Counter(a) == Counter(b)

def first_unique_char(s):
    counts = Counter(s)
    for i, ch in enumerate(s):
        if counts[ch] == 1:
            return i
    return -1

print(is_anagram("listen", "silent"), first_unique_char("leetcode"))
```

## Pattern 3: grouping by a canonical key

Map each item to a key that's equal for items that belong together:

```python
from collections import defaultdict

def group_by_signature(words):
    groups = defaultdict(list)
    for w in words:
        groups["".join(sorted(w))].append(w)      # anagrams share sorted letters
    return list(groups.values())

print(group_by_signature(["eat", "tea", "tan", "ate", "nat", "bat"]))
```

## Pattern 4: set for O(1) membership

Longest run of consecutive numbers in O(n): only start counting from numbers that begin a run (`x - 1` not in the set).

```python
def longest_run(nums):
    s = set(nums)
    best = 0
    for x in s:
        if x - 1 not in s:
            length = 1
            while x + length in s:
                length += 1
            best = max(best, length)
    return best

print(longest_run([100, 4, 200, 1, 3, 2]))
```

## Pattern 5: prefix sums

Precompute running totals so any range sum is O(1): `sum(nums[i:j]) == prefix[j] - prefix[i]`. Combined with a dict of prefix counts it solves "number of subarrays summing to k" in O(n).

## Checklist

- Is there a pairwise comparison I can replace with a lookup?
- What should the key be: the value, a sorted version, a count tuple, a prefix sum?
- State the trade-off: O(n) extra memory for O(n) time.
