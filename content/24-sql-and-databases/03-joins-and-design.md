---
title: Joins and schema design
minutes: 10
---
Real data lives in several related tables. **Keys** connect them: each table has a **primary key**, and a **foreign key** in one table points at a primary key in another.

```python
import sqlite3

db = sqlite3.connect(":memory:")
db.executescript("""
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, city TEXT);
CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    total REAL,
    placed_on TEXT
);
INSERT INTO customers VALUES (1, 'Ana', 'Kochi'), (2, 'Bo', 'Pune'), (3, 'Cy', 'Kochi');
INSERT INTO orders VALUES
  (10, 1, 1200, '2026-11-01'), (11, 1, 300, '2026-11-03'),
  (12, 2, 4500, '2026-11-02'), (13, NULL, 99, '2026-11-04');
""")

print("INNER JOIN: only matching rows")
for r in db.execute("""
    SELECT c.name, o.id, o.total
    FROM orders o
    JOIN customers c ON c.id = o.customer_id
    ORDER BY o.id"""):
    print(r)

print("LEFT JOIN: every customer, even with no orders")
for r in db.execute("""
    SELECT c.name, COUNT(o.id) AS orders, COALESCE(SUM(o.total), 0) AS spent
    FROM customers c
    LEFT JOIN orders o ON o.customer_id = c.id
    GROUP BY c.id
    ORDER BY spent DESC"""):
    print(r)
```

| Join | Returns |
| --- | --- |
| `INNER JOIN` | rows with a match on both sides |
| `LEFT JOIN` | every row from the left table; NULLs where the right has no match |
| `RIGHT` / `FULL OUTER` | the mirror image / everything from both (not all databases support these) |

## Design guidelines

- **One fact in one place** (normalisation). Store a customer's city in `customers`, not repeated in every order.
- Every table gets a primary key; use foreign keys for relationships.
- Choose types deliberately: money as integer paise or `NUMERIC`, timestamps in UTC.
- Add an **index** on columns you filter or join on often: `CREATE INDEX idx_orders_customer ON orders(customer_id);`. Indexes speed up reads but slow writes slightly.
- Use **migrations** (Alembic, Django migrations) to evolve a schema in production, not hand-run ALTER statements.

## Interview favourites

- Second-highest salary (`ORDER BY ... LIMIT 1 OFFSET 1`, or a subquery)
- Customers with no orders (`LEFT JOIN ... WHERE o.id IS NULL`)
- Top N per group (window functions: `ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...)`, which SQLite supports too)
