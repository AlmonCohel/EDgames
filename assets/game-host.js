/* Game host: reads ?id=, dresses the page from the catalog, and mounts the game
   module from games/<id>.js.

   A game module registers itself:

     EDGames.register('my-game', {
       sets: [ { id, emoji, label: { he, en }, ...whatever the game needs } ],
       mount(root, ctx) { ... },   // root is the empty stage element
       unmount() { ... },          // optional — clean up timers/listeners
     });

   ctx gives the game { game, lang, set, again(), exit() } so it can send the
   child back to the grid and write its own text in the language on screen.

   A set is one run of a game: the same rules with different questions. The host
   owns the picker above the stage and hands the chosen entry back as ctx.set;
   what is inside it is the game's own business. */

window.EDGames = {
  registry: {},
  register(id, module) { this.registry[id] = module; },
};

const stage = document.getElementById('stage');
const back = document.getElementById('back');
const setRow = document.getElementById('game-sets');
const setChips = document.getElementById('set-chips');
const resetBtn = document.getElementById('game-reset');

/* Inside the home screen's layer (see assets/player.js) "back" hides the layer
   and keeps this page alive underneath, so the game is still where the child
   left it when they come back to it. */
const embedded = Boolean(window.EDPause && EDPause.embedded);
function leave() {
  if (embedded) { try { window.parent.EDPlayer.close(); return; } catch { /* fall through */ } }
  location.href = gridHref;
}

/* Read by game.html before the game is loaded: the site's tune plays under a
   game that makes no sounds of its own, and never on top of one that does. */
window.EDHost = (() => {
  const g = gameById(new URLSearchParams(location.search).get('id'));
  return { wantsMusic: !embedded && Boolean(g) && !g.sound };
})();

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
  if (embedded) {
    e.preventDefault();
    leave();
    return;
  }
  if (history.length > 1 && document.referrer.includes(location.host)) {
    e.preventDefault();
    history.back();
  }
});

/* The "all games" links on the notes below lead out the same way. */
document.addEventListener('click', (e) => {
  if (embedded && !e.defaultPrevented && e.target.closest('a[href^="index.html"]')) {
    e.preventDefault();
    leave();
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
  /* The game's own drawing on its subject's colour, the same pair the tile on
     the home screen wears, so arriving here looks like the card that was
     pressed. */
  document.getElementById('game-mark').innerHTML = EDCovers.has(game.id) ? EDCovers.art(game.id) : EDScenes.picture(game);
  document.getElementById('game-header').dataset.subject = game.subject;
  stage.dataset.subject = game.subject;
}

/* ---- Sets ---- */

/* The set on screen lives in the URL, so one a child likes can be bookmarked,
   and the language toggle — which reloads the page — comes back to it. */
function readSetIndex(sets) {
  const wanted = new URLSearchParams(location.search).get('set');
  const i = sets.findIndex((s) => s.id === wanted);
  return i === -1 ? 0 : i;
}

function writeSetId(id) {
  const p = new URLSearchParams(location.search);
  p.set('set', id);
  /* Rewriting the URL is refused when the site is opened as a file, and the
     site is meant to work from a file — the picker still works without it. */
  try { history.replaceState(null, '', `?${p}`); } catch { /* file:// */ }
}

function buildSetChips(sets, onPick) {
  setChips.replaceChildren(...sets.map((set, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = `<span class="emoji" aria-hidden="true">${set.emoji}</span>${EDLang.pick(set.label)}`;
    b.addEventListener('click', () => onPick(i));
    return b;
  }));
  document.getElementById('set-label').hidden = false;
}

function markSet(index) {
  setChips.querySelectorAll('.chip').forEach((c, i) => c.setAttribute('aria-pressed', String(i === index)));
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

  const sets = Array.isArray(module.sets) && module.sets.length ? module.sets : null;
  let index = sets ? readSetIndex(sets) : 0;

  function play() {
    if (typeof module.unmount === 'function') module.unmount();
    stage.innerHTML = '';
    if (sets) {
      markSet(index);
      writeSetId(sets[index].id);
    }
    /* Remembered for the card at the top of the home screen — on every play,
       not just the first, so "again" and the set picker keep it true to
       whichever set is on screen when the child leaves. */
    EDRecent.write(game.id, sets ? sets[index].id : null);
    module.mount(stage, {
      game,
      lang: EDLang.current,
      set: sets ? sets[index] : null,
      /* "Again" moves on to the next set rather than replaying the one just
         finished — that is what makes three runs in a row three different
         games. The picker above the stage is how you go back to one on
         purpose. */
      again: () => { if (sets) index = (index + 1) % sets.length; play(); },
      exit: leave,
    });
  }

  if (sets) buildSetChips(sets, (i) => { index = i; play(); });
  /* Back to the start of this step — the same set, from its first round. */
  resetBtn.hidden = false;
  resetBtn.addEventListener('click', () => {
    if (window.EDVoice) EDVoice.stop();
    if (window.EDSound) EDSound.hush();
    play();
  });
  play();

  window.addEventListener('pagehide', () => {
    if (typeof module.unmount === 'function') module.unmount();
  });
}

start();
