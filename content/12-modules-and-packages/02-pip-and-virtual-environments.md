---
title: pip and virtual environments
minutes: 9
---
Third-party packages come from **PyPI** and are installed with **pip**. But if every project installs into one global Python, versions clash: project A needs `pandas 2.2`, project B needs `1.5`. The fix is a **virtual environment** per project.

## Creating and using a venv

```bash
cd my-project
python -m venv .venv            # create it (py -m venv .venv on Windows)

# activate it
source .venv/bin/activate        # macOS / Linux
.venv\Scripts\Activate.ps1       # Windows PowerShell

pip install requests             # installs into .venv only
python app.py                    # uses .venv's Python and packages
deactivate                       # leave it
```

Your prompt shows `(.venv)` while it's active. VS Code detects `.venv` automatically; pick it with **Python: Select Interpreter**.

> [!WARNING]
> Never commit `.venv` to Git. Add it to `.gitignore`. It's large and machine-specific; the next item is how you share dependencies instead.

## requirements.txt

Record what the project needs so anyone can recreate the environment:

```bash
pip freeze > requirements.txt      # snapshot exact versions
pip install -r requirements.txt    # recreate elsewhere
```

A hand-written requirements file often lists just top-level packages with version ranges, e.g. `fastapi>=0.110`, `pandas~=2.2`.

## pyproject.toml and modern tools

Newer projects describe dependencies in `pyproject.toml`. Tools like **uv** and **Poetry** manage the venv, lock files and installs for you. uv is very fast and popular for new projects:

```bash
uv init my-api
cd my-api
uv add fastapi
uv run python main.py
```

Whichever tool your team uses, the idea is the same: **one isolated environment per project, with dependencies written down**.

## Useful pip commands

| Command | Does |
| --- | --- |
| `pip install pkg==1.2.3` | install a specific version |
| `pip install -U pkg` | upgrade |
| `pip uninstall pkg` | remove |
| `pip list` | show installed packages |
| `pip show pkg` | details and location |
