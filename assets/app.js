/* Grid page: builds the filter chips, filters the catalog, renders the grid.
   Filter state lives in the URL so going into a game and coming back keeps it. */

const els = {
  ageChips: document.getElementById('age-chips'),
  subjectChips: document.getElementById('subject-chips'),
  clear: document.getElementById('clear'),
  grid: document.getElementById('grid'),
  empty: document.getElementById('empty'),
  resultLine: document.getElementById('result-line'),
  q: document.getElementById('q'),
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

/* ---- Rendering ---- */

function chip(id, label, emoji, group) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'chip';
  b.dataset.group = group;
  b.dataset.id = id;
  if (group === 'subjects') b.dataset.subject = id;
  b.setAttribute('aria-pressed', 'false');
  b.innerHTML = `<span class="emoji" aria-hidden="true">${emoji}</span>${label}`;
  return b;
}

function buildChips() {
  AGE_GROUPS.forEach((a) => els.ageChips.append(chip(a.id, EDLang.pick(a.label), a.emoji, 'ages')));

  /* A subject whose games are all still being built is marked the way an
     unfinished card is, so a chip that leads nowhere playable does not look
     like one that does. It stays selectable — the games behind it are meant to
     be visible — and the word rides on the label for anyone not seeing colour. */
  SUBJECTS.forEach((s) => {
    const label = EDLang.pick(s.label);
    const c = chip(s.id, label, s.emoji, 'subjects');
    if (!subjectHasReady(s.id)) {
      c.dataset.status = 'soon';
      c.setAttribute('aria-label', `${label} — ${EDLang.t('card.soon')}`);
    }
    els.subjectChips.append(c);
  });
}

function card(game) {
  const subject = subjectById(game.subject);
  const soon = game.status !== 'ready';

  /* The language rides along on the link so a card shared from an English
     page opens in English. */
  const params = new URLSearchParams({ id: game.id });
  EDLang.stamp(params);

  const li = document.createElement('li');
  const a = document.createElement('a');
  a.className = 'glass-card game-card';
  a.href = `game.html?${params}`;
  a.dataset.subject = game.subject;
  a.dataset.status = game.status;
  a.innerHTML = `
    ${soon ? `<span class="ribbon">${EDLang.t('card.soon')}</span>` : ''}
    <div class="game-art" aria-hidden="true">${game.emoji}</div>
    <div class="game-body">
      <div class="card-header">
        <h3 class="game-title">${EDLang.pick(game.title)}</h3>
        <p class="game-blurb">${EDLang.pick(game.blurb)}</p>
      </div>
      <div class="badges">
        <span class="badge badge--age">${EDLang.t('card.age')} <span class="num">${game.ageMin}–${game.ageMax}</span></span>
        <span class="badge">${EDLang.pick(subject.label)}</span>
      </div>
    </div>`;
  li.append(a);
  return li;
}

function render() {
  document.querySelectorAll('.chip[data-group]').forEach((c) => {
    const on = state[c.dataset.group].has(c.dataset.id);
    c.setAttribute('aria-pressed', String(on));
  });

  const filtering = state.ages.size || state.subjects.size || state.query.trim();
  els.clear.hidden = !filtering;

  const found = GAMES.filter(matches);
  els.grid.replaceChildren(...found.map(card));
  els.empty.hidden = found.length > 0;

  const ready = found.filter((g) => g.status === 'ready').length;
  const one = found.length === 1;
  els.resultLine.innerHTML = found.length
    ? EDLang.t(one ? 'results.lineOne' : 'results.line')
        .replace('{count}', `<span class="result-count">${found.length}</span>`)
        .replace('{fit}', filtering ? EDLang.t(one ? 'results.fitOne' : 'results.fit') : '')
        .replace('{ready}', ready)
    : '';

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
  if (e.target.closest('#clear, [data-clear]')) clearAll();
});

els.q.addEventListener('input', () => {
  state.query = els.q.value;
  render();
});

EDLang.applyStatic();
EDLang.mountToggle();
buildChips();
readUrl();
render();
