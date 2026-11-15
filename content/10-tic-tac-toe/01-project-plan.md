---
title: Planning the game
minutes: 10
---
Time to combine everything so far into a real program. The trick to any project is **decomposition**: break the problem into small functions you can build and test one at a time.

## Representing the board

We'll use a list of 9 strings, one per square. An empty square is a single space. Players refer to squares by number, laid out like a phone keypad:

```text
 1 | 2 | 3
---+---+---
 4 | 5 | 6
---+---+---
 7 | 8 | 9
```

Square `n` lives at index `n - 1`:

```python
board = [" "] * 9
board[4] = "X"     # the centre, square 5
print(board)
```

## The functions you'll build

Each one is a separate exercise in this module, with its own tests:

1. **`render_board(board)`** returns the board as a printable string.
2. **`place_marker(board, position, marker)`** puts `X` or `O` on a free square and reports whether it worked.
3. **`winner(board)`** returns `"X"`, `"O"` or `None`.
4. **`is_full(board)`** tells you when it's a draw.
5. **`choose_move(board, marker)`** is a computer player that wins when it can and blocks when it must.

## Checking for a winner

There are exactly 8 winning lines: 3 rows, 3 columns and 2 diagonals. Store them as index triples and loop over them:

```python
LINES = [
    (0, 1, 2), (3, 4, 5), (6, 7, 8),   # rows
    (0, 3, 6), (1, 4, 7), (2, 5, 8),   # columns
    (0, 4, 8), (2, 4, 6),              # diagonals
]
board = ["X", "X", "X", " ", "O", " ", "O", " ", " "]
for a, b, c in LINES:
    if board[a] != " " and board[a] == board[b] == board[c]:
        print("Winner:", board[a])
```

## Putting it together

Once your five functions pass their tests, paste them into a file `tictactoe.py` on your computer, add this game loop under them, and run `python tictactoe.py` in a terminal:

```py
def play():
    board = [" "] * 9
    player = "X"
    while True:
        print(render_board(board))
        if player == "X":
            raw = input("Your move (1-9): ")
            if not raw.isdigit() or not place_marker(board, int(raw), "X"):
                print("That square isn't available.")
                continue
        else:
            move = choose_move(board, "O")
            place_marker(board, move, "O")
            print(f"Computer plays {move}")
        if winner(board):
            print(render_board(board))
            print(f"{winner(board)} wins!")
            break
        if is_full(board):
            print(render_board(board))
            print("It's a draw.")
            break
        player = "O" if player == "X" else "X"

if __name__ == "__main__":
    play()
```

> [!TIP]
> Notice how the game loop reads almost like English. That's the payoff of small, well-named functions: the hard parts are hidden behind names you've already tested.
