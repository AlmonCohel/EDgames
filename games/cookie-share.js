/* חולקים שווה בשווה / Fair Share — early division and equal groups for ages 3–5.

   Before a child ever meets a division sign, they already know what "fair" means:
   one for you, one for me, until the tray is empty and every friend has the same
   pile. A picnic table holds two or three animal friends, each with a porcelain
   plate and a live counter badge; below sits the baking tray of warm cookies.

   Cookies can be dragged onto any plate or tapped to deal to the friend with the
   fewest. If the tray runs out while one plate has more than another, the fuller
   plate glows and tapping or dragging a cookie moves it over. In the third set,
   once the cookies are shared equally, the child also answers how many each
   friend got.

   Sets: two friends, three friends, how many did each get. */

(function () {
  const SETS = [
    { id: 'two', emoji: '🐻', label: { he: 'שני חברים', en: 'Two friends' }, friends: 2, askCount: false },
    { id: 'three', emoji: '🐰', label: { he: 'שלושה חברים', en: 'Three friends' }, friends: 3, askCount: false },
    { id: 'howmany', emoji: '🔢', label: { he: 'כמה לכל אחד?', en: 'How many each?' }, friends: 0, askCount: true },
  ];

  const TEXT = {
    he: {
      ask: 'חלקו את העוגיות שווה בשווה בין החברים',
      howmany: 'כמה עוגיות קיבל כל חבר?',
      tapDeal: 'גוררים עוגייה לצלחת, או לוחצים כדי לחלק לפי התור',
      unequal: 'לצלחת אחת יש יותר! העבירו עוגייה לחבר שיש לו פחות',
      each: (n) => `${n} עוגיות לכל חבר!`,
      plate: (name, n) => `צלחת של ${name}: ${n}`,
      cookie: 'עוגייה',
    },
    en: {
      ask: 'Share the cookies equally between the friends',
      howmany: 'How many cookies did each friend get?',
      tapDeal: 'Drag a cookie to a plate, or tap to deal in turn',
      unequal: 'One plate has more! Move a cookie to the friend with fewer',
      each: (n) => `${n} cookies for each friend!`,
      plate: (name, n) => `${name}'s plate: ${n}`,
      cookie: 'cookie',
    },
  };

  const FRIENDS = [
    {
      id: 'bear',
      name: { he: 'דובון', en: 'Bear' },
      svg: (happy) => `<svg viewBox="0 0 80 72" aria-hidden="true">
        <circle cx="18" cy="18" r="12" fill="#9c6234"/><circle cx="18" cy="18" r="6.5" fill="#d9a173"/>
        <circle cx="62" cy="18" r="12" fill="#9c6234"/><circle cx="62" cy="18" r="6.5" fill="#d9a173"/>
        <ellipse cx="40" cy="40" rx="28" ry="25" fill="#b87742"/>
        <ellipse cx="40" cy="46" rx="14" ry="11" fill="#f3d2b3"/>
        <circle cx="29" cy="34" r="3.6" fill="#1e2a44"/><circle cx="51" cy="34" r="3.6" fill="#1e2a44"/>
        <circle cx="27.8" cy="32.6" r="1.3" fill="#fff"/><circle cx="49.8" cy="32.6" r="1.3" fill="#fff"/>
        <ellipse cx="40" cy="42" rx="5.2" ry="3.6" fill="#4a2b13"/>
        ${happy
          ? '<path d="M32 48q8 9 16 0" stroke="#4a2b13" stroke-width="3" fill="none" stroke-linecap="round"/>'
          : '<path d="M35 49h10" stroke="#4a2b13" stroke-width="2.6" fill="none" stroke-linecap="round"/>'}
        <circle cx="21" cy="43" r="4.5" fill="#ff8fa3" opacity=".55"/><circle cx="59" cy="43" r="4.5" fill="#ff8fa3" opacity=".55"/>
      </svg>`,
    },
    {
      id: 'bunny',
      name: { he: 'ארנבון', en: 'Bunny' },
      svg: (happy) => `<svg viewBox="0 0 80 72" aria-hidden="true">
        <ellipse cx="27" cy="17" rx="7.5" ry="16" fill="#f2eef7" stroke="#d5cce4" stroke-width="2"/>
        <ellipse cx="27" cy="18" rx="3.8" ry="11" fill="#ffb3c6"/>
        <ellipse cx="53" cy="17" rx="7.5" ry="16" fill="#f2eef7" stroke="#d5cce4" stroke-width="2"/>
        <ellipse cx="53" cy="18" rx="3.8" ry="11" fill="#ffb3c6"/>
        <ellipse cx="40" cy="43" rx="26" ry="23" fill="#ffffff" stroke="#d5cce4" stroke-width="2"/>
        <circle cx="30" cy="38" r="3.6" fill="#1e2a44"/><circle cx="50" cy="38" r="3.6" fill="#1e2a44"/>
        <circle cx="28.8" cy="36.6" r="1.3" fill="#fff"/><circle cx="48.8" cy="36.6" r="1.3" fill="#fff"/>
        <ellipse cx="40" cy="44" rx="4.2" ry="3" fill="#ff7a9e"/>
        ${happy
          ? '<path d="M32 50q8 8 16 0" stroke="#5b4a6e" stroke-width="2.8" fill="none" stroke-linecap="round"/>'
          : '<path d="M35 51h10" stroke="#5b4a6e" stroke-width="2.5" fill="none" stroke-linecap="round"/>'}
        <circle cx="22" cy="46" r="4.5" fill="#ffb3c6" opacity=".65"/><circle cx="58" cy="46" r="4.5" fill="#ffb3c6" opacity=".65"/>
      </svg>`,
    },
    {
      id: 'fox',
      name: { he: 'שועלון', en: 'Fox' },
      svg: (happy) => `<svg viewBox="0 0 80 72" aria-hidden="true">
        <path d="M14 34 L18 8 L35 24 Z" fill="#e86a24"/><path d="M18 28 L20 13 L31 24 Z" fill="#fff3e2"/>
        <path d="M66 34 L62 8 L45 24 Z" fill="#e86a24"/><path d="M62 28 L60 13 L49 24 Z" fill="#fff3e2"/>
        <ellipse cx="40" cy="42" rx="27" ry="23" fill="#f27930"/>
        <path d="M16 44 Q28 38 40 54 Q52 38 64 44 Q56 64 40 65 Q24 64 16 44 Z" fill="#fff7ec"/>
        <circle cx="29" cy="36" r="3.6" fill="#1e2a44"/><circle cx="51" cy="36" r="3.6" fill="#1e2a44"/>
        <circle cx="27.8" cy="34.6" r="1.3" fill="#fff"/><circle cx="49.8" cy="34.6" r="1.3" fill="#fff"/>
        <circle cx="40" cy="45" r="4" fill="#1e2a44"/>
        ${happy
          ? '<path d="M33 51q7 8 14 0" stroke="#1e2a44" stroke-width="2.8" fill="none" stroke-linecap="round"/>'
          : '<path d="M35 52h10" stroke="#1e2a44" stroke-width="2.5" fill="none" stroke-linecap="round"/>'}
      </svg>`,
    },
  ];

  const COOKIE_SVG = `<svg viewBox="0 0 48 48" aria-hidden="true">
    <circle cx="24" cy="26" r="20" fill="#a66829" opacity=".35"/>
    <circle cx="24" cy="23" r="20" fill="#e09f54" stroke="#b5742c" stroke-width="2.5"/>
    <ellipse cx="17" cy="14" rx="7" ry="4" fill="#f7c888" opacity=".55" transform="rotate(-20 17 14)"/>
    <circle cx="16" cy="16" r="3.2" fill="#593110"/><circle cx="29" cy="14" r="2.8" fill="#593110"/>
    <circle cx="23" cy="25" r="3.4" fill="#593110"/><circle cx="14" cy="29" r="2.7" fill="#593110"/>
    <circle cx="32" cy="27" r="3.1" fill="#593110"/><circle cx="24" cy="35" r="2.5" fill="#593110"/>
  </svg>`;

  const ROUNDS = 5;
  const PENTA = [262, 294, 330, 392, 440, 523];

  const CSS = `
    .cs { gap: 10px; }
    .cs-table { width: min(100%, 620px); border-radius: 26px; padding: 14px 12px 16px;
      background: linear-gradient(180deg, #dff4ff 0%, #f3fbff 48%, #f7e1be 48.5%, #e8c690 100%);
      border: 3px solid #fff; box-shadow: 0 6px 0 var(--edge); display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .cs-friends { display: flex; gap: 12px; justify-content: center; align-items: stretch; width: 100%; flex-wrap: nowrap; }
    .cs-spot { flex: 1 1 0; max-width: 188px; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 4px;
      background: rgba(255,255,255,.55); border: 2px solid rgba(255,255,255,.85); border-radius: 22px; padding: 6px 6px 10px;
      cursor: pointer; transition: transform .15s, border-color .2s, background .2s; position: relative; }
    .cs-spot:active { transform: scale(.98); }
    .cs-spot.need { border-color: #2f6ae8; box-shadow: 0 0 0 3px rgba(47,106,232,.22); }
    .cs-spot.extra { border-color: #e8621c; background: #fff4ec; }
    .cs-spot.equal { border-color: var(--pos); background: #eafaf0; }
    .cs-pet { width: clamp(54px, 14vw, 72px); height: clamp(48px, 12.5vw, 64px); pointer-events: none; transition: transform .25s; }
    .cs-spot.equal .cs-pet { animation: kit-pop .45s ease; }
    .cs-plate { position: relative; width: min(100%, 144px); min-height: 76px; border-radius: 50% / 38%;
      background: radial-gradient(ellipse at 50% 42%, #ffffff 0 64%, #e5edf7 66% 100%);
      border: 3px solid #c9d6e8; box-shadow: 0 5px 0 rgba(80,100,130,.22);
      display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 4px; padding: 10px 12px; }
    .cs-badge { position: absolute; top: -10px; inset-inline-end: -4px; min-width: 30px; height: 30px; padding: 0 7px;
      border-radius: 15px; background: var(--sub-solid); color: #fff; font: 700 1.15rem/30px Fredoka, Heebo, sans-serif;
      text-align: center; box-shadow: 0 3px 0 var(--sub-edge); pointer-events: none; }
    .cs-spot.equal .cs-badge { background: var(--pos); box-shadow: 0 3px 0 #0f5a37; }
    .cs-spot.extra .cs-badge { background: #e8621c; box-shadow: 0 3px 0 #a33f0c; }
    .cs-tray-wrap { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 6px; min-height: 82px; justify-content: center; }
    .cs-tray { min-height: 72px; width: min(100%, 480px); border-radius: 20px; padding: 8px 14px;
      background: linear-gradient(180deg, #8b99ad, #6c7a8e); border: 3px solid #aebbd0; box-shadow: inset 0 3px 6px rgba(0,0,0,.22), 0 4px 0 #4f5b6b;
      display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: center; }
    .cs-cookie { width: clamp(40px, 10.5vw, 48px); height: clamp(40px, 10.5vw, 48px); padding: 0; border: none; background: none;
      cursor: pointer; flex: none; transition: transform .12s; animation: kit-pop .25s ease; }
    .cs-plate .cs-cookie { width: clamp(32px, 8.2vw, 38px); height: clamp(32px, 8.2vw, 38px); }
    .cs-cookie:hover { transform: scale(1.08); }
    .cs-cookie:active { transform: scale(.94); }
    .cs-cookie svg { width: 100%; height: 100%; display: block; }
    .cs-eq { min-height: 2.1rem; font: 700 1.65rem/1.2 Fredoka, Heebo, sans-serif; color: var(--sub-ink); direction: ltr; text-align: center; }
    .cs-opts .kit-opt { min-width: 72px; min-height: 72px; font-size: 2.2rem; }
  `;

  const clock = EDKit.timers();

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];
    EDKit.style('cs-style', CSS);

    let round = 0;
    let lastKey = '';
    const wrap = document.createElement('div');
    wrap.className = 'kit cs';
    root.append(wrap);

    function makeProblem() {
      for (;;) {
        const nFriends = set.friends || (round % 2 === 0 ? 2 : 3);
        const maxPer = nFriends === 2 ? 4 : 3;
        const per = 1 + Math.floor(Math.random() * maxPer);
        const total = nFriends * per;
        /* Avoid 1 cookie each on every other round so children genuinely deal several. */
        if (per === 1 && round > 1 && Math.random() < 0.65) continue;
        const key = `${nFriends}:${per}`;
        if (key !== lastKey) {
          lastKey = key;
          return { nFriends, per, total };
        }
      }
    }

    function next() {
      if (round >= ROUNDS) return EDKit.end(wrap, ctx, lang);
      const p = makeProblem();
      const plates = Array.from({ length: p.nFriends }, () => 0);
      let tray = p.total;
      let phase = 'share'; // 'share' | 'question' | 'done'

      wrap.innerHTML = `
        ${EDKit.dots(ROUNDS, round)}
        ${EDKit.head(text.ask, lang)}
        <div class="cs-table">
          <div class="cs-friends"></div>
          <div class="cs-tray-wrap"></div>
        </div>
        <div class="cs-eq" aria-live="polite"></div>
        <p class="kit-hint" aria-live="polite">${text.tapDeal}</p>`;

      const friendsRow = wrap.querySelector('.cs-friends');
      const trayWrap = wrap.querySelector('.cs-tray-wrap');
      const eqEl = wrap.querySelector('.cs-eq');
      const hintEl = wrap.querySelector('.kit-hint');
      const headH2 = wrap.querySelector('.kit-head h2');

      EDKit.voice(wrap, 'share-ask', lang);

      function isEqualDone() {
        return tray === 0 && plates.every((c) => c === p.per);
      }

      function smallestPlateIndex() {
        let idx = 0;
        for (let i = 1; i < plates.length; i += 1) {
          if (plates[i] < plates[idx]) idx = i;
        }
        return idx;
      }

      function dealTo(friendIdx) {
        if (phase !== 'share') return;
        if (tray > 0) {
          tray -= 1;
          plates[friendIdx] += 1;
          const cnt = plates[friendIdx];
          EDSound.note(PENTA[(cnt - 1) % PENTA.length], { seconds: 0.2, wave: 'triangle', gain: 0.2 });
          EDVoice.say(EDVoiceLines.num(cnt), lang);
          render();
          checkAfterMove();
        } else if (plates[friendIdx] < p.per) {
          /* Tray is empty and the child tapped the plate that needs a cookie:
             move one from the fullest plate. */
          let maxIdx = 0;
          for (let i = 1; i < plates.length; i += 1) {
            if (plates[i] > plates[maxIdx]) maxIdx = i;
          }
          if (plates[maxIdx] > plates[friendIdx]) {
            plates[maxIdx] -= 1;
            plates[friendIdx] += 1;
            const cnt = plates[friendIdx];
            EDSound.note(PENTA[(cnt - 1) % PENTA.length], { seconds: 0.2, wave: 'triangle', gain: 0.2 });
            EDVoice.say(EDVoiceLines.num(cnt), lang);
            render();
            checkAfterMove();
          }
        }
      }

      function moveFromPlate(fromIdx, toIdx) {
        if (phase !== 'share' || plates[fromIdx] <= 0) return;
        if (typeof toIdx === 'number' && toIdx !== fromIdx && toIdx >= 0 && toIdx < plates.length) {
          plates[fromIdx] -= 1;
          plates[toIdx] += 1;
          const cnt = plates[toIdx];
          EDSound.note(PENTA[(cnt - 1) % PENTA.length], { seconds: 0.2, wave: 'triangle', gain: 0.2 });
          EDVoice.say(EDVoiceLines.num(cnt), lang);
        } else if (tray === 0 && plates[fromIdx] > p.per) {
          const needIdx = smallestPlateIndex();
          plates[fromIdx] -= 1;
          plates[needIdx] += 1;
          const cnt = plates[needIdx];
          EDSound.note(PENTA[(cnt - 1) % PENTA.length], { seconds: 0.2, wave: 'triangle', gain: 0.2 });
          EDVoice.say(EDVoiceLines.num(cnt), lang);
        } else {
          plates[fromIdx] -= 1;
          tray += 1;
          EDSound.note(220, { seconds: 0.14, wave: 'sine', gain: 0.15 });
        }
        render();
        checkAfterMove();
      }

      function finishRound() {
        phase = 'done';
        render();
        const sumParts = plates.map(() => p.per).join(' + ');
        eqEl.textContent = `${p.total} = ${sumParts}`;
        hintEl.textContent = text.each(p.per);
        EDSound.note([523, 659, 784], { seconds: 0.45, wave: 'triangle', gain: 0.22 });
        EDKit.confetti(28);
        EDVoice.say([EDVoiceLines.num(p.per), 'share-each'], lang).then(() => EDKit.praise(lang));
        round += 1;
        clock.later(next, 2800);
      }

      function checkAfterMove() {
        if (!isEqualDone()) {
          if (tray === 0) {
            hintEl.textContent = text.unequal;
          } else {
            hintEl.textContent = text.tapDeal;
          }
          return;
        }
        if (!set.askCount) {
          finishRound();
          return;
        }
        /* Set 3: cookies are shared equally; now ask how many each friend got. */
        phase = 'question';
        headH2.textContent = text.howmany;
        hintEl.textContent = '';
        render();
        EDKit.voice(wrap, 'share-howmany', lang);
      }

      function render() {
        const equal = isEqualDone();
        const unevenEmpty = tray === 0 && !equal;
        friendsRow.innerHTML = plates.map((count, idx) => {
          const f = FRIENDS[idx];
          const stateCls = equal ? 'equal' : (unevenEmpty ? (count > p.per ? 'extra' : (count < p.per ? 'need' : '')) : '');
          const cookiesHtml = Array.from({ length: count }, () => `<button type="button" class="cs-cookie" data-from="${idx}" aria-label="${text.cookie}">${COOKIE_SVG}</button>`).join('');
          return `
            <div class="cs-spot ${stateCls}" data-friend="${idx}" role="region" aria-label="${text.plate(f.name[lang], count)}">
              <div class="cs-pet">${f.svg(equal)}</div>
              <div class="cs-plate">
                <span class="cs-badge">${count}</span>
                ${cookiesHtml}
              </div>
            </div>`;
        }).join('');

        /* Wire tapping the friend/plate area to deal a cookie there. */
        friendsRow.querySelectorAll('.cs-spot').forEach((spot) => {
          spot.addEventListener('click', (e) => {
            if (e.target.closest('.cs-cookie')) return;
            dealTo(Number(spot.dataset.friend));
          });
        });

        /* Wire cookies already on plates for tap-or-drag repositioning. */
        friendsRow.querySelectorAll('.cs-cookie').forEach((btn) => {
          const fromIdx = Number(btn.dataset.from);
          EDKit.drag(btn, {
            onTap: () => moveFromPlate(fromIdx),
            onDrop: (under) => {
              const target = under && under.closest('[data-friend]');
              if (target) moveFromPlate(fromIdx, Number(target.dataset.friend));
              else moveFromPlate(fromIdx);
            },
          });
        });

        if (phase === 'question') {
          const pool = [1, 2, 3, 4, 5].filter((n) => n !== p.per);
          const opts = EDKit.shuffle([p.per, ...EDKit.shuffle(pool).slice(0, 3)]).sort((a, b) => a - b);
          trayWrap.innerHTML = `
            <div class="kit-opts cs-opts">
              ${opts.map((n) => `<button type="button" class="kit-opt" data-n="${n}">${n}</button>`).join('')}
            </div>`;
          trayWrap.querySelectorAll('.kit-opt').forEach((btn) => btn.addEventListener('click', () => {
            if (phase !== 'question') return;
            const chosen = Number(btn.dataset.n);
            if (chosen !== p.per) {
              EDKit.nope(btn);
              EDVoice.say('try-again', lang);
              return;
            }
            EDKit.yes(btn);
            finishRound();
          }));
        } else if (phase === 'share') {
          trayWrap.innerHTML = `
            <div class="cs-tray">
              ${Array.from({ length: tray }, (_, i) => `<button type="button" class="cs-cookie" data-tray="${i}" aria-label="${text.cookie}">${COOKIE_SVG}</button>`).join('')}
            </div>`;
          trayWrap.querySelectorAll('.cs-cookie').forEach((btn) => {
            EDKit.drag(btn, {
              onTap: () => dealTo(smallestPlateIndex()),
              onDrop: (under) => {
                const target = under && under.closest('[data-friend]');
                dealTo(target ? Number(target.dataset.friend) : smallestPlateIndex());
              },
            });
          });
        } else {
          trayWrap.innerHTML = '';
        }
      }

      render();
      return undefined;
    }

    next();
  }

  function unmount() {
    clock.clear();
    EDVoice.stop();
  }

  EDGames.register('cookie-share', { sets: SETS, mount, unmount });
})();
