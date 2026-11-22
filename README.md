<div align="center">

# 🐍 PyPath

### Learn Python from zero to job-ready. Right on your own computer.

Lessons you can run, quizzes that remember what you miss, and coding exercises graded by **real tests**.<br>
No accounts. No tracking. No server. Your progress is one file you own.

[![Live demo](https://img.shields.io/badge/live%20demo-open-000000?style=for-the-badge&logo=vercel)](https://pypath-bice.vercel.app/)
[![License: MIT](https://img.shields.io/badge/license-MIT-3776AB?style=for-the-badge)](LICENSE)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs)
![Python](https://img.shields.io/badge/Python-3.10+-FFD43B?style=for-the-badge&logo=python&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Local first](https://img.shields.io/badge/local--first-100%25-2ea44f?style=for-the-badge)

[🌐 Live demo](https://pypath-bice.vercel.app/) · [Quick start](#-quick-start) · [What you get](#-what-you-get) · [Curriculum](#-curriculum) · [Hosted mode](#hosted-mode-vercel) · [Contributing](#-adding-or-editing-content) · [License](#-license)

</div>

---

## ✨ What you get

| | |
| --- | --- |
| 📚 **111 lessons** | Short, focused, and every Python block has a **Run** button that executes on your machine. |
| 🧪 **158 coding exercises** | A real editor, hints, and hidden tests. Submit and see exactly which assertion failed and why. |
| 🧠 **266 quiz questions** | Instant explanations, plus a **spaced-repetition review queue** that brings back what you got wrong. |
| 🎬 **Netflix-style profiles** | Open the app and pick **who's learning**: AI Engineer, Python, Backend, Data, Automation or Interview. Each profile has its **own syllabus and its own progress**, tracked separately. |
| 🧭 **6 separate syllabi** | Python (20 modules), AI Engineer (32, with the Python it needs built in), Backend, Data, Automation and Interview (18 to 20 each). Learn, Quizzes, Code, Review and the dashboard only show your profile's modules. |
| 🏗️ **Portfolio projects** | Step-by-step builds with ready-to-paste résumé bullets. |
| 🎯 **Interview prep** | Big-O, hashing, two pointers, trees, graphs, DP, with timed **mock interviews**. |
| 🔥 **Motivation built in** | XP, streaks, a heatmap, achievements and a daily challenge. |
| 🔎 **Search everything** | `Ctrl/Cmd + K` jumps to any lesson, exercise or quiz. |
| 🌗 **Dark and light** | A clean, fast UI that stays out of your way. |

### Why PyPath?

- **Local-first.** Code runs with your own Python, and progress lives in a plain JSON file you can back up, move or edit.
- **Real grading.** Exercises are checked by actual Python `assert` tests, not string matching, so there is no fake "correct".
- **Zero accounts.** Nothing to sign up for, nothing leaves your computer.
- **Two ways to run.** Use it locally with full Python, or deploy it as a **static website** that runs Python in the browser with WebAssembly.
- **Open content.** Every lesson, quiz and exercise is a plain Markdown or YAML file. Add your own without touching code.

## 🗺️ Curriculum

**49 modules** in three sections, plus a full **AI Engineer syllabus** (below).

| Section | Modules | You will learn |
| --- | --- | --- |
| 🧱 **Foundations** (20) | Getting Started → Capstone | Numbers, strings, lists, dicts, files, control flow, loops, functions, OOP, modules and pip, errors and testing, decorators and generators, the standard library, modern Python, plus **Tic Tac Toe** and **Blackjack** projects. |
| 💼 **Career** (19) | Developer Workflow → AI Capstone | Testing and code quality, HTTP and APIs, SQL, **FastAPI**, **NumPy and pandas**, data visualization, automation and CLI tools, **building with LLMs**, embeddings and **RAG**. |
| 🎯 **Interview** (10) | Big-O → AI Engineer Interview Questions | Arrays and hashing, two pointers and sliding window, stacks, queues and binary search, recursion and backtracking, linked lists and trees, graphs and heaps, dynamic programming. |

## 🤖 The AI Engineer syllabus

Built from a review of a top-rated LLM engineering course (8 weeks, 8 projects) and 2026 AI engineering roadmaps and job-posting analyses, where **LLM APIs, evals, RAG and agents** are the most requested skills. Pick the **AI Engineer** profile and you get one 32-module syllabus: the Python you need first, then the AI path, with its own progress:

| Stage | Modules |
| --- | --- |
| 1. Python and engineering base | Python Foundations, Developer Workflow, Testing, HTTP and APIs, FastAPI |
| 2. LLM fundamentals | **How LLMs Work** (tokens, context, sampling, model choice), **Building with LLMs** (APIs, structured output, tool calling, streaming, retries), **Prompt and Context Engineering** |
| 3. Models and retrieval | **Open-Source and Local LLMs** (Ollama, Hugging Face, quantization), **Embeddings, Search and RAG** (chunking, hybrid search, RRF, retrieval metrics) |
| 4. Agents | **Agents and Tool Use** (the loop, memory, guardrails), **MCP and Multi-Agent Systems** (JSON-RPC, tool servers, state graphs) |
| 5. Quality and customisation | **Evals** (datasets, checks, LLM-as-judge, regression gates), **Fine-Tuning** (SFT data, LoRA and QLoRA, proving it worked) |
| 6. Production | **LLMOps and Security** (caching, rate limiting, PII redaction, prompt injection, observability) |
| 7. Prove it | **AI Capstone** (documents Q&A with citations, abstention and an eval harness), **AI Engineer Interview Questions**, and four portfolio projects (brochure generator, support agent, RAG knowledge worker, multi-agent deal finder) |

Every exercise is graded by real tests against **fake model clients**, so you need **no API key and no GPU**, and everything also runs in the browser version.

## 🚀 Quick start

**You need:** Node.js 20.9+ (`node -v`) and Python 3.10+ on your PATH (`python --version`, or `py --version` on Windows).

```bash
git clone https://github.com/JEREMIA-SUNNY/PYPATH.git
cd PYPATH
npm install
npm run dev
```

Open **http://127.0.0.1:3000** (use `127.0.0.1`, not `localhost`; the server only listens on your own machine).

For a faster, production-style run:

```bash
npm run build
npm start
```

## 🛠️ Built with

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · CodeMirror 6 · Motion · Pyodide (hosted mode)

## 💾 Where your progress lives

Everything (lessons done, quiz scores, review queue, exercise code, notes, projects) is saved in `data/progress.json` inside this folder. Back it up or move it with **Settings → Export / Import**. Reset keeps a backup copy in `data/`.

Set `PYPATH_DATA_DIR` to store it somewhere else, and `PYPATH_PYTHON` to point at a specific Python interpreter.

## 📦 Packages for career modules

Some career modules use third-party libraries. Install them once into the Python that PyPath uses:

```bash
pip install requests beautifulsoup4 pillow pypdf fastapi httpx uvicorn numpy pandas matplotlib openpyxl pytest
```

(On Windows: `py -m pip install ...`.) If an exercise needs a missing package, the output panel tells you which one.

## ⌨️ Keyboard shortcuts

| Keys | Action |
| --- | --- |
| `Ctrl/Cmd + K` | search everything |
| `Ctrl/Cmd + Enter` | run code |
| `Ctrl/Cmd + Shift + Enter` | submit exercise |
| `1`–`4`, `Enter` | answer quiz questions |

## ✍️ Adding or editing content

Content is plain files under `content/`, so no code changes are needed.

```text
content/
  03-strings/
    module.yaml        # title, summary, icon, section, skills, packages
    01-basics.md       # lesson; front-matter: title, minutes
    quiz.yaml          # q, code?, options, answer (0-based), explain
    exercises.yaml     # id, title, difficulty, prompt, starter, hints, tests, solution
  tracks.yaml          # career tracks
  projects.yaml        # portfolio projects
```

- In lessons, ```` ```python ```` blocks get a **Run** button; use ```` ```py ```` for display-only code (e.g. code that calls `input()`).
- `> [!TIP]`, `> [!NOTE]` and `> [!WARNING]` blockquotes render as callouts.
- Exercise tests are Python `assert` snippets run after the learner's code in the same namespace. `__stdout__` holds what the program printed.
- After editing, run `npm run check:content`. It validates every file and proves each solution passes its tests and each starter fails at least one.

## 🔒 Security

The app executes Python code you write, with your user's permissions, just like running a script yourself. The API only answers requests from this computer (loopback host, same origin, custom header), so other websites and devices on your network can't trigger code execution.

## 🌐 Try it online (hosted mode)

**Live demo: https://pypath-bice.vercel.app/**

Besides the local app, PyPath is also available as a website. It can be built as a **fully static site with no server code**. Progress is saved to a file on the visitor's own computer, and Python runs in their browser with [Pyodide](https://pyodide.org) (WebAssembly). Local mode is unchanged.

```bash
npm run dev:hosted     # http://localhost:3001
npm run build:hosted   # static site in ./out
```

The mode is chosen at build time with `NEXT_PUBLIC_PYPATH_MODE` (`local` by default, or `hosted`).

### How progress works

- On the first visit the user creates (or picks) a `pypath-progress.json` file with the File System Access API. Every change is written to that file, and a mirror plus the last 5 snapshots are kept in the browser's IndexedDB.
- On every later visit the file is read again (Chrome may ask for one click, or none if the user chose "Allow on every visit"). If the browser copy is newer than the file, for example after a failed write, the browser copy wins and the old file content is kept as a snapshot.
- A file that is missing or damaged is never overwritten: the user can find it, restore the browser backup into a new file, or start fresh.
- The file has exactly the same format as local mode's `data/progress.json`, so you can point the hosted site at it, or copy a hosted file into `data/`.

| Browser | Progress |
| --- | --- |
| Chrome, Edge, Opera, Chrome on Android | Automatic saving to a file, plus browser backup |
| Firefox, Safari, iPhone | Browser-only mode: kept in IndexedDB, with a banner asking for regular **Download backup** |

### What can't run in the browser

Real network calls, sending email, running servers (`uvicorn`), threads and `subprocess` don't work in Pyodide. `npm run check:content:browser` runs every exercise solution and every lesson `python` block in Pyodide, compares with real Python, and writes `content/browser-compat.json`. In hosted mode, anything on that list shows a notice instead of a Run button. Packages are loaded from the Pyodide distribution, or from PyPI through micropip when they are pure Python.

Exercise tests are sent to the browser so they can be graded there, which means anyone reading the page source can see them. That is fine for a learning tool.

## 📄 License

PyPath is open source under the [MIT License](LICENSE). Use it, learn from it, fork it, teach with it.

<div align="center">

**If PyPath helps you learn, give it a ⭐ on GitHub.**

</div>
