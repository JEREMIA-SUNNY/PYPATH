---
title: enumerate, zip and friends
minutes: 7
---
Python has built-ins that remove most of the index-juggling you'd do in other languages.

## enumerate: index and item together

```python
tasks = ["write tests", "fix bug", "deploy"]
for i, task in enumerate(tasks, start=1):
    print(f"{i}. {task}")
```

Instead of `for i in range(len(tasks))`, reach for `enumerate`.

## zip: walk several sequences in step

```python
names = ["Ana", "Bo", "Cy"]
scores = [88, 92, 79]
for name, score in zip(names, scores):
    print(name, score)
print(dict(zip(names, scores)))
```

`zip` stops at the shortest input. Pass `strict=True` to raise an error if the lengths differ.

## Aggregates

```python
nums = [4, 8, 15, 16, 23, 42]
print(sum(nums), min(nums), max(nums), len(nums))
print(any(n > 40 for n in nums), all(n > 0 for n in nums))
print(sorted(nums, reverse=True)[:3])
print(list(reversed(nums)))
```

`any` and `all` answer "does at least one / does every item satisfy this?" and stop early.

## Random numbers

```python
import random

random.seed(1)                  # same results every run, good for tests
print(random.randint(1, 6))     # inclusive at both ends
print(random.choice(["rock", "paper", "scissors"]))
deck = list(range(1, 11))
random.shuffle(deck)
print(deck, random.sample(deck, 3))
```

## Reading user input

`input(prompt)` waits for the user to type a line and returns it as a **string**:

```py
age = int(input("Your age: "))
```

In PyPath, put input values in the **Input** box below the editor, one per line.
