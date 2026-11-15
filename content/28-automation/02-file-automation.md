---
title: Safe file automation
minutes: 9
---
Scripts that move or delete files can do a lot of damage quickly. Professional automation follows a few rules.

## 1. Always offer a dry run

Compute the plan first, then either print it or execute it:

```python
from pathlib import Path

CATEGORIES = {".jpg": "images", ".png": "images", ".pdf": "documents", ".csv": "data", ".zip": "archives"}

def plan_moves(folder: Path) -> list[tuple[Path, Path]]:
    moves = []
    for f in sorted(folder.iterdir()):
        if f.is_file():
            sub = CATEGORIES.get(f.suffix.lower(), "other")
            moves.append((f, folder / sub / f.name))
    return moves

demo = Path("downloads-demo")
demo.mkdir(exist_ok=True)
for name in ["photo.JPG", "invoice.pdf", "data.csv", "notes.txt"]:
    (demo / name).write_text("x")

for src, dst in plan_moves(demo):
    print(f"would move {src.name} -> {dst.parent.name}/")
```

## 2. Never silently overwrite

If the destination exists, pick a new name:

```python
from pathlib import Path

def unique_path(path: Path) -> Path:
    n = 1
    candidate = path
    while candidate.exists():
        candidate = path.with_name(f"{path.stem} ({n}){path.suffix}")
        n += 1
    return candidate
```

## 3. Log every action

Write what you did to a log file so you can audit, and even undo, a run.

## 4. Prefer moving to a "trash" folder over deleting

`shutil.move(f, trash / f.name)` is reversible; `f.unlink()` is not.

## 5. Make it idempotent

Running the script twice should be safe: the second run finds nothing to do.

## Watching and batching

- Process files in batches with progress output for long jobs.
- To react to new files automatically, the `watchdog` package watches folders for changes.
- Use `concurrent.futures.ThreadPoolExecutor` to speed up many network-bound jobs (downloads, API calls).
