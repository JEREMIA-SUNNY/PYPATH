---
title: Tokens and context windows
minutes: 9
---
## An LLM predicts the next token

A large language model does one thing: given some text, it predicts what comes next. It does not read characters or words. Text is first split into **tokens**, small chunks such as `"un"`, `"believ"`, `"able"` or `" the"`. Each token becomes a number, and the model outputs a probability for every possible next token.

A handy rule of thumb for English: **1 token is roughly 4 characters, or about 3/4 of a word**. Code and non-English text usually need more tokens per character.

```python
def estimate_tokens(text: str) -> int:
    """Cheap estimate: about 4 characters per token."""
    return -(-len(text) // 4)      # ceiling division

for sample in ["Hello", "Large language models predict the next token.", "def add(a, b):\n    return a + b"]:
    print(f"{estimate_tokens(sample):>3} tokens  <- {sample!r}")
```

Real APIs report the exact count in each response (`usage.prompt_tokens`, `usage.completion_tokens`). Use the estimate for planning and the real numbers for billing.

## The context window

Every model has a **context window**: the maximum number of tokens it can handle in one request, **input and output together**. If the window is 128,000 tokens and your prompt is 120,000, the answer can be at most 8,000 tokens long.

```python
WINDOW = 8_000

def room_for_answer(prompt: str, window: int = WINDOW) -> int:
    return max(0, window - estimate_tokens(prompt))

print(room_for_answer("word " * 5_000))
```

Three consequences you will meet in every project:

- **The model is stateless.** It remembers nothing between calls. A chat app resends the conversation each time, so long chats get slower and more expensive.
- **More context is not always better.** Models can lose track of details buried in the middle of a very long prompt. Send what is relevant, not everything you have.
- **You pay per token**, usually priced per million tokens, with output tokens costing several times more than input tokens.

## Cost is just arithmetic

```python
def cost_usd(input_tokens, output_tokens, price_in_per_m, price_out_per_m):
    return input_tokens / 1_000_000 * price_in_per_m + output_tokens / 1_000_000 * price_out_per_m

# 2,000 tokens in, 500 out, at $3 / $15 per million
print(round(cost_usd(2_000, 500, 3, 15), 6))
```

> [!TIP]
> Budget for tokens the way you budget for memory. Know your typical prompt size, your maximum answer size and the price, before you ship.
