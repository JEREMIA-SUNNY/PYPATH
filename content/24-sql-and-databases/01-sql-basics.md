---
title: SQL basics
minutes: 11
---
SQL is the language of relational databases (PostgreSQL, MySQL, SQLite, SQL Server). It appears in nearly every backend and data job description. Python ships with **SQLite**, a real SQL database stored in a single file, so you can practise right here.

```python
import sqlite3

db = sqlite3.connect(":memory:")       # a throwaway in-memory database
db.executescript("""
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    price REAL NOT NULL,
    stock INTEGER DEFAULT 0
);
INSERT INTO products (name, category, price, stock) VALUES
  ('Keyboard', 'peripherals', 2499, 12),
  ('Mouse', 'peripherals', 799, 40),
  ('Monitor', 'displays', 11999, 5),
  ('Webcam', 'peripherals', 3499, 0),
  ('Laptop stand', 'accessories', 1299, 18);
""")

def show(sql, params=()):
    for row in db.execute(sql, params):
        print(row)
    print("-" * 30)

show("SELECT name, price FROM products WHERE price < 3000 ORDER BY price DESC")
show("SELECT category, COUNT(*), AVG(price) FROM products GROUP BY category")
show("SELECT name FROM products WHERE stock = 0 OR name LIKE 'M%'")
```

## The core statements

| Statement | Example |
| --- | --- |
| Read | `SELECT name, price FROM products WHERE stock > 0 ORDER BY price LIMIT 10` |
| Insert | `INSERT INTO products (name, price) VALUES ('Pen', 20)` |
| Update | `UPDATE products SET stock = stock - 1 WHERE id = 3` |
| Delete | `DELETE FROM products WHERE stock = 0` |

> [!WARNING]
> An `UPDATE` or `DELETE` without a `WHERE` clause changes **every row**. Run the matching `SELECT` first.

## Filtering and sorting

- `WHERE price BETWEEN 500 AND 3000`, `WHERE category IN ('a', 'b')`, `WHERE name LIKE '%board%'`, `WHERE category IS NULL`
- `ORDER BY category, price DESC`, `LIMIT 5 OFFSET 10`

## Aggregates and GROUP BY

`COUNT`, `SUM`, `AVG`, `MIN`, `MAX` summarise rows. `GROUP BY` produces one row per group, and `HAVING` filters groups (whereas `WHERE` filters rows before grouping):

```python
import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE sales (city TEXT, amount REAL)")
db.executemany("INSERT INTO sales VALUES (?, ?)", [("Kochi", 500), ("Pune", 200), ("Kochi", 700), ("Pune", 50), ("Agra", 90)])
for row in db.execute("""
    SELECT city, SUM(amount) AS total, COUNT(*) AS n
    FROM sales
    GROUP BY city
    HAVING total > 100
    ORDER BY total DESC
"""):
    print(row)
```
