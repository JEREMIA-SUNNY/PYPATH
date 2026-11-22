---
title: Orchestration and multi-agent patterns
minutes: 11
---
## Workflows vs agents

Not every problem needs an autonomous agent. Pick the simplest thing that works:

- **A single call:** one prompt, one answer.
- **A workflow:** your code fixes the steps (classify, then retrieve, then answer). Predictable, cheap and easy to test.
- **An agent:** the model chooses the steps. Flexible, but harder to test and more costly.

Most production systems are **workflows with a few agentic steps**. Reach for full autonomy only when the path genuinely cannot be known in advance.

## State graphs

A clean way to build non-trivial flows is a **graph**: **nodes** are steps (a function that reads the shared state and returns updates), **edges** say what runs next, and **conditional edges** route based on the state. Loops are allowed, which is what lets an agent "try again". Libraries such as LangGraph give you this, but the idea fits in a few lines.

```python
END = "END"

class Graph:
    def __init__(self):
        self.nodes, self.edges = {}, {}

    def add_node(self, name, fn):
        self.nodes[name] = fn

    def add_edge(self, src, dst):            # dst can be a name or a function(state) -> name
        self.edges[src] = dst

    def run(self, start, state, max_steps=20):
        current, steps = start, 0
        while current != END:
            if steps >= max_steps:
                raise RuntimeError("max steps reached")
            state = {**state, **self.nodes[current](state)}
            steps += 1
            nxt = self.edges[current]
            current = nxt(state) if callable(nxt) else nxt
        return state

g = Graph()
g.add_node("count", lambda s: {"n": s["n"] + 1})
g.add_edge("count", lambda s: END if s["n"] >= 3 else "count")
print(g.run("count", {"n": 0}))
```

## Multi-agent patterns

Splitting work across several agents can help, when each has a **narrow role, its own tools and its own short context**:

- **Router:** a cheap model classifies the request and hands it to the right specialist.
- **Supervisor / worker:** a planner breaks the task up, workers do the parts, the supervisor merges the results.
- **Critic / generator:** one agent drafts, another checks it against a rubric. Loop until it passes or a limit is hit.
- **Handoff:** one agent passes the conversation (and the relevant state) to another.

Costs of multi-agent designs are real: more model calls, more latency, and **errors that compound** between agents. Share only what the next agent needs, validate the hand-offs, cap the loops, and trace every step.

> [!TIP]
> Before adding a second agent, ask: could a better prompt, a better tool or a plain function do this? Build the single-agent version first and keep it as your baseline in the evals.
