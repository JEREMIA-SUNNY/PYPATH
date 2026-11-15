---
title: Git and GitHub essentials
minutes: 10
---
Every job uses version control, almost always **Git**, usually hosted on **GitHub** or GitLab. Your GitHub profile is also your portfolio, so get comfortable here.

## The everyday loop

```bash
git init                         # or: git clone https://github.com/you/repo.git
git status                       # what changed?
git add app.py tests/            # stage changes
git commit -m "Add CSV export to report command"
git push                         # send commits to GitHub
git pull                         # get teammates' commits
```

Write commit messages in the imperative ("Add", "Fix", "Refactor") that say **what and why**, not "update" or "changes".

## Branches and pull requests

Teams never commit straight to `main`. The usual flow:

```bash
git switch -c feature/export-csv      # new branch
# ...edit, add, commit (several small commits)...
git push -u origin feature/export-csv
# open a Pull Request on GitHub, get a review, merge
git switch main && git pull
```

| Command | Use |
| --- | --- |
| `git log --oneline --graph` | see history |
| `git diff` / `git diff --staged` | see unstaged / staged changes |
| `git restore file.py` | throw away local changes to a file |
| `git stash` / `git stash pop` | park work temporarily |
| `git rebase main` / `git merge main` | bring your branch up to date |

## .gitignore for Python

```text
.venv/
__pycache__/
*.pyc
.env
.pytest_cache/
.mypy_cache/
dist/
*.egg-info/
.DS_Store
```

> [!WARNING]
> Never commit secrets. If you accidentally push an API key, **revoke it immediately**; deleting the commit isn't enough because it stays in history and in forks.

## A portfolio-ready repo

- A `README.md` with what it does, a screenshot, how to install and run, and how to test.
- Small, meaningful commits rather than one giant "final" commit.
- A `LICENSE` (MIT is common for personal projects).
- Optional: a GitHub Actions workflow that runs your tests on every push (see the next module).
