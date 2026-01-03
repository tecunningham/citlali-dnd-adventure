# Citlali's D&D Adventure

🎮 **Play now:** https://tecunningham.github.io/citlali-dnd-adventure/

A text-based adventure game where you make choices and roll dice!

## How to Play

1. Start at scene 1
2. Read what happens
3. Choose an action
4. If you need to fight, tap the dice to roll!
5. Roll higher than the target number to succeed

## How to Edit the Game

Open `game.yaml` and change things:

- **Add new scenes** — copy an existing scene and change the number and text
- **Change the story** — edit the `text:` lines
- **Change images** — use emoji (🐀), keywords, or photo URLs
- **Make fights easier or harder** — change `roll_needed:`
- **Add new choices** — add more items under `choices:`

## Example Scenes

Simple choice (just go to another scene):

```yaml
  4:
    text: You see a path ahead.
    image: 🏔️
    choices:
      - continue: 5
```

Multiple choices with a fight:

```yaml
  7:
    text: A giant girl rat appears in your path.
    image: 🐀
    choices:
      - fight:
          roll_needed: 10
          succeed: 9
          fail: 8
      - talk: 10
```

Using a photo:

```yaml
  13:
    text: You meet a wizard cat!
    image: https://example.com/pecas-wizard-hat.jpg
    choices:
      - talk: 14
```

Ending scene:

```yaml
  19:
    text: You win! Congratulations!
    image: 🏆
    ending: win
```

Have fun! 🎲🐀
