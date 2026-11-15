---
title: Files and folders with os, pathlib, shutil and zipfile
minutes: 9
---
Automation scripts constantly list, move, copy and archive files. These four modules cover it.

## pathlib for paths

```python
from pathlib import Path

base = Path("demo")
(base / "reports").mkdir(parents=True, exist_ok=True)
for name in ["a.txt", "b.csv", "c.txt"]:
    (base / name).write_text(f"data for {name}\n", encoding="utf-8")

print(sorted(p.name for p in base.iterdir()))
print(sorted(p.name for p in base.glob("*.txt")))
print([str(p) for p in sorted(base.rglob("*")) if p.is_file()])
p = base / "b.csv"
print(p.stem, p.suffix, p.parent, p.stat().st_size, "bytes")
```

`glob("*.txt")` matches in one folder; `rglob` searches all subfolders.

## shutil for copying and moving

```python
import shutil
from pathlib import Path

Path("demo2").mkdir(exist_ok=True)
Path("demo2/notes.txt").write_text("hi\n", encoding="utf-8")
shutil.copy("demo2/notes.txt", "demo2/notes-copy.txt")
Path("demo2/archive").mkdir(exist_ok=True)
shutil.move("demo2/notes-copy.txt", "demo2/archive/notes-copy.txt")
print(sorted(str(p) for p in Path("demo2").rglob("*")))
shutil.rmtree("demo2")        # deletes a whole tree. Careful!
print(Path("demo2").exists())
```

## os for the environment

```python
import os

print(os.getcwd())
print(os.environ.get("HOME") or os.environ.get("USERPROFILE"))
print(os.environ.get("API_KEY", "not set"))
```

Reading secrets from environment variables keeps them out of your code.

## zipfile

```python
import zipfile
from pathlib import Path

Path("pack").mkdir(exist_ok=True)
for i in range(3):
    Path(f"pack/file{i}.txt").write_text(f"file {i}\n", encoding="utf-8")

with zipfile.ZipFile("pack.zip", "w", zipfile.ZIP_DEFLATED) as zf:
    for f in Path("pack").glob("*.txt"):
        zf.write(f, arcname=f.name)

with zipfile.ZipFile("pack.zip") as zf:
    print(zf.namelist())
    zf.extractall("unpacked")
print(sorted(p.name for p in Path("unpacked").iterdir()))
```

`shutil.make_archive("backup", "zip", "pack")` zips a whole folder in one line.
