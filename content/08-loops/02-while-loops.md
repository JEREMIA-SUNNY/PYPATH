---
title: while loops, break and continue
minutes: 7
---
A `while` loop repeats as long as its condition is true. Use it when you don't know in advance how many iterations you need.

```python
balance = 1000
years = 0
while balance < 2000:
    balance *= 1.08
    years += 1
print(f"Doubled after {years} years: ₹{balance:,.0f}")
```

Make sure something inside the loop eventually makes the condition false, or it runs forever. (In PyPath the runner stops it after 10 seconds.)

## break and continue

- `break` leaves the loop immediately.
- `continue` skips to the next iteration.

```python
for n in range(1, 20):
    if n % 2 == 0:
        continue          # skip even numbers
    if n > 9:
        break             # stop entirely
    print(n, end=" ")
print()
```

## The while True pattern

For "keep asking until valid" logic, loop forever and `break` out on success:

```py
while True:
    answer = input("Enter a number from 1 to 9: ")
    if answer.isdigit() and 1 <= int(answer) <= 9:
        break
    print("Try again.")
print("You chose", answer)
```

(That block is display-only because it waits for keyboard input. You can try it in the Playground using the Input box.)

## else on loops

A loop's `else` block runs only if the loop finished **without** hitting `break`. It's handy for searches:

```python
target = 7
for n in [2, 4, 6, 8]:
    if n == target:
        print("found it")
        break
else:
    print("not found")
```
