---
title: Hugging Face, tokenizers and chat templates
minutes: 10
---
## The Hugging Face ecosystem

**Hugging Face** is the hub for open models, datasets and tools. The `transformers` library loads a model and tokenizer by name, and a **pipeline** wraps the common tasks.

```py
from transformers import pipeline

generator = pipeline("text-generation", model="Qwen/Qwen2.5-0.5B-Instruct")
out = generator("Explain recursion in one sentence.", max_new_tokens=60)
print(out[0]["generated_text"])
```

For finer control you load the two halves yourself:

```py
from transformers import AutoTokenizer, AutoModelForCausalLM

tok = AutoTokenizer.from_pretrained("Qwen/Qwen2.5-0.5B-Instruct")
model = AutoModelForCausalLM.from_pretrained("Qwen/Qwen2.5-0.5B-Instruct", device_map="auto")

ids = tok("Hello world", return_tensors="pt")
print(tok.convert_ids_to_tokens(ids["input_ids"][0]))     # the tokens the model sees
```

Models on the hub differ in size, license (check it before you ship), context window and **tokenizer**. A prompt that is 100 tokens for one model can be 140 for another.

## Chat templates

Instruction-tuned ("chat") models were trained on conversations written in a specific text layout, with special tokens that mark roles. Send the wrong layout and quality drops. The **chat template** turns a list of messages into that exact text. Hugging Face tokenizers carry it: `tok.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)`.

A common layout (ChatML) looks like this:

```python
def chatml(messages):
    text = ""
    for m in messages:
        text += f"<|im_start|>{m['role']}\n{m['content']}<|im_end|>\n"
    return text + "<|im_start|>assistant\n"         # the model continues from here

print(chatml([
    {"role": "system", "content": "You are concise."},
    {"role": "user", "content": "Hi!"},
]))
```

Hosted APIs apply the template for you. When you run a raw model, **you** must use the right one.

## Base vs instruct models

- **Base** models only continue text. They are good starting points for fine-tuning.
- **Instruct / chat** models are additionally trained to follow instructions and hold conversations. Use these for applications.

> [!WARNING]
> Always read the model card: license, intended use, context length, recommended chat template and known limitations. "Open weights" does not always mean "free for any use".
