---
title: pandas DataFrames
minutes: 12
---
A **DataFrame** is a table: labelled columns, each a typed **Series**. It's Excel plus SQL plus Python in one object.

```python
import pandas as pd

df = pd.DataFrame({
    "date": ["2026-11-01", "2026-11-01", "2026-11-02", "2026-11-03", "2026-11-03"],
    "city": ["Kochi", "Pune", "Kochi", "Pune", "Agra"],
    "product": ["Tea", "Coffee", "Coffee", "Tea", "Tea"],
    "qty": [3, 2, 5, 1, 4],
    "price": [60, 180, 180, 60, 55],
})
print(df.head())
print(df.shape, list(df.columns))
print(df.dtypes)
```

In real work you'd load a file: `pd.read_csv("sales.csv")`, `pd.read_excel("sales.xlsx")`, `pd.read_json(...)`, or `pd.read_sql(query, conn)`.

## Selecting

```python
import pandas as pd
df = pd.DataFrame({"city": ["Kochi", "Pune", "Agra"], "qty": [3, 7, 1], "price": [60, 180, 55]})

print(df["city"])                           # one column (Series)
print(df[["city", "qty"]])                  # several columns
print(df[df["qty"] > 2])                    # filter rows
print(df[(df["qty"] > 2) & (df["city"] != "Pune")])   # & and |, with parentheses
print(df.loc[0, "city"], df.iloc[-1]["qty"])          # label / position
print(df.query("price > 50 and qty < 5"))
```

## New columns and sorting

```python
import pandas as pd
df = pd.DataFrame({"product": ["Tea", "Coffee"], "qty": [3, 2], "price": [60, 180]})
df["revenue"] = df["qty"] * df["price"]
df["band"] = df["revenue"].apply(lambda r: "high" if r > 200 else "low")
print(df.sort_values("revenue", ascending=False))
print(df["revenue"].describe())
```

## Cleaning messy data

```python
import pandas as pd
import numpy as np

raw = pd.DataFrame({
    "name": [" Ana ", "Bo", "Bo", None, "cy"],
    "amount": ["1,200", "300", "300", "50", None],
    "joined": ["2026-01-05", "2026-02-10", "2026-02-10", "bad date", "2026-03-01"],
})
clean = (
    raw.drop_duplicates()
       .dropna(subset=["name"])
       .assign(
           name=lambda d: d["name"].str.strip().str.title(),
           amount=lambda d: pd.to_numeric(d["amount"].str.replace(",", ""), errors="coerce").fillna(0),
           joined=lambda d: pd.to_datetime(d["joined"], errors="coerce"),
       )
)
print(clean)
print(clean.isna().sum())
```

The `.str` accessor applies string methods to a whole column; `errors="coerce"` turns unparseable values into missing values instead of crashing.
