/* Language. Hebrew is the site's default and English is a toggle.

   The choice is kept in localStorage so it survives a fresh visit, and mirrored
   into ?lang= so a shared link opens in the language it was shared in. Hebrew,
   being the default, stays out of the URL.

   This file loads in <head> so the document's dir is right before the first
   paint. Static markup carries data-i18n keys; catalog text carries { he, en }
   objects and goes through EDLang.pick. */

const LANGS = ['he', 'en'];
const FALLBACK_LANG = 'he';
const LANG_KEY = 'edgames-lang';

const UI = {
  he: {
    'lang.name':   'עברית',
    'lang.switch': 'מעבר לאנגלית',

    'site.title':       'גנון משחקים — משחקים לימודיים לילדים',
    'site.description': 'אוסף משחקים לימודיים קטנים לילדים בגיל 3 עד 8. אפשר לסנן לפי גיל ולפי נושא ולבחור משחק.',
    'brand.name':       'גנון משחקים',
    'brand.initial':    'ג',
    'appbar.greeting':  'מה משחקים היום?',

    'search.label':       'חיפוש משחק',
    'search.placeholder': 'איזה משחק מחפשים?',

    'nav.label':   'ניווט',
    'tabs.home':   'בית',
    'tabs.age':    'לפי גיל',
    'tabs.search': 'חיפוש',

    'rail.all':         'הכול',
    'browse.continue':  'ממשיכים מאיפה שהפסקנו',
    'continue.kicker':  'המשחק האחרון ששיחקתם',
    'browse.ready':     'אפשר לשחק עכשיו',
    'browse.soon':      'בקרוב',
    'browse.soonMore':  'עוד נבנים',
    'browse.count':     '{count} משחקים',

    'filters.age':     'גיל',
    'filters.subject': 'נושא',
    'filters.clear':   'נקה סינון ✕',

    /* Hebrew deliberately reuses one form for both counts — this is the line
       the site has always shown, and getting Hebrew agreement right is a
       separate job from adding English. */
    'results.line':    '{count} משחקים{fit} · {ready} מוכנים לשחק',
    'results.lineOne': '{count} משחקים{fit} · {ready} מוכנים לשחק',
    'results.fit':     ' מתאימים',
    'results.fitOne':  ' מתאימים',

    'empty.title':  'לא מצאנו משחק כזה',
    'empty.text':   'אפשר לנסות גיל אחר או נושא אחר.',
    'empty.action': 'הצג את כל המשחקים',

    'card.soon': 'בקרוב',
    'card.age':  'גיל',

    'footer': 'נבנה באהבה לילדים סקרנים 💛',

    'game.pageTitle':    'משחק — גנון משחקים',
    'game.back':         'חזרה למשחקים',
    'game.loadingTitle': 'טוען…',
    'game.allGames':     'לכל המשחקים',
    'game.sets.label':   'ערכה',

    'game.missing.title':   'משחק לא נמצא',
    'game.missing.heading': 'אופס, המשחק הזה לא קיים',
    'game.missing.text':    'אולי הקישור השתבש. אפשר לחזור ולבחור משחק אחר.',
    'game.soon.heading':    'המשחק הזה עוד בבנייה',
    'game.soon.text':       'הוא כבר בדרך. בינתיים יש עוד הרבה משחקים שמחכים.',
    'game.loading.heading': 'רגע אחד…',
    'game.loading.text':    'המשחק נטען.',
    'game.failed.heading':  'המשחק לא נטען',
    'game.failed.text':     'משהו השתבש בטעינה. אפשר לרענן את הדף ולנסות שוב.',
    'game.unregistered':    'הקובץ נטען אבל המשחק לא נרשם. אפשר לרענן את הדף ולנסות שוב.',
  },

  en: {
    'lang.name':   'English',
    'lang.switch': 'Switch to Hebrew',

    'site.title':       'EDgames — educational games for kids',
    'site.description': 'A small collection of educational games for children aged 3 to 8. Filter by age and by subject and pick a game.',
    'brand.name':       'EDgames',
    'brand.initial':    'E',
    'appbar.greeting':  'What shall we play today?',

    'search.label':       'Search for a game',
    'search.placeholder': 'Which game shall we play?',

    'nav.label':   'Navigation',
    'tabs.home':   'Home',
    'tabs.age':    'By age',
    'tabs.search': 'Search',

    'rail.all':         'All',
    'browse.continue':  'Carry on where you left off',
    'continue.kicker':  'The last game you played',
    'browse.ready':     'Ready to play now',
    'browse.soon':      'Coming soon',
    'browse.soonMore':  'Still being built',
    'browse.count':     '{count} games',

    'filters.age':     'Age',
    'filters.subject': 'Subject',
    'filters.clear':   'Clear filters ✕',

    'results.line':    '{count} games{fit} · {ready} ready to play',
    'results.lineOne': '{count} game{fit} · {ready} ready to play',
    'results.fit':     ' that match',
    'results.fitOne':  ' that matches',

    'empty.title':  'We found no game like that',
    'empty.text':   'Try another age or another subject.',
    'empty.action': 'Show all the games',

    'card.soon': 'Soon',
    'card.age':  'Ages',

    'footer': 'Built with love for curious kids 💛',

    'game.pageTitle':    'Game — EDgames',
    'game.back':         'Back to games',
    'game.loadingTitle': 'Loading…',
    'game.allGames':     'All the games',
    'game.sets.label':   'Set',

    'game.missing.title':   'Game not found',
    'game.missing.heading': 'Oops, that game does not exist',
    'game.missing.text':    'The link may have gone wrong. You can go back and pick another game.',
    'game.soon.heading':    'This game is still being built',
    'game.soon.text':       'It is on its way. There are plenty of other games waiting in the meantime.',
    'game.loading.heading': 'One moment…',
    'game.loading.text':    'The game is loading.',
    'game.failed.heading':  'The game did not load',
    'game.failed.text':     'Something went wrong while loading. Refresh the page and try again.',
    'game.unregistered':    'The file loaded but the game did not register. Refresh the page and try again.',
  },
};

/* localStorage throws rather than returns null in a few browsers on file:// and
   in private windows, and the site is meant to work from a file. */
function readLang() {
  try { return localStorage.getItem(LANG_KEY); } catch { return null; }
}
function saveLang(lang) {
  try { localStorage.setItem(LANG_KEY, lang); } catch { /* the URL still carries it */ }
}

const EDLang = {
  current: FALLBACK_LANG,

  /* A UI string by key. */
  t(key) {
    return UI[this.current][key] ?? UI[FALLBACK_LANG][key] ?? '';
  },

  /* A catalog field written as { he, en }. A plain string passes through. */
  pick(field) {
    if (typeof field === 'string') return field;
    return field?.[this.current] ?? field?.[FALLBACK_LANG] ?? '';
  },

  /* The language the toggle offers. */
  other() {
    return this.current === 'he' ? 'en' : 'he';
  },

  /* Puts the current language on a link or a history write, so a shared URL
     opens the same way even where localStorage is unavailable. */
  stamp(params) {
    if (this.current === FALLBACK_LANG) params.delete('lang');
    else params.set('lang', this.current);
    return params;
  },

  /* Reloads rather than re-renders: the grid's filters live in the URL and
     survive it, and a running game needs a fresh mount anyway. */
  set(lang) {
    if (!LANGS.includes(lang) || lang === this.current) return;
    saveLang(lang);
    const p = new URLSearchParams(location.search);
    if (lang === FALLBACK_LANG) p.delete('lang'); else p.set('lang', lang);
    /* Assigning search rather than href keeps the path alone, which matters
       when the site is opened as a file. */
    location.search = p.toString();
  },

  /* Swaps the text of every element carrying a data-i18n key. */
  applyStatic() {
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = this.t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-html]').forEach((el) => { el.innerHTML = this.t(el.dataset.i18nHtml); });
    document.querySelectorAll('[data-i18n-content]').forEach((el) => { el.content = this.t(el.dataset.i18nContent); });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = this.t(el.dataset.i18nPlaceholder); });
    document.querySelectorAll('[data-i18n-label]').forEach((el) => { el.setAttribute('aria-label', this.t(el.dataset.i18nLabel)); });
  },

  /* The toggle reads in the language it switches to, so it is recognisable to
     someone who cannot read the page they are looking at. */
  mountToggle() {
    const btn = document.getElementById('lang-toggle');
    if (!btn) return;
    const next = this.other();
    btn.lang = next;
    btn.dir = next === 'he' ? 'rtl' : 'ltr';
    btn.setAttribute('aria-label', this.t('lang.switch'));
    btn.innerHTML = `${EDGlyphs.icon('globe')}${UI[next]['lang.name']}`;
    btn.addEventListener('click', () => this.set(next));
  },
};

/* Resolve now, before anything paints: the URL wins over the stored choice, so
   a link shared in one language opens in it. */
(function () {
  const fromUrl = new URLSearchParams(location.search).get('lang');
  const stored = readLang();

  if (LANGS.includes(fromUrl)) {
    EDLang.current = fromUrl;
    saveLang(fromUrl);
  } else if (LANGS.includes(stored)) {
    EDLang.current = stored;
  }

  document.documentElement.lang = EDLang.current;
  document.documentElement.dir = EDLang.current === 'he' ? 'rtl' : 'ltr';
})();
