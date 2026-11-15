---
title: Graphs and heaps
minutes: 15
---
A **graph** is nodes connected by edges: cities and roads, users and follows, tasks and dependencies, cells in a grid. Recognising a problem as a graph is half the solution.

## Representation

Use an **adjacency list**, a dict from each node to its neighbours:

```python
from collections import defaultdict

edges = [("A", "B"), ("A", "C"), ("B", "D"), ("C", "D"), ("D", "E")]
graph = defaultdict(list)
for u, v in edges:
    graph[u].append(v)
    graph[v].append(u)        # omit for a directed graph
print(dict(graph))
```

## BFS: shortest path in an unweighted graph

Breadth-first search explores in rings of distance 1, 2, 3…, so the first time it reaches a node is via a shortest path.

```python
from collections import deque

def shortest_path_len(graph, start, goal):
    q = deque([(start, 0)])
    seen = {start}
    while q:
        node, dist = q.popleft()
        if node == goal:
            return dist
        for nb in graph[node]:
            if nb not in seen:
                seen.add(nb)
                q.append((nb, dist + 1))
    return -1

graph = {"A": ["B", "C"], "B": ["A", "D"], "C": ["A", "D"], "D": ["B", "C", "E"], "E": ["D"]}
print(shortest_path_len(graph, "A", "E"))
```

Mark nodes as seen **when you enqueue them**, not when you dequeue, or the same node can be added many times.

## DFS: explore everything reachable

Counting connected regions ("number of islands") is DFS on a grid, where each cell's neighbours are up, down, left and right:

```python
def count_islands(grid):
    rows, cols = len(grid), len(grid[0]) if grid else 0
    seen = set()

    def sink(r, c):
        stack = [(r, c)]
        while stack:
            r, c = stack.pop()
            if (r, c) in seen or not (0 <= r < rows and 0 <= c < cols) or grid[r][c] != "1":
                continue
            seen.add((r, c))
            stack.extend([(r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)])

    count = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1" and (r, c) not in seen:
                sink(r, c)
                count += 1
    return count

print(count_islands(["11000", "11000", "00100", "00011"]))
```

## Topological sort

For **dependencies** (course prerequisites, build steps), repeatedly take nodes with no remaining prerequisites (Kahn's algorithm). If some nodes are never taken, there's a cycle.

## Heaps

A heap gives O(1) access to the smallest item, with O(log n) push and pop. Python's `heapq` works on a plain list as a **min-heap**:

```python
import heapq

nums = [5, 1, 8, 3, 9, 2]
print(heapq.nsmallest(3, nums), heapq.nlargest(2, nums))

top = []                                   # keep the k largest seen so far
for x in nums:
    heapq.heappush(top, x)
    if len(top) > 3:
        heapq.heappop(top)                 # drop the smallest
print(sorted(top, reverse=True), "-> 3rd largest is", top[0])
```

For a max-heap, push negated values: `heappush(h, -x)`. Push tuples `(priority, item)` to order by priority.

## Dijkstra: shortest path with weights

BFS assumes every edge costs 1. With weights, always expand the cheapest known node next, using a heap:

```python
import heapq

def dijkstra(graph, start):
    dist = {start: 0}
    heap = [(0, start)]
    while heap:
        d, node = heapq.heappop(heap)
        if d > dist.get(node, float("inf")):
            continue
        for nb, w in graph.get(node, []):
            nd = d + w
            if nd < dist.get(nb, float("inf")):
                dist[nb] = nd
                heapq.heappush(heap, (nd, nb))
    return dist

roads = {"Kochi": [("Thrissur", 80), ("Kottayam", 65)], "Thrissur": [("Palakkad", 70)], "Kottayam": [("Palakkad", 160)]}
print(dijkstra(roads, "Kochi"))
```
