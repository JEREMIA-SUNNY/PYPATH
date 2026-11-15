"""PyPath harness: runs learner code, then (optionally) hidden tests.

Usage: python harness.py <workdir> <sentinel> <mode>
  workdir   folder containing main.py (and tests.json in test mode)
  sentinel  random token; the final JSON result is printed on a line starting with it
  mode      "run" or "test"

The learner's code runs as a real ``__main__`` module with the working directory
set to ``workdir``. Everything it prints streams to stdout as normal. In test
mode, each test is executed in the same namespace, with two helpers available:

  __stdout__                 everything the program printed while it ran
  capture_output(fn, *a, **k)  -> (return_value, printed_text)
"""

import contextlib
import io
import json
import os
import sys
import time
import traceback
import types

WORKDIR, SENTINEL, MODE = sys.argv[1], sys.argv[2], sys.argv[3]
MAIN_FILE = os.path.join(WORKDIR, "main.py")
REAL_STDOUT = sys.stdout


class Tee(io.TextIOBase):
    """Writes to the real stdout and keeps a copy for tests."""

    def __init__(self, target):
        self.target = target
        self.buffer_text = io.StringIO()

    def write(self, s):
        self.buffer_text.write(s)
        self.target.write(s)
        return len(s)

    def flush(self):
        self.target.flush()

    def isatty(self):
        return False

    def getvalue(self):
        return self.buffer_text.getvalue()


def format_error(exc):
    """Format an exception, keeping only frames from the learner's file."""
    if isinstance(exc, SyntaxError):
        lines = traceback.format_exception_only(type(exc), exc)
        return "".join(lines).replace(MAIN_FILE, "main.py").rstrip()
    frames = [f for f in traceback.extract_tb(exc.__traceback__) if f.filename == MAIN_FILE]
    out = []
    if frames:
        out.append("Traceback (most recent call last):\n")
        for line in traceback.format_list(frames):
            out.append(line.replace(MAIN_FILE, "main.py"))
    out.extend(traceback.format_exception_only(type(exc), exc))
    return "".join(out).rstrip()


def short_error(exc):
    text = traceback.format_exception_only(type(exc), exc)[-1].strip()
    return text.replace(MAIN_FILE, "main.py")


def capture_output(fn, *args, **kwargs):
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        result = fn(*args, **kwargs)
    return result, buf.getvalue()


def emit(result):
    sys.stdout = REAL_STDOUT
    sys.stdout.flush()
    REAL_STDOUT.write("\n" + SENTINEL + json.dumps(result) + "\n")
    REAL_STDOUT.flush()


def main():
    os.chdir(WORKDIR)
    sys.path.insert(0, WORKDIR)
    started = time.perf_counter()
    with open(MAIN_FILE, encoding="utf-8") as fh:
        source = fh.read()

    module = types.ModuleType("__main__")
    module.__file__ = MAIN_FILE
    module.__builtins__ = __builtins__
    sys.modules["__main__"] = module

    tee = Tee(REAL_STDOUT)
    sys.stdout = tee
    error = None
    try:
        code = compile(source, MAIN_FILE, "exec")
        exec(code, module.__dict__)
    except SystemExit as exc:
        if exc.code not in (None, 0):
            error = "SystemExit: " + str(exc.code)
    except BaseException as exc:  # noqa: BLE001 - we report everything to the learner
        error = format_error(exc)
    finally:
        sys.stdout = REAL_STDOUT

    result = {"ok": error is None, "error": error, "tests": [], "durationMs": 0}

    if MODE == "test":
        with open(os.path.join(WORKDIR, "tests.json"), encoding="utf-8") as fh:
            tests = json.load(fh)
        ns = module.__dict__
        ns["__stdout__"] = tee.getvalue()
        ns["capture_output"] = capture_output
        for test in tests:
            name = test.get("name", "test")
            if error is not None:
                result["tests"].append({"name": name, "passed": False,
                                        "message": "Your code raised an error before the tests could run."})
                continue
            buf = io.StringIO()
            try:
                with contextlib.redirect_stdout(buf):
                    exec(compile(test["code"], "<test>", "exec"), ns)
                result["tests"].append({"name": name, "passed": True, "message": ""})
            except AssertionError as exc:
                msg = str(exc).strip() or "Assertion failed: " + test["code"].strip().splitlines()[-1]
                result["tests"].append({"name": name, "passed": False, "message": msg})
            except BaseException as exc:  # noqa: BLE001
                result["tests"].append({"name": name, "passed": False, "message": short_error(exc)})

    result["durationMs"] = round((time.perf_counter() - started) * 1000)
    emit(result)


if __name__ == "__main__":
    main()
