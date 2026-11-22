---
title: LLM-as-judge and regression gates
minutes: 11
---
## When code cannot judge

Some qualities are fuzzy: "is the summary faithful?", "is the tone polite?", "does the answer actually use the retrieved context?". For these, use **another model as the judge**, with a clear **rubric**.

A good judge prompt:

- scores **one thing at a time** (faithfulness, relevance, tone, not "overall quality")
- gives a **small scale with definitions** ("5 = every claim is supported by the context, 1 = contradicts it")
- asks for the **reason first**, then the score, in a strict format you can parse
- is **calibrated against human labels**: score 30 cases yourself and check the judge agrees

```python
import re

def parse_verdict(text):
    m = re.search(r"score\s*[:=]\s*([1-5])", text, re.I)
    if not m:
        raise ValueError("no score found")
    reason = re.search(r"reason\s*[:=]\s*(.+)", text, re.I)
    return int(m.group(1)), (reason.group(1).strip() if reason else "")

print(parse_verdict("REASON: Every claim is in the context.\nSCORE: 5"))
```

Judges have known biases: they favour **longer** answers, prefer **their own** model's style, and are sensitive to **position** when comparing two answers (swap the order and average). Use a different model family from the one under test, keep temperature low, and never treat one judge score as ground truth.

## Aggregating scores

```python
def summarize(scores, threshold=4):
    return {
        "mean": sum(scores) / len(scores),
        "min": min(scores),
        "pass_rate": sum(s >= threshold for s in scores) / len(scores),
    }

print(summarize([5, 4, 2, 5, 4]))
```

## Regression gates in CI

The payoff: every prompt, model or retrieval change runs the eval suite **before merge**, just like tests.

1. Store the last good results as the **baseline**.
2. Run the candidate, compare per case.
3. **Fail the build** if the pass rate drops by more than a small tolerance, and list the cases that went from pass to fail.

```python
def compare_runs(baseline, candidate, max_drop=0.02):
    rate = lambda r: sum(r.values()) / len(r)
    regressions = sorted(c for c in baseline if baseline[c] and not candidate.get(c, False))
    return {
        "baseline_rate": rate(baseline),
        "candidate_rate": rate(candidate),
        "regressions": regressions,
        "ok": rate(candidate) >= rate(baseline) - max_drop,
    }

print(compare_runs({"a": True, "b": True, "c": False}, {"a": True, "b": False, "c": True}))
```

> [!NOTE]
> Averages can hide pain. A candidate that fixes three easy cases and breaks one critical case may have a higher pass rate. Always read the regression list, and tag critical cases that must never fail.

For RAG apps, evaluate the two halves **separately**: retrieval (recall@k, MRR) and generation (faithfulness to the retrieved context, answer relevance).
