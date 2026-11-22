---
title: The questions AI engineering interviews ask
minutes: 14
---
Interviewers for AI engineer roles want to see **judgement under trade-offs**, not trivia. For each question below, practise answering out loud in three beats: **the goal, the options and trade-offs, then what you would measure.**

## 1. "Design a support chatbot over our documentation."

A strong answer walks the pipeline: ingest and chunk (structure-aware, with overlap and metadata), embed and index, **hybrid retrieval plus a reranker**, a prompt with numbered sources and a "use only these" rule, **citations**, **abstention** when retrieval is weak, a **human handoff** path, then **evals** (retrieval recall, faithfulness, refusal accuracy), caching, rate limits and monitoring. Mention how new documents get re-indexed.

## 2. "The bot gives wrong answers. How do you debug it?"

Do not touch the prompt first. Split the problem: **was the right chunk retrieved?** If not, fix chunking, embeddings, hybrid search or query rewriting. If it was retrieved but ignored or distorted, fix the prompt, ordering or context size, or use a stronger model. Read traces, add the failure to the golden set, change one thing at a time and re-run the evals.

## 3. "RAG, fine-tuning or a longer prompt?"

Prompting is cheapest and tries first. **RAG for knowledge** (fresh, private, citable). **Fine-tuning for behaviour** (style, format, narrow tasks on a cheaper model). Fine-tuning is poor at injecting facts. They combine well: a fine-tuned small model plus retrieval.

## 4. "How do you evaluate an LLM feature?"

Start with error analysis on real inputs, then a golden set of 50 to 100 cases. Use **deterministic checks** first, **LLM-as-judge** with a rubric calibrated to human labels for fuzzy qualities, and **regression gates in CI**. Evaluate retrieval and generation separately. Monitor sampled production traffic for drift.

## 5. "Costs doubled last month. What do you do?"

Look at traces and cost per request. Levers, in order of effort: **caching** and prompt caching, shorter prompts and context (better retrieval, fewer chunks), **smaller models** for easy requests (routing), capping output tokens, batching, and only then fine-tuning a small model. Verify each change against evals so quality does not slip.

## 6. "How do you make an agent safe?"

Least privilege tools, argument validation, human approval for irreversible actions, step and spend limits, treating tool output as untrusted (prompt injection), sandboxed execution, full logging and evals that include adversarial cases.

## 7. "Latency is too high."

Stream tokens, shrink the prompt, cache, run independent calls in parallel, use a faster or smaller model for easy steps, precompute embeddings, reduce retrieval fan-out and avoid unnecessary agent hops. Measure time to first token and p95, not averages.

## 8. "What are the limits of LLMs you would design around?"

Hallucination, stale knowledge, limited and unevenly used context, non-determinism, prompt injection, bias, and cost and latency. The design answers are retrieval, validation, structured output, evals, guardrails and fallbacks.

> [!TIP]
> Bring numbers from your own projects: "I raised recall@3 from 0.71 to 0.89", "caching cut cost 38%". Specifics make answers believable.
