---
title: Eval datasets and deterministic checks
minutes: 11
---
## Why evals are the job

LLM output is non-deterministic and "looks fine" is not a test. **Evals** are to LLM apps what unit tests are to code: a repeatable way to know whether a change (new prompt, new model, new chunk size) made things better or worse. Teams that ship reliable AI features all have them. Teams without them argue from anecdotes.

## Start with error analysis, not a framework

1. Collect **real inputs**: logs, support tickets, or 20 examples you write yourself.
2. Run your app and **read the outputs**. Write down how each failure looks ("ignored the refund policy", "invented an order id", "too long").
3. Group the failures. The top two or three groups become your first eval cases.
4. Turn each into a **test case**: an input plus a way to check the output.

A set of **50 to 100 well-chosen cases** beats thousands of random ones. Keep a growing *golden set*, and add every production bug to it so it never returns.

## Deterministic checks first

Wherever you can, check output with plain code. It is free, instant and perfectly repeatable:

- contains or does not contain certain phrases
- valid JSON with the required keys
- length limits, language, format
- cites a source that really was retrieved
- calls the right tool with the right arguments

```python
import json

def check_output(output, check):
    failures = []
    for phrase in check.get("contains", []):
        if phrase.lower() not in output.lower():
            failures.append(f"missing: {phrase}")
    for phrase in check.get("not_contains", []):
        if phrase.lower() in output.lower():
            failures.append(f"forbidden: {phrase}")
    if "max_words" in check and len(output.split()) > check["max_words"]:
        failures.append("too long")
    if "json_keys" in check:
        try:
            data = json.loads(output)
            failures += [f"missing key: {k}" for k in check["json_keys"] if k not in data]
        except ValueError:
            failures.append("not valid JSON")
    return failures

print(check_output("Refunds take 5 days.", {"contains": ["refund", "5 days"], "max_words": 10}))
print(check_output("sorry, no idea", {"contains": ["refund"], "max_words": 2}))
```

## A tiny eval runner

An eval run feeds every case to the app, applies the checks and produces a **report**: pass rate plus the list of failing case ids. Everything else (dashboards, tracking over time) builds on that.

> [!TIP]
> Make the app a plain function `model_fn(input) -> output`. Then you can run the same evals against a fake model in unit tests, a cheap model while developing, and the production model before release.
