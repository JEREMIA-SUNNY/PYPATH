---
title: Sampling, temperature and choosing a model
minutes: 10
---
## From scores to a choice

For each next token the model produces a **logit** (a raw score) for every token in its vocabulary. A function called **softmax** turns those scores into probabilities that add up to 1. Then the app **samples** one token.

```python
import math

def softmax(logits, temperature=1.0):
    scaled = [x / temperature for x in logits]
    m = max(scaled)                        # subtract the max for numerical stability
    exps = [math.exp(x - m) for x in scaled]
    total = sum(exps)
    return [e / total for e in exps]

logits = [2.0, 1.0, 0.1]
for t in (0.2, 1.0, 2.0):
    print(t, [round(p, 3) for p in softmax(logits, t)])
```

## Temperature

**Temperature** divides the logits before softmax:

- **Low (0 to 0.3):** the top token dominates. Output is focused and repeatable. Use it for extraction, classification and code.
- **High (0.8 to 1.2):** probabilities flatten. Output is more varied and creative, and more likely to wander.

Two companion settings trim the candidate list before sampling:

- **top-k:** only consider the `k` most likely tokens.
- **top-p (nucleus):** only consider the smallest set of tokens whose probabilities add up to `p`.

Tip: change temperature **or** top-p, not both at once.

## Choosing a model

There is no single best model. Compare on the things that matter for your product:

| Question | Why it matters |
| --- | --- |
| **Quality** on *your* task | Public benchmarks are a guide. Your own eval set (later in this course) is the truth. |
| **Cost** per request | Small models can be 10 to 50 times cheaper than frontier models. |
| **Latency** | Time to first token and tokens per second decide whether a chat feels instant. |
| **Context window** | Long documents need a large window, or retrieval (RAG). |
| **Privacy and control** | Open-source models can run on your own hardware, so data never leaves. |
| **Features** | Tool calling, structured output, vision, audio. |

**Frontier (closed) models** such as GPT, Claude and Gemini give the best quality and the least work, through an API. **Open-source models** such as Llama, Qwen, Mistral and Gemma give control and lower unit cost, but you host or rent the compute.

> [!NOTE]
> A strong pattern in production: start with a frontier model to prove the feature works, measure it with evals, then try a cheaper model and keep it only if quality holds.
