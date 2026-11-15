---
title: Pydantic models, validation and errors
minutes: 10
---
**Pydantic** models describe the shape of data. FastAPI uses them to parse and validate request bodies and to shape responses.

```python
from pydantic import BaseModel, Field, ValidationError

class TaskIn(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    priority: int = Field(default=3, ge=1, le=5)
    tags: list[str] = []

print(TaskIn(title="Write tests", priority="2"))     # "2" is coerced to int
try:
    TaskIn(title="", priority=9)
except ValidationError as e:
    print(e.error_count(), "errors:", [err["loc"][0] for err in e.errors()])
```

## Request and response models

```python
from fastapi import FastAPI, HTTPException, status
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field

app = FastAPI()

class TaskIn(BaseModel):
    title: str = Field(min_length=1)
    done: bool = False

class TaskOut(TaskIn):
    id: int

TASKS: dict[int, TaskOut] = {}

@app.post("/tasks", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(task: TaskIn):
    new = TaskOut(id=len(TASKS) + 1, **task.model_dump())
    TASKS[new.id] = new
    return new

@app.get("/tasks/{task_id}", response_model=TaskOut)
def read_task(task_id: int):
    if task_id not in TASKS:
        raise HTTPException(status_code=404, detail="Task not found")
    return TASKS[task_id]

client = TestClient(app)
print(client.post("/tasks", json={"title": "Ship v1"}).json())
print(client.post("/tasks", json={"title": ""}).status_code)       # 422
print(client.get("/tasks/99").json())                               # 404 detail
```

- `response_model` filters and documents what you return. It's how you avoid leaking fields like password hashes.
- `status_code=201` sets the success code for creation.
- `HTTPException` returns an error response with a JSON `detail`.
- Invalid input automatically produces **422** with details of every field that failed.

## Partial updates

For PATCH, make every field optional and apply only what was sent:

```py
class TaskPatch(BaseModel):
    title: str | None = None
    done: bool | None = None

@app.patch("/tasks/{task_id}", response_model=TaskOut)
def update_task(task_id: int, patch: TaskPatch):
    if task_id not in TASKS:
        raise HTTPException(status_code=404, detail="Task not found")
    task = TASKS[task_id]
    updated = task.model_copy(update=patch.model_dump(exclude_unset=True))
    TASKS[task_id] = updated
    return updated
```
