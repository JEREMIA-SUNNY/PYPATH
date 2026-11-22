---
title: The agent loop
minutes: 11
---
## What is an agent?

A normal LLM call is one question, one answer. An **agent** is a loop: the model **decides** what to do, **acts** by calling tools, **observes** the results, and repeats until the task is done. The model is the planner. Your code runs the tools and keeps control.

```text
user goal -> model -> (tool call?) -> run tool -> add result to messages -> model -> ... -> final answer
```

That is all the "magic" behind coding agents, research agents and support bots. Frameworks add convenience, but the core is a `for` loop you can write yourself.

## A complete agent in 20 lines

The "model" below is a scripted fake, so the loop is easy to see and to test. In a real app `llm(messages)` calls an API and returns either text or tool calls.

```python
def run_agent(llm, tools, question, max_steps=5):
    messages = [{"role": "user", "content": question}]
    for step in range(1, max_steps + 1):
        reply = llm(messages)
        calls = reply.get("tool_calls")
        if not calls:
            return reply["content"], step
        messages.append({"role": "assistant", "tool_calls": calls})
        for call in calls:
            try:
                result = tools[call["name"]](**call["arguments"])
            except Exception as e:
                result = f"error: {e}"
            messages.append({"role": "tool", "tool_call_id": call["id"], "content": str(result)})
    raise RuntimeError("max steps reached")

def fake_llm(messages):
    last = messages[-1]
    if last["role"] == "user":
        return {"tool_calls": [{"id": "1", "name": "add", "arguments": {"a": 2, "b": 3}}]}
    return {"content": f"The answer is {last['content']}"}

print(run_agent(fake_llm, {"add": lambda a, b: a + b}, "What is 2 + 3?"))
```

## What makes agents work (or fail)

- **A step limit.** Models can loop forever. Always cap steps (and cost).
- **Good tool design.** Few, well-named tools with clear descriptions and strict argument schemas beat many vague ones. Return **short, useful** results, because every result is added to the context.
- **Errors as observations.** Return tool errors to the model instead of crashing, so it can recover.
- **A clear stop condition.** The loop ends when the model answers without tool calls.

## ReAct and planning

**ReAct** (reason + act) asks the model to write a short thought before each action. For bigger goals, have it write a **plan** first (a list of steps), then execute and update it. Reasoning models do much of this internally.

> [!TIP]
> Start with the simplest thing: a single model with tools in a loop. Add planners, sub-agents and frameworks only when you can show the simple version is not enough.
