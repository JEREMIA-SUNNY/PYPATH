---
title: Your first FastAPI app
minutes: 10
---
**FastAPI** is the fastest-growing Python web framework. It uses type hints to validate requests, serialise responses and generate interactive docs automatically, and it's async-first. If you've used NestJS, you'll find the ideas familiar: decorators for routes, DTO-like models and dependency injection.

```bash
pip install "fastapi[standard]"
```

```py
# main.py
from fastapi import FastAPI

app = FastAPI(title="Task API")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/tasks/{task_id}")
def get_task(task_id: int, verbose: bool = False):
    return {"id": task_id, "verbose": verbose}
```

```bash
fastapi dev main.py          # or: uvicorn main:app --reload
```

Open `http://127.0.0.1:8000/docs` and you get interactive Swagger docs, generated from your code.

## Parameters come from type hints

- `task_id: int` in the path means it's a **path parameter**, converted to int and validated. `/tasks/abc` returns a 422 error automatically.
- `verbose: bool = False` is not in the path, so it's a **query parameter**: `/tasks/7?verbose=true`.
- A Pydantic model parameter is read from the **JSON body** (next lesson).

## Trying it without a server

FastAPI's `TestClient` calls your app directly. It's how you'll write tests, and how PyPath's exercises check your API:

```python
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

@app.get("/greet/{name}")
def greet(name: str, excited: bool = False):
    return {"message": f"Hello, {name}{'!' if excited else '.'}"}

client = TestClient(app)
r = client.get("/greet/Jerry", params={"excited": True})
print(r.status_code, r.json())
print(client.get("/greet").status_code)     # no such route
```

(This needs `pip install fastapi httpx` on your machine.)

## async or not?

You can write `async def` endpoints. Use them when the body awaits async libraries (httpx, async database drivers). Plain `def` endpoints are fine too; FastAPI runs them in a thread pool so they don't block the server.
