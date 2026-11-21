# Whispering Woods — Visual Style Reference

**Reference image:** `assets/worlds/whispering-woods.jpg` (the original clay diorama approved by Almon on 20 Nov 2026).

## One Style Prompt

> Handcrafted miniature 3D sculpted polymer-clay and carved-wood nocturnal woodland diorama (Arise: A Simple Story aesthetic). Matte tactile clay surfaces with subtle hand-sculpted texture, chunky cozy proportions, glossy dark bead eyes with warm specular catchlights. Lighting combines warm amber-gold lantern rim light from the right with cool deep-teal twilight ambient light and soft moonlight from above. Straight-on eye-level stage camera angle, cozy storybook palette of bark browns, moss greens, warm ochre, cream, and deep forest teal. No outlines, no flat 2D vector shading, no text.

## Asset Rules

- **Background (`bg.jpg`):** Same forest diorama (hollow oak in the center, mossy hollow log on the left, glowing cyan woodland flowers, bubbling stream and mossy bank on the right, hanging amber lantern on the central branch, crescent moon and starry teal sky, carved wood diorama rim with bokeh mushrooms and ferns in the foreground) with **no animals and no girl painted in**. Under 800 KB.
- **Playable animals (`<animal>-<state>.png`):** Transparent RGBA PNG cut-outs, each under 150 KB, matching the clay texture, eye-level angle, and warm-amber + cool-teal lighting of `bg.jpg`.
  - Species (6): `owl`, `hedgehog`, `bunny`, `frog`, `squirrel`, `dormouse`.
  - States per species: `hidden` (tucked/curled/peeking), `found` (alert, looking out), `happy` (little jump, wing flap, or wave).
- **Character (`girl-<state>.png`):** The girl in the knit pom-pom beanie, brown knitted poncho, boots, holding the glowing warm brass lantern — transparent RGBA PNG cut-outs under 150 KB in three poses: `looking`, `pointing`, `cheering`.
- **Foreground hiding-cover pieces (`cover-<name>.png`):** Transparent RGBA PNG cut-outs under 150 KB placed in front of animals so they peek out from behind real scene art: `cover-fern.png`, `cover-leaves.png`, `cover-mushrooms.png`, `cover-hollow.png`.
- **Cover (`cover.jpg`):** 800×800 JPEG under 150 KB, no text, composed from `bg.jpg` (hollow oak, hanging lantern, crescent moon, mossy log), `owl-found.png` tucked in the oak hollow, `bunny-hidden.png` behind `cover-fern.png`, `hedgehog-found.png` near the oak roots, and `girl-pointing.png` standing on the right mossy bank lighting them with her warm lantern beam.
- **In-game lighting (code, not baked into animal PNGs):** Tint each animal dark and cool-teal outside the lantern beam, reveal full warm colors only inside the lantern cone, and render a soft ground contact shadow underneath each animal.
