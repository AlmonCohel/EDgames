/* The home screen. Two modes over one catalog.

   Nothing filtered → browse: the game last played, a row of everything that is
   ready, a row per subject with more than one finished game, and a list of what
   is still being built. Nineteen games across seven subjects is exactly the
   shape that reads well as rows and badly as a wall.

   Anything filtered → results: the same tiles laid flat, with the count line
   and the empty state. Picking a subject, an age or a search term is a
   question, and a question deserves an answer rather than a rearranged shelf.

   Filter state lives in the URL so going into a game and coming back keeps it. */

const els = {
  rail: document.getElementById('subject-rail'),
  ageChips: document.getElementById('age-chips'),
  ageSheet: document.getElementById('age-sheet'),
  searchSheet: document.getElementById('search-sheet'),
  clear: document.getElementById('clear'),
  resultBar: document.getElementById('result-bar'),
  browse: document.getElementById('browse'),
  grid: document.getElementById('grid'),
  empty: document.getElementById('empty'),
  resultLine: document.getElementById('result-line'),
  q: document.getElementById('q'),
  continueShelf: document.getElementById('continue-shelf'),
  continueBox: document.getElementById('continue'),
  ready: document.getElementById('ready'),
  readyCount: document.getElementById('ready-count'),
  bySubject: document.getElementById('by-subject'),
  soon: document.getElementById('soon'),
  tabs: {
    home: document.getElementById('tab-home'),
    age: document.getElementById('tab-age'),
    search: document.getElementById('tab-search'),
  },
};

const state = { ages: new Set(), subjects: new Set(), query: '' };

const FILTER_KEY = 'edgames-filters';

/* ---- URL <-> state ---- */

/* Rewriting the URL is refused when the site is opened as a file, and the site
   is meant to work from a file. There the filters fall back to the tab's own
   storage, which lasts for the tab and the session — exactly as long as the
   URL would have carried them. */
function readStoredFilters() {
  try { return sessionStorage.getItem(FILTER_KEY) || ''; } catch { return ''; }
}

function saveFilters(qs) {
  try { sessionStorage.setItem(FILTER_KEY, qs); } catch { /* then they do not survive the trip */ }
}

function readUrl() {
  /* The URL wins; the stored copy only stands in when nothing was written to it. */
  const search = new URLSearchParams(location.search);
  const carried = search.has('age') || search.has('subject') || search.has('q');
  const p = carried ? search : new URLSearchParams(readStoredFilters());
  const valid = (list, ids) => list.filter((id) => ids.includes(id));
  state.ages = new Set(valid((p.get('age') || '').split(',').filter(Boolean), AGE_GROUPS.map((a) => a.id)));
  state.subjects = new Set(valid((p.get('subject') || '').split(',').filter(Boolean), SUBJECTS.map((s) => s.id)));
  state.query = p.get('q') || '';
  els.q.value = state.query;
}

function writeUrl() {
  const p = new URLSearchParams();
  if (state.ages.size) p.set('age', [...state.ages].join(','));
  if (state.subjects.size) p.set('subject', [...state.subjects].join(','));
  if (state.query.trim()) p.set('q', state.query.trim());
  const filters = p.toString();
  EDLang.stamp(p);
  const qs = p.toString();
  try { history.replaceState(null, '', qs ? `?${qs}` : location.pathname); }
  catch { saveFilters(filters); /* file:// */ }
}

/* ---- Filtering ---- */

function matches(game) {
  if (state.ages.size) {
    const overlaps = [...state.ages].some((id) => {
      const group = AGE_GROUPS.find((a) => a.id === id);
      return game.ageMin <= group.max && game.ageMax >= group.min;
    });
    if (!overlaps) return false;
  }
  if (state.subjects.size && !state.subjects.has(game.subject)) return false;

  /* Searches the language on screen. Folded to lower case for English; Hebrew
     has no case, so this costs it nothing. */
  const q = state.query.trim().toLowerCase();
  if (q) {
    const subject = subjectById(game.subject);
    const haystack = `${EDLang.pick(game.title)} ${EDLang.pick(game.blurb)} ${EDLang.pick(subject.label)}`;
    if (!haystack.toLowerCase().includes(q)) return false;
  }
  return true;
}

/* ---- The pieces the catalog is drawn as ---- */

/* The language rides along on the link so a card shared from an English page
   opens in English. */
function gameHref(game) {
  const params = new URLSearchParams({ id: game.id });
  EDLang.stamp(params);
  return `game.html?${params}`;
}

/* Which drawn field each game wears, decided once for the whole catalog. The
   picture on top of it is the game's own now, so the field is no longer what
   tells two tiles apart — it is the colour and texture the row is made of, and
   spreading it still keeps a shelf from reading as one flat block. */
const COVERS = EDGlyphs.covers(GAMES);

function tile(game) {
  const soon = game.status !== 'ready';
  const cover = COVERS.get(game.id);
  const li = document.createElement('li');
  li.innerHTML = `
    <a class="tile" href="${gameHref(game)}" data-subject="${game.subject}" data-status="${game.status}">
      <div class="cover" data-variant="${cover.variant}" data-tone="${cover.tone}">
        ${EDGlyphs.mark(game.subject, 'mark ghost')}
        ${EDScenes.picture(game)}
      </div>
      <h3>${EDLang.pick(game.title)}</h3>
      <div class="meta">${EDLang.t('card.age')} <span class="num">${game.ageMin}–${game.ageMax}</span>${soon ? ` · ${EDLang.t('card.soon')}` : ''}</div>
    </a>`;
  return li;
}

function soonItem(game) {
  const li = document.createElement('li');
  li.innerHTML = `
    <a class="item" href="${gameHref(game)}" data-subject="${game.subject}">
      <span class="chip-cover" aria-hidden="true">${EDScenes.picture(game)}</span>
      <div class="txt">
        <h3>${EDLang.pick(game.title)}</h3>
        <p>${EDLang.pick(game.blurb)}</p>
      </div>
      <span class="soon-tag">${EDLang.t('card.soon')}</span>
    </a>`;
  return li;
}

function shelf(title, count, games) {
  const section = document.createElement('section');
  section.className = 'shelf';
  section.innerHTML = `
    <div class="head"><h2>${title}</h2><span class="more">${count}</span></div>
    <ul class="row"></ul>`;
  section.querySelector('.row').append(...games.map(tile));
  return section;
}

const gameCount = (n) => EDLang.t('browse.count').replace('{count}', n);

/* ---- Browse ----
   Built once: it is the catalog, which does not change while the page is open,
   and the language toggle reloads. Filtering only hides it. */

function buildBrowse() {
  const last = EDRecent.game();
  if (last) {
    els.continueBox.innerHTML = `
      <a class="continue" href="${gameHref(last)}" data-subject="${last.subject}">
        ${EDGlyphs.mark(last.subject, 'mark ghost')}
        ${EDScenes.picture(last, 'scene scene-main')}
        <div class="txt">
          <div class="kicker">${EDLang.t('continue.kicker')}</div>
          <h3>${EDLang.pick(last.title)}</h3>
          <p>${EDLang.pick(last.blurb)}</p>
        </div>
      </a>`;
    els.continueShelf.hidden = false;
  }

  const ready = GAMES.filter((g) => g.status === 'ready');
  els.ready.append(...ready.map(tile));
  els.readyCount.textContent = gameCount(ready.length);

  /* One row per subject that has something finished behind it — a row of one
     tile looks broken, so a subject with a single ready game rides in the row
     above and does not get a row of its own. */
  SUBJECTS
    .map((s) => ({ s, games: ready.filter((g) => g.subject === s.id) }))
    .filter(({ games }) => games.length > 1)
    .forEach(({ s, games }) => {
      els.bySubject.append(shelf(EDLang.pick(s.label), gameCount(games.length), games));
    });

  els.soon.append(...GAMES.filter((g) => g.status !== 'ready').map(soonItem));
}

/* ---- Chips ---- */

function chip(id, label, group) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'chip';
  b.dataset.group = group;
  b.dataset.id = id;
  b.setAttribute('aria-pressed', 'false');
  b.textContent = label;
  return b;
}

function buildChips() {
  /* "All" belongs to no subject, so it takes the ink rather than borrowing a
     subject's colour and implying one. It is the way back out of a subject on
     the rail itself, where the thumb already is. */
  const all = document.createElement('button');
  all.type = 'button';
  all.id = 'subject-all';
  all.className = 'chip';
  all.textContent = EDLang.t('rail.all');
  all.setAttribute('aria-pressed', 'true');
  els.rail.append(all);

  /* A subject whose games are all still being built is marked the way an
     unfinished tile is, so a chip that leads nowhere playable does not look
     like one that does. It stays selectable — the games behind it are meant to
     be visible — and the word rides on the label for anyone not seeing colour. */
  SUBJECTS.forEach((s) => {
    const label = EDLang.pick(s.label);
    const c = chip(s.id, label, 'subjects');
    c.dataset.subject = s.id;
    c.insertAdjacentHTML('afterbegin', EDGlyphs.mark(s.id));
    if (!subjectHasReady(s.id)) {
      c.dataset.status = 'soon';
      c.setAttribute('aria-label', `${label} — ${EDLang.t('card.soon')}`);
    }
    els.rail.append(c);
  });

  AGE_GROUPS.forEach((a) => els.ageChips.append(chip(a.id, EDLang.pick(a.label), 'ages')));
}

/* ---- Sheets ----
   One at a time: on a phone they both sit in the same place, just above the bar
   the button that opened them is on. */

let openSheet = null;

function showSheet(name, focus) {
  openSheet = name;
  els.ageSheet.hidden = name !== 'age';
  els.searchSheet.hidden = name !== 'search';
  els.tabs.age.setAttribute('aria-expanded', String(name === 'age'));
  els.tabs.search.setAttribute('aria-expanded', String(name === 'search'));
  if (name === 'search' && focus) els.q.focus();
}

/* ---- Rendering ---- */

function render() {
  document.querySelectorAll('.chip[data-group]').forEach((c) => {
    c.setAttribute('aria-pressed', String(state[c.dataset.group].has(c.dataset.id)));
  });
  document.getElementById('subject-all').setAttribute('aria-pressed', String(state.subjects.size === 0));

  const filtering = state.ages.size || state.subjects.size || state.query.trim();
  els.clear.hidden = !filtering;
  els.resultBar.hidden = !filtering;
  els.browse.hidden = Boolean(filtering);
  els.grid.hidden = !filtering;

  if (filtering) els.tabs.home.removeAttribute('aria-current');
  else els.tabs.home.setAttribute('aria-current', 'page');
  els.tabs.age.dataset.on = String(state.ages.size > 0);
  els.tabs.search.dataset.on = String(state.query.trim() !== '');

  if (filtering) {
    const found = GAMES.filter(matches);
    els.grid.replaceChildren(...found.map(tile));
    els.empty.hidden = found.length > 0;

    const ready = found.filter((g) => g.status === 'ready').length;
    const one = found.length === 1;
    els.resultLine.innerHTML = found.length
      ? EDLang.t(one ? 'results.lineOne' : 'results.line')
          .replace('{count}', `<span class="result-count">${found.length}</span>`)
          .replace('{fit}', EDLang.t(one ? 'results.fitOne' : 'results.fit'))
          .replace('{ready}', ready)
      : '';
  } else {
    els.grid.replaceChildren();
    els.empty.hidden = true;
    els.resultLine.textContent = '';
  }

  writeUrl();
}

/* ---- Events ---- */

function toggle(group, id) {
  const set = state[group];
  if (set.has(id)) set.delete(id); else set.add(id);
  render();
}

function clearAll() {
  state.ages.clear();
  state.subjects.clear();
  state.query = '';
  els.q.value = '';
  render();
}

document.addEventListener('click', (e) => {
  const c = e.target.closest('.chip[data-group]');
  if (c) return toggle(c.dataset.group, c.dataset.id);

  if (e.target.closest('#subject-all')) {
    state.subjects.clear();
    return render();
  }
  if (e.target.closest('#clear, [data-clear]')) return clearAll();

  if (e.target.closest('#tab-age')) return showSheet(openSheet === 'age' ? null : 'age', true);
  if (e.target.closest('#tab-search')) return showSheet(openSheet === 'search' ? null : 'search', true);
  if (e.target.closest('#tab-home')) {
    showSheet(null);
    clearAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && openSheet) showSheet(null);
});

els.q.addEventListener('input', () => {
  state.query = els.q.value;
  render();
});

EDLang.applyStatic();
EDLang.mountToggle();
buildChips();
buildBrowse();
readUrl();
/* A page opened on a link that already carries a filter opens the drawer that
   filter came from, so the narrowed list is never unexplained. */
if (state.query.trim()) showSheet('search');
else if (state.ages.size) showSheet('age');
render();
