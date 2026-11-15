---
title: Embeddings and similarity search
minutes: 10
---
An **embedding** is a list of numbers (a vector, often 384 to 3072 long) that represents the *meaning* of a piece of text. Texts with similar meaning get vectors that point in similar directions, even with no words in common: "How do I get my money back?" lands near "refund policy".

You get embeddings from an embeddings API or a local model (e.g. `sentence-transformers`). Then search is just maths.

## Cosine similarity

The standard measure is the cosine of the angle between two vectors: 1 means the same direction, 0 means unrelated.

```python
import math

def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    norm = math.sqrt(sum(x * x for x in a)) * math.sqrt(sum(y * y for y in b))
    return dot / norm if norm else 0.0

print(round(cosine([1, 2, 3], [2, 4, 6]), 3))     # same direction
print(round(cosine([1, 0], [0, 1]), 3))           # unrelated
print(round(cosine([1, 1], [1, 0.8]), 3))
```

## A toy embedding to see the idea

Real embeddings come from neural networks, but a simple **bag-of-words** vector shows how vector search works end to end:

```python
import math
import re

def tokens(text):
    return re.findall(r"[a-z]+", text.lower())

docs = {
    "refunds": "Refunds are processed within 7 days to the original payment method.",
    "delivery": "Standard delivery takes 3 to 5 days. Express delivery takes 1 day.",
    "returns": "You can return unused items within 30 days for a refund.",
}
vocab = sorted({w for d in docs.values() for w in tokens(d)})

def embed(text):
    words = tokens(text)
    return [words.count(w) for w in vocab]

def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    n = math.sqrt(sum(x * x for x in a)) * math.sqrt(sum(y * y for y in b))
    return dot / n if n else 0.0

query = "how many days for a refund"
scores = sorted(((round(cosine(embed(query), embed(t)), 3), k) for k, t in docs.items()), reverse=True)
print(scores)
```

Bag-of-words only matches exact words. Neural embeddings also match synonyms and paraphrases, which is why they power modern search.

## Storing vectors

- A few thousand chunks: a NumPy array and a brute-force similarity scan is fine.
- Larger collections: a **vector database** or extension (pgvector for Postgres, Chroma, Qdrant, FAISS) with approximate nearest-neighbour indexes.
- **Hybrid search** (keyword BM25 + vectors) often beats either alone, especially for codes, names and IDs.
