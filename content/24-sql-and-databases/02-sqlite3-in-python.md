---
title: sqlite3 from Python, safely
minutes: 10
---
## Connecting and querying

```python
import sqlite3

conn = sqlite3.connect(":memory:")       # or "app.db" for a file
conn.row_factory = sqlite3.Row            # rows behave like dicts
conn.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT UNIQUE, name TEXT)")

with conn:                                # commits on success, rolls back on error
    conn.execute("INSERT INTO users (email, name) VALUES (?, ?)", ("ana@x.in", "Ana"))
    conn.executemany(
        "INSERT INTO users (email, name) VALUES (?, ?)",
        [("bo@x.in", "Bo"), ("cy@x.in", "Cy")],
    )

row = conn.execute("SELECT * FROM users WHERE email = ?", ("bo@x.in",)).fetchone()
print(row["id"], row["name"], dict(row))
print([r["name"] for r in conn.execute("SELECT name FROM users ORDER BY name")])
```

- `execute` returns a cursor; use `fetchone()`, `fetchall()`, or loop over it.
- `with conn:` wraps a **transaction**: all statements commit together, or none do.
- `cursor.lastrowid` gives the id of the row you just inserted.

## SQL injection, and how parameters prevent it

**Never** build SQL with f-strings or `+` from user input:

```python
import sqlite3
conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE users (email TEXT, is_admin INTEGER)")
conn.execute("INSERT INTO users VALUES ('admin@x.in', 1)")

evil = "nobody' OR '1'='1"
unsafe = f"SELECT * FROM users WHERE email = '{evil}'"
print("unsafe query returns:", conn.execute(unsafe).fetchall())      # leaks every row!

safe = conn.execute("SELECT * FROM users WHERE email = ?", (evil,)).fetchall()
print("parameterized returns:", safe)
```

With `?` placeholders, the database treats the value strictly as **data**, never as SQL. This rule applies to every database library: psycopg uses `%s`, SQLAlchemy uses `:name`.

## ORMs

In larger apps you'll often use an ORM such as **SQLAlchemy** or **SQLModel**, or the Django ORM, which map tables to Python classes. They generate parameterized SQL for you. Learn raw SQL first, though: you'll need it to debug slow queries, write reports, and pass interviews.
