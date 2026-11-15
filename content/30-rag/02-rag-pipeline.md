---
title: The RAG pipeline
minutes: 11
---
LLMs don't know your private documents, and they can make things up. **Retrieval-augmented generation** fixes both: find the relevant passages first, then ask the model to answer **only from them**, with citations.

## Indexing (done ahead of time)

1. **Load** documents (Markdown, PDFs, web pages, tickets).
2. **Chunk** them into passages, typically 200–800 tokens with some **overlap** so sentences cut at a boundary still appear whole in one chunk. Split on headings or paragraphs where possible.
3. **Embed** each chunk and store the vector with **metadata** (source file, heading, URL, date).

```python
def chunk_words(text, size=50, overlap=10):
    words = text.split()
    step = size - overlap
    return [" ".join(words[i:i + size]) for i in range(0, max(len(words) - overlap, 1), step)]

doc = " ".join(f"w{i}" for i in range(120))
chunks = chunk_words(doc, size=50, overlap=10)
print(len(chunks), [c.split()[0] + ".." + c.split()[-1] for c in chunks])
```

## Answering (on every question)

1. Embed the user's question.
2. **Retrieve** the top-k most similar chunks (k = 3 to 8), optionally re-ranking them.
3. Build a prompt that includes the chunks, labelled with their sources.
4. Ask the model to answer only from the context, cite sources, and say "I don't know" otherwise.

```python
def build_rag_prompt(question, chunks):
    context = "\n\n".join(f"[{i + 1}] ({c['source']}) {c['text']}" for i, c in enumerate(chunks))
    return (
        "Answer the question using ONLY the context below. "
        "Cite sources like [1]. If the answer is not in the context, say you don't know.\n\n"
        f"<context>\n{context}\n</context>\n\n<question>{question}</question>"
    )

print(build_rag_prompt(
    "How long do refunds take?",
    [{"source": "policy.md#refunds", "text": "Refunds are processed within 7 days."}],
))
```

## Making it good

| Problem | Fix |
| --- | --- |
| Right answer exists but isn't retrieved | better chunking, hybrid search, query rewriting, more k with re-ranking |
| Retrieved but the model ignores it | clearer prompt, put the best chunks first, smaller context |
| Model answers beyond the context | stricter instructions, require citations, check them in code |
| Stale answers | re-index on document change; store and filter by date |

## Evaluate retrieval and answers separately

- **Retrieval**: for each test question, is the correct chunk in the top k? (recall@k)
- **Answer**: is it correct, grounded in the cited chunks, and complete?

This is exactly the *Docs Q&A Assistant* portfolio project on the Career page. It's one of the most in-demand skills in AI engineering roles right now.
