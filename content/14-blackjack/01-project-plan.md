---
title: Designing Blackjack with classes
minutes: 10
---
This project practises **object-oriented design**: deciding which classes exist, what each one knows, and what each one does.

## The rules we'll implement

- The player and dealer each start with two cards; one dealer card is hidden.
- Number cards are worth their number, J/Q/K are worth 10, an Ace is worth 11 **or** 1.
- The player hits (takes cards) or stands. Going over 21 is a bust and loses immediately.
- The dealer then hits until reaching **17 or more**.
- Closest to 21 without going over wins; equal totals are a push (tie).

## Finding the classes

Look for the nouns: card, deck, hand, chips. Each becomes a class with clear responsibilities.

| Class | Knows | Does |
| --- | --- | --- |
| `Card` | rank, suit | reports its point value, prints itself |
| `Deck` | 52 cards | shuffles, deals one card |
| `Hand` | cards held | adds a card, computes the best total |
| `Chips` | total, current bet | places a bet, wins or loses it |

The rules that don't belong to any one object (should the dealer hit? who won?) become plain functions.

## Aces: the interesting part

A hand's value starts by counting every Ace as 11. While the total is over 21 and there's still an Ace counted as 11, turn one of them into a 1 (subtract 10):

```python
values = [11, 11, 9]        # Ace, Ace, 9
total, aces = sum(values), values.count(11)
while total > 21 and aces:
    total -= 10
    aces -= 1
print(total)                 # 21
```

## Testable randomness

Shuffling is random, which makes testing hard. The trick is to let callers pass a **seed**: `Deck.shuffle(seed=42)` uses `random.Random(42)`, so tests get the same order every time while real games stay unpredictable.

## Play it

After all five steps pass, combine the classes in `blackjack.py` with a loop like this and run it in your terminal:

```py
def play():
    chips = Chips(100)
    deck = Deck()
    deck.shuffle()
    chips.bet(int(input(f"You have {chips.total}. Bet: ")))
    player, dealer = Hand(), Hand()
    for _ in range(2):
        player.add(deck.deal())
        dealer.add(deck.deal())
    print("Dealer shows:", dealer.cards[0])
    while player.value < 21 and input(f"{player.value}. Hit? (y/n) ") == "y":
        player.add(deck.deal())
    while player.value <= 21 and dealer_should_hit(dealer):
        dealer.add(deck.deal())
    result = decide_winner(player.value, dealer.value)
    print(f"You {player.value}, dealer {dealer.value}: {result}")
    if result == "player":
        chips.win_bet()
    elif result == "dealer":
        chips.lose_bet()
    print("Chips:", chips.total)
```
