/* הפיצרייה / The Pizza Shop — counting with a reason to count.

   A customer orders. The child puts toppings on the pizza, each one counted out
   loud, can take one off by pressing it, and serves when it looks right. A pizza
   that is wrong is sent back with what is wrong about it, and the ticket line
   that is off is marked, so it is a fix rather than a do-over.

   Sets: one topping, two toppings, three toppings. A topping that is not on the
   order is always on the counter too, because leaving something out is part of it. */

(function () {
  const TOPPINGS = {
    mushroom: { e: '🍄', name: { he: 'פטריות', en: 'mushrooms' } },
    tomato: { e: '🍅', name: { he: 'עגבניות', en: 'tomatoes' } },
    cheese: { e: '🧀', name: { he: 'גבינה', en: 'cheese' } },
    corn: { e: '🌽', name: { he: 'תירס', en: 'corn' } },
  };
  /* Only these three have recorded orders. */
  const ORDERABLE = ['mushroom', 'tomato', 'cheese'];

  const SETS = [
    { id: 'one', emoji: '🍄', label: { he: 'תוספת אחת', en: 'One topping' }, kinds: 1, max: 5 },
    { id: 'two', emoji: '🍅', label: { he: 'שתי תוספות', en: 'Two toppings' }, kinds: 2, max: 4 },
    { id: 'three', emoji: '🍕', label: { he: 'שלוש תוספות', en: 'Three toppings' }, kinds: 3, max: 3 },
  ];

  const CUSTOMERS = ['👧', '👦', '👩', '👨', '👵', '👴'];

  const TEXT = {
    he: {
      order: 'ההזמנה', serve: 'מגישים!', more: (e) => `חסר עוד ${e}`, less: (e) => `יש יותר מדי ${e}`,
      thanks: 'תודה! איזו פיצה טעימה!', add: (n) => `להוסיף ${n}`, remove: (n) => `להוריד ${n}`,
    },
    en: {
      order: 'The order', serve: 'Serve it!', more: (e) => `More ${e} needed`, less: (e) => `Too many ${e}`,
      thanks: 'Thank you! What a tasty pizza!', add: (n) => `add ${n}`, remove: (n) => `take off ${n}`,
    },
  };

  const ROUNDS = 5;

  /* Spots on the pizza, as percent; far enough apart that each can be counted. */
  const SPOTS = [[50, 50], [30, 34], [68, 32], [28, 66], [70, 68], [50, 22], [50, 78], [18, 50], [82, 50], [36, 50], [64, 50], [50, 36]];

  const CSS = `
    .pz-shop { display: flex; flex-wrap: wrap; gap: 14px 22px; justify-content: center; align-items: center; width: 100%; }
    .pz-ticket { background: #fffdf3; border: 2px dashed #d9c98a; border-radius: 18px; padding: 8px 16px; display: flex; flex-wrap: wrap; gap: 4px 14px; align-items: center; justify-content: center; }
    .pz-who { font-size: 2.8rem; line-height: 1.1; }
        .pz-line { font-size: 1.6rem; font-weight: 700; display: flex; gap: 8px; justify-content: center; align-items: center; border-radius: 10px; padding: 1px 8px; }
    .pz-line.off { background: #ffe1da; }
    .pz-pizza { position: relative; width: min(58vw, 36vh, 280px); aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle, #f9d976 0 58%, #f3b94d 60% 66%, #d98b34 68% 100%); box-shadow: 0 8px 0 #a86d38; }
    .pz-top { position: absolute; transform: translate(-50%, -50%); font-size: clamp(26px, 8vw, 38px); line-height: 1; background: none; border: 0; padding: 4px; cursor: pointer; animation: pz-drop .22s ease-out; }
    @keyframes pz-drop { from { transform: translate(-50%, -90%) scale(1.5); opacity: 0; } }
    .pz-counter { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
    .pz-counter .kit-opt { min-width: 68px; min-height: 68px; font-size: 2.1rem; padding: 6px; }
    .pz-serve { min-width: 180px; justify-content: center; }
    .pz-happy { font-size: 4.4rem; text-align: center; animation: kit-pop .5s ease; }
  `;

  const clock = EDKit.timers();

  function mount(root, ctx) {
    const lang = TEXT[ctx.lang] ? ctx.lang : 'he';
    const text = TEXT[lang];
    const set = ctx.set || SETS[0];
    EDKit.style('pz-style', CSS);

    let round = 0;
    const wrap = document.createElement('div');
    wrap.className = 'kit';
    root.append(wrap);

    function makeOrder() {
      const kinds = EDKit.shuffle(ORDERABLE).slice(0, set.kinds);
      const order = {};
      kinds.forEach((k) => { order[k] = 1 + Math.floor(Math.random() * set.max); });
      return order;
    }

    const orderVoice = (order) => ['pizza-ask', ...Object.entries(order).map(([k, n]) => `pizza-${k}-${n}`)];

    function next() {
      if (round >= ROUNDS) return EDKit.end(wrap, ctx, lang);
      const order = makeOrder();
      const counter = EDKit.shuffle([...Object.keys(order), EDKit.pick(Object.keys(TOPPINGS).filter((k) => !order[k]))]);
      const placed = [];   // topping ids, by spot index
      const who = EDKit.pick(CUSTOMERS);

      wrap.innerHTML = `
        ${EDKit.dots(ROUNDS, round)}
        ${EDKit.head(`${text.order}:`, lang)}
        <div class="pz-shop">
          <div class="pz-ticket">
            <div class="pz-who" aria-hidden="true">${who}</div>
            ${Object.entries(order).map(([k, n]) => `<div class="pz-line" data-k="${k}"><span>${n}</span><span aria-label="${TOPPINGS[k].name[lang]}">${TOPPINGS[k].e}</span></div>`).join('')}
          </div>
          <div class="pz-pizza"></div>
        </div>
        <p class="kit-hint" aria-live="polite"></p>
        <div class="pz-counter">
          ${counter.map((k) => `<button type="button" class="kit-opt" data-k="${k}" aria-label="${text.add(TOPPINGS[k].name[lang])}">${TOPPINGS[k].e}</button>`).join('')}
        </div>
        <button type="button" class="btn btn--big pz-serve">${text.serve}</button>`;
      EDKit.voice(wrap, orderVoice(order), lang);

      const pizza = wrap.querySelector('.pz-pizza');
      const hint = wrap.querySelector('.kit-hint');

      function draw() {
        pizza.innerHTML = placed.map((k, i) => `<button type="button" class="pz-top" data-i="${i}" style="left:${SPOTS[i][0]}%;top:${SPOTS[i][1]}%" aria-label="${text.remove(TOPPINGS[k].name[lang])}">${TOPPINGS[k].e}</button>`).join('');
      }

      function clearMarks() {
        hint.textContent = '';
        wrap.querySelectorAll('.pz-line.off').forEach((l) => l.classList.remove('off'));
      }

      pizza.addEventListener('click', (e) => {
        const top = e.target.closest('.pz-top');
        if (!top) return;
        placed.splice(Number(top.dataset.i), 1);
        clearMarks();
        draw();
      });

      wrap.querySelectorAll('.pz-counter .kit-opt').forEach((b) => b.addEventListener('click', () => {
        if (placed.length >= SPOTS.length) { EDKit.nope(b); return; }
        placed.push(b.dataset.k);
        clearMarks();
        draw();
        EDVoice.say(EDVoiceLines.num(placed.filter((k) => k === b.dataset.k).length), lang);
      }));

      wrap.querySelector('.pz-serve').addEventListener('click', (e) => {
        clearMarks();
        const have = (k) => placed.filter((p) => p === k).length;
        const extra = placed.find((k) => !order[k]);
        const wrongLine = Object.keys(order).find((k) => have(k) !== order[k]);
        if (extra) {
          hint.textContent = text.less(TOPPINGS[extra].e);
          EDKit.nope(e.target);
          EDVoice.say('pizza-less', lang);
          return;
        }
        if (wrongLine) {
          const short = have(wrongLine) < order[wrongLine];
          hint.textContent = short ? text.more(TOPPINGS[wrongLine].e) : text.less(TOPPINGS[wrongLine].e);
          wrap.querySelector(`.pz-line[data-k="${wrongLine}"]`).classList.add('off');
          EDKit.nope(e.target);
          EDVoice.say(short ? 'pizza-more' : 'pizza-less', lang);
          return;
        }
        wrap.innerHTML = `
          ${EDKit.dots(ROUNDS, round + 1)}
          <div class="pz-happy" aria-hidden="true">${who}🍕</div>
          <h2>${text.thanks}</h2>`;
        EDKit.confetti(24);
        EDVoice.say('pizza-yum', lang);
        round += 1;
        clock.later(next, 2300);
      });

      draw();
      return undefined;
    }

    next();
  }

  function unmount() {
    clock.clear();
    EDVoice.stop();
  }

  EDGames.register('pizza-shop', { sets: SETS, mount, unmount });
})();
