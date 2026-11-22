---
title: Deploying, caching and observing LLM services
minutes: 11
---
## From notebook to service

An AI feature in production is an ordinary backend service with unusual dependencies: slow, costly, non-deterministic API calls. The usual rules apply, plus a few new ones.

**Package it.** A FastAPI app in a Docker image behaves the same on your laptop and on a server:

```py
# Dockerfile
# FROM python:3.12-slim
# WORKDIR /app
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt
# COPY . .
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

- Read **API keys from environment variables** (never from the repo or the image). Use a secrets manager in production.
- Add a `/health` endpoint, request **timeouts** and **structured JSON logs**.
- Put model name, base URL and prompt version in **config**, so you can switch without redeploying code.

## Cache what you can

Identical requests with temperature 0 give (nearly) identical answers, so cache them. A cache cuts cost and latency and shields you from rate limits. Key it on **everything that changes the answer**: model, prompt, parameters.

```python
import hashlib
import json
from collections import OrderedDict

class LLMCache:
    def __init__(self, max_size=128):
        self.max_size, self._data = max_size, OrderedDict()
        self.hits = self.misses = 0

    @staticmethod
    def key(model, prompt, temperature):
        raw = json.dumps([model, prompt, temperature])
        return hashlib.sha256(raw.encode()).hexdigest()

    def get_or_call(self, model, prompt, temperature, fn):
        k = self.key(model, prompt, temperature)
        if k in self._data:
            self.hits += 1
            self._data.move_to_end(k)
            return self._data[k]
        self.misses += 1
        value = self._data[k] = fn()
        if len(self._data) > self.max_size:
            self._data.popitem(last=False)         # evict the least recently used
        return value

cache = LLMCache(2)
for _ in range(3):
    cache.get_or_call("m", "hi", 0, lambda: "hello")
print(cache.hits, cache.misses)
```

Providers also offer **prompt caching** (a discount for a repeated long prefix such as your system prompt and documents), so put stable content first.

## Observe everything

You cannot fix what you cannot see. For every model call, record: **prompt name and version, model, input and output tokens, cost, latency, and the trace** (retrieval results, tool calls, intermediate steps). Tools such as Langfuse, LangSmith, Arize or plain OpenTelemetry give you timelines ("spans") and let you click from a bad answer to exactly what was retrieved and sent.

Alert on **cost per day**, **error and timeout rate**, **p95 latency** and **eval score drift** from sampled production traffic.

> [!TIP]
> Set a hard monthly budget with the provider and a per-user daily cap in your own code. A bug or an abusive user can otherwise burn a month's money in an hour.
