/* Game covers — a full-colour illustration per game, the picture on its tile.

   `scenes.js` draws each game as a few white strokes, and that was enough to
   tell tiles apart but not enough for a child to know what a game *is* before
   pressing it. A real games site sells each game with a picture of the game:
   the ducks on the pond, the balloons about to pop, the cookies on the plate.
   That is what these are — small illustrated scenes, drawn in SVG so they stay
   sharp at every size, need no image files, and load with the page.

   One house style runs through all of them: a full-bleed background (sky,
   water, wood, a room), objects with a soft shadow under them and a shine on
   top, rounded shapes, bright colours. Shared gradients live once in `defs()`
   and every cover points at them.

   A game with no cover falls back to its line scene on its subject's colour,
   so adding a game never leaves a hole — see `has()` and app.js. */

const EDCovers = (() => {
  /* ---- shared paint ---- */
  const defs = () => `
    <svg width="0" height="0" aria-hidden="true" style="position:absolute">
      <defs>
        <linearGradient id="cv-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd0ff"/><stop offset="1" stop-color="#d9f2ff"/></linearGradient>
        <linearGradient id="cv-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fd0f5"/><stop offset="1" stop-color="#1e88cc"/></linearGradient>
        <linearGradient id="cv-grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#93e36f"/><stop offset="1" stop-color="#46a836"/></linearGradient>
        <linearGradient id="cv-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e0a96d"/><stop offset="1" stop-color="#a86d38"/></linearGradient>
        <linearGradient id="cv-room" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1d6"/><stop offset="1" stop-color="#ffd89e"/></linearGradient>
        <linearGradient id="cv-night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3f9e"/><stop offset="1" stop-color="#7b5ce0"/></linearGradient>
        <linearGradient id="cv-lav" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9ccff"/><stop offset="1" stop-color="#9f80ff"/></linearGradient>
        <linearGradient id="cv-pink" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe0ec"/><stop offset="1" stop-color="#ff9fc6"/></linearGradient>
        <linearGradient id="cv-mint" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d4fbe9"/><stop offset="1" stop-color="#6fd7ad"/></linearGradient>
        <linearGradient id="cv-desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8e0ff"/><stop offset="1" stop-color="#5b9ff0"/></linearGradient>
        <linearGradient id="cv-sunny" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe27a"/><stop offset="1" stop-color="#ffb347"/></linearGradient>
        <linearGradient id="cv-teal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b6f0f4"/><stop offset="1" stop-color="#36b9c9"/></linearGradient>
        <linearGradient id="cv-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffdf7"/><stop offset="1" stop-color="#f3e9d6"/></linearGradient>
        <radialGradient id="cv-gloss"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
        <radialGradient id="cv-shade"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
        <radialGradient id="cv-sun"><stop offset="0" stop-color="#fff6b0"/><stop offset=".6" stop-color="#ffd23f"/><stop offset="1" stop-color="#ffb000"/></radialGradient>
      </defs>
    </svg>`;

  /* ---- small parts several covers share ---- */
  const shadow = (cx, cy, rx, ry = rx * 0.28) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#cv-shade)"/>`;
  const gloss = (cx, cy, rx, ry, rot = -25) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#cv-gloss)" transform="rotate(${rot} ${cx} ${cy})"/>`;
  const bg = (paint) => `<rect width="200" height="200" fill="url(#${paint})"/>`;
  const sun = (x, y, r) => `<g><circle cx="${x}" cy="${y}" r="${r * 1.45}" fill="#fff3a6" opacity=".45"/><circle cx="${x}" cy="${y}" r="${r}" fill="url(#cv-sun)"/></g>`;
  const cloud = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff"><ellipse cx="0" cy="6" rx="26" ry="11"/><circle cx="-10" cy="0" r="11"/><circle cx="7" cy="-4" r="14"/><circle cx="19" cy="3" r="9"/></g>`;
  const star = (x, y, r, c = '#ffd23f') => {
    let d = '';
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; d += `${i ? 'L' : 'M'}${(x + Math.cos(a) * rr).toFixed(1)} ${(y + Math.sin(a) * rr).toFixed(1)}`; }
    return `<path d="${d}Z" fill="${c}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>`;
  };
  const sparkle = (x, y, r, c = '#fff') => `<path d="M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z" fill="${c}"/>`;
  const eye = (x, y, r = 3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#1e2a44"/><circle cx="${x + r * .35}" cy="${y - r * .35}" r="${r * .38}" fill="#fff"/>`;

  /* A rubber duck, facing right, about 60 wide at s = 1. */
  const duck = (x, y, s = 1, flip = false) => `
    <g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">
      <ellipse cx="0" cy="18" rx="30" ry="6" fill="#0b5f97" opacity=".25"/>
      <path d="M-28 4c0-14 12-22 28-22 18 0 28 8 28 20 0 9-7 14-18 14h-24c-9 0-14-5-14-12z" fill="#ffd43b"/>
      <path d="M-24 10c6 6 30 8 44 0-2 8-10 10-20 10h-12c-6 0-10-4-12-10z" fill="#f0b400"/>
      <path d="M-10 0c6 8 18 8 24 2" stroke="#e8a600" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle cx="16" cy="-22" r="15" fill="#ffd43b"/>
      ${gloss(10, -28, 6, 4)}
      <path d="M29 -24l14 4-14 7z" fill="#ff8a1f"/>
      ${eye(20, -26, 3.2)}
      <circle cx="12" cy="-16" r="3" fill="#ff9e7a" opacity=".6"/>
    </g>`;

  /* A wooden letter block with a front face and a top/side for depth. */
  const block = (x, y, size, letter, face, ink = '#fff', rot = 0) => {
    const d = size * 0.16;
    return `
    <g transform="rotate(${rot} ${x + size / 2} ${y + size / 2})">
      ${shadow(x + size / 2 + 4, y + size + 4, size * 0.62, size * 0.14)}
      <path d="M${x} ${y}l${d} ${-d}h${size}l${-d} ${d}z" fill="#fff" opacity=".55"/>
      <path d="M${x + size} ${y}l${d} ${-d}v${size}l${-d} ${d}z" fill="#000" opacity=".18"/>
      <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * .14}" fill="${face}"/>
      <rect x="${x + 4}" y="${y + 4}" width="${size - 8}" height="${size - 8}" rx="${size * .1}" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="2"/>
      <text x="${x + size / 2}" y="${y + size * 0.72}" text-anchor="middle" font-family="Fredoka, Heebo, sans-serif" font-weight="700" font-size="${size * 0.62}" fill="${ink}">${letter}</text>
    </g>`;
  };

  const ART = {
    /* Balloons on a blue sky, one bursting into confetti. */
    'color-pop': () => `
      ${bg('cv-sky')}${cloud(150, 40, .9)}${cloud(40, 160, .7)}
      <path d="M58 118q-6 20 4 40" stroke="#5b6b86" stroke-width="2" fill="none"/>
      <path d="M104 98q6 26-2 58" stroke="#5b6b86" stroke-width="2" fill="none"/>
      <g><ellipse cx="58" cy="88" rx="26" ry="31" fill="#ff4d6d"/><path d="M53 118h10l-5 6z" fill="#e0304f"/>${gloss(48, 74, 7, 12)}</g>
      <g><ellipse cx="104" cy="70" rx="27" ry="32" fill="#3d7bff"/><path d="M99 101h10l-5 6z" fill="#2457cc"/>${gloss(94, 56, 7, 12)}</g>
      <g transform="translate(150 104)">
        <path d="M0-30l6 18 18-8-10 16 18 6-19 4 6 18-15-12-12 15 2-19-19 1 15-11-12-15 18 5z" fill="#ffd23f"/>
        <circle r="10" fill="#fff"/>
      </g>
      <g fill="#2fc57d"><rect x="132" y="60" width="7" height="12" rx="2" transform="rotate(30 135 66)"/><rect x="178" y="132" width="7" height="12" rx="2" transform="rotate(-20 181 138)"/></g>
      <g fill="#ff4d6d"><circle cx="174" cy="74" r="4"/><circle cx="124" cy="140" r="4"/></g>
      <g fill="#8a4dff"><rect x="166" y="150" width="6" height="10" rx="2" transform="rotate(50 169 155)"/></g>`,

    /* Three ducks on a pond, the third counted. */
    'count-the-ducks': () => `
      ${bg('cv-sky')}${sun(160, 34, 16)}${cloud(50, 34, .8)}
      <path d="M0 92c30-8 60 6 100 0s70-10 100 0v108H0z" fill="#5fc94a"/>
      <path d="M0 104c40-6 70 6 100 2s70-8 100 0v96H0z" fill="url(#cv-water)"/>
      <g stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round" fill="none"><path d="M20 150q10-5 20 0"/><path d="M140 176q10-5 20 0"/><path d="M90 186q8-4 16 0"/></g>
      <g><ellipse cx="168" cy="160" rx="16" ry="6" fill="#3fae4a"/><path d="M168 160l12-5" stroke="#2c8a36" stroke-width="2"/></g>
      <g fill="#2e8a3a"><path d="M14 112c-2-18 0-30 4-38l3 38z"/><path d="M22 112c0-14 4-24 8-30l-3 30z"/></g>
      ${duck(44, 128, .62)}${duck(100, 146, .7, true)}${duck(152, 124, .58)}
      <g font-family="Fredoka, Heebo, sans-serif" font-weight="700" font-size="16" text-anchor="middle">
        <circle cx="54" cy="96" r="12" fill="#fff"/><text x="54" y="102" fill="#2f6ae8">1</text>
        <circle cx="92" cy="112" r="12" fill="#fff"/><text x="92" y="118" fill="#2f6ae8">2</text>
        <circle cx="162" cy="92" r="12" fill="#ffc531"/><text x="162" y="98" fill="#5a3b00">3</text>
      </g>`,

    /* A wooden sorting board, two pieces in, one on its way. */
    'shape-match': () => `
      ${bg('cv-pink')}
      ${shadow(100, 176, 86, 12)}
      <rect x="18" y="92" width="164" height="80" rx="16" fill="url(#cv-wood)"/>
      <rect x="18" y="92" width="164" height="12" rx="6" fill="#fff" opacity=".2"/>
      <circle cx="56" cy="132" r="21" fill="#7a4a22"/>
      <rect x="82" y="112" width="40" height="40" rx="6" fill="#7a4a22"/>
      <path d="M150 112l22 38h-44z" fill="#7a4a22"/>
      <rect x="84" y="110" width="36" height="36" rx="6" fill="#3d7bff"/>${gloss(94, 120, 7, 5)}
      <path d="M150 116l18 31h-36z" fill="#ffc531"/>
      ${shadow(56, 132, 20, 8)}
      <g transform="translate(0 -6)"><circle cx="56" cy="62" r="21" fill="#ff4d6d"/>${gloss(48, 54, 7, 5)}</g>
      <path d="M56 86v10M50 92l6 6 6-6" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      ${sparkle(150, 70, 9)}${sparkle(30, 30, 6)}`,

    /* A cow on the farm, mooing, and a chick listening. */
    'animal-sounds': () => `
      ${bg('cv-sky')}${cloud(40, 30, .7)}
      <path d="M0 120c50-14 120-12 200 0v80H0z" fill="url(#cv-grass)"/>
      <g stroke="#c98a4a" stroke-width="4"><path d="M8 140h60M14 128v28M38 128v28M62 128v28"/></g>
      ${shadow(92, 182, 50, 9)}
      <g transform="translate(92 118)">
        <path d="M-40-28c-12-6-20 0-18 8 10 0 16-2 20-6z" fill="#fff" stroke="#e8e3d8" stroke-width="2"/>
        <path d="M40-28c12-6 20 0 18 8-10 0-16-2-20-6z" fill="#fff" stroke="#e8e3d8" stroke-width="2"/>
        <path d="M-26-40l-6-14 12 8zM26-40l6-14-12 8z" fill="#f4d9a8"/>
        <ellipse cx="0" cy="-12" rx="40" ry="38" fill="#fff"/>
        <path d="M-30-40c10-6 20-4 22 6-8 8-24 8-28 0z" fill="#3a3a48"/>
        <path d="M28-34c-6 10-4 22 6 22 6-8 4-18-6-22z" fill="#3a3a48"/>
        ${eye(-14, -16, 5)}${eye(14, -16, 5)}
        <ellipse cx="0" cy="14" rx="30" ry="20" fill="#ffb3c1"/>
        <ellipse cx="-10" cy="12" rx="5" ry="7" fill="#c9566c"/><ellipse cx="10" cy="12" rx="5" ry="7" fill="#c9566c"/>
        <ellipse cx="0" cy="28" rx="12" ry="5" fill="#a83850"/>
      </g>
      <g stroke="#2f6ae8" stroke-width="5" fill="none" stroke-linecap="round"><path d="M146 76a16 16 0 0 1 0 26"/><path d="M158 66a30 30 0 0 1 0 46"/><path d="M170 56a44 44 0 0 1 0 66"/></g>
      <g transform="translate(160 160)">${shadow(0, 16, 14, 4)}<ellipse cx="0" cy="4" rx="13" ry="12" fill="#ffd43b"/><circle cx="2" cy="-10" r="9" fill="#ffd43b"/><path d="M10-10l7 2-7 4z" fill="#ff8a1f"/>${eye(5, -12, 2)}</g>`,

    /* Piano keys, each with an animal face, and notes rising. */
    'piano-pets': () => `
      ${bg('cv-lav')}
      ${shadow(100, 182, 88, 10)}
      <rect x="10" y="78" width="180" height="100" rx="14" fill="#2b2459"/>
      ${[0, 1, 2, 3, 4].map((i) => `<rect x="${18 + i * 33.6}" y="88" width="31" height="84" rx="6" fill="#fff"/>`).join('')}
      ${[0, 1, 3].map((i) => `<rect x="${41 + i * 33.6}" y="88" width="18" height="50" rx="4" fill="#1e1a40"/>`).join('')}
      <g transform="translate(33 152)"><circle r="11" fill="#ff9e3d"/><path d="M-9-6l2-10 6 6zM9-6l-2-10-6 6z" fill="#ff9e3d"/>${eye(-4, -2, 2)}${eye(4, -2, 2)}<path d="M-2 4l2 2 2-2" stroke="#1e2a44" stroke-width="1.5" fill="none"/></g>
      <g transform="translate(67 152)"><circle r="11" fill="#c8915a"/><ellipse cx="-11" cy="-2" rx="4" ry="8" fill="#8a5a2f"/><ellipse cx="11" cy="-2" rx="4" ry="8" fill="#8a5a2f"/>${eye(-4, -2, 2)}${eye(4, -2, 2)}<ellipse cx="0" cy="4" rx="3" ry="2" fill="#1e2a44"/></g>
      <g transform="translate(101 152)"><circle r="11" fill="#ffd43b"/><path d="M4 0l9 3-9 4z" fill="#ff8a1f"/>${eye(-2, -3, 2)}</g>
      <g transform="translate(134 152)"><circle r="11" fill="#ffb3c1"/><ellipse cx="0" cy="3" rx="6" ry="4" fill="#ff7a9a"/>${eye(-4, -4, 2)}${eye(4, -4, 2)}</g>
      <g transform="translate(168 152)"><circle r="11" fill="#eee"/><path d="M-7-8c-2-10 2-14 4-10zM7-8c2-10-2-14-4-10z" fill="#eee" stroke="#ccc"/>${eye(-4, -2, 2)}${eye(4, -2, 2)}</g>
      <g fill="#fff"><path d="M60 22v28a7 6 0 1 1-4-5V22h18v8H60z"/><path d="M130 30v24a6 5 0 1 1-4-5V30z"/><path d="M150 14v26a6 5 0 1 1-4-5V18l12-4v8z"/></g>`,

    /* Memory cards: most face down, one matching pair turned up. */
    'memory-pairs': () => `
      ${bg('cv-mint')}
      ${[[22, 22], [80, 22], [138, 22], [22, 106], [80, 106], [138, 106]].map(([x, y], i) => {
        const up = i === 1 || i === 5;
        return `${shadow(x + 22, y + 82, 24, 5)}
          <rect x="${x}" y="${y}" width="44" height="78" rx="9" fill="${up ? '#fff' : '#7c4ced'}"/>
          ${up ? `<g transform="translate(${x + 22} ${y + 42})"><path d="M0 14c-12-6-16-14-14-22 2-6 10-8 14-2 4-6 12-4 14 2 2 8-2 16-14 22z" fill="#ff4d6d"/><path d="M-4-14c2-6 8-8 10-6-2 2-4 6-10 6z" fill="#2fc57d"/>${gloss(-6, -2, 4, 3)}</g>`
              : `<rect x="${x + 5}" y="${y + 5}" width="34" height="68" rx="6" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2"/><text x="${x + 22}" y="${y + 50}" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="26" fill="#fff" opacity=".85">?</text>`}`;
      }).join('')}
      ${sparkle(106, 18, 8)}${sparkle(186, 112, 7)}`,

    /* A drum with its sticks, and the beat flying off it. */
    'rhythm-tap': () => `
      ${bg('cv-sunny')}
      ${shadow(100, 184, 62, 10)}
      <path d="M44 100v58c0 12 25 22 56 22s56-10 56-22v-58z" fill="#ff4d6d"/>
      <path d="M44 120c0 12 25 22 56 22s56-10 56-22" stroke="#ffd23f" stroke-width="6" fill="none"/>
      <g stroke="#fff" stroke-width="3" opacity=".8"><path d="M56 112l14 52M86 118l6 56M114 118l-6 56M144 112l-14 52"/></g>
      <ellipse cx="100" cy="100" rx="56" ry="20" fill="#fff4e0"/><ellipse cx="100" cy="100" rx="56" ry="20" fill="none" stroke="#e0c9a0" stroke-width="4"/>
      ${gloss(84, 96, 22, 6, 0)}
      <g stroke-linecap="round"><path d="M40 30l52 62" stroke="#a86d38" stroke-width="7"/><circle cx="92" cy="92" r="7" fill="#f4d9a8"/><path d="M168 36l-58 56" stroke="#a86d38" stroke-width="7"/><circle cx="110" cy="92" r="7" fill="#f4d9a8"/></g>
      <g stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"><path d="M28 78l-12-6M30 96H16M172 80l12-6M170 98h14"/></g>
      ${star(30, 150, 9)}${star(172, 146, 9, '#2fc57d')}`,

    /* A computer mouse clicking, with the pointer and click rings. */
    'mouse-moves': () => `
      ${bg('cv-desk')}
      <rect x="20" y="120" width="160" height="70" rx="14" fill="#2b4a8a" opacity=".35"/>
      ${shadow(102, 176, 40, 9)}
      <path d="M100 74c-26 0-38 18-38 46v14c0 26 16 40 38 40s38-14 38-40v-14c0-28-12-46-38-46z" fill="#fff"/>
      <path d="M100 74v44M62 118h76" stroke="#d3e2f5" stroke-width="3"/>
      <path d="M100 74c-26 0-38 18-38 44h38z" fill="#ffc531"/>
      <rect x="96" y="88" width="8" height="18" rx="4" fill="#52607c"/>
      ${gloss(80, 96, 10, 16, -20)}
      <path d="M100 74c0-26 20-34 30-50" stroke="#52607c" stroke-width="4" fill="none" stroke-linecap="round"/>
      <g transform="translate(140 40)"><path d="M0 0v40l11-10 8 18 8-4-8-17h15z" fill="#fff" stroke="#1e2a44" stroke-width="3" stroke-linejoin="round"/></g>
      <g stroke="#ffc531" stroke-width="4" fill="none" stroke-linecap="round"><circle cx="70" cy="48" r="10"/><circle cx="70" cy="48" r="20" opacity=".5"/></g>`,

    /* A turtle on a path of tiles, heading home, arrow keys below. */
    'arrow-trail': () => `
      ${bg('cv-grass')}
      ${[[28, 28], [70, 28], [112, 28], [112, 70], [112, 112], [154, 112]].map(([x, y]) => `<rect x="${x - 18}" y="${y - 18}" width="36" height="36" rx="8" fill="#f6dfae"/><rect x="${x - 18}" y="${y + 12}" width="36" height="6" rx="3" fill="#c9a064"/>`).join('')}
      <g stroke="#fff" stroke-width="4" stroke-dasharray="2 9" stroke-linecap="round" fill="none"><path d="M44 28h50M112 46v50M128 112h10"/></g>
      <g transform="translate(28 30)">${shadow(0, 12, 16, 4)}<ellipse cx="0" cy="2" rx="15" ry="11" fill="#2fa35b"/><path d="M-8-2h16M0-8v14" stroke="#1f7a43" stroke-width="2"/><circle cx="17" cy="0" r="6" fill="#8fd16a"/>${eye(19, -2, 1.6)}</g>
      <g transform="translate(154 108)">${shadow(0, 20, 18, 4)}<rect x="-14" y="-4" width="28" height="22" rx="3" fill="#fff"/><path d="M-19-2l19-17 19 17z" fill="#ff4d6d"/><rect x="-4" y="6" width="9" height="12" rx="2" fill="#7a4a22"/></g>
      <g transform="translate(70 152)">
        ${[[0, -18, 'M0-6l-6 8h12z'], [-26, 8, 'M-6 0l8-6v12z'], [0, 8, 'M0 6l-6-8h12z'], [26, 8, 'M6 0l-8-6v12z']].map(([x, y, d]) => `<g transform="translate(${x} ${y})"><rect x="-12" y="-11" width="24" height="24" rx="5" fill="#3a4660"/><rect x="-12" y="-13" width="24" height="23" rx="5" fill="#52607c"/><path d="${d}" fill="#fff" transform="translate(0 -1)"/></g>`).join('')}
      </g>`,

    /* A little story in three frames: seed, sprout, flower. */
    'story-order': () => `
      ${bg('cv-lav')}
      ${[0, 1, 2].map((i) => `${shadow(38 + i * 62, 150, 28, 5)}<rect x="${12 + i * 62}" y="62" width="52" height="84" rx="9" fill="#fff" transform="rotate(${[-5, 0, 5][i]} ${38 + i * 62} 104)"/>`).join('')}
      <g transform="rotate(-5 38 104)"><rect x="18" y="68" width="40" height="52" rx="5" fill="#d9f2ff"/><path d="M18 108h40v12H18z" fill="#8a5a2f"/><ellipse cx="38" cy="106" rx="6" ry="4" fill="#a86d38"/></g>
      <rect x="80" y="68" width="40" height="52" rx="5" fill="#d9f2ff"/><path d="M80 108h40v12H80z" fill="#8a5a2f"/><path d="M100 108V90" stroke="#2fa35b" stroke-width="3"/><path d="M100 94c-8-2-10-8-8-10 6 0 8 4 8 10zM100 92c6-4 10-4 12-2-2 4-6 4-12 2z" fill="#2fc57d"/>
      <g transform="rotate(5 162 104)"><rect x="142" y="68" width="40" height="52" rx="5" fill="#d9f2ff"/><path d="M142 108h40v12h-40z" fill="#8a5a2f"/><path d="M162 108V84" stroke="#2fa35b" stroke-width="3"/><g transform="translate(162 80)">${[0, 1, 2, 3, 4].map((k) => `<ellipse cx="0" cy="-7" rx="4.5" ry="7" fill="#ff7aa8" transform="rotate(${k * 72})"/>`).join('')}<circle r="4" fill="#ffd23f"/></g></g>
      <g font-family="Fredoka, Heebo, sans-serif" font-weight="700" font-size="15" text-anchor="middle" fill="#fff">
        ${[0, 1, 2].map((i) => `<circle cx="${38 + i * 62}" cy="${136 + [-2, 0, 2][i]}" r="10" fill="#7c4ced"/><text x="${38 + i * 62}" y="${141 + [-2, 0, 2][i]}">${i + 1}</text>`).join('')}
      </g>
      ${sparkle(30, 30, 7)}${sparkle(176, 40, 9)}`,

    /* A park picture as a jigsaw, one piece lifted out. */
    'puzzle-park': () => `
      <rect width="200" height="200" fill="url(#cv-sky)"/>
      ${sun(156, 44, 16)}${cloud(56, 40, .8)}
      <path d="M0 120c40-12 120-12 200 0v80H0z" fill="url(#cv-grass)"/>
      <g transform="translate(60 100)"><rect x="-5" y="0" width="10" height="34" fill="#8a5a2f"/><circle cx="0" cy="-12" r="26" fill="#2fa35b"/><circle cx="-12" cy="-4" r="16" fill="#3fbf6a"/>${gloss(-8, -22, 10, 6)}</g>
      <path d="M118 150h56" stroke="#a86d38" stroke-width="5"/><path d="M124 150v16M168 150v16" stroke="#a86d38" stroke-width="4"/><path d="M118 140h56" stroke="#c98a4a" stroke-width="6" stroke-linecap="round"/>
      <g stroke="#1e2a44" stroke-opacity=".25" stroke-width="2" fill="none"><path d="M100 0v200M0 100h200"/></g>
      <path d="M100 100h46c0 10 8 10 8 0s8-10 8 0h38v100H100v-40c10 0 10-8 0-8s-10-8 0-8z" fill="#1e2a44" opacity=".18"/>
      <g transform="translate(14 -16) rotate(8 150 150)">
        ${shadow(156, 168, 46, 8)}
        <path d="M100 100h46c0 10 8 10 8 0s8-10 8 0h38v52h-100v-12c10 0 10-8 0-8s-10-8 0-8z" fill="url(#cv-grass)" stroke="#fff" stroke-width="3"/>
        <path d="M118 128h44" stroke="#a86d38" stroke-width="4"/><path d="M118 120h44" stroke="#c98a4a" stroke-width="5" stroke-linecap="round"/>
      </g>`,

    /* A magnifying glass finding one letter among many. */
    'letter-hunt': () => `
      ${bg('cv-teal')}
      ${[['א', 18, 22, '#ff4d6d'], ['ג', 74, 18, '#3d7bff'], ['ד', 132, 26, '#ffc531'], ['ה', 26, 84, '#2fc57d'], ['ש', 140, 92, '#7c4ced'], ['ל', 20, 142, '#ff8a1f'], ['מ', 136, 148, '#ff4d6d']].map(([l, x, y, c], i) => block(x, y, 40, l, c, '#fff', [-8, 6, -4, 5, -6, 8, -3][i])).join('')}
      ${shadow(104, 150, 30, 6)}
      <circle cx="96" cy="96" r="38" fill="#fff" opacity=".35"/>
      ${block(78, 80, 38, 'ב', '#ffffff', '#0f8ea0')}
      <circle cx="96" cy="96" r="38" fill="none" stroke="#3a4660" stroke-width="9"/>
      ${gloss(80, 78, 14, 8)}
      <path d="M124 124l26 26" stroke="#3a4660" stroke-width="14" stroke-linecap="round"/><path d="M128 128l22 22" stroke="#ff8a1f" stroke-width="8" stroke-linecap="round"/>`,

    /* A wizard's hat and wand, and the one missing letter of the spell glowing. */
    'wizard-spell': () => `
      ${bg('cv-night')}
      ${[[20, 24], [170, 18], [150, 70], [30, 90], [100, 14]].map(([x, y]) => sparkle(x, y, 5, '#fff6b0')).join('')}
      <path d="M38 110l34-86 30 84z" fill="#3d7bff"/><path d="M60 52l-6 16M80 40l4 18" stroke="#ffd23f" stroke-width="3"/>
      ${star(66, 78, 9)}${star(84, 58, 6)}
      <ellipse cx="70" cy="110" rx="46" ry="11" fill="#2457cc"/>
      <path d="M128 94l44-44" stroke="#5a3b00" stroke-width="7" stroke-linecap="round"/><path d="M164 58l8-8" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
      ${star(176, 46, 12)}${sparkle(158, 34, 7, '#fff6b0')}
      ${block(22, 138, 44, 'ק', '#7c4ced')}
      <g><rect x="78" y="138" width="44" height="44" rx="7" fill="#ffd23f" opacity=".25"/><rect x="78" y="138" width="44" height="44" rx="7" fill="none" stroke="#ffd23f" stroke-width="3" stroke-dasharray="6 5"/><text x="100" y="170" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="28" fill="#ffd23f">?</text></g>
      ${block(134, 138, 44, 'ם', '#7c4ced')}`,

    /* A fairy-tale tower whose numbered stairs have one gap. */
    'tower-steps': () => `
      ${bg('cv-sky')}${cloud(40, 40, .8)}
      <path d="M0 170c60-10 140-10 200 0v30H0z" fill="url(#cv-grass)"/>
      <rect x="112" y="40" width="64" height="134" fill="#e3d4ff"/><rect x="112" y="40" width="64" height="134" fill="none" stroke="#c4b2f5" stroke-width="3"/>
      <path d="M106 42l38-34 38 34z" fill="#7c4ced"/><path d="M144 8v-10" stroke="#5a30c2" stroke-width="3"/><path d="M144-2l14 5-14 5z" fill="#ff4d6d"/>
      <rect x="132" y="66" width="24" height="30" rx="12" fill="#5a30c2"/><rect x="132" y="140" width="24" height="34" rx="12" fill="#a86d38"/>
      ${[0, 1, 2, 3].map((i) => {
        const x = 18 + i * 24, y = 156 - i * 24;
        return i === 2
          ? `<rect x="${x}" y="${y}" width="30" height="20" rx="4" fill="#fff" fill-opacity=".4" stroke="#3a4660" stroke-width="2.5" stroke-dasharray="5 4"/><text x="${x + 15}" y="${y + 16}" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="15" fill="#3a4660">?</text>`
          : `<rect x="${x}" y="${y}" width="30" height="20" rx="4" fill="#ffc531"/><rect x="${x}" y="${y + 14}" width="30" height="6" rx="3" fill="#d49a00"/><text x="${x + 15}" y="${y + 15}" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="14" fill="#5a3b00">${i + 1}</text>`;
      }).join('')}`,

    /* A keyboard with one key lit and being pressed. */
    'keyboard-keys': () => `
      ${bg('cv-desk')}
      ${shadow(100, 172, 92, 10)}
      <rect x="8" y="70" width="184" height="100" rx="14" fill="#3a4660"/>
      ${[0, 1, 2, 3].map((r) => [0, 1, 2, 3, 4, 5, 6].map((c) => {
        const x = 18 + c * 24.5 + (r % 2) * 6, y = 80 + r * 21;
        if (x > 170) return '';
        const lit = r === 1 && c === 3;
        return `<rect x="${x}" y="${y + 2}" width="21" height="18" rx="4" fill="${lit ? '#d49a00' : '#1e2a44'}"/><rect x="${x}" y="${y}" width="21" height="17" rx="4" fill="${lit ? '#ffc531' : '#eef3f8'}"/>`;
      }).join('')).join('')}
      <text x="${18 + 3 * 24.5 + 6 + 10.5}" y="115" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="12" fill="#5a3b00">A</text>
      <g transform="translate(104 34)"><path d="M0 70V20c0-8 12-8 12 0v26c0-6 10-6 10 0v6c0-6 10-6 10 0v6c0-6 9-6 9 1v16c0 16-8 24-22 24h-4C6 98 0 88 0 76z" fill="#ffd2b0" stroke="#e8a985" stroke-width="2"/></g>
      ${sparkle(86, 40, 9)}${sparkle(160, 46, 6)}`,

    /* A ladybird on a screen, with the pointer about to catch it. */
    'click-catch': () => `
      ${bg('cv-mint')}
      ${shadow(100, 182, 70, 8)}
      <rect x="22" y="30" width="156" height="118" rx="12" fill="#3a4660"/><rect x="30" y="38" width="140" height="102" rx="6" fill="#d9f2ff"/>
      <path d="M88 148h24l6 26H82z" fill="#52607c"/><rect x="66" y="172" width="68" height="8" rx="4" fill="#3a4660"/>
      <g transform="translate(92 86) rotate(-20)">
        <ellipse cx="0" cy="0" rx="24" ry="20" fill="#ff3b4a"/><path d="M0-20v40" stroke="#1e2a44" stroke-width="3"/>
        <circle cx="-11" cy="-6" r="5" fill="#1e2a44"/><circle cx="11" cy="-6" r="5" fill="#1e2a44"/><circle cx="-10" cy="9" r="4" fill="#1e2a44"/><circle cx="10" cy="9" r="4" fill="#1e2a44"/>
        <circle cx="0" cy="-24" r="10" fill="#1e2a44"/>${eye(-4, -26, 2)}${eye(4, -26, 2)}
        ${gloss(-10, -10, 8, 5)}
      </g>
      <g stroke="#ff8a1f" stroke-width="3" fill="none"><circle cx="92" cy="86" r="34" stroke-dasharray="6 6"/></g>
      <g transform="translate(124 100)"><path d="M0 0v34l9-8 7 15 7-3-7-15h13z" fill="#fff" stroke="#1e2a44" stroke-width="3" stroke-linejoin="round"/></g>`,

    /* Half sunny, half rainy, with the right clothes for each. */
    'weather-day': () => `
      <rect width="100" height="200" fill="url(#cv-sunny)"/><rect x="100" width="100" height="200" fill="#8fa3c8"/>
      ${sun(48, 46, 20)}
      <g transform="translate(150 40)"><ellipse cx="0" cy="8" rx="30" ry="13" fill="#e8eef8"/><circle cx="-12" cy="0" r="13" fill="#e8eef8"/><circle cx="8" cy="-4" r="16" fill="#e8eef8"/></g>
      <g stroke="#3d7bff" stroke-width="3" stroke-linecap="round"><path d="M130 72l-4 10M150 70l-4 10M170 72l-4 10M140 92l-4 10M160 90l-4 10"/></g>
      <path d="M0 160h200v40H0z" fill="#5fc94a"/>
      <g transform="translate(48 132)">${shadow(0, 30, 26, 5)}<path d="M-30-4l-6-6M30-4l6-6" stroke="#ff4d6d" stroke-width="4" stroke-linecap="round"/><path d="M-5 0q5-6 10 0" stroke="#ff4d6d" stroke-width="4" fill="none"/><circle cx="-17" cy="2" r="13" fill="#2b3b66" stroke="#ff4d6d" stroke-width="4"/><circle cx="17" cy="2" r="13" fill="#2b3b66" stroke="#ff4d6d" stroke-width="4"/>${gloss(-21, -2, 5, 3)}${gloss(13, -2, 5, 3)}</g>
      <g transform="translate(150 120)"><path d="M-34 0a34 30 0 0 1 68 0z" fill="#ff4d6d"/><path d="M-34 0q8.5-6 17 0t17 0 17 0 17 0" fill="#ff4d6d" stroke="#e0304f" stroke-width="2"/><path d="M0 0v34c0 8 10 8 10 0" stroke="#3a4660" stroke-width="4" fill="none" stroke-linecap="round"/></g>
      <g transform="translate(150 178)"><path d="M-14-10h10l2 12h-14z M4-10h10l2 12H2z" fill="#ffc531"/></g>`,

    /* A fish, and the word for it built from letter blocks. */
    'build-a-word': () => `
      ${bg('cv-water')}
      <g fill="#fff" opacity=".45"><circle cx="40" cy="30" r="5"/><circle cx="48" cy="18" r="3"/><circle cx="160" cy="40" r="4"/></g>
      <g transform="translate(100 66)">
        <path d="M-40 0c14-24 54-26 70 0-16 26-56 24-70 0z" fill="#ff8a1f"/>
        <path d="M28 0l22-18v36z" fill="#ff6a00"/>
        <path d="M-10-18c4 10 4 26 0 36" stroke="#ffb36b" stroke-width="4" fill="none"/>
        ${eye(-26, -4, 5)}${gloss(-16, -10, 12, 5, 0)}
      </g>
      <path d="M0 150c40-8 80 8 120 0s60-8 80 0v50H0z" fill="#f6dfae"/>
      ${block(48, 118, 46, 'ד', '#2fa35b', '#fff', -4)}${block(106, 118, 46, 'ג', '#3d7bff', '#fff', 5)}
      ${sparkle(170, 110, 8)}${sparkle(30, 110, 6)}`,

    /* Cookies on plates: two plus one. */
    'plus-minus': () => `
      ${bg('cv-room')}
      <rect x="0" y="130" width="200" height="70" fill="#e0a96d"/><rect x="0" y="130" width="200" height="8" fill="#c98a4a"/>
      ${[[50, 120], [150, 120]].map(([x, y]) => `${shadow(x, y + 18, 40, 7)}<ellipse cx="${x}" cy="${y + 10}" rx="40" ry="13" fill="#fff"/><ellipse cx="${x}" cy="${y + 8}" rx="30" ry="8" fill="#eef3f8"/>`).join('')}
      ${[[36, 100], [62, 104], [150, 100]].map(([x, y]) => `<g transform="translate(${x} ${y})"><circle r="17" fill="#d9a066"/><circle r="17" fill="none" stroke="#b67a3c" stroke-width="3"/><g fill="#5a3218"><circle cx="-6" cy="-5" r="3"/><circle cx="6" cy="-2" r="3"/><circle cx="-2" cy="7" r="3"/><circle cx="9" cy="8" r="2.4"/></g>${gloss(-6, -8, 7, 4)}</g>`).join('')}
      <g transform="translate(100 104)"><circle r="15" fill="#2f6ae8"/><path d="M-8 0h16M0-8v16" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g>
      <g font-family="Fredoka, sans-serif" font-weight="700" text-anchor="middle"><rect x="70" y="20" width="60" height="44" rx="12" fill="#fff"/><text x="100" y="54" font-size="34" fill="#2f6ae8">?</text></g>
      ${sparkle(30, 40, 8)}${sparkle(172, 50, 7)}`,

    /* NEW — a picture of an apple, and its first letter picked from three. */
    'first-letter': () => `
      ${bg('cv-pink')}
      ${shadow(64, 118, 40, 8)}
      <rect x="22" y="22" width="84" height="94" rx="14" fill="#fff"/>
      <g transform="translate(64 72)">
        <path d="M0-18c-20-12-38 4-34 24 4 22 18 34 34 28 16 6 30-6 34-28 4-20-14-36-34-24z" fill="#ff3b4a"/>
        <path d="M0-18c0-8 2-14 6-18" stroke="#7a4a22" stroke-width="4" stroke-linecap="round"/>
        <path d="M4-26c8-10 18-8 20-4-6 6-14 8-20 4z" fill="#2fc57d"/>
        ${gloss(-16, -4, 8, 12, 20)}
      </g>
      <path d="M112 66h22" stroke="#7c4ced" stroke-width="5" stroke-linecap="round"/><path d="M128 58l9 8-9 8" stroke="#7c4ced" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      ${block(142, 44, 46, 'ת', '#ffc531', '#5a3b00')}
      ${block(24, 140, 40, 'ב', '#ffffff', '#c2410c', -6)}${block(80, 144, 40, 'מ', '#ffffff', '#c2410c', 4)}${block(136, 140, 40, 'ש', '#ffffff', '#c2410c', -3)}
      ${sparkle(170, 26, 8)}`,

    /* NEW — the final letters, each tied to its everyday partner. */
    'final-letters': () => `
      ${bg('cv-teal')}
      ${[['מ', 'ם', 26], ['נ', 'ן', 84], ['כ', 'ך', 142]].map(([a, b, y], i) => {
        const col = ['#ff4d6d', '#3d7bff', '#2fa35b'][i];
        return `${block(22, y - 18, 40, a, '#ffffff', col, -4)}
          <path d="M70 ${y + 2}c20 -14 40 14 60 0" stroke="${col}" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="1 9"/>
          ${block(136, y - 18, 40, b, col, '#fff', 4)}`;
      }).join('')}
      ${sparkle(100, 12, 7)}${sparkle(100, 190, 6)}`,

    /* NEW — a big letter traced by a pencil along its dotted path. */
    'letter-trace': () => `
      ${bg('cv-paper')}
      <g stroke="#cfe0f5" stroke-width="2"><path d="M0 40h200M0 80h200M0 120h200M0 160h200"/></g>
      <path d="M16 0v200" stroke="#f3a7a7" stroke-width="2"/>
      <text x="96" y="162" text-anchor="middle" font-family="Fredoka, Heebo, sans-serif" font-weight="700" font-size="160" fill="none" stroke="#c3d5ec" stroke-width="5" stroke-dasharray="3 9" stroke-linecap="round">א</text>
      <path d="M58 54c18 30 40 66 66 100" stroke="#7c4ced" stroke-width="13" fill="none" stroke-linecap="round"/>
      <g transform="translate(124 154) rotate(-35)">
        ${shadow(10, 20, 24, 5)}
        <rect x="0" y="-8" width="70" height="16" rx="3" fill="#ffc531"/><rect x="52" y="-8" width="18" height="16" fill="#ff8fa3"/><rect x="48" y="-8" width="5" height="16" fill="#c9ced6"/>
        <path d="M0-8l-16 8 16 8z" fill="#f4d9a8"/><path d="M-11-3l-5 3 5 3z" fill="#7c4ced"/>
      </g>
      ${star(166, 36, 13)}${sparkle(40, 180, 8, '#ffc531')}`,

    /* ---- October 2026 ---- */

    /* A pink birthday cake with four lit candles. */
    'birthday-candles': () => `
      ${bg('cv-pink')}
      ${sparkle(30, 34, 8)}${sparkle(172, 48, 7)}${sparkle(160, 20, 5)}
      ${shadow(100, 176, 76, 10)}
      <ellipse cx="100" cy="168" rx="76" ry="12" fill="#e8eef7"/>
      <rect x="38" y="110" width="124" height="56" rx="10" fill="#ff7eb6"/>
      <rect x="38" y="136" width="124" height="8" fill="#fff" opacity=".7"/>
      <ellipse cx="100" cy="110" rx="62" ry="14" fill="#ffd1e4"/>
      <path d="M38 110c0 14 8 12 11 4 3 14 11 14 13 2 3 14 12 13 13 2 3 14 12 14 14 1 3 14 12 14 13 2 3 13 12 14 14 2 3 12 11 12 12 4 2 10 8 10 10-12z" fill="#fff"/>
      ${[66, 88, 110, 132].map((x, i) => `
        <rect x="${x}" y="66" width="10" height="38" rx="3" fill="${['#2f9bff', '#ffc531', '#7c4ced', '#1cc47a'][i]}"/>
        <path d="M${x + 1} 74l8-6M${x + 1} 86l8-6M${x + 1} 98l8-6" stroke="#fff" stroke-width="2.5" opacity=".8"/>
        <path d="M${x + 5} 66v-6" stroke="#444" stroke-width="2"/>
        <ellipse cx="${x + 5}" cy="50" rx="7" ry="11" fill="#ffc531"/><ellipse cx="${x + 5}" cy="53" rx="3.5" ry="6" fill="#fff6c2"/>`).join('')}
`,

    /* A frog mid-hop over numbered lily pads. */
    'frog-hops': () => `
      ${bg('cv-water')}
      <path d="M0 150q50-10 100 0t100 0v50H0z" fill="#1e88cc" opacity=".35"/>
      ${[[38, 150, '1'], [100, 160, '2'], [162, 150, '3']].map(([x, y, n]) => `
        <ellipse cx="${x}" cy="${y + 6}" rx="30" ry="10" fill="#0b5f97" opacity=".3"/>
        <path d="M${x} ${y} L${x + 30} ${y - 4} A30 14 0 1 1 ${x + 20} ${y - 11} Z" fill="#3cc46a" stroke="#1f9a4c" stroke-width="2"/>
        <text x="${x}" y="${y + 7}" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="20" fill="#fff">${n}</text>`).join('')}
      <path d="M44 124q28-70 58-20" stroke="#fff" stroke-width="3" stroke-dasharray="4 7" fill="none" stroke-linecap="round"/>
      <g transform="translate(118 74)">
        ${shadow(0, 50, 22, 5)}
        <ellipse cx="0" cy="18" rx="26" ry="20" fill="#5bd36b"/>
        <ellipse cx="0" cy="24" rx="16" ry="11" fill="#b8f0a8"/>
        <circle cx="-12" cy="-2" r="10" fill="#5bd36b"/><circle cx="12" cy="-2" r="10" fill="#5bd36b"/>
        <circle cx="-12" cy="-3" r="6" fill="#fff"/><circle cx="12" cy="-3" r="6" fill="#fff"/>
        ${eye(-11, -3, 3.4)}${eye(13, -3, 3.4)}
        <path d="M-10 14q10 8 20 0" stroke="#1e6b2c" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M-24 30l-14 14M24 30l14 14" stroke="#4cbf5c" stroke-width="7" stroke-linecap="round"/>
      </g>
      ${sparkle(170, 30, 8, '#fff6b0')}`,

    /* Two baskets: a few apples in one, a heap in the other. */
    'more-or-less': () => {
      const basket = (x, n) => `
        ${shadow(x, 168, 44, 8)}
        ${[[0, -6], [-18, -4], [18, -4], [-9, -20], [9, -20], [0, -34]].slice(0, n).map(([dx, dy]) => `<circle cx="${x + dx}" cy="${120 + dy}" r="11" fill="#ff4d4d"/><path d="M${x + dx} ${110 + dy}q3-6 7-6" stroke="#2e7d32" stroke-width="3" fill="none"/>${gloss(x + dx - 4, 116 + dy, 3, 2)}`).join('')}
        <path d="M${x - 44} 122h88l-9 40c-1 4-4 6-8 6h-54c-4 0-7-2-8-6z" fill="#d79a52"/>
        <path d="M${x - 40} 136h80M${x - 36} 150h72" stroke="#b77a36" stroke-width="3"/>
        <rect x="${x - 47}" y="116" width="94" height="10" rx="5" fill="#c4843c"/>`;
      return `${bg('cv-sunny')}${sun(170, 34, 16)}${basket(54, 2)}${basket(146, 6)}
        <text x="100" y="64" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="40" fill="#fff" stroke="#e08a00" stroke-width="2">?</text>`;
    },

    /* The princess in her ball gown, with colour swatches to choose from. */
    'princess-dress': () => `
      ${bg('cv-pink')}
      ${sparkle(30, 30, 8)}${sparkle(176, 40, 9)}${sparkle(160, 150, 6)}
      <g transform="translate(40 14) scale(.62)">
        <ellipse cx="100" cy="292" rx="70" ry="7" fill="#000" opacity=".12"/>
        <path d="M58 70c-6 40-2 92 10 120h64c12-28 16-80 10-120-4-30-24-44-42-44s-38 14-42 44z" fill="#f2b33d"/>
        <path d="M78 112h44l6 40c22 30 36 76 40 122H32c4-46 18-92 40-122z" fill="#a66cff"/>
        <path d="M50 230c16 10 34 14 50 14s34-4 50-14l6 22c-18 10-36 14-56 14s-38-4-56-14z" fill="#fff" opacity=".35"/>
        <circle cx="72" cy="118" r="13" fill="#a66cff"/><circle cx="128" cy="118" r="13" fill="#a66cff"/>
        <rect x="93" y="96" width="14" height="18" rx="5" fill="#f7d1b5"/>
        <circle cx="100" cy="72" r="30" fill="#f7d1b5"/>
        <path d="M70 70c0-22 14-34 30-34s30 12 30 34c-8-12-20-18-30-18s-22 6-30 18z" fill="#f2b33d"/>
        ${eye(89, 74, 3.6)}${eye(111, 74, 3.6)}
        <circle cx="82" cy="84" r="5" fill="#ff9eb8" opacity=".6"/><circle cx="118" cy="84" r="5" fill="#ff9eb8" opacity=".6"/>
        <path d="M92 88c5 5 11 5 16 0" stroke="#c0505f" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <path d="M76 44l8-20 10 14 6-18 6 18 10-14 8 20z" fill="#ffd23f" stroke="#e0a800" stroke-width="2"/>
        <circle cx="100" cy="36" r="5.5" fill="#4aa3ff" stroke="#fff" stroke-width="1.5"/>
      </g>
      ${['#ff7eb6', '#4aa3ff', '#ffd23f'].map((c, i) => `<circle cx="${28}" cy="${92 + i * 30}" r="11" fill="${c}" stroke="#fff" stroke-width="3"/>`).join('')}`,

    /* A unicorn at the foot of a rainbow, a castle on the cloud across. */
    'unicorn-rainbow': () => `
      ${bg('cv-sky')}
      ${['#ff4d4d', '#ff9a1f', '#ffd23f', '#3ccf7a', '#4aa3ff', '#a66cff'].map((c, i) => `<path d="M${18 + i * 9} 170A${82 - i * 9} ${82 - i * 9} 0 0 1 ${182 - i * 9} 170" stroke="${c}" stroke-width="9" fill="none"/>`).join('')}
      ${cloud(28, 170, 1)}${cloud(168, 166, 1.1)}
      <g transform="translate(150 118)">
        <rect x="0" y="0" width="34" height="34" fill="#ffd1e4"/><rect x="-6" y="-14" width="12" height="48" fill="#ffb3d1"/><rect x="28" y="-14" width="12" height="48" fill="#ffb3d1"/>
        <path d="M-8-14l8-14 8 14zM26-14l8-14 8 14z" fill="#a66cff"/><path d="M12 34v-14a5 5 0 0 1 10 0v14z" fill="#a66cff"/>
      </g>
      <g transform="translate(46 108)">
        ${shadow(0, 46, 26, 6)}
        <path d="M-6 -6l8 -34 8 30z" fill="#ffd23f" stroke="#e0a800" stroke-width="1.5"/>
        <path d="M-2-22l8 3M-4-12l10 3" stroke="#e0a800" stroke-width="1.5"/>
        <ellipse cx="0" cy="12" rx="22" ry="20" fill="#fff"/>
        <ellipse cx="16" cy="24" rx="12" ry="10" fill="#fff"/>
        <circle cx="20" cy="24" r="2" fill="#ffb3c7"/>
        ${eye(4, 8, 3.4)}
        <circle cx="-10" cy="-2" r="8" fill="#ff7eb6"/><circle cx="-18" cy="10" r="8" fill="#a66cff"/><circle cx="-20" cy="24" r="7" fill="#4aa3ff"/>
        <path d="M-8-12l-6-8 8 2z" fill="#fff"/>
      </g>
      ${sparkle(100, 40, 8, '#fff')}${sparkle(130, 70, 5, '#fff')}`,

    /* A golden magic mirror holding a crown's shadow. */
    'castle-shadows': () => `
      ${bg('cv-night')}
      ${sparkle(26, 30, 5)}${sparkle(170, 26, 7)}${sparkle(40, 150, 4)}${sparkle(178, 120, 5)}
      ${shadow(100, 186, 50, 8)}
      <ellipse cx="100" cy="98" rx="56" ry="74" fill="#e09a00"/>
      <ellipse cx="100" cy="98" rx="48" ry="66" fill="#ffcf3f"/>
      <ellipse cx="100" cy="98" rx="40" ry="58" fill="#dff3ff"/>
      ${gloss(84, 64, 10, 22, -20)}
      <path d="M70 120l-4-36 18 16 16-26 16 26 18-16-4 36z" fill="#1e2a44" opacity=".85"/>
      <path d="M100 18l8 10-8 6-8-6z" fill="#ff7eb6" stroke="#fff" stroke-width="2"/>
      <g transform="translate(150 150) scale(.5)">
        <path d="M-30 20l-4-36 18 16 16-26 16 26 18-16-4 36z" fill="#ffd23f" stroke="#e0a800" stroke-width="3"/>
        <circle cx="0" cy="8" r="6" fill="#ff4d8d"/>
      </g>`,

    /* A castle on blueprint paper, its last tower still a dashed outline. */
    'castle-builder': () => `
      <rect width="200" height="200" fill="#2f6ae8"/>
      <g stroke="#fff" stroke-opacity=".14"><path d="M0 20h200M0 40h200M0 60h200M0 80h200M0 100h200M0 120h200M0 140h200M0 160h200M0 180h200M20 0v200M40 0v200M60 0v200M80 0v200M100 0v200M120 0v200M140 0v200M160 0v200M180 0v200"/></g>
      <rect x="26" y="78" width="40" height="96" fill="#b99cff"/>
      <path d="M18 78l28-40 28 40z" fill="#ff6f91"/>
      <rect x="66" y="108" width="68" height="66" fill="#ff9fc6"/>
      <path d="M86 174v-24a14 14 0 0 1 28 0v24z" fill="#c98a4b"/>
      <circle cx="46" cy="104" r="9" fill="#8fd3ff"/>
      <rect x="134" y="78" width="40" height="96" fill="none" stroke="#fff6aa" stroke-width="3" stroke-dasharray="7 6"/>
      <path d="M126 78l28-40 28 40z" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="7 6"/>
      <path d="M46 38v-18" stroke="#fff" stroke-width="2"/><path d="M46 20h16l-4 5 4 5H46z" fill="#ffd23f"/>
      ${sparkle(154, 118, 10, '#fff6aa')}`,

    /* A big speaker calling out, and three Hebrew letter cards. */
    'letter-listen': () => `
      ${bg('cv-teal')}
      <g transform="translate(36 30)">
        <path d="M0 24h18l22-18v68L18 56H0z" fill="#fff"/>
        <path d="M52 22q12 18 0 36M62 12q22 28 0 56" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>
      </g>
      ${[['ב', '#ff7eb6', 30, -8], ['ג', '#ffc531', 82, 4], ['א', '#7c4ced', 134, -6]].map(([l, c, x, r]) => `
        <g transform="rotate(${r} ${x + 18} 150)">
          ${shadow(x + 18, 182, 22, 5)}
          <rect x="${x}" y="118" width="36" height="58" rx="8" fill="#fff"/>
          <text x="${x + 18}" y="162" text-anchor="middle" font-family="Heebo, sans-serif" font-weight="800" font-size="36" fill="${c}">${l}</text>
        </g>`).join('')}
      ${sparkle(170, 40, 9)}`,

    /* Balloons with letters, one popping. */
    'letter-balloons': () => `
      ${bg('cv-sky')}
      ${cloud(40, 40, .8)}${cloud(160, 160, .7)}
      ${[['מ', '#ff5d8f', 52, 96], ['ש', '#4aa3ff', 104, 70], ['ב', '#3ccf7a', 150, 110]].map(([l, c, x, y]) => `
        <path d="M${x} ${y + 34}q-6 20 4 40" stroke="#6b7a90" stroke-width="1.5" fill="none"/>
        <ellipse cx="${x}" cy="${y}" rx="26" ry="32" fill="${c}"/>
        <path d="M${x - 5} ${y + 32}h10l-5 6z" fill="${c}"/>
        ${gloss(x - 10, y - 12, 7, 11)}
        <text x="${x}" y="${y + 12}" text-anchor="middle" font-family="Heebo, sans-serif" font-weight="800" font-size="30" fill="#fff">${l}</text>`).join('')}
      <path d="M160 40l6 10M176 34l-4 12M186 50l-12 2M150 54l10 0" stroke="#ff8a1f" stroke-width="4" stroke-linecap="round"/>`,

    /* A star drawn by joining lettered dots, the last line still to go. */
    'alefbet-dots': () => {
      const pts = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5; const r = i % 2 ? 32 : 76; return [100 + Math.cos(a) * r, 108 + Math.sin(a) * r]; });
      const L = [...'אבגדהוזחטי'];
      return `${bg('cv-paper')}
        <polyline points="${pts.slice(0, 8).map((p) => p.join(',')).join(' ')}" fill="none" stroke="#0f8ea0" stroke-width="4" stroke-linejoin="round"/>
        ${pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="5" fill="${i < 8 ? '#0f8ea0' : '#fff'}" stroke="#52607c" stroke-width="1.5"/>
          <text x="${x + (x - 100) * .18}" y="${y + (y - 108) * .18 + 5}" text-anchor="middle" font-family="Heebo, sans-serif" font-weight="800" font-size="14" fill="#1e2a44">${L[i]}</text>`).join('')}
        <g transform="translate(150 166) rotate(-30)"><rect x="0" y="-6" width="44" height="12" rx="3" fill="#ffc531"/><path d="M0-6l-12 6 12 6z" fill="#f4d9a8"/></g>`;
    },

    /* Mother Duck with a big A, her duckling with a small a. */
    'abc-big-small': () => `
      ${bg('cv-water')}
      <path d="M0 140q50-10 100 0t100 0v60H0z" fill="#1e88cc" opacity=".35"/>
      ${duck(70, 124, 1.15)}
      ${duck(150, 150, .55)}
      ${block(40, 22, 50, 'A', '#ff6f91')}
      ${block(132, 90, 34, 'a', '#7c4ced')}
      ${sparkle(176, 30, 8)}`,

    /* A caterpillar of letters, A B _ D. */
    'abc-caterpillar': () => `
      ${bg('cv-mint')}
      <path d="M0 150q60-16 120-4t80 0v54H0z" fill="#46a836" opacity=".45"/>
      <path d="M150 40q30 10 34 40-26 4-40-14z" fill="#5cc94e"/>
      ${['A', 'B', '', 'D'].map((l, i) => `
        <circle cx="${32 + i * 34}" cy="${124 - (i % 2) * 8}" r="20" fill="${l ? ['#7bd96b', '#5cc94e', '', '#4fbf6a'][i] : '#fff'}" ${l ? '' : 'stroke="#4fbf6a" stroke-width="3" stroke-dasharray="5 4"'}/>
        <text x="${32 + i * 34}" y="${135 - (i % 2) * 8}" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="24" fill="#1e5a2a">${l}</text>`).join('')}
      <circle cx="170" cy="110" r="24" fill="#ff6f91"/>
      ${eye(164, 104, 4)}${eye(180, 104, 4)}
      <path d="M164 118q8 6 16 0" stroke="#1e2a44" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M162 88l-6-16M180 88l6-16" stroke="#1e2a44" stroke-width="3" stroke-linecap="round"/>
      <circle cx="156" cy="72" r="4" fill="#1e2a44"/><circle cx="186" cy="72" r="4" fill="#1e2a44"/>`,

    /* Numbered bubbles rising through the water. */
    'bubble-count': () => `
      ${bg('cv-water')}
      ${[[56, 142, 34, '1'], [136, 118, 30, '2'], [70, 66, 26, '3'], [150, 46, 20, '4']].map(([x, y, r, n]) => `
        <circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".28" stroke="#fff" stroke-width="3"/>
        ${gloss(x - r * .35, y - r * .4, r * .32, r * .2)}
        <text x="${x}" y="${y + r * .42}" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="${r * 1.2}" fill="#fff">${n}</text>`).join('')}
      <circle cx="28" cy="52" r="7" fill="#fff" opacity=".35"/><circle cx="108" cy="30" r="5" fill="#fff" opacity=".35"/><circle cx="178" cy="150" r="8" fill="#fff" opacity=".35"/>`,

    /* Three apples and a car, with a question mark over the car. */
    'odd-one-out': () => `
      ${bg('cv-sunny')}
      ${[[56, 58], [144, 58], [56, 146]].map(([x, y]) => `
        ${shadow(x, y + 30, 30)}
        <path d="M${x} ${y - 16}c-14-12-34-2-32 18 2 22 18 32 32 25 14 7 30-3 32-25 2-20-18-30-32-18z" fill="#ec3b3b"/>
        ${gloss(x - 13, y - 6, 8, 12)}
        <path d="M${x} ${y - 16}q2-12 11-15" stroke="#6b3e13" stroke-width="4" fill="none" stroke-linecap="round"/>`).join('')}
      <circle cx="144" cy="146" r="42" fill="#fff" stroke="#e8621c" stroke-width="5" stroke-dasharray="9 7"/>
      <rect x="112" y="142" width="64" height="20" rx="8" fill="#2f6ae8"/>
      <path d="M122 142l9-15h26l10 15z" fill="#7cb0ff"/>
      <circle cx="127" cy="164" r="7" fill="#1e2a44"/><circle cx="161" cy="164" r="7" fill="#1e2a44"/>`,

    /* Two baskets, and what goes in each: an apple, a ball. */
    'sort-baskets': () => `
      ${bg('cv-mint')}
      ${[[54, '#d79a52'], [146, '#c4843c']].map(([x, c]) => `
        ${shadow(x, 180, 42)}
        <path d="M${x - 40} 112h80l-9 58c-1 6-5 9-11 9h-40c-6 0-10-3-11-9z" fill="${c}"/>
        <path d="M${x - 37} 130h74M${x - 34} 150h68M${x - 16} 112v66M${x + 16} 112v66" stroke="#9c6426" stroke-width="3"/>
        <rect x="${x - 44}" y="104" width="88" height="12" rx="6" fill="#a86d38"/>`).join('')}
      <circle cx="54" cy="76" r="24" fill="#ec3b3b"/>${gloss(46, 68, 7, 10)}
      <path d="M54 52q2-10 11-13" stroke="#6b3e13" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle cx="146" cy="76" r="24" fill="#2f6ae8"/>
      <path d="M124 68q22 10 44 0M124 86q22-10 44 0" stroke="#fff" stroke-width="5" fill="none"/>${gloss(138, 66, 6, 8)}`,

    /* A pizza with its toppings on a wooden board. */
    'pizza-shop': () => `
      ${bg('cv-wood')}
      ${shadow(100, 170, 78)}
      <circle cx="100" cy="100" r="78" fill="#d98b34"/>
      <circle cx="100" cy="100" r="66" fill="#f9d976"/>
      <path d="M40 92a60 60 0 0 1 112-22" stroke="#f3b94d" stroke-width="6" fill="none" opacity=".7"/>
      ${[[72, 72], [130, 84], [90, 132], [140, 134]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13" fill="#e53935"/><circle cx="${x - 4}" cy="${y - 4}" r="3.5" fill="#fff" opacity=".5"/>`).join('')}
      ${[[104, 58], [62, 118], [116, 108]].map(([x, y]) => `<path d="M${x - 13} ${y}a13 12 0 0 1 26 0z" fill="#efe4d3" stroke="#c7b39a" stroke-width="2"/><rect x="${x - 5}" y="${y}" width="10" height="10" rx="3" fill="#efe4d3" stroke="#c7b39a" stroke-width="2"/>`).join('')}`,

    /* A robot on a grid, a battery at the end of a dotted path. */
    'robot-code': () => `
      ${bg('cv-desk')}
      <g stroke="#fff" stroke-opacity=".55" stroke-width="3">${[40, 80, 120, 160].map((v) => `<path d="M${v} 0v200M0 ${v}h200"/>`).join('')}</g>
      <path d="M60 148h80V60" stroke="#ffd23f" stroke-width="7" fill="none" stroke-dasharray="4 14" stroke-linecap="round"/>
      ${shadow(60, 182, 30)}
      <rect x="33" y="118" width="54" height="50" rx="12" fill="#e9eef6" stroke="#52607c" stroke-width="4"/>
      <circle cx="50" cy="140" r="7" fill="#2f6ae8"/><circle cx="70" cy="140" r="7" fill="#2f6ae8"/>
      <path d="M49 156h22" stroke="#52607c" stroke-width="4" stroke-linecap="round"/>
      <path d="M60 118v-12" stroke="#52607c" stroke-width="4"/><circle cx="60" cy="102" r="6" fill="#e8621c"/>
      <rect x="39" y="168" width="14" height="12" rx="3" fill="#52607c"/><rect x="67" y="168" width="14" height="12" rx="3" fill="#52607c"/>
      <rect x="116" y="26" width="48" height="26" rx="6" fill="#1c9a57" transform="rotate(90 140 39)"/>
      <rect x="134" y="4" width="12" height="7" rx="2" fill="#13733f"/>
      <path d="M143 24l-9 15h7l-3 13 10-17h-7z" fill="#fff"/>`,

    /* A flask with two pots pouring into it. */
    'color-lab': () => `
      ${bg('cv-lav')}
      ${shadow(100, 186, 56)}
      <path d="M80 54v44L44 158c-7 13 2 26 16 26h80c14 0 23-13 16-26l-36-60V54z" fill="#fff" fill-opacity=".85" stroke="#6b7a99" stroke-width="5" stroke-linejoin="round"/>
      <path d="M68 118h64l22 42c4 9-2 19-13 19H59c-11 0-17-10-13-19z" fill="#43a047"/>
      <circle cx="82" cy="146" r="6" fill="#fff" opacity=".5"/><circle cx="116" cy="158" r="4" fill="#fff" opacity=".5"/>
      <rect x="72" y="42" width="56" height="13" rx="6" fill="#6b7a99"/>
      <circle cx="42" cy="46" r="24" fill="#fdd835" stroke="#fff" stroke-width="4"/>
      <circle cx="158" cy="46" r="24" fill="#1e88e5" stroke="#fff" stroke-width="4"/>
      <path d="M64 58q14 6 24 24M136 58q-14 6-24 24" stroke="#1e2a44" stroke-width="4" fill="none" stroke-linecap="round" opacity=".55"/>`,

    /* A speech bubble saying "dog", and the dog. */
    'english-words': () => `
      ${bg('cv-pink')}
      <path d="M26 24h148a14 14 0 0 1 14 14v56a14 14 0 0 1-14 14H86l-30 26v-26H26a14 14 0 0 1-14-14V38a14 14 0 0 1 14-14z" fill="#fff"/>
      <text x="100" y="86" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="52" fill="#d9416a">dog</text>
      ${shadow(126, 188, 44)}
      <path d="M92 158c0-26 14-40 34-40s34 14 34 40c0 18-14 28-34 28s-34-10-34-28z" fill="#c98a4b"/>
      <path d="M88 122c-14 2-18 24-8 36 10-6 14-20 12-36zM164 122c14 2 18 24 8 36-10-6-14-20-12-36z" fill="#8d5a2b"/>
      ${eye(112, 148, 4.5)}${eye(140, 148, 4.5)}
      <ellipse cx="126" cy="164" rx="9" ry="6.5" fill="#1e2a44"/>`,

    /* A ten frame, seven dots in it and three to come. */
    'make-ten': () => `
      ${bg('cv-sky')}
      ${shadow(100, 172, 90, 10)}
      <rect x="10" y="48" width="180" height="112" rx="16" fill="#1e2a44"/>
      ${Array.from({ length: 10 }, (_, i) => {
        const x = 18 + (i % 5) * 33.5;
        const y = 56 + Math.floor(i / 5) * 49;
        return `<rect x="${x}" y="${y}" width="30" height="46" rx="6" fill="#fff"/>${i < 7 ? `<circle cx="${x + 15}" cy="${y + 23}" r="12" fill="#2583c9"/>` : `<circle cx="${x + 15}" cy="${y + 23}" r="11" fill="none" stroke="#f5a623" stroke-width="3" stroke-dasharray="4 4"/>`}`;
      }).join('')}
      <text x="100" y="36" text-anchor="middle" direction="ltr" unicode-bidi="bidi-override" font-family="Fredoka, sans-serif" font-weight="700" font-size="30" fill="#1e2a44">7 + ? = 10</text>`,

    /* A row of shapes with the last one missing, and a bulb. */
    'what-next': () => `
      ${bg('cv-night')}
      ${sparkle(30, 30, 8)}${sparkle(170, 38, 6)}
      <g transform="translate(100 70)">
        <path d="M-30 18c0-10-14-16-14-34a44 44 0 0 1 88 0c0 18-14 24-14 34z" fill="#ffd23f" transform="translate(-14 0) scale(.9)"/>
        <rect x="-26" y="20" width="26" height="9" rx="4" fill="#c7cede"/><rect x="-23" y="31" width="20" height="7" rx="3.5" fill="#c7cede"/>
      </g>
      <g transform="translate(0 112)">
        <circle cx="30" cy="42" r="19" fill="#e53935"/>
        <rect x="58" y="24" width="36" height="36" rx="5" fill="#1e88e5"/>
        <circle cx="124" cy="42" r="19" fill="#e53935"/>
        <rect x="150" y="22" width="40" height="40" rx="8" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="7 6"/>
        <text x="170" y="53" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="30" fill="#fff">?</text>
      </g>`,
  };

  const has = (id) => Boolean(ART[id]);

  /* The cover itself. Decorative: the game's title is printed right under it. */
  function art(id, cls) {
    return `<svg class="${cls || 'art'}" viewBox="0 0 200 200" aria-hidden="true" focusable="false">${ART[id]()}</svg>`;
  }

  function inject() {
    document.body.insertAdjacentHTML('afterbegin', defs());
  }

  return { has, art, inject };
})();
