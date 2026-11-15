---
title: async and await
minutes: 10
---
Most programs spend a lot of time **waiting**: for a web API, a database, a file. `asyncio` lets one thread juggle many waits at once. While one task waits on the network, another runs.

```python
import asyncio
import time

async def fetch(name: str, seconds: float) -> str:
    await asyncio.sleep(seconds)          # stands in for a network call
    return f"{name} done"

async def main():
    start = time.perf_counter()
    results = await asyncio.gather(
        fetch("users", 0.3),
        fetch("orders", 0.3),
        fetch("stock", 0.3),
    )
    print(results, f"{time.perf_counter() - start:.2f}s")

asyncio.run(main())
```

Three 0.3-second waits finish in about 0.3 seconds total, not 0.9, because they wait **concurrently**.

## The rules

- `async def` defines a **coroutine function**. Calling it returns a coroutine object; nothing runs yet.
- `await` runs a coroutine and waits for its result. It's only allowed inside `async def`.
- `asyncio.run(main())` starts the event loop from normal code. Call it once, at the top level.
- `asyncio.gather(...)` runs several coroutines concurrently and returns their results in order.

## Timeouts and tasks

```python
import asyncio

async def slow():
    await asyncio.sleep(5)

async def main():
    try:
        await asyncio.wait_for(slow(), timeout=0.2)
    except TimeoutError:
        print("gave up waiting")

    task = asyncio.create_task(asyncio.sleep(0.1, result="background"))
    print("doing other work…")
    print(await task)

asyncio.run(main())
```

## When to use async

Async helps with **I/O-bound** work with lots of waiting: many HTTP calls, web servers handling many connections (FastAPI is async-first), websockets and chat. It does **not** speed up CPU-heavy work like number crunching; for that, use `multiprocessing` or a library like NumPy.

> [!WARNING]
> Never call a blocking function like `time.sleep()` or `requests.get()` inside async code. It freezes every task. Use the async versions (`asyncio.sleep`, `httpx.AsyncClient`).

Coming from JavaScript? The model is very similar to promises and `async/await`, but in Python nothing runs until it's awaited or scheduled as a task.
