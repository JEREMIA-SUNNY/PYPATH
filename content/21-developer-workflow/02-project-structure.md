---
title: Project layout and configuration
minutes: 9
---
A consistent layout makes a project easy to navigate, test and package. This "src layout" is the modern standard:

```text
task-api/
├── pyproject.toml        # project metadata and dependencies
├── README.md
├── .gitignore
├── .env.example          # documents required env vars (no real secrets)
├── src/
│   └── task_api/
│       ├── __init__.py
│       ├── main.py       # entry point
│       ├── config.py     # settings from env vars
│       └── services.py
└── tests/
    └── test_services.py
```

## pyproject.toml

```toml
[project]
name = "task-api"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = ["fastapi>=0.110", "uvicorn[standard]"]

[project.optional-dependencies]
dev = ["pytest", "ruff", "mypy"]
```

With **uv**: `uv init`, `uv add fastapi`, `uv add --dev pytest`, `uv run pytest`. With plain pip: `python -m venv .venv`, then `pip install -e ".[dev]"`.

## Configuration from the environment

The **twelve-factor** rule: anything that differs between your laptop, staging and production (database URLs, API keys, debug flags) comes from **environment variables**, not code.

```python
import os

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///dev.db")
DEBUG = os.environ.get("DEBUG", "false").lower() in {"1", "true", "yes"}
print(DATABASE_URL, DEBUG)
```

Locally, people keep these in a `.env` file (git-ignored) and load it with `python-dotenv` or let tools like uv/Docker load it. Commit a `.env.example` listing the variable names with fake values so teammates know what to set.

## Semantic versioning

Libraries and APIs use `MAJOR.MINOR.PATCH`:

- **PATCH** (`1.4.2` → `1.4.3`): bug fixes only
- **MINOR** (`1.4.3` → `1.5.0`): new features, backwards compatible
- **MAJOR** (`1.5.0` → `2.0.0`): breaking changes

Bumping one part resets the parts to its right to zero.
