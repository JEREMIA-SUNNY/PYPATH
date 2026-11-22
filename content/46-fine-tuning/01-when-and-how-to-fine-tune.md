---
title: When to fine-tune, and preparing the data
minutes: 11
---
## Try the cheaper tools first

Fine-tuning changes the model's weights using your examples. It is powerful and often **not** the right first move. Climb this ladder:

1. **Better prompts** with clear instructions and few-shot examples.
2. **RAG**, when the model lacks *knowledge* (your documents, fresh facts).
3. **Fine-tuning**, when the model lacks *behaviour*: a consistent style or format, a narrow task done cheaply with a small model, domain jargon, or tool-calling habits that prompts cannot fix.

| Goal | Reach for |
| --- | --- |
| Answer from your private documents | RAG |
| Always reply in a strict JSON shape | Structured output first, fine-tune if still flaky |
| Match a brand voice across thousands of replies | Fine-tune |
| Make a cheap 3B model as good as a big one at one task | Fine-tune (often distillation) |
| Teach new facts | RAG, not fine-tuning |

Fine-tuning is **not** a good way to inject facts. It teaches patterns, and facts learned that way are unreliable and hard to update.

## The data is the product

Quality beats quantity: a few hundred to a few thousand **clean, consistent, representative** examples often beat tens of thousands of noisy ones. Most training problems are data problems.

Supervised fine-tuning (SFT) data is usually conversations in the chat format:

```python
import json

def to_example(user, assistant, system="You are a helpful support agent."):
    return {"messages": [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
        {"role": "assistant", "content": assistant},
    ]}

print(json.dumps(to_example("Where is my order?", "Please share your order number and I will check.")))
```

Store one JSON object per line (**JSONL**). Then clean it:

- remove **duplicates** and near-duplicates (they cause memorisation)
- drop examples that are too short, too long, or wrong
- remove **personal data** and anything you may not train on
- check **balance**: if 90% of examples are one case, the model learns that case
- hold out a **validation set** (about 5 to 10%) that the model never trains on, and a separate **test set** you only look at at the end

```python
import random

def split(rows, val_fraction=0.1, seed=0):
    rows = list(rows)
    random.Random(seed).shuffle(rows)
    n_val = max(1, round(len(rows) * val_fraction)) if len(rows) > 1 else 0
    return rows[n_val:], rows[:n_val]

train, val = split(range(20), 0.1, seed=1)
print(len(train), len(val))
```

> [!WARNING]
> Never evaluate on data the model trained on. A model that memorised its training set looks perfect and fails in production.
