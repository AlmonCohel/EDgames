/* Game host: reads ?id=, dresses the page from the catalog, and mounts the game
   module from games/<id>.js.

   A game module registers itself:

     EDGames.register('my-game', {
       mount(root, ctx) { ... },   // root is the empty stage element
       unmount() { ... },          // optional — clean up timers/listeners
     });

   ctx gives the game { game, lang, exit() } so it can send the child back to
   the grid and write its own text in the language on screen. */

window.EDGames = {
  registry: {},
  register(id, module) { this.registry[id] = module; },
};

const stage = document.getElementById('stage');
const back = document.getElementById('back');

/* Every way back to the grid carries the language, so leaving a game does not
   drop the child into Hebrew. */
const gridHref = (() => {
  const qs = EDLang.stamp(new URLSearchParams()).toString();
  return qs ? `index.html?${qs}` : 'index.html';
})();

back.href = gridHref;

/* Going back through history keeps the grid's filters and scroll position;
   the href is the fallback for a game opened directly from a link. */
back.addEventListener('click', (e) => {
  if (history.length > 1 && document.referrer.includes(location.host)) {
    e.preventDefault();
    history.back();
  }
});

function note(emoji, heading, text, action) {
  stage.innerHTML = `
    <div class="stage-note">
      <div class="emoji" aria-hidden="true">${emoji}</div>
      <h2>${heading}</h2>
      <p>${text}</p>
      ${action ? `<a class="btn" href="${gridHref}">${action}</a>` : ''}
    </div>`;
}

function dressPage(game) {
  const subject = subjectById(game.subject);
  const title = EDLang.pick(game.title);
  document.title = `${title} — ${EDLang.t('brand.name')}`;
  document.getElementById('game-title').textContent = title;
  document.getElementById('game-badges').innerHTML = `
    <span class="badge badge--age">${EDLang.t('card.age')} <span class="num">${game.ageMin}–${game.ageMax}</span></span>
    <span class="badge">${EDLang.pick(subject.label)}</span>`;
  stage.dataset.subject = game.subject;
}

function loadModule(game) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `games/${game.id}.js`;
    s.onload = resolve;
    s.onerror = () => reject(new Error('script failed to load'));
    document.body.append(s);
  });
}

async function start() {
  EDLang.applyStatic();
  EDLang.mountToggle();

  const id = new URLSearchParams(location.search).get('id');
  const game = id && gameById(id);

  if (!game) {
    document.getElementById('game-title').textContent = EDLang.t('game.missing.title');
    note('🧭', EDLang.t('game.missing.heading'), EDLang.t('game.missing.text'), EDLang.t('game.allGames'));
    return;
  }

  dressPage(game);

  if (game.status !== 'ready') {
    note('🚧', EDLang.t('game.soon.heading'), EDLang.t('game.soon.text'), EDLang.t('game.allGames'));
    return;
  }

  note('⏳', EDLang.t('game.loading.heading'), EDLang.t('game.loading.text'));

  try {
    await loadModule(game);
  } catch {
    note('😕', EDLang.t('game.failed.heading'), EDLang.t('game.failed.text'), EDLang.t('game.allGames'));
    return;
  }

  const module = window.EDGames.registry[game.id];
  if (!module || typeof module.mount !== 'function') {
    note('😕', EDLang.t('game.failed.heading'), EDLang.t('game.unregistered'), EDLang.t('game.allGames'));
    return;
  }

  stage.innerHTML = '';
  module.mount(stage, { game, lang: EDLang.current, exit: () => { location.href = gridHref; } });

  window.addEventListener('pagehide', () => {
    if (typeof module.unmount === 'function') module.unmount();
  });
}

start();
