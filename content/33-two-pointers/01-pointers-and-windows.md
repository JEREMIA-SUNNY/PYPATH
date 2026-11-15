---
title: Two pointers and sliding windows
minutes: 12
---
Both patterns replace nested loops with indexes that only move forward, so each element is visited a constant number of times: **O(n)**.

## Two pointers from both ends

Works on **sorted** arrays and on symmetric checks like palindromes. Move whichever pointer can improve the answer.

```python
def pair_with_sum(sorted_nums, target):
    lo, hi = 0, len(sorted_nums) - 1
    while lo < hi:
        s = sorted_nums[lo] + sorted_nums[hi]
        if s == target:
            return sorted_nums[lo], sorted_nums[hi]
        if s < target:
            lo += 1              # need a bigger sum
        else:
            hi -= 1              # need a smaller sum
    return None

print(pair_with_sum([1, 3, 4, 6, 9, 11], 13))
```

Palindrome check, skipping non-letters:

```python
def is_palindrome(s):
    i, j = 0, len(s) - 1
    while i < j:
        if not s[i].isalnum():
            i += 1
        elif not s[j].isalnum():
            j -= 1
        elif s[i].lower() != s[j].lower():
            return False
        else:
            i, j = i + 1, j - 1
    return True

print(is_palindrome("A man, a plan, a canal: Panama"))
```

## Fast and slow pointers

Two pointers moving in the same direction at different speeds: removing duplicates in place, or detecting cycles in linked lists (next modules).

## Sliding window

For **contiguous** subarrays or substrings. Keep a window `[left, right]`, expand `right` every step, and shrink `left` while the window breaks a rule.

Fixed-size window (max sum of any k consecutive elements):

```python
def max_window_sum(nums, k):
    window = sum(nums[:k])
    best = window
    for right in range(k, len(nums)):
        window += nums[right] - nums[right - k]     # slide: add new, drop old
        best = max(best, window)
    return best

print(max_window_sum([2, 1, 5, 1, 3, 2], 3))
```

Variable-size window (longest substring with no repeated characters):

```python
def longest_unique(s):
    last_seen = {}
    left = best = 0
    for right, ch in enumerate(s):
        if ch in last_seen and last_seen[ch] >= left:
            left = last_seen[ch] + 1                 # shrink past the duplicate
        last_seen[ch] = right
        best = max(best, right - left + 1)
    return best

print(longest_unique("abcabcbb"), longest_unique("pwwkew"))
```

## Spotting the pattern

| Clue in the problem | Pattern |
| --- | --- |
| sorted array, find a pair or triplet | two pointers from both ends |
| palindrome, reverse in place | two pointers from both ends |
| longest/shortest **contiguous** subarray or substring meeting a condition | sliding window |
| "at most k distinct", "no repeats", "sum ≥ target" | variable sliding window with a dict or counter |
