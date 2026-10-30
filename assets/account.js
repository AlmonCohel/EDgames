/* Signing up, logging in, the forgotten password and the account itself: one page,
   one card, drawn per ?view=.

     ?view=signup|login|forgot|reset|account
     ?plan=free|basic|pro   the plan to preselect
     ?next=<game id>        the game to open once it can be opened
     ?token=...             with view=reset, from the email */

(function () {
  const params = new URLSearchParams(location.search);
  const box = document.getElementById('view');
  const t = (key) => EDLang.t(key);

  const nextGame = gameById(params.get('next')) || null;
  let wanted = PLAN_IDS.includes(params.get('plan')) ? params.get('plan') : null;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function link(path, extra = {}) {
    const q = new URLSearchParams(extra);
    EDLang.stamp(q);
    return q.toString() ? `${path}?${q}` : path;
  }

  /* Keeps the plan and the waiting game when moving between signing up and logging in. */
  const viewLink = (view) => link('account.html', {
    view,
    ...(wanted ? { plan: wanted } : {}),
    ...(nextGame ? { next: nextGame.id } : {}),
  });

  /* To the games, or into the game that brought them here. #play is what the
     home screen opens on load. Replaces this page, so "back" does not land on a
     form that has already been filled in. */
  function goPlay() {
    EDAuth.markEntered();
    const canOpen = nextGame && EDAuth.canPlay(nextGame);
    location.replace(link('play.html') + (canOpen ? `#play=${encodeURIComponent(nextGame.id)}` : ''));
  }

  function errorText(err) {
    return t(`auth.error.${err.code}`) || t('auth.error.server');
  }

  /* Wires a form: disables its button while waiting, shows a refusal in place,
     and offers playing as a guest when the server cannot be reached at all. */
  function onSubmit(form, work) {
    const button = form.querySelector('button[type="submit"]');
    const label = button.textContent;
    const message = form.querySelector('.form-error');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      message.hidden = true;
      button.disabled = true;
      button.textContent = t('auth.busy');
      try {
        await work(new FormData(form));
      } catch (err) {
        message.textContent = errorText(err);
        if (err.code === 'network') {
          message.insertAdjacentHTML('beforeend', ` <a href="${link('play.html')}">${t('auth.guest')}</a>`);
        }
        message.hidden = false;
      }
      button.disabled = false;
      button.textContent = label;
    });
  }

  const field = (name, type, label, autocomplete, extra = '') => `
    <label class="field">
      <span>${t(label)}</span>
      <input name="${name}" type="${type}" autocomplete="${autocomplete}" dir="ltr" required ${extra}>
    </label>`;

  const errorBox = '<p class="form-error" role="alert" hidden></p>';

  /* ---- The plans, as a choice inside a form ---- */

  function planChoices(selected) {
    return PLAN_IDS.map((id) => {
      const tier = tierById(id);
      const adds = GAMES.filter((g) => gameTier(g) === id).length;
      return `
        <label class="plan-choice">
          <input type="radio" name="plan" value="${id}" ${id === selected ? 'checked' : ''}>
          <span class="plan-choice-in">
            <b>${EDLang.pick(tier.name)}</b>
            <small>${EDLang.pick(tier.tagline)}</small>
            <small class="plan-choice-meta">${EDLang.t('landing.addsCount').replace('{count}', adds)} · ${t(id === 'free' ? 'plan.freeForever' : 'plan.early')}</small>
          </span>
        </label>`;
    }).join('');
  }

  /* ---- Views ---- */

  const VIEWS = {
    signup() {
      box.innerHTML = `
        <h1>${t('auth.signup.heading')}</h1>
        <p class="card-lede">${t('auth.signup.lede')}</p>
        <form novalidate>
          ${field('email', 'email', 'auth.email', 'email')}
          ${field('password', 'password', 'auth.password.new', 'new-password', 'minlength="8"')}
          <fieldset class="plan-choices"><legend>${t('auth.plan')}</legend>${planChoices(wanted || 'free')}</fieldset>
          <label class="consent"><input type="checkbox" name="accept"><span>${t('auth.accept')}</span></label>
          ${errorBox}
          <button type="submit" class="btn btn--big">${t('auth.signup.go')}</button>
        </form>
        <p class="card-links"><a href="${viewLink('login')}">${t('auth.toLogin')}</a><a href="${link('play.html')}">${t('auth.guest')}</a></p>`;
      onSubmit(box.querySelector('form'), async (data) => {
        await EDAuth.signup({
          email: data.get('email'),
          password: data.get('password'),
          plan: data.get('plan'),
          accept: data.get('accept') === 'on',
        });
        goPlay();
      });
    },

    login() {
      box.innerHTML = `
        <h1>${t('auth.login.heading')}</h1>
        <form novalidate>
          ${field('email', 'email', 'auth.email', 'email')}
          ${field('password', 'password', 'auth.password', 'current-password')}
          ${errorBox}
          <button type="submit" class="btn btn--big">${t('auth.login.go')}</button>
        </form>
        <p class="card-links"><a href="${viewLink('forgot')}">${t('auth.forgot.link')}</a><a href="${viewLink('signup')}">${t('auth.toSignup')}</a><a href="${link('play.html')}">${t('auth.guest')}</a></p>`;
      onSubmit(box.querySelector('form'), async (data) => {
        await EDAuth.login(data.get('email'), data.get('password'));
        /* Logged in on a plan that does not open the game they came for: the
           account page offers it, rather than the game saying "locked" again. */
        if (nextGame && !EDAuth.canPlay(nextGame)) return draw('account');
        return goPlay();
      });
    },

    forgot() {
      box.innerHTML = `
        <h1>${t('auth.forgot.heading')}</h1>
        <p class="card-lede">${t('auth.forgot.lede')}</p>
        <form novalidate>
          ${field('email', 'email', 'auth.email', 'email')}
          ${errorBox}
          <button type="submit" class="btn btn--big">${t('auth.forgot.go')}</button>
        </form>
        <p class="card-links"><a href="${viewLink('login')}">${t('auth.login.heading')}</a></p>`;
      onSubmit(box.querySelector('form'), async (data) => {
        await EDAuth.forgot(data.get('email'));
        box.innerHTML = `
          <h1>${t('auth.forgot.heading')}</h1>
          <p class="form-ok" role="status">${t('auth.forgot.sent')}</p>
          <p class="card-links"><a href="${viewLink('login')}">${t('auth.login.heading')}</a></p>`;
      });
    },

    reset() {
      box.innerHTML = `
        <h1>${t('auth.reset.heading')}</h1>
        <form novalidate>
          ${field('password', 'password', 'auth.password.new', 'new-password', 'minlength="8"')}
          ${errorBox}
          <button type="submit" class="btn btn--big">${t('auth.reset.go')}</button>
        </form>
        <p class="card-links"><a href="${viewLink('forgot')}">${t('auth.forgot.go')}</a></p>`;
      onSubmit(box.querySelector('form'), async (data) => {
        await EDAuth.reset(params.get('token'), data.get('password'));
        /* The token is spent; no reason to keep it in the address bar and the history. */
        try { history.replaceState(null, '', viewLink('login')); } catch { /* file:// */ }
        draw('login');
        box.querySelector('form').insertAdjacentHTML('beforebegin', `<p class="form-ok" role="status">${t('auth.reset.done')}</p>`);
      });
    },

    account() {
      const user = EDAuth.user();
      const plan = EDAuth.plan();
      box.innerHTML = `
        <h1>${t('auth.account.heading')}</h1>
        <p class="card-lede" dir="ltr">${esc(user.email)}</p>
        <h2>${t('auth.account.plan')}</h2>
        <p class="form-ok" role="status" hidden></p>
        ${errorBox}
        <div class="plan-rows">
          ${PLAN_IDS.map((id) => {
            const tier = tierById(id);
            const mine = id === plan;
            return `
              <div class="plan-row${mine ? ' is-mine' : ''}${id === wanted && !mine ? ' is-wanted' : ''}">
                <div class="plan-row-text">
                  <b>${EDLang.pick(tier.name)}</b>
                  <small>${EDLang.pick(tier.tagline)}</small>
                  <small class="plan-choice-meta">${t(id === 'free' ? 'plan.freeForever' : 'plan.early')}</small>
                </div>
                ${mine
                  ? `<span class="plan-mine">${t('plan.current')}</span>`
                  : `<button type="button" class="btn${id === wanted ? '' : ' btn--ghost'}" data-plan="${id}">${t('plan.pick').replace('{plan}', EDLang.pick(tier.name))}</button>`}
              </div>`;
          }).join('')}
        </div>
        <div class="account-actions">
          <a class="btn btn--big" href="${link('play.html')}" id="to-games">${t('auth.account.play')}</a>
          <button type="button" class="btn btn--big btn--ghost" id="logout">${t('auth.account.logout')}</button>
        </div>
        <details class="danger">
          <summary>${t('auth.delete.heading')}</summary>
          <form novalidate>
            <p>${t('auth.delete.text')}</p>
            ${field('password', 'password', 'auth.password', 'current-password')}
            ${errorBox}
            <button type="submit" class="btn btn--danger">${t('auth.delete.go')}</button>
          </form>
        </details>`;

      const planError = box.querySelector(':scope > .form-error');
      box.querySelectorAll('button[data-plan]').forEach((b) => b.addEventListener('click', async () => {
        planError.hidden = true;
        b.disabled = true;
        b.textContent = t('auth.busy');
        try {
          await EDAuth.setPlan(b.dataset.plan);
        } catch (err) {
          /* A session ended elsewhere: back to logging in, not a dead button. */
          if (err.code === 'signed_out') { await EDAuth.logout(); return draw('login'); }
          draw('account');
          const shown = box.querySelector(':scope > .form-error');
          shown.textContent = errorText(err);
          shown.hidden = false;
          return undefined;
        }
        if (nextGame && EDAuth.canPlay(nextGame)) return goPlay();
        wanted = null;
        draw('account');
        const ok = box.querySelector(':scope > .form-ok');
        ok.textContent = t('auth.account.changed');
        ok.hidden = false;
        return undefined;
      }));

      box.querySelector('#to-games').addEventListener('click', (e) => { e.preventDefault(); goPlay(); });

      box.querySelector('#logout').addEventListener('click', async () => {
        await EDAuth.logout();
        draw('login');
      });

      onSubmit(box.querySelector('.danger form'), async (data) => {
        await EDAuth.deleteAccount(data.get('password'));
        box.innerHTML = `
          <h1>${t('auth.delete.heading')}</h1>
          <p class="form-ok" role="status">${t('auth.delete.done')}</p>
          <p class="card-links"><a href="${link('index.html', { home: '1' })}">${t('brand.name')}</a><a href="${link('play.html')}">${t('auth.guest')}</a></p>`;
      });
    },
  };

  function draw(view) {
    /* Signed in, there is nothing to sign up for; signed out, there is no account to show. */
    let name = VIEWS[view] ? view : (EDAuth.user() ? 'account' : 'signup');
    if (EDAuth.user() && (name === 'signup' || name === 'login')) name = 'account';
    if (!EDAuth.user() && name === 'account') name = 'login';
    document.title = t(`auth.title.${name}`);
    VIEWS[name]();
    const first = box.querySelector('input:not([type="radio"]):not([type="checkbox"])');
    if (first && name !== 'account') first.focus();
  }

  EDLang.mountToggle();
  EDLang.applyStatic();
  document.getElementById('logo').href = link('index.html', { home: '1' });
  document.getElementById('foot-privacy').href = link('privacy.html');
  document.getElementById('foot-terms').href = link('terms.html');

  draw(params.get('view'));

  /* The account page shows the server's plan, not this device's memory of it. */
  if (EDAuth.user()) {
    EDAuth.refresh().then((changed) => {
      if (changed || !EDAuth.user()) draw(params.get('view'));
    });
  }
})();
