---
title: How LLM APIs work
minutes: 10
---
Most AI features are an HTTP call to a model provider (Anthropic, OpenAI, Google, or a self-hosted open model) wrapped in good engineering. You don't need to train models to be an AI engineer; you need to call them well.

## The request

Chat-style APIs take a list of **messages**, each with a **role**:

```python
import json

request = {
    "model": "a-model-name",
    "max_tokens": 300,
    "temperature": 0.2,
    "system": "You are a concise assistant for an Indian e-commerce support team.",
    "messages": [
        {"role": "user", "content": "Where is my order 4417?"},
        {"role": "assistant", "content": "Could you share the email you ordered with?"},
        {"role": "user", "content": "jerry@example.com"},
    ],
}
print(json.dumps(request, indent=2)[:400])
```

- **system** sets behaviour and context for the whole conversation.
- **user** and **assistant** messages alternate. The model is **stateless**: you resend the relevant history on every call.
- **max_tokens** caps the length of the reply; **temperature** controls randomness (low for extraction and classification, higher for brainstorming).

Providers ship official SDKs that wrap this HTTP call, for example `client.messages.create(model=..., messages=[...])`. Read the API key from an environment variable, never from code.

## Tokens

Models read and write **tokens**, chunks of roughly 3–4 characters of English (more tokens per word for many other languages). Tokens matter because:

- Pricing is per token (input and output priced separately; output costs more).
- Every model has a **context window**: the maximum tokens of input plus output.
- Latency grows with output length.

```python
def rough_tokens(text: str) -> int:
    return max(1, round(len(text) / 4))      # quick estimate; use the provider's counter for billing

prompt = "Summarise this support ticket in one sentence: " + "The parcel arrived damaged. " * 20
print(rough_tokens(prompt), "tokens (approx.)")
```

## Streaming

For chat UIs, request a **streamed** response: tokens arrive as they're generated (server-sent events), so users see text immediately instead of waiting for the full reply.

## Choosing a model

Bigger models are smarter but slower and pricier. A common pattern is to route simple tasks (classification, extraction) to a small fast model and hard reasoning to a large one. Measure on **your** examples rather than trusting leaderboards.
