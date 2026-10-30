/* The landing page: what the site is, the plans, and the choice of signing up,
   logging in or just playing. It is written for the grown-up; everything past it
   is for the child. The counts and pictures all come from the catalog, so adding
   a game or moving one between plans needs no change here. */

(function () {
  const games = (id) => GAMES.filter((g) => g.status === 'ready' && gameTier(g) === id);
  const count = (key, n) => EDLang.t(key).replace('{count}', n);

  const link = (path, params = {}) => {
    const q = EDLang.stamp(new URLSearchParams(params)).toString();
    return q ? `${path}?${q}` : path;
  };

  EDLang.applyStatic();
  EDLang.mountToggle();

  document.getElementById('cta-signup').href = link('account.html', { view: 'signup' });
  ['cta-login', 'top-login'].forEach((id) => { document.getElementById(id).href = link('account.html', { view: 'login' }); });
  ['foot-privacy', 'foot-terms'].forEach((id) => {
    const a = document.getElementById(id);
    a.href = link(a.getAttribute('href'));
  });

  /* Going to the games replaces this page in the history, so that "back" from
     the home screen leaves the site rather than bouncing off this page's
     redirect to the home screen. */
  ['cta-guest', 'foot-games'].forEach((id) => {
    const a = document.getElementById(id);
    a.href = link('play.html');
    a.addEventListener('click', (e) => {
      if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      EDAuth.markEntered();
      location.replace(a.href);
    });
  });

  /* Someone back here from the logo, already signed in, has no use for "sign up". */
  if (EDAuth.user()) {
    const signup = document.getElementById('cta-signup');
    signup.textContent = EDLang.t('account.mine');
    signup.href = link('account.html');
    const top = document.getElementById('top-login');
    top.textContent = EDLang.t('account.mine');
    top.href = signup.href;
    document.getElementById('cta-login').hidden = true;
  }

  const open = games('guest');
  document.getElementById('guest-note').textContent = count('landing.guestNote', open.length);

  /* A real picture of real games, one from each plan's corner of the catalog. */
  const showcase = ['count-the-ducks', 'color-pop', 'robot-code', 'princess-dress', 'english-words', 'animal-sounds'];
  document.getElementById('hero-art').innerHTML = showcase
    .filter((id) => EDCovers.has(id))
    .map((id) => `<div class="hero-tile" data-subject="${gameById(id).subject}">${EDCovers.art(id)}</div>`)
    .join('');

  document.getElementById('plan-cards').innerHTML = PLAN_IDS.map((id, i) => {
    const tier = tierById(id);
    const list = games(id);
    const previous = i > 0 ? tierById(PLAN_IDS[i - 1]) : null;
    return `
      <article class="plan" data-plan="${id}">
        <h3>${EDLang.pick(tier.name)}</h3>
        <p class="plan-price">${EDLang.t(id === 'free' ? 'plan.freeForever' : 'plan.early')}</p>
        <p class="plan-tagline">${EDLang.pick(tier.tagline)}</p>
        <div class="plan-covers" aria-hidden="true">
          ${list.slice(0, 3).map((g) => `<span class="plan-cover">${EDCovers.has(g.id) ? EDCovers.art(g.id) : ''}</span>`).join('')}
        </div>
        <ul class="plan-list">
          <li class="plan-inc">${previous ? EDLang.t('plan.includesPrev').replace('{plan}', EDLang.pick(previous.name)) : `${EDLang.t('plan.includes')} (${open.length})`}</li>
          <li class="plan-adds">${count('landing.addsCount', list.length)}:</li>
          ${list.map((g) => `<li>${EDLang.pick(g.title)}</li>`).join('')}
        </ul>
        <a class="btn" href="${link('account.html', { view: 'signup', plan: id })}">${EDLang.t('plan.pick').replace('{plan}', EDLang.pick(tier.name))}</a>
      </article>`;
  }).join('');
})();
