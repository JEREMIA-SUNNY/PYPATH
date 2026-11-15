---
title: groupby, merge and pivot tables
minutes: 11
---
## groupby: split, apply, combine

```python
import pandas as pd

sales = pd.DataFrame({
    "city": ["Kochi", "Pune", "Kochi", "Pune", "Agra", "Kochi"],
    "product": ["Tea", "Coffee", "Coffee", "Tea", "Tea", "Tea"],
    "revenue": [180, 360, 900, 60, 220, 120],
})
print(sales.groupby("city")["revenue"].sum().sort_values(ascending=False))
print(sales.groupby(["city", "product"])["revenue"].agg(["sum", "count", "mean"]))
print(sales.groupby("city").agg(total=("revenue", "sum"), orders=("revenue", "size")))
```

Named aggregation (`total=("revenue", "sum")`) gives you clean column names.

## Dates

```python
import pandas as pd

df = pd.DataFrame({
    "date": pd.to_datetime(["2026-09-03", "2026-09-28", "2026-10-02", "2026-11-11", "2026-11-12"]),
    "revenue": [100, 250, 80, 400, 90],
})
df["month"] = df["date"].dt.to_period("M")
print(df.groupby("month")["revenue"].sum())
print(df["date"].dt.day_name().tolist())
```

## merge: SQL joins for DataFrames

```python
import pandas as pd

orders = pd.DataFrame({"order_id": [1, 2, 3, 4], "customer_id": [10, 11, 10, 12], "total": [500, 120, 80, 999]})
customers = pd.DataFrame({"customer_id": [10, 11, 13], "name": ["Ana", "Bo", "Di"], "city": ["Kochi", "Pune", "Goa"]})

inner = orders.merge(customers, on="customer_id", how="inner")
left = orders.merge(customers, on="customer_id", how="left")
print(inner)
print(left[left["name"].isna()])            # orders with unknown customers
```

`how` can be `"inner"`, `"left"`, `"right"` or `"outer"`, exactly like SQL.

## Pivot tables

```python
import pandas as pd

sales = pd.DataFrame({
    "city": ["Kochi", "Pune", "Kochi", "Pune", "Agra"],
    "product": ["Tea", "Coffee", "Coffee", "Tea", "Tea"],
    "revenue": [180, 360, 900, 60, 220],
})
print(sales.pivot_table(index="city", columns="product", values="revenue", aggfunc="sum", fill_value=0))
```

## Saving results

`df.to_csv("out.csv", index=False)`, `df.to_excel("out.xlsx", index=False)` (needs openpyxl), `df.to_sql("table", conn)`.

> [!TIP]
> Chain operations with methods (`.dropna().assign(...).groupby(...)`) and you'll get readable, reproducible analysis steps. In a notebook, check the result after each step.
