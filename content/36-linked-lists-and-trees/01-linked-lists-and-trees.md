---
title: Linked lists and binary trees
minutes: 14
---
## Linked lists

Each node holds a value and a reference to the next node. Interview problems test whether you can rewire references without losing track.

```python
class ListNode:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next

def build(values):
    head = None
    for v in reversed(values):
        head = ListNode(v, head)
    return head

def to_list(head):
    out = []
    while head:
        out.append(head.val)
        head = head.next
    return out

def reverse(head):
    prev = None
    while head:
        head.next, prev, head = prev, head, head.next   # rewire, then advance
    return prev

print(to_list(reverse(build([1, 2, 3, 4]))))
```

Draw boxes and arrows on paper and update them one assignment at a time. That's how everyone gets these right.

### Fast and slow pointers

Move `slow` one step and `fast` two steps:

- When `fast` reaches the end, `slow` is at the **middle**.
- If there's a **cycle**, `fast` eventually laps `slow` and they meet (Floyd's algorithm).

```python
class ListNode:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def build(values):
    head = None
    for v in reversed(values):
        head = ListNode(v, head)
    return head

def middle(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    return slow.val

print(middle(build([1, 2, 3, 4, 5])))
```

A **dummy head** node (`dummy = ListNode(0, head)`) avoids special cases when the real head might change, for example when merging lists or removing the first node.

## Binary trees

Each node has up to two children. Most tree problems are solved with **recursion**: solve for the left and right subtrees, then combine.

```python
class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

#        4
#      /   \
#     2     7
#    / \     \
#   1   3     9
root = TreeNode(4, TreeNode(2, TreeNode(1), TreeNode(3)), TreeNode(7, None, TreeNode(9)))

def depth(node):
    if not node:
        return 0
    return 1 + max(depth(node.left), depth(node.right))

def inorder(node):
    return inorder(node.left) + [node.val] + inorder(node.right) if node else []

print(depth(root), inorder(root))
```

### DFS orders

- **Pre-order** (node, left, right): copying or serialising a tree.
- **In-order** (left, node, right): gives a **binary search tree** in sorted order.
- **Post-order** (left, right, node): computing from children up, e.g. heights and sizes.

### BFS: level by level

```python
from collections import deque

class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

root = TreeNode(4, TreeNode(2, TreeNode(1), TreeNode(3)), TreeNode(7, None, TreeNode(9)))

def levels(root):
    if not root:
        return []
    out, q = [], deque([root])
    while q:
        level = []
        for _ in range(len(q)):            # exactly the nodes on this level
            node = q.popleft()
            level.append(node.val)
            for child in (node.left, node.right):
                if child:
                    q.append(child)
        out.append(level)
    return out

print(levels(root))
```

### Binary search trees

In a BST, every value in a node's left subtree is smaller and every value in its right subtree is larger. Search, insert and delete are O(h), where h is the height: O(log n) if balanced, O(n) if it degenerates into a line.
