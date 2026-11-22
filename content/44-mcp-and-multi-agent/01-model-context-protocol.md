---
title: The Model Context Protocol (MCP)
minutes: 11
---
## The integration problem

Every AI app needs the same things: read files, query a database, search the web, call internal APIs. Without a standard, each app wrote its own glue code for each tool. The **Model Context Protocol (MCP)** is an open standard that fixes this. Think of it as **USB-C for AI tools**: write a tool server once and any MCP-aware app can use it.

## The parts

- **Host:** the AI application the user talks to (an IDE assistant, a chat app, your own agent).
- **Client:** a connector inside the host that speaks MCP to one server.
- **Server:** a small program that exposes capabilities:
  - **Tools:** functions the model can call (`search_docs`, `create_ticket`).
  - **Resources:** read-only data the host can load (files, records).
  - **Prompts:** reusable prompt templates.

Servers run locally over **stdio** (the host starts the process) or remotely over **HTTP**. Underneath, the messages are **JSON-RPC 2.0**.

## JSON-RPC in thirty seconds

A request names a `method`, carries `params` and an `id`. The response has the same `id` and either a `result` or an `error`.

```python
import json

request = {"jsonrpc": "2.0", "id": 1, "method": "tools/list"}
response = {"jsonrpc": "2.0", "id": 1, "result": {"tools": [{"name": "add", "description": "Add two numbers"}]}}
error = {"jsonrpc": "2.0", "id": 2, "error": {"code": -32601, "message": "Method not found"}}

for m in (request, response, error):
    print(json.dumps(m))
```

A request **without** an `id` is a *notification*: no response is sent. The standard error codes are `-32700` (parse error), `-32600` (invalid request), `-32601` (method not found) and `-32602` (invalid params).

## What an MCP session looks like

1. The client sends `initialize` and the server answers with its capabilities.
2. The client calls `tools/list` to discover tools and their JSON-Schema inputs.
3. When the model wants a tool, the client sends `tools/call` with the name and arguments.
4. The server replies with content (usually text) and an `isError` flag.

A tiny server in Python, using the official SDK, is just decorated functions:

```py
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("docs")

@mcp.tool()
def search_docs(query: str) -> str:
    """Search the documentation and return the best match."""
    return "..."

if __name__ == "__main__":
    mcp.run()
```

> [!WARNING]
> An MCP server is code with access to your systems. Only connect servers you trust, give each the least privilege it needs, and keep a human approval step for actions with side effects.
