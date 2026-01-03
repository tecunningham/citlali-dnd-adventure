# Citlali's D&D Adventure

A text-based adventure game where you make choices and roll dice!

## How to Play

1. Start at scene 1
2. Read what happens
3. Choose an action
4. If you need to fight, roll a d20 (20-sided die)
5. If you roll higher than the threshold, you win!

## How to Edit the Game

Open `game.yaml` and change things:

- **Add new scenes** — copy an existing scene and change the number and text
- **Change the story** — edit the `text:` lines
- **Make fights easier or harder** — change `success_threshold:`
- **Add new choices** — add more items under `choices:`

## Example Scene

```yaml
  5:
    text: A giant rat appears in your path!
    choices:
      - action: fight
        roll: d20
        success_threshold: 10
        success_goto: 6
        fail_goto: 8
      - action: run
        goto: 7
```

Have fun! 🎲🐀

