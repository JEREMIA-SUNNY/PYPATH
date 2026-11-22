---
title: Chunking, hybrid search and measuring retrieval
minutes: 12
---
## Chunking decides what the model can find

Documents are too long to embed or send whole, so you split them into **chunks**. Chunking is the most underrated lever in RAG:

- **Too big:** vectors blur many topics together and each chunk wastes context tokens.
- **Too small:** a chunk loses the surrounding meaning ("it" refers to what?).
- **Overlap:** repeating a few words between neighbouring chunks stops answers from being cut in half at a boundary.

Typical starting points are 200 to 500 tokens with 10 to 20% overlap. Better still, **split on structure** (headings, paragraphs, code blocks) before falling back to size. Store metadata with every chunk (source, title, page, section) so you can **cite** it.

```python
def chunk_words(text, size, overlap):
    words = text.split()
    step = size - overlap
    chunks = []
    for start in range(0, len(words), step):
        chunks.append(" ".join(words[start:start + size]))
        if start + size >= len(words):
            break
    return chunks

doc = " ".join(f"w{i}" for i in range(10))
for c in chunk_words(doc, size=4, overlap=1):
    print(c)
```

## Hybrid search and reranking

**Vector search** finds meaning ("car" matches "automobile") but can miss exact terms, names and codes ("error E1042"). **Keyword search** (BM25) is the opposite. **Hybrid search** runs both and merges the rankings.

A simple, robust way to merge is **Reciprocal Rank Fusion (RRF)**: each list gives a document `1 / (k + rank)` points, and you add up the points.

```python
def rrf(*rankings, k=60):
    scores = {}
    for ranking in rankings:
        for rank, doc in enumerate(ranking, start=1):
            scores[doc] = scores.get(doc, 0) + 1 / (k + rank)
    return sorted(scores, key=lambda d: (-scores[d], d))

vector = ["a", "b", "c"]
keyword = ["b", "c", "d"]
print(rrf(vector, keyword))
```

A **reranker** (a small model that scores each query/chunk pair) then reorders the top 20 to 50 candidates so the best few go into the prompt. Retrieve wide, rerank narrow.

## Measure retrieval before you tune the prompt

If the right chunk never reaches the model, no prompt can save the answer. Build a small set of questions with the chunk(s) that should answer each, then measure:

- **Recall@k:** of the relevant chunks, what fraction appear in the top `k` results?
- **Precision@k:** of the top `k`, what fraction are relevant?
- **MRR:** how high does the first relevant result rank?

```python
def recall_at_k(retrieved, relevant, k):
    relevant = set(relevant)
    return len(set(retrieved[:k]) & relevant) / len(relevant) if relevant else 0.0

print(recall_at_k(["a", "b", "c"], {"a", "c", "z"}, 2))
```

> [!TIP]
> Change one thing at a time (chunk size, overlap, embedding model, hybrid on/off, reranker) and re-run the same retrieval eval. That is how you improve RAG with evidence instead of guesses.
