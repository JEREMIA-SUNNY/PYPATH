---
title: Build your own project
minutes: 12
---
Tutorials teach syntax; projects teach programming. Your capstone is a project **you** choose, built from scratch, outside PyPath, in your own Git repository.

## Choosing a project

Pick something you'd actually use. Motivation is what gets a project finished. Some ideas, roughly by difficulty:

**Starter**
- Expense splitter for a trip: who owes whom, settled in the fewest payments
- Quiz game that loads questions from a JSON file and tracks high scores
- Password generator and strength checker (use `secrets`)

**Intermediate**
- Personal finance CLI on SQLite with monthly reports (see the *Expense Tracker* portfolio project)
- Weather or cricket-score notifier using a public API, run on a schedule
- Markdown notes to static website generator

**Ambitious**
- A small web app with FastAPI (career module 25) and a database
- A Telegram or Discord bot that answers questions about your own notes (RAG, career module 30)
- A habit tracker with streaks and charts

## Scope it down

Write the **smallest version that's useful** in one sentence: *"A CLI where I type an expense and it's saved; `report` shows this month's total by category."* Build that first. Put every extra idea in a `TODO.md` and only pick them up once version 1 works.

## A checklist that works

1. Create a repo with a `README.md`, `.gitignore`, and a virtual environment.
2. Sketch the data: what are the nouns? Dataclasses or dicts?
3. Write the core logic as plain functions, with tests.
4. Add the interface (CLI with `argparse`, a web API, or a bot) as a thin layer on top.
5. Handle errors: bad input, missing files, network failures.
6. Write the README: what it does, a screenshot or example output, how to install and run it.
7. Push to GitHub and ask someone to try it.

## Self-review rubric

| Area | Done well when… |
| --- | --- |
| Works | A stranger can follow your README and run it in under 5 minutes |
| Structure | Functions do one thing; no 200-line functions; no copy-pasted blocks |
| Naming | You can read the main flow aloud and it makes sense |
| Errors | Bad input gives a helpful message, not a traceback |
| Tests | The core logic has tests, and they pass |
| Git | Small commits with meaningful messages |

When you've shipped it, add it to the **Career** page as a portfolio project you're proud of. Then pick a career track and keep going. 🚀
