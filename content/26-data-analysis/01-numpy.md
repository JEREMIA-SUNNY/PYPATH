---
title: NumPy arrays
minutes: 10
---
**NumPy** gives Python fast, fixed-type arrays and vectorised maths. pandas, scikit-learn, PyTorch and nearly every data library are built on it. Install with `pip install numpy pandas`.

```python
import numpy as np

prices = np.array([120, 80, 250, 99, 310])
print(prices.dtype, prices.shape)
print(prices * 1.18)                 # maths on every element, no loop
print(prices.mean(), prices.max(), prices.std().round(2))
print(prices[prices > 100])          # boolean mask filtering
```

## Why vectorise?

A Python loop handles one number at a time through the interpreter. NumPy runs the loop in compiled C over a compact block of memory, often 10 to 100 times faster:

```python
import numpy as np, time

data = np.random.default_rng(0).random(1_000_000)
t = time.perf_counter(); s1 = sum(x * 2 for x in data); t1 = time.perf_counter() - t
t = time.perf_counter(); s2 = (data * 2).sum(); t2 = time.perf_counter() - t
print(f"loop {t1:.3f}s vs numpy {t2:.4f}s")
```

## Creating arrays

```python
import numpy as np

print(np.arange(0, 10, 2), np.linspace(0, 1, 5))
print(np.zeros((2, 3)), np.ones(3, dtype=int))
grid = np.arange(12).reshape(3, 4)
print(grid)
print(grid[1, 2], grid[:, 0], grid[0])     # row 1 col 2, first column, first row
print(grid.sum(axis=0), grid.sum(axis=1))   # column sums, row sums
```

## Broadcasting

Arrays of different shapes combine when their dimensions are compatible. A common use is normalising each column:

```python
import numpy as np

scores = np.array([[70, 80], [90, 60], [50, 100]], dtype=float)
col_mean = scores.mean(axis=0)
col_std = scores.std(axis=0)
print((scores - col_mean) / col_std)        # z-scores per column
```

## Handy functions

`np.where(cond, a, b)`, `np.clip(x, lo, hi)`, `np.unique(x, return_counts=True)`, `np.percentile(x, 90)`, `np.round(x, 2)`, `np.isnan(x)`.
