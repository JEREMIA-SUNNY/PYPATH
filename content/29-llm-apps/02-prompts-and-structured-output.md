---
title: Prompts and structured output
minutes: 11
---
## Prompts that hold up

Treat prompts like code: versioned, tested and reviewed.

- **Be specific about the task and audience.** "Summarise for a support agent in under 40 words" beats "summarise".
- **Give context and constraints.** Policies, allowed actions, what to do when unsure ("If the order ID is missing, ask for it").
- **Show examples** (few-shot) of tricky inputs and the exact output you want.
- **Separate instructions from data** with clear delimiters, such as XML-style tags.

```python
TEMPLATE = """You classify customer messages for an online store.

<categories>refund, delivery, product_question, other</categories>

<message>
{message}
</message>

Reply with JSON only: {{"category": "...", "urgent": true or false, "summary": "under 15 words"}}"""

print(TEMPLATE.format(message="My parcel is 5 days late and I need it for a wedding tomorrow!!"))
```

(The doubled `{{ }}` are literal braces in a `str.format` template.)

## Structured output

Downstream code needs data, not prose. Ask for JSON, then **parse and validate** it, because models occasionally wrap JSON in prose or code fences, or miss a field.

```python
import json
import re

FENCE = "`" * 3          # a markdown code fence, built so it doesn't end this lesson's block

def extract_json(reply: str) -> dict:
    fenced = re.search(FENCE + r"(?:json)?\s*(\{.*?\})\s*" + FENCE, reply, re.DOTALL)
    candidate = fenced.group(1) if fenced else reply[reply.find("{"): reply.rfind("}") + 1]
    return json.loads(candidate)

reply = "Sure! Here you go:\n" + FENCE + 'json\n{"category": "delivery", "urgent": true, "summary": "Late parcel needed for wedding"}\n' + FENCE
print(reply)
print(extract_json(reply))
```

Then validate the shape, ideally with Pydantic:

```py
from pydantic import BaseModel
from typing import Literal

class Triage(BaseModel):
    category: Literal["refund", "delivery", "product_question", "other"]
    urgent: bool
    summary: str

triage = Triage.model_validate(extract_json(reply))
```

Many providers now offer **structured output / tool calling** modes that guarantee valid JSON matching a schema. Use them when available, and keep validating anyway.

## Tool calling (function calling)

You describe functions (name, description, JSON schema of arguments). The model replies with a request to call one; **your code** runs it and sends back the result. This is the basis of AI **agents**: a loop of think → call tool → observe → answer.
