---
title: Shipping AI features responsibly
minutes: 9
---
## Cost and latency

```python
PRICES_PER_MILLION = {"small": (0.25, 1.25), "large": (3.00, 15.00)}   # (input, output) USD, illustrative

def cost_usd(model: str, input_tokens: int, output_tokens: int) -> float:
    p_in, p_out = PRICES_PER_MILLION[model]
    return round((input_tokens * p_in + output_tokens * p_out) / 1_000_000, 6)

per_call = cost_usd("large", 2_000, 400)
print(per_call, "USD per call ->", round(per_call * 50_000, 2), "USD for 50k calls/day")
```

Levers: shorter prompts, smaller models for easy steps, caching repeated prompts, and capping `max_tokens`.

## Reliability

- Set timeouts and **retry with backoff** on 429 and 5xx errors (you built this in the HTTP module).
- Validate every structured output; on failure, retry once with the validation error included in the prompt.
- Have a fallback: a simpler model, a canned response, or a human handoff.

## Evaluation

You can't improve what you don't measure. Build a small **eval set**: 20–100 real inputs with expected outputs or grading rules. Run it on every prompt or model change and track the score, just like unit tests. For open-ended answers, use rubric checks ("mentions the refund policy", "under 60 words") or a model-graded comparison, spot-checked by humans.

## Safety and security

- **Prompt injection**: text from users, web pages or documents may contain instructions ("ignore previous instructions and…"). Treat model input from outside as **data**, keep it inside delimiters, never let model output directly trigger sensitive actions (refunds, emails, deletes) without validation or human approval, and give tools the least privilege possible.
- **Privacy**: don't send secrets or unnecessary personal data; check your provider's data retention terms.
- **Hallucination**: models can state false things confidently. Ground answers in retrieved documents (next module) and show sources.

## Architecture of a typical AI feature

1. Receive the request (FastAPI endpoint).
2. Retrieve context (database, search, RAG).
3. Build the prompt from a versioned template.
4. Call the model with timeout, retries and streaming.
5. Validate the output; apply business rules.
6. Log inputs, outputs, tokens, latency and cost for monitoring and evals.
