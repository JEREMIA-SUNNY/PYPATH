---
title: Why Python, and how PyPath works
minutes: 5
---
Python is a general-purpose language that reads almost like English. It's the most-used language for data, AI and automation, and a top choice for backend web services. Companies use it because developers ship quickly with it, and its library ecosystem (over half a million packages) means most problems are already half-solved.

Here is a complete Python program:

```python
name = "Jerry"
print(f"Hello, {name}! Welcome to Python.")
```

Press **Run** on the block above. That ran on *your* computer, using *your* Python installation. Every code block marked `python` in a lesson is runnable.

## What makes Python different

- **No braces or semicolons.** Indentation (4 spaces) defines blocks.
- **Dynamically typed.** You don't declare `int x`; a variable can hold any type.
- **Batteries included.** The standard library covers files, dates, JSON, HTTP, testing, and much more.
- **Interpreted.** You run source files directly with `python file.py`; no build step.

Coming from JavaScript or TypeScript? You'll find Python familiar: functions are first-class, there are classes, modules, async/await and type hints. The biggest adjustments are significant whitespace, `snake_case` names, and `None` instead of `null`/`undefined`.

## How PyPath is organised

1. **Lessons** explain one idea with runnable examples. Mark each complete when you're done.
2. **Quizzes** (their own section) check understanding. Missed questions come back later in **Review**.
3. **Code** exercises give you a prompt, starter code and hidden tests. **Run** shows output; **Submit** runs the tests.

Many early exercises hand you a function skeleton like this:

```py
def double(n):
    # your code here
    return ...
```

You'll learn how functions work in module 9. Until then, just put your code inside the function and `return` the answer; the tests call the function for you.

> [!TIP]
> Progress, notes and your code are saved to `data/progress.json` in the PyPath folder. Back it up from Settings any time.
