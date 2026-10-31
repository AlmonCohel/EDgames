/* ==========================================================================
   Shared Settings & Catalog Helper for EDgames V4 Architectural Mockups
   ========================================================================== */

(function () {
  const THEME_KEY = 'edgames-kid-theme';
  const params = new URLSearchParams(location.search);
  const urlTheme = params.get('theme');
  const wantSettings = params.get('settings') === '1' || location.hash === '#settings';

  function getSavedTheme() {
    if (urlTheme && ['default', 'princess', 'spiderman'].includes(urlTheme)) {
      return urlTheme;
    }
    try {
      const t = localStorage.getItem(THEME_KEY);
      if (t && ['default', 'princess', 'spiderman'].includes(t)) return t;
    } catch {}
    return 'default';
  }

  function applyKidTheme(theme, persist = true) {
    if (!['default', 'princess', 'spiderman'].includes(theme)) theme = 'default';
    document.body.dataset.kidTheme = theme;
    if (persist) {
      try { localStorage.setItem(THEME_KEY, theme); } catch {}
    }
    document.querySelectorAll('.v4-theme-option').forEach((btn) => {
      const active = btn.dataset.choice === theme;
      btn.setAttribute('aria-checked', active ? 'true' : 'false');
      const badge = btn.querySelector('.v4-theme-badge');
      if (badge) badge.textContent = active ? 'נבחר ✓' : 'בחירה';
    });
    window.dispatchEvent(new CustomEvent('edthemechange', { detail: { theme } }));
  }

  function injectDialogs() {
    const html = `
      <dialog class="v4-settings-dialog" id="settings-dialog" aria-labelledby="v4-settings-title">
        <div class="v4-settings-head">
          <h2 id="v4-settings-title">⚙️ הגדרות ועיצוב האתר</h2>
          <button type="button" class="v4-settings-close" id="v4-settings-close" aria-label="סגירה">✕</button>
        </div>

        <span class="v4-settings-label">בחירת עיצוב לילד/ה (משפיע על מעטפת האתר, לא על המשחקים עצמם):</span>
        <div class="v4-theme-grid" role="radiogroup" aria-label="בחירת עיצוב האתר">
          <button type="button" class="v4-theme-option" data-choice="default" role="radio" aria-checked="true">
            <div class="v4-theme-art">
              <svg viewBox="0 0 120 74" aria-hidden="true">
                <rect width="120" height="74" fill="#f4f1ea"/>
                <rect x="12" y="14" width="44" height="46" rx="8" fill="#1e2229"/>
                <rect x="64" y="14" width="44" height="20" rx="6" fill="#e05a37"/>
                <rect x="64" y="40" width="44" height="20" rx="6" fill="#2b6cb0"/>
              </svg>
            </div>
            <div class="v4-theme-txt">
              <b>עיצוב סטודיו</b>
              <small>נקי, מקצועי ומאוזן</small>
            </div>
            <span class="v4-theme-badge">נבחר ✓</span>
          </button>

          <button type="button" class="v4-theme-option" data-choice="princess" role="radio" aria-checked="false">
            <div class="v4-theme-art">
              <svg viewBox="0 0 120 74" aria-hidden="true">
                <rect width="120" height="74" fill="#ffe6f4"/>
                <path d="M12,64 A48,40 0 0,1 108,64" fill="none" stroke="#ff7eb6" stroke-width="5" opacity="0.5"/>
                <path d="M36,50 L40,24 L51,34 L60,16 L69,34 L80,24 L84,50 Z" fill="#ffd166" stroke="#c92a81" stroke-width="2" stroke-linejoin="round"/>
                <circle cx="60" cy="38" r="4" fill="#c92a81"/>
              </svg>
            </div>
            <div class="v4-theme-txt">
              <b>נסיכות ואגדות 👑</b>
              <small>כתרים, ארמון וקסם</small>
            </div>
            <span class="v4-theme-badge">בחירה</span>
          </button>

          <button type="button" class="v4-theme-option" data-choice="spiderman" role="radio" aria-checked="false">
            <div class="v4-theme-art">
              <svg viewBox="0 0 120 74" aria-hidden="true">
                <rect width="120" height="74" fill="#0f1e47"/>
                <path d="M0,0 L120,74 M120,0 L0,74 M60,0 V74 M0,37 H120" stroke="#ffffff" stroke-opacity="0.2" stroke-width="1.5"/>
                <ellipse cx="60" cy="37" rx="20" ry="24" fill="#e62429" stroke="#0b132b" stroke-width="2.5"/>
                <path d="M45,31 Q51,23 57,35 Z M75,31 Q69,23 63,35 Z" fill="#ffffff" stroke="#0b132b" stroke-width="2"/>
              </svg>
            </div>
            <div class="v4-theme-txt">
              <b>ספיידרמן 🕷️</b>
              <small>קורי עכביש וגיבורי־על</small>
            </div>
            <span class="v4-theme-badge">בחירה</span>
          </button>
        </div>

        <div class="v4-settings-row">
          <span class="v4-settings-label" style="margin:0">אפשרויות נוספות להורים:</span>
          <div class="v4-settings-actions">
            <a class="v4-settings-btn" href="../../../account.html">👤 חשבון ומסלולים</a>
            <a class="v4-settings-btn" href="../../../index.html?home=1">ℹ️ על האתר</a>
          </div>
        </div>
      </dialog>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    const dlg = document.getElementById('settings-dialog');
    document.querySelectorAll('[data-open-settings]').forEach((btn) => {
      btn.addEventListener('click', () => dlg.showModal());
    });
    document.getElementById('v4-settings-close')?.addEventListener('click', () => dlg.close());
    dlg?.addEventListener('click', (e) => {
      if (e.target === dlg) dlg.close();
    });

    document.querySelectorAll('.v4-theme-option').forEach((btn) => {
      btn.addEventListener('click', () => {
        applyKidTheme(btn.dataset.choice, true);
      });
    });

    applyKidTheme(getSavedTheme(), false);

    if (wantSettings) {
      setTimeout(() => dlg.showModal(), 80);
    }

    window.addEventListener('message', (e) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === 'setKidTheme') {
        applyKidTheme(e.data.theme, false);
      } else if (e.data.type === 'toggleSettings') {
        if (dlg.open) dlg.close();
        else dlg.showModal();
      }
    });
  }

  window.EDV4 = {
    init() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectDialogs);
      } else {
        injectDialogs();
      }
    },
    applyKidTheme,
    openSettings() {
      document.getElementById('settings-dialog')?.showModal();
    },
    readyGames() {
      return (typeof GAMES !== 'undefined' ? GAMES : []).filter((g) => g.status === 'ready');
    },
    soonGames() {
      return (typeof GAMES !== 'undefined' ? GAMES : []).filter((g) => g.status !== 'ready');
    },
    gameUrl(id) {
      return `../../../game.html?id=${encodeURIComponent(id)}`;
    },
    subjectById(id) {
      return (typeof SUBJECTS !== 'undefined' ? SUBJECTS : []).find((s) => s.id === id) || SUBJECTS[0];
    },
    pick(val) {
      if (!val) return '';
      if (typeof val === 'string') return val;
      return (typeof EDLang !== 'undefined' && EDLang.pick) ? EDLang.pick(val) : (val.he || val.en || '');
    },
    coverHtml(game) {
      if (!game) return '';
      let raw = '';
      if (typeof EDCovers !== 'undefined' && EDCovers.has(game.id)) {
        raw = EDCovers.art(game.id);
      } else if (typeof EDScenes !== 'undefined' && EDScenes.picture) {
        raw = EDScenes.picture(game);
      }
      return raw.replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" ');
    },
    markHtml(subjectId) {
      if (subjectId === 'all') {
        return typeof EDGlyphs !== 'undefined' ? EDGlyphs.icon('home') : '';
      }
      return typeof EDGlyphs !== 'undefined' ? EDGlyphs.mark(subjectId) : '';
    },
  };
})();
