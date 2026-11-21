# Stream Crossing — Visual Style Reference

**Reference image:** `assets/worlds/stream-crossing.jpg` (the original clay diorama approved by Almon on 20 Nov 2026).

## One Style Prompt

> Handcrafted miniature 3D sculpted polymer-clay and carved-wood twilight riverbank diorama (Arise: A Simple Story aesthetic). Matte tactile clay surfaces with subtle hand-sculpted dimples, thick velvety olive-green moss, chunky cozy proportions, glossy dark bead eyes with warm specular catchlights. Lighting combines warm amber-gold candle glow from the tree-root burrow on the right and warm golden sunset sheen on the rippling water with cool deep-teal twilight ambient light and glowing cyan woodland flowers. Elevated 3/4 diorama stage camera angle looking across the stream from the foreground mossy shore toward the left bank and the right candle-lit burrow. No outlines, no flat 2D vector shading, no text.

## Asset Rules

- **Background (`bg.jpg`):** Same riverbank diorama (left mossy bank with tree roots and glowing cyan flowers, wide open rippling teal-and-amber stream in the middle, right bank with the warm candle-lit burrow inside tree roots, foreground mossy shore with blurred cattails) with **no bear and no stepping stones** painted in. Under 800 KB.
- **Character (`bear-<state>.png`):** Little Bear — chunky brown sculpted polymer-clay bear cub holding his woven wicker basket of glowing warm golden berries in his **left arm/paw** in every pose. Transparent RGBA PNG cut-outs, each under 150 KB:
  - `bear-waiting.png` (standing calmly on the bank looking across the stream)
  - `bear-hop.png` (mid-air joyful hop)
  - `bear-cheer.png` (right paw raised in happy celebration)
  - `bear-oops.png` (gentle puzzled "hmm" tilt with right paw near chin)
- **Stepping stones (`stone-*.png`):** Transparent RGBA PNG cut-outs, each under 150 KB, in one warm-grey clay-and-olive-moss style (warm amber rim on the left, cool slate-teal shade on the right):
  - **Size set:** `stone-s.png`, `stone-m.png`, `stone-l.png`, `stone-xl.png` (same round mossy stone in 4 distinct sizes, no dots).
  - **Shape set:** `stone-circle.png`, `stone-square.png`, `stone-triangle.png`, `stone-star.png` (same visual size, no dots).
- **Code effects only:** Glowing counting dots on plain stones, soft underwater glowing outline of the needed stone (shape or size), water ripples, splashes, and soft ground/water contact shadows are rendered in code.
- **Cover (`cover.jpg`):** 800×800 JPEG under 150 KB, no text — Little Bear standing on a stepping stone mid-stream with the warm candle-lit burrow glowing behind him, composed from the game's own art.
