---
title: matplotlib fundamentals
minutes: 10
---
**matplotlib** is Python's foundational plotting library; pandas and seaborn build on it. Install with `pip install matplotlib`.

Always use the **object-oriented** style: create a figure and axes, then call methods on the axes. It scales from one chart to dashboards of subplots.

```py
import matplotlib.pyplot as plt

months = ["Jul", "Aug", "Sep", "Oct", "Nov"]
revenue = [42, 48, 51, 63, 71]          # ₹ thousands

fig, ax = plt.subplots(figsize=(8, 4))
ax.plot(months, revenue, marker="o")
ax.set_title("Revenue is up 69% since July")
ax.set_xlabel("Month")
ax.set_ylabel("Revenue (₹ thousands)")
ax.grid(alpha=0.3)
fig.tight_layout()
fig.savefig("revenue.png", dpi=150)
plt.show()                                # opens a window when run locally
```

## The common chart types

```py
fig, axes = plt.subplots(1, 3, figsize=(12, 3.5))

axes[0].bar(["Kochi", "Pune", "Agra"], [400, 270, 120])
axes[0].set_title("Bar: compare categories")

axes[1].hist([3, 5, 5, 6, 7, 7, 7, 8, 9, 12], bins=5)
axes[1].set_title("Histogram: distribution")

axes[2].scatter([1, 2, 3, 4, 5], [2.1, 3.9, 6.2, 7.8, 10.1])
axes[2].set_title("Scatter: relationship")

fig.tight_layout()
fig.savefig("charts.png")
```

| Question | Chart |
| --- | --- |
| How does a value change over time? | line |
| How do categories compare? | bar (horizontal if labels are long) |
| How are values distributed? | histogram or box plot |
| Do two variables move together? | scatter |
| What share is each part? | stacked bar (pie only for 2–3 parts) |

## Plotting straight from pandas

```py
import pandas as pd

df = pd.DataFrame({"city": ["Kochi", "Pune", "Agra"], "revenue": [400, 270, 120]})
ax = df.plot.barh(x="city", y="revenue", legend=False, title="Revenue by city")
ax.figure.savefig("by_city.png", bbox_inches="tight")
```

## Running without a screen

On servers, in tests and in scripts that only save files, select the non-interactive backend **before** importing pyplot:

```py
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
```
