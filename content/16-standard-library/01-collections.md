---
title: collections
minutes: 8
---
The `collections` module has specialised containers that replace a lot of hand-written dict code.

## Counter

Counts hashable things and finds the most common ones:

```python
from collections import Counter

words = "the quick brown fox jumps over the lazy dog the end".split()
c = Counter(words)
print(c["the"], c["cat"])          # missing keys count as 0
print(c.most_common(2))
print(Counter("mississippi"))
```

## defaultdict

A dict that creates a default value for missing keys. Perfect for grouping:

```python
from collections import defaultdict

orders = [("ana", "tea"), ("bo", "coffee"), ("ana", "cake")]
by_customer = defaultdict(list)
for name, item in orders:
    by_customer[name].append(item)     # no KeyError, no setdefault
print(dict(by_customer))
```

`defaultdict(int)` gives you a counter; `defaultdict(set)` collects unique values.

## namedtuple

A tuple with named fields: lightweight, immutable records.

```python
from collections import namedtuple

Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
print(p.x, p[1], p)
x, y = p
```

For records with defaults, methods or type hints, prefer a `dataclass` (covered in *Modern Python*).

## deque

A double-ended queue: fast appends and pops from **both** ends (a list is slow at the front).

```python
from collections import deque

recent = deque(maxlen=3)          # keeps only the last 3
for page in ["home", "docs", "blog", "about"]:
    recent.append(page)
print(recent)
q = deque([1, 2, 3])
q.appendleft(0)
print(q.popleft(), q.pop(), q)
```

You'll use `deque` as the queue in breadth-first search in Interview Prep.
