---
title: Prompt patterns that work
minutes: 10
---
## A prompt is an interface

A prompt is the contract between your code and the model. A good one is **specific, structured and testable**. Most production prompts combine a few proven patterns.

### 1. Role and task

Tell the model who it is and what it must do, in plain words, in the **system** message. Keep user content (the data) separate.

```py
messages = [
    {"role": "system", "content": "You are a support triage assistant. Classify each message. Reply with JSON only."},
    {"role": "user", "content": "My parcel is 5 days late."},
]
```

### 2. Delimiters

Wrap input data in tags so the model cannot confuse instructions with content. This also helps against **prompt injection**, where the data itself says "ignore your instructions".

```python
def wrap(label, text):
    return f"<{label}>\n{text.strip()}\n</{label}>"

print(wrap("email", "  Hi, I want a refund.  "))
```

### 3. Few-shot examples

Showing 2 to 5 input/output examples teaches format and edge cases better than a paragraph of rules. Pick examples that cover the **tricky** cases, not only the easy ones.

```python
EXAMPLES = [
    ("Where is my order?", "delivery"),
    ("It arrived broken, I want my money back", "refund"),
]

def few_shot(task, examples, query):
    parts = [task, ""]
    for x, y in examples:
        parts += [f"Input: {x}", f"Output: {y}", ""]
    parts += [f"Input: {query}", "Output:"]
    return "\n".join(parts)

print(few_shot("Classify the message as delivery, refund or other.", EXAMPLES, "Do you sell gift cards?"))
```

### 4. Let the model think first

For multi-step problems, ask for reasoning **before** the answer ("Think step by step, then give the final answer on a line starting with `ANSWER:`"). Parse only the final line. Reasoning models do this internally, so check what your model already does before adding it.

### 5. An output contract

Say exactly what the reply must look like (JSON keys, allowed values, maximum length) and **validate it in code**. Retry once with the validation error when it fails.

> [!WARNING]
> Never paste untrusted text into the instruction part of a prompt. Treat anything from users, web pages and documents as data, and keep it inside delimiters.
