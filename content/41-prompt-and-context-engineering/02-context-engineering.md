---
title: Context engineering and prompt versioning
minutes: 11
---
## Context engineering

Prompt wording matters less as models improve. **What you put in the context window** matters more. Context engineering is the job of assembling, in each request, exactly the information the model needs: instructions, relevant documents, conversation history, tool results and examples.

Questions to ask for every request:

- **What does the model need to know right now?** Retrieve it. Do not paste the whole knowledge base.
- **What can I leave out?** Every extra token costs money, adds latency and dilutes attention.
- **In what order?** Put stable instructions first and the question last. Put the most important evidence near the start or end, not buried in the middle.
- **Is it fresh and trustworthy?** Prefer recent, high-scoring, de-duplicated sources and keep citations so answers can be checked.

## Packing under a budget

You usually have more candidate context than fits. A simple, effective strategy: rank by relevance, then add pieces until the budget is full.

```python
def estimate_tokens(text):
    return -(-len(text) // 4)

def pack(chunks, budget):
    """chunks: list of (score, text). Highest score first, skip anything that doesn't fit."""
    chosen, used = [], 0
    for score, text in sorted(chunks, key=lambda c: -c[0]):
        cost = estimate_tokens(text)
        if used + cost <= budget:
            chosen.append(text)
            used += cost
    return chosen, used

docs = [(0.9, "Refunds take 5 days."), (0.4, "We were founded in 2012. " * 5), (0.7, "Contact support by email.")]
print(pack(docs, 12))
```

## Managing conversation history

Long chats overflow the window. Common tactics, from simplest to smartest:

1. **Sliding window:** keep the last N turns.
2. **Summarise old turns** into a short running summary message.
3. **Store facts** (name, order id, preferences) in a small memory object and inject it each time.

## Version your prompts

A prompt change is a code change. Give prompts **names and versions**, keep them in files or a registry, render them with checked variables, and run your eval set before promoting a new version.

```python
import string

class PromptRegistry:
    def __init__(self):
        self._p = {}

    def register(self, name, version, template):
        self._p[(name, version)] = template

    def render(self, name, version, **values):
        template = self._p[(name, version)]
        needed = {f for _, f, _, _ in string.Formatter().parse(template) if f}
        missing = needed - values.keys()
        if missing:
            raise KeyError(f"missing variables: {sorted(missing)}")
        return template.format(**values)

reg = PromptRegistry()
reg.register("summarise", 1, "Summarise in {words} words: {text}")
print(reg.render("summarise", 1, words=20, text="LLMs predict tokens."))
```

> [!TIP]
> Log the prompt name and version with every model call. When quality drops, you can see exactly which prompt change caused it.
