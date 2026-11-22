---
title: Capstone plan - a documents Q&A system you can trust
minutes: 12
---
## The goal

Build a system that answers questions **only from your documents**, shows **which sources** it used, says **"I don't know"** when the documents do not cover the question, and comes with an **eval suite** that proves it. This is the shape of most real-world AI products, and it is exactly what hiring managers ask about.

## The pipeline

```text
question -> embed -> retrieve top-k chunks -> (similarity too low? refuse)
         -> build prompt with numbered sources -> LLM -> answer with [1] [2] citations
```

Every stage is a plain function you can test with fakes, which is how you will work in the exercises: `embed(text)` and `llm(prompt)` are passed in, so no API key is needed.

```python
import math

def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    na, nb = math.sqrt(sum(x * x for x in a)), math.sqrt(sum(y * y for y in b))
    return dot / (na * nb) if na and nb else 0.0

def retrieve(question, docs, embed, k=2):
    q = embed(question)
    scored = [(cosine(q, embed(d["text"])), d) for d in docs]
    return sorted(scored, key=lambda s: -s[0])[:k]

# a toy "embedding": counts of three keywords
embed = lambda t: [t.lower().count(w) for w in ("refund", "ship", "warranty")]
docs = [{"id": "refunds", "text": "Refund requests are accepted within 30 days."},
        {"id": "shipping", "text": "We ship worldwide in 3 to 5 days."}]
for score, d in retrieve("how do refunds work", docs, embed):
    print(d["id"], round(score, 2))
```

## Your build plan

1. **Ingest:** load documents, clean them, chunk with overlap, keep source metadata.
2. **Index:** embed chunks into a vector store (Chroma, FAISS, pgvector).
3. **Retrieve:** vector plus keyword search, merged with RRF, then rerank.
4. **Answer:** a prompt with numbered sources, a strict "use only these sources and cite them" instruction.
5. **Abstain:** refuse politely when the best similarity is below a threshold.
6. **Evaluate:** a golden set of questions with the source that should answer each, plus questions that should be refused. Measure recall@k, citation accuracy and refusal accuracy.
7. **Serve:** wrap it in a FastAPI endpoint with caching, rate limiting, tracing and a cost budget.
8. **Ship:** Dockerfile, README with eval results and a short write-up of what you tried and what failed.

## In this module's exercises

You will implement the three core pieces as testable functions: `answer_question` (retrieve, prompt, cite), `evaluate_pipeline` (hit rate and refusal rate against a golden set) and the abstention rule.

> [!TIP]
> Put the eval results in your README as a table. "Recall@3 improved from 0.71 to 0.89 after adding hybrid search" is the sentence that gets interviews.
