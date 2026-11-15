---
title: Dependencies, databases and tests
minutes: 11
---
## Dependency injection with Depends

A **dependency** is a function FastAPI calls for you and passes into your endpoint, for things like a database session, the current user or settings. Tests can override it.

```python
import sqlite3
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.testclient import TestClient

app = FastAPI()

def get_db():
    conn = sqlite3.connect(":memory:", check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("CREATE TABLE notes (id INTEGER PRIMARY KEY, body TEXT)")
    try:
        yield conn
    finally:
        conn.close()

def require_token(authorization: str = Header(default="")):
    if authorization != "Bearer secret-token":
        raise HTTPException(status_code=401, detail="Not authenticated")

@app.post("/notes", status_code=201, dependencies=[Depends(require_token)])
def add_note(body: dict, db: sqlite3.Connection = Depends(get_db)):
    cur = db.execute("INSERT INTO notes (body) VALUES (?)", (body["text"],))
    return {"id": cur.lastrowid, "text": body["text"]}

client = TestClient(app)
print(client.post("/notes", json={"text": "hi"}).status_code)
print(client.post("/notes", json={"text": "hi"}, headers={"Authorization": "Bearer secret-token"}).json())
```

In a real app, `get_db` opens a connection to a database **file** (or Postgres) and the schema is created once at startup or by migrations.

## Overriding dependencies in tests

```py
def fake_db():
    conn = sqlite3.connect(":memory:", check_same_thread=False)
    ...
    yield conn

app.dependency_overrides[get_db] = fake_db
```

That's how you test endpoints against a clean, throwaway database every time.

## Structuring a bigger app

```text
src/task_api/
├── main.py          # app = FastAPI(); app.include_router(tasks.router)
├── db.py            # engine/session, get_db dependency
├── models.py        # SQLAlchemy/SQLModel tables
├── schemas.py       # Pydantic request/response models
├── security.py      # password hashing, token checks
└── routers/
    └── tasks.py     # router = APIRouter(prefix="/tasks")
```

## Testing checklist for an endpoint

- Happy path: correct status code **and** response body.
- Validation: a bad body returns 422.
- Not found: a missing id returns 404.
- Auth: no token returns 401; another user's resource returns 403 or 404.
- Side effects: after POST, a GET returns the new item.

## Running in production

`fastapi run main.py` or `uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4`, usually inside a Docker container behind a reverse proxy. Configuration comes from environment variables, and the database is a managed Postgres instance.
