---
title: Installing Python and running code
minutes: 7
---
PyPath needs Python **3.10 or newer**. Check what you have by opening a terminal and typing:

```bash
python --version      # Windows (or: py --version)
python3 --version     # macOS / Linux
```

If that prints `Python 3.12.x` or similar, you're set. If not, install it:

- **Windows**: download from python.org and tick **"Add python.exe to PATH"** in the installer. The `py` launcher also gets installed.
- **macOS**: install from python.org, or `brew install python`.
- **Linux**: usually preinstalled; otherwise `sudo apt install python3 python3-pip`.

## Three ways to run Python

**1. The REPL (interactive shell).** Type `python` (or `py`) and press Enter. You get a `>>>` prompt that evaluates each line immediately. It's perfect for quick experiments. Exit with `exit()`.

```py
>>> 2 + 3
5
>>> "py" * 3
'pypypy'
```

**2. Script files.** Save code in a file ending in `.py` and run it:

```bash
python hello.py
```

This is how real programs run. Unlike the REPL, a script only shows what you `print()`.

**3. An editor.** VS Code with the official Python extension gives you syntax highlighting, linting, a debugger and a Run button. Install it now; you'll use it for the portfolio projects.

PyPath itself is a fourth option: the editor in **Code** and **Playground** saves your code to a temporary `main.py` and runs it with your Python.

## print() is your best friend

```python
print("Hello")
print("Sum:", 2 + 3)          # several values, separated by spaces
print("a", "b", "c", sep="-")  # change the separator
print("no newline", end="")    # change the line ending
print("!")
```

## Comments

Anything after `#` is ignored by Python. Use comments to explain *why*, not *what*.

```python
# Prices are stored in paise to avoid float rounding issues
price_paise = 49900
print(price_paise / 100)
```
