---
title: Command-line tools with argparse
minutes: 10
---
A good CLI turns a script into a tool other people (and future you) can use without reading the code. `argparse` is in the standard library.

```python
import argparse

def build_parser():
    p = argparse.ArgumentParser(prog="tidy", description="Organise files in a folder.")
    p.add_argument("folder", help="folder to organise")
    p.add_argument("--by", choices=["type", "date"], default="type", help="how to group files")
    p.add_argument("-n", "--dry-run", action="store_true", help="show what would happen")
    p.add_argument("--min-size", type=int, default=0, metavar="KB", help="skip smaller files")
    p.add_argument("-v", "--verbose", action="count", default=0)
    return p

args = build_parser().parse_args(["Downloads", "--by", "date", "-n", "-vv"])
print(args)
print(args.folder, args.by, args.dry_run, args.verbose)
build_parser().print_help()
```

- **Positional** arguments (`folder`) are required by default.
- **Options** start with `-`/`--`. Dashes become underscores: `--dry-run` → `args.dry_run`.
- `type=int` converts and validates; `choices` restricts values; `action="store_true"` makes a flag.
- `--help` is generated for free. Invalid input exits with a clear message and status code 2.

## Subcommands

Tools like `git` have subcommands (`git commit`, `git push`). argparse supports them:

```python
import argparse

parser = argparse.ArgumentParser(prog="expenses")
sub = parser.add_subparsers(dest="command", required=True)
add = sub.add_parser("add", help="record an expense")
add.add_argument("amount", type=float)
add.add_argument("category")
rep = sub.add_parser("report", help="monthly report")
rep.add_argument("--month", default="2026-11")

print(parser.parse_args(["add", "250", "food"]))
print(parser.parse_args(["report"]))
```

## The entry point pattern

```py
def main(argv=None) -> int:
    args = build_parser().parse_args(argv)
    ...
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
```

Accepting `argv` makes `main` easy to test: `main(["Downloads", "--dry-run"])`. Returning an int becomes the process exit code (0 means success), which other scripts and CI rely on.

> [!TIP]
> For bigger CLIs, **Typer** (built on type hints, by the FastAPI author) and **Click** are popular. **Rich** adds colours, tables and progress bars.
