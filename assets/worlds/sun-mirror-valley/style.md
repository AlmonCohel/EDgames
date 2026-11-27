# Sun-Mirror Valley — Visual Style Reference

**Reference image:** `assets/worlds/sun-mirror-valley.jpg` (the painted twilight valley approved by Almon on 20 Nov 2026).

## One Style Prompt

> Handcrafted 3D sculpted polymer-clay, carved-stone, and warm-wood twilight mountain valley panorama (*Arise: A Simple Story* diorama aesthetic combined with a painterly bioluminescent twilight valley). Matte tactile stone and clay surfaces with hand-carved runes and velvety olive-green moss, chunky friendly proportions, glossy dark bead eyes with warm specular catchlights. Lighting combines warm amber-gold sun-tower lantern light from the upper-left cliff and warm peach-gold horizon sunset glow in the distant mountain gap with cool deep-teal twilight valley shade and radiant sky-cyan bioluminescent wildflowers in the foreground meadow. Elevated 3/4 panoramic stage camera looking across the foreground meadow and central hill toward the riverside rock pedestal, the upper-right glass greenhouse dome, and the lower-right wooden watermill by the river. No outlines, no flat 2D vector shading, no text.

## Asset Rules

- **Background (`bg.jpg`):** 2560×1429 JPEG under 800 KB (374 KB). The painted valley, left sun-tower lighthouse, central grassy hill, riverside rock pedestal, upper-right cliff, lower-right wooden watermill house and waterfall chute, and foreground meadow — with **no mirror, no crystal, no waterwheel, no hiker, and no beam** painted in, leaving clear ground where the mirror, crystal, and helper stand.
- **Stone mirror on a stand (`mirror-stand.png` + `mirror-face.png`):** Transparent RGBA PNG cut-outs at 2× display size, under 150 KB each:
  - `mirror-stand.png` (338×460, 40 KB): carved U-shaped grey-brown stone cradle base with runes and olive moss tufts sitting firmly on the central grassy hill.
  - `mirror-face.png` (360×360, 36 KB): circular bronze-and-stone framed reflective mirror disc with side pivot pins, centered on a square canvas so code can rotate the mirror face smoothly inside the stand.
- **Crystal (`crystal-idle.png` + `crystal-lit.png`):** Transparent RGBA PNG cut-outs (200×440, identical bounding box), under 150 KB each:
  - `crystal-idle.png` (106 KB): translucent deep sea-teal hexagonal crystal prism in its carved stone socket base before the sunbeam hits it.
  - `crystal-lit.png` (135 KB): the same crystal prism and socket brightly lit from within by warm golden-cyan light when a sunbeam passes through it.
- **Watermill wheel (`watermill-wheel.png`):** 420×420 (59 KB) symmetrical 8-spoke carved oak waterwheel with a brass center hub and wet sheen on the lower paddles, centered on a square canvas so code can spin it smoothly on the side of the watermill house when lit.
- **Greenhouse (`greenhouse-unlit.png` + `greenhouse-lit.png`):** Transparent RGBA PNG cut-outs (434×480, identical bounding box), under 150 KB each:
  - `greenhouse-unlit.png` (53 KB): stone-and-iron domed greenhouse with dark twilight teal glass panes.
  - `greenhouse-lit.png` (69 KB): the same domed greenhouse warmly illuminated from inside with golden sunlight and glowing green plants visible through the arched windows and dome.
- **Wildflowers (`flowers-closed.png` + `flowers-open.png`):** Transparent RGBA PNG cut-outs (420×402, identical bounding box), under 150 KB each:
  - `flowers-closed.png` (128 KB): tucked twilight teal-blue flower buds before the valley wakes up.
  - `flowers-open.png` (39 KB): wide-open bioluminescent sky-cyan and golden wildflowers that bloom when the target lights up (used at most twice per screen with varied flip, size, and tilt).
- **Helper character (`hiker-waiting.png`, `hiker-pointing.png`, `hiker-cheering.png`):** Transparent RGBA PNG cut-outs (420 px tall), under 150 KB each — the young valley explorer in a warm ochre hooded tunic, teal scarf, leather backpack, boots, and wooden walking staff:
  - `hiker-waiting.png` (224×420, 125 KB): standing calmly on the foreground trail holding the staff.
  - `hiker-pointing.png` (248×420, 116 KB): pointing happily toward the mirror and crystal.
  - `hiker-cheering.png` (277×420, 118 KB): jumping with both arms raised in celebration when the valley lights up.
- **Code effects only:** Soft glowing golden sunbeams (outer warm bloom + inner soft core, never a hard yellow bar), gentle water splash mist under the turning waterwheel, and soft ground contact shadows under every placed cut-out.
- **Cover (`cover.jpg`):** 800×800 JPEG under 150 KB (101 KB), no text — the golden sunbeam bouncing off the stone mirror into the warmly lit greenhouse, with the cheering helper and blooming cyan wildflowers in the foreground.
