---
title: Linters, type checkers and CI
minutes: 8
---
Teams automate the boring parts of code review.

## ruff: linting and formatting

**ruff** is an extremely fast linter and formatter that replaces flake8, isort and black in one tool:

```bash
pip install ruff
ruff check .            # find problems: unused imports, undefined names, bugs
ruff check . --fix      # auto-fix what it can
ruff format .           # consistent formatting
```

Configure it in `pyproject.toml`:

```toml
[tool.ruff]
line-length = 100
[tool.ruff.lint]
select = ["E", "F", "I", "B", "UP"]   # pycodestyle, pyflakes, isort, bugbear, pyupgrade
```

## mypy: static type checking

```bash
pip install mypy
mypy src
```

mypy uses your type hints to catch bugs like `None` being passed where a `str` is required, or calling a method that doesn't exist. Start with hints on public functions; tighten settings (`strict = true`) as the codebase matures.

## pre-commit: checks before every commit

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.8.0
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format
```

`pip install pre-commit && pre-commit install` and the hooks run on every `git commit`.

## Continuous integration with GitHub Actions

Run the same checks on every push and pull request:

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -e ".[dev]"
      - run: ruff check .
      - run: mypy src
      - run: pytest -q
```

A green CI badge in your README tells a recruiter you work like a professional.
