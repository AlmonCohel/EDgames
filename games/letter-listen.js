/* איזו אות שמעתי? / Which Letter Did You Hear? — from a letter's name to its shape.

   Made for the child who knows the letters by name but cannot read yet: the
   voice says a letter's name — "מצאו את האות גימל" — and the child finds that
   shape among the cards. A wrong card says its own name, so every tap teaches
   one letter. It is always the Hebrew alef-bet, whatever language the page is
   in; the instructions follow the page.

   Sets: א–י, כ–ת, and the letters that look alike (ב כ פ, ד ר ך, ה ח ת, ו ז ן …). */

(function () {
  const SETS = [
    { id: 'first', emoji: '🅰️', label: { he: 'א עד י', en: 'Alef to Yud' }, pool: [...'אבגדהוזחטי'], options: 3 },
    { id: 'second', emoji: '🔤', label: { he: 'כ עד ת', en: 'Kaf to Tav' }, pool: [...'כלמנסעפצקרשת'], options: 3 },
    { id: 'alike', emoji: '🔍', label: { he: 'אותיות דומות', en: 'Look-alike letters' }, groups: ['בכפ', 'דרך', 'החת', 'וזן', 'גנצ', 'סםט', 'עצש', 'יון'].map((g) => [...g]), options: 3 },
  ];

  const TEXT = {
    he: { ask: 'מצאו את האות ששמעתם' },
    en: { ask: 'Find the letter you heard' },
  };

  const ROUNDS = 6;

  const CSS = `
    .ll-cards { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; direction: rtl; }
    .ll-cards .kit-opt { width: 120px; height: 140px; font-size: 5rem; font-family: "Heebo", "Fredoka", sans-serif; color: var(--sub-ink); }
    @media (max-width: 480px) { .ll-cards .kit-opt { width: 96px; height: 116px; font-size: 4rem; } }
    .ll-ear { font-size: 64px; line-height: 1; }
  `;

  const clock = EDKit.timers();

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];
    EDKit.style('ll-style', CSS);

    let round = 0;
    let last = null;
    const wrap = document.createElement('div');
    wrap.className = 'kit';
    root.append(wrap);

    function choose() {
      if (set.groups) {
        const g = EDKit.pick(set.groups.filter((x) => !x.includes(last)));
        const opts = EDKit.shuffle([...new Set(g)]).slice(0, set.options);
        return { opts, target: EDKit.pick(opts) };
      }
      const target = EDKit.pick(set.pool.filter((x) => x !== last));
      const opts = EDKit.shuffle([target, ...EDKit.shuffle(set.pool.filter((x) => x !== target)).slice(0, set.options - 1)]);
      return { opts, target };
    }

    function next() {
      if (round >= ROUNDS) return EDKit.end(wrap, ctx, lang);
      const { opts, target } = choose();
      last = target;
      wrap.innerHTML = `
        ${EDKit.dots(ROUNDS, round)}
        ${EDKit.head(text.ask, lang)}
        <div class="ll-ear" aria-hidden="true">👂</div>
        <div class="ll-cards">${opts.map((ch) => `<button type="button" class="kit-opt" data-ch="${ch}">${ch}</button>`).join('')}</div>`;
      const ask = ['listen-find', EDVoiceLines.letter(target)];
      EDKit.voice(wrap, ask, lang);
      wrap.querySelectorAll('.kit-opt').forEach((b) => b.addEventListener('click', () => {
        const ch = b.dataset.ch;
        if (ch !== target) {
          EDKit.nope(b);
          /* That card's own name, then the one we are looking for again. */
          EDVoice.say([EDVoiceLines.letter(ch), ...ask], lang);
          return;
        }
        EDKit.yes(b);
        wrap.querySelectorAll('.kit-opt').forEach((o) => { o.disabled = true; });
        EDVoice.say([EDVoiceLines.letter(ch), `praise-${1 + Math.floor(Math.random() * 4)}`], lang);
        round += 1;
        clock.later(next, 1900);
      }));
    }

    next();
  }

  function unmount() {
    clock.clear();
    EDVoice.stop();
  }

  EDGames.register('letter-listen', { sets: SETS, mount, unmount });
})();
