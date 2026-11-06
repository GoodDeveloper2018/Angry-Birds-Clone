# Angry Birds Clone

The original author gave up at introducing the slingshot, so I let Sonnet 5.5 finish it.
It was told to keep all the original jank, so the physics are still cursed on purpose.

Built with [p5.js](https://p5js.org/) and [Matter.js](https://brm.io/matter-js/).

## The jank (kept on purpose)

- You can drag the bird anywhere, even across the whole map, even after you launched it.
  This is a feature now.
- Letting go just yeets the spring.
- Everything is still bouncy (restitution 0.8) so the blocks never fully stay still.

## What got added around the jank

- Title screen, level select, pause, win and lose screens
- 6 levels (level 1 is the og layout, the rest are new)
- Birds actually reload now, 4 to 6 per level
- Pigs and blocks take damage from hits, crack, then explode into particles
- Score, bonus points for leftover birds, 1 to 3 stars
- Progress saved in localStorage
- Sounds made out of pure math (no audio files), flight trail, popups
- Sprite cache so birds stop flickering when they spawn

## Run it

It needs a server, `file://` says no (the browser blocks the sprite loading). From this folder:

```
python -m http.server 8000
```

Then open http://localhost:8000/ (any static file server works).

## How to play

- Press the mouse (or finger) and drag, the bird follows the pointer. Let go to launch it.
- Knock out every pig before you run out of birds.
- Pigs are worth 5000 (the big one 10000), blocks 500, and every unused bird 10000 on a win.
- 3 stars if you finish within the level's par number of birds, 2 stars with one more bird.
- Levels unlock in order.

Keys: `R` restart, `P` or `Esc` pause, `M` mute, `N` or `Enter` next level after a win.

## Files

| File | What it does |
| --- | --- |
| `sketch.js` | p5 `setup`/`draw`, game states, rules (damage, reload, win and lose), input |
| `Levels.js` | The six level layouts |
| `BaseClass.js`, `Box.js`, `Log.js`, `Pig.js`, `Bird.js` | Physics objects, now with health and scoring |
| `Ground.js`, `Slingshot.js` | Ground, platform and the catapult |
| `UI.js` | Menus, HUD, pause and result screens |
| `Effects.js` | Particles, score popups and the flight trail |
| `Sfx.js` | Synthesized sound effects |

## Original README

> Drawing the rubberband for the catapult
> Placing the images of the catapult in the game.
