# Citlali's D&D Adventure

A text-based adventure game where you make choices and roll dice!

## How to Play

1. Start at scene 1
2. Read what happens
3. Choose an action
4. If you need to fight, roll a d20 (20-sided die)
5. If you roll higher than `roll_needed`, you win!

## How to Edit the Game

Open `game.yaml` and change things:

- **Add new scenes** — copy an existing scene and change the number and text
- **Change the story** — edit the `text:` lines
- **Make fights easier or harder** — change `roll_needed:`
- **Add new choices** — add more items under `choices:`

## Example Scenes

Simple choice (just go to another scene):

```yaml
  4:
    text: You see a path ahead.
    choices:
      - continue: 5
```

Multiple choices:

```yaml
  7:
    text: A giant girl rat appears in your path.
    choices:
      - fight:
          roll_needed: 10
          succeed: 9
          fail: 8
      - talk: 10
```

Ending scene:

```yaml
  19:
    text: You win! Congratulations!
    ending: win
```

Have fun! 🎲🐀
