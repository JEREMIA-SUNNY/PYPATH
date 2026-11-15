---
title: Command line basics
minutes: 6
---
Developers live in the terminal. You'll use it to run scripts, install packages with `pip`, manage virtual environments and use Git. Here are the commands you need on day one.

| Task | Windows (PowerShell) | macOS / Linux |
| --- | --- | --- |
| Where am I? | `pwd` | `pwd` |
| List files | `dir` or `ls` | `ls` |
| Change folder | `cd projects` | `cd projects` |
| Up one folder | `cd ..` | `cd ..` |
| Make a folder | `mkdir demo` | `mkdir demo` |
| Clear screen | `cls` | `clear` |
| Run a script | `py hello.py` | `python3 hello.py` |

## Paths

A **path** says where a file lives. `C:\Users\jerry\code\hello.py` (Windows) or `/home/jerry/code/hello.py` (Linux) are **absolute** paths. `code/hello.py` is **relative** to the folder you're in. Most "file not found" errors are really "I'm in the wrong folder" errors, so check with `pwd`.

## Your first script

```bash
mkdir python-practice
cd python-practice
# create hello.py in VS Code with: print("Hello from a file")
python hello.py
```

## Installing packages with pip

Python's package manager is **pip**. It downloads libraries from PyPI, the Python Package Index:

```bash
pip install requests
# Windows, if pip isn't found:
py -m pip install requests
```

You'll learn to isolate packages per project with virtual environments in the *Modules, Packages and pip* module.

> [!TIP]
> Press the Up arrow to re-run previous commands, and Tab to auto-complete file and folder names. Those two keys save hours.
