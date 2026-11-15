---
title: Charts and reports that land
minutes: 8
---
A chart is an argument. The best analysts make the point obvious in two seconds.

## Make the title the finding

"Revenue by month" describes the axes. **"Revenue up 69% since July, driven by Kochi"** tells the reader what to take away. Lead with the answer.

## Remove what doesn't help

- Label axes with **units** (₹, %, days).
- Start bar charts at zero; don't truncate the axis to exaggerate differences.
- Sort bars by value unless the category has a natural order (months, sizes).
- One highlight colour for what matters; grey for everything else.
- Avoid 3D effects, dual axes and rainbow palettes.

```py
import matplotlib.pyplot as plt

cities = ["Agra", "Pune", "Goa", "Kochi"]
growth = [4, 6, 9, 31]
colors = ["#a1a1aa"] * 3 + ["#6366f1"]

fig, ax = plt.subplots(figsize=(6, 3))
ax.barh(cities, growth, color=colors)
ax.set_title("Kochi grew 31%, three times any other city", loc="left")
ax.set_xlabel("Year-on-year growth (%)")
for side in ("top", "right"):
    ax.spines[side].set_visible(False)
fig.tight_layout()
fig.savefig("growth.png", dpi=150)
```

## A simple report structure

1. **Headline**: the single most important finding, with a number.
2. **Context**: data source, date range, what was excluded.
3. **Findings**: 3 to 5 points, each with one chart or table.
4. **Recommendation**: what should someone do differently?
5. **Appendix**: method details and caveats.

## Generating the report with code

Analysts often produce the summary table and text from code so it can be rerun next month. Markdown is a convenient output: it renders on GitHub, in notebooks and in most wikis.

```python
rows = [("Kochi", 400, 2), ("Pune", 270, 3), ("Agra", 120, 1)]
lines = ["| City | Revenue (₹) | Orders |", "| --- | ---: | ---: |"]
lines += [f"| {c} | {r:,} | {n} |" for c, r, n in rows]
print("\n".join(lines))
```

Tools like **Jupyter**, **Quarto** and **Streamlit** turn the same code into shareable notebooks, documents and dashboards.
