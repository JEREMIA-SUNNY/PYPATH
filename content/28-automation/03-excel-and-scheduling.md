---
title: Excel reports and scheduling
minutes: 9
---
## Excel with openpyxl

Many businesses run on spreadsheets. `openpyxl` reads and writes `.xlsx` files (`pip install openpyxl`).

```py
from openpyxl import Workbook, load_workbook
from openpyxl.styles import Font

wb = Workbook()
ws = wb.active
ws.title = "Sales"
ws.append(["City", "Revenue", "Orders"])
for row in [("Kochi", 12400, 2), ("Pune", 870, 3)]:
    ws.append(row)
ws["A1"].font = ws["B1"].font = ws["C1"].font = Font(bold=True)
ws["E1"] = "Total"
ws["F1"] = "=SUM(B2:B3)"                  # a live Excel formula
ws.column_dimensions["A"].width = 14
wb.save("report.xlsx")

wb = load_workbook("report.xlsx")
for city, revenue, orders in wb["Sales"].iter_rows(min_row=2, values_only=True):
    print(city, revenue, orders)
```

For analysis-heavy work, pandas reads and writes Excel too: `pd.read_excel`, `df.to_excel` (using openpyxl under the hood).

## Scheduling scripts

Automation pays off when it runs without you.

| Platform | Tool | Example |
| --- | --- | --- |
| Linux / macOS | cron | `30 8 * * 1-5 /home/jerry/.venv/bin/python /home/jerry/report.py` |
| Windows | Task Scheduler | Create Basic Task → Daily → Start a program: `C:\...\.venv\Scripts\python.exe`, argument `report.py` |
| Any | GitHub Actions | `on: schedule: - cron: "0 3 * * *"` |
| In-process | `schedule` package | `schedule.every().day.at("08:30").do(job)` |

Tips for scheduled jobs:

- Use **absolute paths** (cron runs with a minimal environment and a different working directory).
- Point to the **venv's** Python so the right packages are available.
- Log to a file and alert on failure (email, Slack webhook), because nobody watches a cron job's terminal.

```bash
# cron line, with output appended to a log file
0 7 * * * cd /home/jerry/reports && .venv/bin/python daily.py >> logs/daily.log 2>&1
```
