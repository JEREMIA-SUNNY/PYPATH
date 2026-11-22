---
title: LoRA, QLoRA and proving it worked
minutes: 12
---
## Why full fine-tuning is expensive

Updating every weight of a 7B model needs memory for the weights, the gradients and the optimizer state: roughly **4 to 8 times the model size**. That is a multi-GPU job.

## LoRA: train a tiny adapter

**LoRA (Low-Rank Adaptation)** freezes the original weights and learns a small *update* for selected layers. Instead of a full `d_in × d_out` change, it learns two thin matrices `A (d_in × r)` and `B (r × d_out)` whose product is the update. The rank `r` is small (8 to 64).

```python
def full_params(d_in, d_out):
    return d_in * d_out

def lora_params(d_in, d_out, rank):
    return rank * (d_in + d_out)

d = 4096
for r in (8, 16, 64):
    saved = lora_params(d, d, r) / full_params(d, d)
    print(f"rank {r:>2}: trains {saved:.2%} of that matrix")
```

At rank 16 on a 4096×4096 layer you train under 1% of the parameters. The adapter file is a few tens of MB, you can keep many adapters for one base model, and you can merge an adapter into the weights for deployment.

## QLoRA: quantize the base, train the adapter

**QLoRA** goes one step further: the frozen base model is loaded in **4-bit**, while the small LoRA adapters train in higher precision. A 7B model that needed ~14 GB at 16-bit fits in about 4 to 5 GB, so you can fine-tune on a single consumer or free-tier GPU.

```py
from transformers import AutoModelForCausalLM, BitsAndBytesConfig
from peft import LoraConfig, get_peft_model
from trl import SFTTrainer, SFTConfig

bnb = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4")
model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3.2-3B-Instruct", quantization_config=bnb, device_map="auto")

lora = LoraConfig(r=16, lora_alpha=32, target_modules=["q_proj", "v_proj"], lora_dropout=0.05, task_type="CAUSAL_LM")
model = get_peft_model(model, lora)

trainer = SFTTrainer(model=model, train_dataset=train_ds, eval_dataset=val_ds,
                     args=SFTConfig(output_dir="out", num_train_epochs=2, learning_rate=2e-4))
trainer.train()
```

Knobs worth knowing: **rank** (capacity), **alpha** (scaling), **target modules** (which layers get adapters), **learning rate** and **epochs**. Watch the **validation loss**: if training loss keeps falling while validation loss rises, you are overfitting. Stop earlier or add data.

## Prove it worked

A lower loss does not mean a better product. Always compare against baselines on your **held-out eval set**:

1. The **base model with a good prompt** (the thing you could ship today).
2. The **fine-tuned model**.
3. Optionally, a **larger frontier model** as a quality ceiling.

Compare quality, **cost per request** and **latency**. Keep the fine-tune only if it wins on what you care about. Also check it did not get worse at things it used to do well (catastrophic forgetting).

> [!TIP]
> Version everything: dataset hash, base model, hyperparameters, adapter and eval results. A fine-tune you cannot reproduce is a liability.
