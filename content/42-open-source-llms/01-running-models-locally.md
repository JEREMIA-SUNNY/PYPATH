---
title: Running models locally
minutes: 10
---
## Why run a model yourself?

Frontier APIs are the fastest way to a working product. Open-weight models (Llama, Qwen, Mistral, Gemma, DeepSeek and many more) earn their place when you need:

- **Privacy:** data never leaves your machine or your cloud account.
- **Cost at scale:** a small model on your own GPU can be far cheaper per request than a frontier API.
- **Control:** pick the exact model and version, fine-tune it, run it offline.
- **Latency or availability:** no network round trip, no rate limits.

The trade-off: **you** own hosting, scaling, updates and quality evaluation.

## Size, memory and quantization

A model's size is counted in **parameters** (7B means 7 billion). Each parameter is stored as a number. The memory needed is roughly:

> memory (GB) = parameters (billions) × bits per parameter ÷ 8

```python
def model_memory_gb(params_billion, bits):
    return params_billion * bits / 8

for bits in (16, 8, 4):
    print(f"7B model at {bits}-bit: {model_memory_gb(7, bits):.1f} GB")
```

**Quantization** stores weights with fewer bits (16, 8, or 4), shrinking memory a lot with a small quality loss. That is how a 7B model that needs 14 GB at 16-bit fits in about 3.5 GB at 4-bit. Add roughly 20% for the context cache and runtime overhead.

## Ollama: the easy way

Ollama downloads and serves models with one command and exposes a local HTTP API on port 11434.

```py
# In a terminal:  ollama pull llama3.2
import requests, json

with requests.post("http://localhost:11434/api/generate",
                   json={"model": "llama3.2", "prompt": "Why is the sky blue?"}, stream=True) as r:
    for line in r.iter_lines():
        if line:
            part = json.loads(line)        # {"response": "The", "done": false}
            print(part["response"], end="")
```

The reply is **NDJSON**: one JSON object per line, with `"done": true` on the last. Ollama also offers an OpenAI-compatible endpoint (`/v1`), so the same client code can talk to a local model or a hosted one by changing the base URL.

> [!TIP]
> Develop against a small local model, then switch the base URL to a frontier model for quality. Having the model name and base URL in config makes that a one-line change.
