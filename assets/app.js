/* The home screen — Console Deck (ED-Deck, Direction 1 from mockups/v4).

   Structured as a handheld play console:
   - Top hardware bar: logo, age switcher, sound toggle, language toggle,
     account button, and Settings & Design button (Studio / Princess / Spider-Man).
   - Inner screen bezel:
     1. Spotlight Active Game Stage: shows the selected game's cover, title,
        blurb, prev/next bumpers, and big launch button (defaults to the last
        game played from EDRecent, or the first matching cartridge).
     2. Cartridge Bay: numbered game cartridges (#01–#43) with instant search
        and filter state kept in the URL (and sessionStorage on file://).
   - Bottom channel dock: all subject channels with their drawn marks. */

const els = {
  rail: document.getElementById('subject-rail'),
  ageChips: document.getElementById('age-chips'),
  clear: document.getElementById('clear'),
  grid: document.getElementById('cartridge-grid'),
  empty: document.getElementById('empty'),
  q: document.getElementById('q'),
  baySubjectName: document.getElementById('bay-subject-name'),
  bayCount: document.getElementById('bay-count'),
  spotStage: document.getElementById('spotlight-stage'),
  spotArt: document.getElementById('spot-art'),
  spotTitle: document.getElementById('spot-title'),
  spotBlurb: document.getElementById('spot-blurb'),
  spotPlay: document.getElementById('spot-play'),
  spotPlayLabel: document.getElementById('spot-play-label'),
  prevBtn: document.getElementById('prev-game'),
  nextBtn: document.getElementById('next-game'),
  settingsDialog: document.getElementById('settings-dialog'),
  settingsClose: document.getElementById('settings-close'),
};

const state = {
  ages: new Set(),
  subjects: new Set(),
  query: '',
  selectedId: '',
};

const FILTER_KEY = 'edgames-filters';

/* ---- URL <-> state ---- */

function readStoredFilters() {
  try { return sessionStorage.getItem(FILTER_KEY) || ''; } catch { return ''; }
}

function saveFilters(qs) {
  try { sessionStorage.setItem(FILTER_KEY, qs); } catch { /* then they do not survive the trip */ }
}

function readUrl() {
  const search = new URLSearchParams(location.search);
  const carried = search.has('age') || search.has('subject') || search.has('q');
  const p = carried ? search : new URLSearchParams(readStoredFilters());
  const valid = (list, ids) => list.filter((id) => ids.includes(id));
  state.ages = new Set(valid((p.get('age') || '').split(',').filter(Boolean), AGE_GROUPS.map((a) => a.id)));
  state.subjects = new Set(valid((p.get('subject') || '').split(',').filter(Boolean), SUBJECTS.map((s) => s.id)));
  state.query = p.get('q') || '';
  if (els.q) els.q.value = state.query;

  const recent = EDRecent.game();
  if (recent) state.selectedId = recent.id;
}

function writeUrl() {
  const p = new URLSearchParams();
  if (state.ages.size) p.set('age', [...state.ages].join(','));
  if (state.subjects.size) p.set('subject', [...state.subjects].join(','));
  if (state.query.trim()) p.set('q', state.query.trim());
  const filters = p.toString();
  saveFilters(filters);
  EDLang.stamp(p);
  const qs = p.toString();
  try { history.replaceState(history.state, '', (qs ? `?${qs}` : location.pathname) + location.hash); }
  catch { /* file:// */ }
}

/* ---- Filtering & sorting ---- */

function matches(game) {
  if (state.ages.size) {
    const overlaps = [...state.ages].some((id) => {
      const group = AGE_GROUPS.find((a) => a.id === id);
      return group && game.ageMin <= group.max && game.ageMax >= group.min;
    });
    if (!overlaps) return false;
  }
  if (state.subjects.size && !state.subjects.has(game.subject)) return false;

  const q = state.query.trim().toLowerCase();
  if (q) {
    const subject = subjectById(game.subject);
    const haystack = `${EDLang.pick(game.title)} ${EDLang.pick(game.blurb)} ${EDLang.pick(subject.label)}`;
    if (!haystack.toLowerCase().includes(q)) return false;
  }
  return true;
}

function orderedGames() {
  const found = GAMES.filter(matches);
  return found.slice().sort((a, b) => {
    const aReady = a.status === 'ready' ? 1 : 0;
    const bReady = b.status === 'ready' ? 1 : 0;
    if (aReady !== bReady) return bReady - aReady;

    const aPlay = EDAuth.canPlay(a) ? 1 : 0;
    const bPlay = EDAuth.canPlay(b) ? 1 : 0;
    if (aPlay !== bPlay) return bPlay - aPlay;

    if (aPlay && bPlay) {
      return tierRank(gameTier(b)) - tierRank(gameTier(a));
    }
    return tierRank(gameTier(a)) - tierRank(gameTier(b));
  });
}

/* ---- Artwork & Links ---- */

function gameHref(game, setId) {
  const params = new URLSearchParams({ id: game.id });
  if (setId) params.set('set', setId);
  EDLang.stamp(params);
  return `game.html?${params}`;
}

function coverGraphic(game) {
  if (EDCovers.has(game.id)) {
    return EDCovers.art(game.id).replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" ');
  }
  return `${EDGlyphs.mark(game.subject, 'mark ghost')}${EDScenes.picture(game)}`;
}

/* ---- Locked games & Account chip ---- */

function nextUrl(view, game) {
  const q = new URLSearchParams({ view, plan: gameTier(game), next: game.id });
  EDLang.stamp(q);
  return `account.html?${q}`;
}

function openLock(game) {
  const tier = tierById(gameTier(game));
  const dialog = document.getElementById('lock-dialog');
  const signedIn = Boolean(EDAuth.user());
  document.getElementById('lock-cover').innerHTML = EDCovers.has(game.id) ? EDCovers.art(game.id) : EDScenes.picture(game);
  document.getElementById('lock-title').textContent = EDLang.t('lock.title').replace('{plan}', EDLang.pick(tier.name));
  document.getElementById('lock-text').textContent = EDLang.t('lock.text');
  const go = document.getElementById('lock-go');
  go.textContent = EDLang.t(signedIn ? 'lock.upgrade' : 'lock.signup');
  go.href = nextUrl(signedIn ? 'account' : 'signup', game);
  dialog.showModal();
}

function drawAccountChip() {
  const chip = document.getElementById('account-chip');
  if (!chip) return;
  const account = EDAuth.user();
  const label = account ? EDLang.pick(tierById(EDAuth.plan()).name) : EDLang.t('account.login');
  chip.innerHTML = `${EDGlyphs.icon('user')}<span>${label}</span>`;
  chip.setAttribute('aria-label', account ? `${EDLang.t('account.mine')}: ${label}` : label);
  const q = EDLang.stamp(new URLSearchParams(account ? {} : { view: 'login' })).toString();
  chip.href = q ? `account.html?${q}` : 'account.html';

  const settingsAcc = document.getElementById('settings-account-link');
  if (settingsAcc) settingsAcc.href = chip.href;
  const settingsAbout = document.getElementById('settings-about-link');
  if (settingsAbout) {
    const aq = EDLang.stamp(new URLSearchParams({ home: '1' })).toString();
    settingsAbout.href = `index.html?${aq}`;
  }
  const logoLink = document.querySelector('.console-logo');
  if (logoLink) {
    const lq = EDLang.stamp(new URLSearchParams({ home: '1' })).toString();
    logoLink.href = `index.html?${lq}`;
  }
}

/* ---- Controls: Age Switcher & Subject Channel Dock ---- */

function buildControls() {
  /* Age Segmented Switcher */
  els.ageChips.replaceChildren();
  const allAgesBtn = document.createElement('button');
  allAgesBtn.type = 'button';
  allAgesBtn.className = 'age-btn';
  allAgesBtn.id = 'age-all';
  allAgesBtn.textContent = EDLang.t('console.allAges');
  allAgesBtn.setAttribute('aria-pressed', 'true');
  els.ageChips.append(allAgesBtn);

  AGE_GROUPS.forEach((a) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'age-btn';
    b.dataset.group = 'ages';
    b.dataset.id = a.id;
    b.setAttribute('aria-pressed', 'false');
    b.textContent = `${a.min}–${a.max}`;
    b.setAttribute('aria-label', EDLang.pick(a.label));
    els.ageChips.append(b);
  });

  /* Bottom Subject Channel Dock */
  els.rail.replaceChildren();
  const allSubBtn = document.createElement('button');
  allSubBtn.type = 'button';
  allSubBtn.id = 'subject-all';
  allSubBtn.className = 'channel-key';
  allSubBtn.setAttribute('aria-pressed', 'true');
  allSubBtn.innerHTML = `${EDGlyphs.icon('home')}<span>${EDLang.t('console.allChannels')}</span>`;
  els.rail.append(allSubBtn);

  SUBJECTS.forEach((s) => {
    const label = EDLang.pick(s.label);
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'channel-key';
    b.dataset.group = 'subjects';
    b.dataset.id = s.id;
    b.dataset.subject = s.id;
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = `${EDGlyphs.mark(s.id)}<span>${label}</span>`;
    if (!subjectHasReady(s.id)) {
      b.dataset.status = 'soon';
      b.setAttribute('aria-label', `${label} — ${EDLang.t('card.soon')}`);
    }
    els.rail.append(b);
  });
}

/* ---- Rendering ---- */

function render() {
  /* Sync age buttons */
  document.querySelectorAll('.age-btn[data-group="ages"]').forEach((b) => {
    b.setAttribute('aria-pressed', String(state.ages.has(b.dataset.id)));
  });
  const ageAll = document.getElementById('age-all');
  if (ageAll) ageAll.setAttribute('aria-pressed', String(state.ages.size === 0));

  /* Sync subject channel keys */
  document.querySelectorAll('.channel-key[data-group="subjects"]').forEach((b) => {
    b.setAttribute('aria-pressed', String(state.subjects.has(b.dataset.id)));
  });
  const subAll = document.getElementById('subject-all');
  if (subAll) subAll.setAttribute('aria-pressed', String(state.subjects.size === 0));

  const filtering = state.ages.size > 0 || state.subjects.size > 0 || state.query.trim() !== '';
  if (els.clear) els.clear.hidden = !filtering;

  /* Update Bay Header Title & Count */
  const list = orderedGames();
  if (state.subjects.size === 1) {
    const subId = [...state.subjects][0];
    els.baySubjectName.textContent = EDLang.pick(subjectById(subId).label);
  } else {
    els.baySubjectName.textContent = EDLang.t('console.allGames');
  }
  els.bayCount.textContent = EDLang.t('console.cartridges').replace('{count}', list.length);

  /* Ensure selectedId is valid inside current list */
  if (!list.some((g) => g.id === state.selectedId) && list.length) {
    const recent = EDRecent.game();
    const recentMatch = recent && list.find((g) => g.id === recent.id);
    state.selectedId = (recentMatch || list[0]).id;
  }

  const active = list.find((g) => g.id === state.selectedId) || list[0] || GAMES[0];
  const activeIdx = Math.max(0, list.indexOf(active));
  const recent = EDRecent.game();

  /* Render Spotlight Stage */
  if (active) {
    const sub = subjectById(active.subject);
    const locked = !EDAuth.canPlay(active);
    const isLastPlayed = Boolean(recent && recent.id === active.id);
    const setId = isLastPlayed ? recent.lastSetId : null;

    els.spotArt.dataset.subject = active.subject;
    els.spotArt.innerHTML = `
      ${coverGraphic(active)}
      <div class="spotlight-tag-row">
        <span class="spot-pill">${EDLang.pick(sub.label)} · ${EDLang.t('card.age')} <span class="num">${active.ageMin}–${active.ageMax}</span></span>
        <span class="spot-num">#${String(activeIdx + 1).padStart(2, '0')}</span>
      </div>
      ${locked ? `<span class="lock-pill" style="top:auto;bottom:10px;inset-inline-start:10px">${EDGlyphs.icon('lock')}${EDLang.pick(tierById(gameTier(active)).name)}</span>` : (isLastPlayed ? `<span class="spot-recent-badge">★ ${EDLang.t('console.lastPlayed')}</span>` : '')}
    `;
    els.spotTitle.textContent = EDLang.pick(active.title);
    els.spotBlurb.textContent = EDLang.pick(active.blurb);
    els.spotPlay.href = gameHref(active, setId);
    if (locked) {
      els.spotPlay.dataset.locked = active.id;
    } else {
      delete els.spotPlay.dataset.locked;
    }
  }

  /* Render Cartridge Grid or Empty State */
  els.empty.hidden = list.length > 0;
  els.grid.hidden = list.length === 0;

  els.grid.innerHTML = list.map((g, i) => {
    const locked = !EDAuth.canPlay(g);
    const selected = g.id === state.selectedId;
    return `
      <button type="button" class="cartridge" role="option"
        data-id="${g.id}" data-subject="${g.subject}" data-status="${g.status}"
        ${locked ? `data-locked="${g.id}"` : ''}
        aria-selected="${selected}">
        <div class="cart-art">
          ${coverGraphic(g)}
          <span class="cart-num">#${String(i + 1).padStart(2, '0')}</span>
          ${locked ? `<span class="lock-pill">${EDGlyphs.icon('lock')}${EDLang.pick(tierById(gameTier(g)).name)}</span>` : ''}
        </div>
        <span class="cart-title">${EDLang.pick(g.title)}</span>
        <span class="cart-meta">
          <span>${EDLang.t('card.age')} <span class="num">${g.ageMin}–${g.ageMax}</span></span>
          <span aria-hidden="true">▶</span>
        </span>
      </button>
    `;
  }).join('');

  writeUrl();
}

/* ---- Settings & Kid Theme Picker ---- */

function syncThemeOptions() {
  const activeTheme = window.EDTheme ? EDTheme.current : 'default';
  document.querySelectorAll('.theme-option[data-theme-choice]').forEach((btn) => {
    const isChecked = btn.dataset.themeChoice === activeTheme;
    btn.setAttribute('aria-checked', String(isChecked));
    const badge = btn.querySelector('[data-theme-badge]');
    if (badge) {
      badge.textContent = EDLang.t(isChecked ? 'settings.selected' : 'settings.pick');
    }
  });
}

function initSettings() {
  syncThemeOptions();
  document.querySelectorAll('[data-open-settings]').forEach((btn) => {
    btn.addEventListener('click', () => {
      syncThemeOptions();
      els.settingsDialog?.showModal();
    });
  });
  els.settingsClose?.addEventListener('click', () => els.settingsDialog?.close());
  els.settingsDialog?.addEventListener('click', (e) => {
    if (e.target === els.settingsDialog) els.settingsDialog.close();
  });
  document.querySelectorAll('.theme-option[data-theme-choice]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (window.EDTheme) EDTheme.set(btn.dataset.themeChoice, true);
      syncThemeOptions();
    });
  });

  const params = new URLSearchParams(location.search);
  if (params.get('settings') === '1' || location.hash === '#settings') {
    setTimeout(() => els.settingsDialog?.showModal(), 60);
  }
}

/* ---- Events ---- */

function clearAll() {
  state.ages.clear();
  state.subjects.clear();
  state.query = '';
  if (els.q) els.q.value = '';
  render();
}

function launchGame(game) {
  if (!game) return;
  if (!EDAuth.canPlay(game)) {
    openLock(game);
    return;
  }
  const recent = EDRecent.game();
  const setId = recent && recent.id === game.id ? recent.lastSetId : null;
  const href = gameHref(game, setId);
  if (window.EDPlayer) EDPlayer.open(href);
  else location.href = href;
}

document.addEventListener('click', (e) => {
  /* Locked Spotlight Play button */
  const lockedLink = e.target.closest('a[data-locked]');
  if (lockedLink && !(e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) {
    e.preventDefault();
    return openLock(gameById(lockedLink.dataset.locked));
  }
  if (e.target.closest('#lock-close')) return document.getElementById('lock-dialog').close();

  /* Cartridge click: first click selects into Spotlight Stage; clicking the
     already-selected cartridge launches the game immediately. */
  const cart = e.target.closest('.cartridge[data-id]');
  if (cart) {
    const id = cart.dataset.id;
    const game = gameById(id);
    if (state.selectedId === id) {
      launchGame(game);
    } else {
      state.selectedId = id;
      render();
    }
    return;
  }

  /* Age filter buttons */
  const ageBtn = e.target.closest('.age-btn[data-group="ages"]');
  if (ageBtn) {
    const id = ageBtn.dataset.id;
    if (state.ages.size === 1 && state.ages.has(id)) {
      state.ages.clear();
    } else {
      state.ages.clear();
      state.ages.add(id);
    }
    return render();
  }
  if (e.target.closest('#age-all')) {
    state.ages.clear();
    return render();
  }

  /* Subject channel dock buttons */
  const subBtn = e.target.closest('.channel-key[data-group="subjects"]');
  if (subBtn) {
    const id = subBtn.dataset.id;
    if (state.subjects.size === 1 && state.subjects.has(id)) {
      state.subjects.clear();
    } else {
      state.subjects.clear();
      state.subjects.add(id);
    }
    return render();
  }
  if (e.target.closest('#subject-all')) {
    state.subjects.clear();
    return render();
  }

  if (e.target.closest('#clear, [data-clear]')) return clearAll();
});

els.prevBtn?.addEventListener('click', () => {
  const list = orderedGames();
  if (!list.length) return;
  const idx = Math.max(0, list.findIndex((g) => g.id === state.selectedId));
  state.selectedId = list[(idx - 1 + list.length) % list.length].id;
  render();
});

els.nextBtn?.addEventListener('click', () => {
  const list = orderedGames();
  if (!list.length) return;
  const idx = Math.max(0, list.findIndex((g) => g.id === state.selectedId));
  state.selectedId = list[(idx + 1) % list.length].id;
  render();
});

els.q?.addEventListener('input', () => {
  state.query = els.q.value;
  render();
});

/* Boot */
EDLang.applyStatic();
EDLang.mountToggle();
drawAccountChip();
buildControls();
readUrl();
initSettings();
render();

/* The game layer refreshes the spotlight when a game is put away. */
window.EDApp = {
  refreshContinue() {
    const last = EDRecent.game();
    if (last) state.selectedId = last.id;
    render();
  },
};

EDAuth.markEntered();
EDAuth.refresh().then((changed) => {
  if (!changed) return;
  drawAccountChip();
  render();
});
