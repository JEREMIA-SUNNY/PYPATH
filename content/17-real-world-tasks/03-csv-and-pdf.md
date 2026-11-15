---
title: CSV and PDF files
minutes: 9
---
## CSV with the csv module

CSV (comma-separated values) is the lingua franca of spreadsheets and data exports. The `csv` module handles quoting and commas inside fields correctly. Never parse CSV with `split(",")`.

```python
import csv

with open("sales.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["date", "product", "qty", "price"])
    writer.writerow(["2026-11-01", "Coffee, large", 2, 180])
    writer.writerow(["2026-11-01", "Tea", 3, 60])
    writer.writerow(["2026-11-02", "Coffee, large", 1, 180])

with open("sales.csv", newline="", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))

print(rows[0])
revenue = sum(int(r["qty"]) * float(r["price"]) for r in rows)
print(f"revenue: ₹{revenue:,.2f}")
```

- Open CSV files with `newline=""` so the module controls line endings.
- `DictReader` gives each row as a dict keyed by the header; every value is a **string**, so convert numbers yourself.
- `DictWriter(f, fieldnames=[...])` writes dicts back out.

Excel files (`.xlsx`) need a package: `openpyxl` (covered in *Automation and CLI Tools*) or pandas.

## PDFs with pypdf

`pip install pypdf` lets you read text and split or merge pages:

```py
from pypdf import PdfReader, PdfWriter

reader = PdfReader("statement.pdf")
print(len(reader.pages), "pages")
print(reader.pages[0].extract_text()[:300])

writer = PdfWriter()
for page in reader.pages[:2]:          # keep the first two pages
    writer.add_page(page)
with open("first-two.pdf", "wb") as f:
    writer.write(f)
```

Merging several PDFs is the same idea: add pages from each reader to one writer.

> [!NOTE]
> Text extraction works on PDFs that contain real text. Scanned PDFs are just images and need OCR (for example `pytesseract`).
