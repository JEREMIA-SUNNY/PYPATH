---
title: Tool calling, streaming and retries
minutes: 12
---
## Tool calling (function calling)

A model cannot check the weather or query your database. But you can **describe functions** to it. When it decides a function is needed, it replies not with text but with a **tool call**: a function name plus JSON arguments. **Your code runs the function** and sends the result back, and the model uses it to write the final answer.

```py
tools = [{
    "type": "function",
    "function": {
        "name": "get_order_status",
        "description": "Look up the status of an order by id",
        "parameters": {
            "type": "object",
            "properties": {"order_id": {"type": "string"}},
            "required": ["order_id"],
        },
    },
}]
# response.choices[0].message.tool_calls -> [{"id": "call_1", "function": {"name": "get_order_status", "arguments": "{\"order_id\": \"4417\"}"}}]
```

The loop is always the same:

1. Send messages and tool descriptions.
2. If the reply contains tool calls, run each one, append a `tool` message with the result (and the matching `tool_call_id`), and call the model again.
3. When the reply is plain text, you are done.

Your code is the one in control. **Validate arguments, check permissions and catch errors**, because the model can invent a tool name or send bad JSON.

```python
import json

TOOLS = {"add": lambda a, b: a + b}

def run_tool_call(call):
    try:
        args = json.loads(call["arguments"])
        return json.dumps({"result": TOOLS[call["name"]](**args)})
    except Exception as e:
        return json.dumps({"error": f"{type(e).__name__}: {e}"})

print(run_tool_call({"name": "add", "arguments": '{"a": 2, "b": 3}'}))
print(run_tool_call({"name": "multiply", "arguments": "{}"}))
```

Returning the error **as the tool result** lets the model see what went wrong and try again.

## Streaming

Waiting 10 seconds for a full answer feels broken. With **streaming** the API sends the reply in small chunks as it is generated, so you can show words immediately. Each chunk has a text `delta`, and the last one carries a `finish_reason` (`stop`, `length`, `tool_calls`).

```python
chunks = [
    {"delta": "Hel", "finish_reason": None},
    {"delta": "lo", "finish_reason": None},
    {"delta": None, "finish_reason": "stop"},
]
text = "".join(c["delta"] or "" for c in chunks)
print(text, chunks[-1]["finish_reason"])
```

A `finish_reason` of `length` means the answer was **cut off** by the token limit. Treat it as a problem, not a success.

## Retries with backoff

Real APIs fail: rate limits (HTTP 429), timeouts, overloaded servers. Retry only **transient** errors, wait longer each time (**exponential backoff**, ideally with random jitter), and give up after a few tries. Never retry on a bad request: it will fail the same way and cost money.

> [!TIP]
> Make your code testable by passing the `sleep` function in as a parameter. Tests can then pass a fake that records delays instead of really waiting.
