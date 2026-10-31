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

    'site.title':       'הגנון של עלמון — משחקים לימודיים לילדים',
    'site.description': 'אוסף משחקים לימודיים קטנים לילדים בגיל 3 עד 8. אפשר לסנן לפי גיל ולפי נושא ולבחור משחק.',
    'brand.name':       'הגנון של עלמון',
    'appbar.greeting':  'מה משחקים היום?',

    'sound.label':   'צלילים: {state}. לחיצה מחליפה',
    'sound.all':     'מוזיקה',
    'sound.effects': 'צלילים',
    'sound.off':     'שקט',

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

    'nav.about':   'על האתר',
    'browse.tier': 'עוד משחקים במסלול {plan}',
    'lock.title':   'המשחק הזה במסלול {plan}',
    'lock.text':    'קוראים למבוגר, וזה ייקח דקה. בתקופת ההשקה אין תשלום ולא צריך כרטיס אשראי.',
    'lock.signup':  'פותחים חשבון',
    'lock.upgrade': 'פותחים את המסלול',
    'lock.close':   'לא עכשיו',
    'account.login': 'כניסה',
    'account.mine':  'החשבון שלי',

    'console.kicker':      'ED-DECK · קונסולת משחקים',
    'console.allAges':     'כל הגילאים',
    'console.allChannels': 'כל הערוצים',
    'console.allGames':    'כל המשחקים',
    'console.cartridges':  '{count} קלטות',
    'console.playNow':     'שחקו עכשיו',
    'console.prevGame':    'משחק קודם',
    'console.nextGame':    'משחק הבא',
    'console.lastPlayed':  'שיחקתם לאחרונה',

    'settings.button':               'עיצוב והגדרות',
    'settings.title':                'הגדרות ועיצוב האתר',
    'settings.close':                'סגירה',
    'settings.themeLabel':           'בחירת עיצוב לילד/ה (משפיע על מעטפת האתר, לא על המשחקים עצמם):',
    'settings.theme.default.title':  'עיצוב סטודיו',
    'settings.theme.default.sub':    'כהה, מקצועי ונקי',
    'settings.theme.princess.title': 'נסיכות ואגדות 👑',
    'settings.theme.princess.sub':   'כתרים, ארמון וקסם',
    'settings.theme.spiderman.title':'ספיידרמן 🕷️',
    'settings.theme.spiderman.sub':  'קורי עכביש וגיבורי־על',
    'settings.selected':             'נבחר ✓',
    'settings.pick':                 'בחירה',
    'settings.parentsLabel':         'אפשרויות נוספות להורים:',
    'settings.accountBtn':           'חשבון ומסלולים',
    'settings.crust.princess':       '👑 מהדורת נסיכות',
    'settings.crust.spiderman':      '🕷️ מהדורת ספיידרמן',

    'landing.title':     'הגנון של עלמון — משחקים לימודיים לילדים בגיל 3 עד 8',
    'landing.kicker':    'משחקים לילדים בגיל 3 עד 8',
    'landing.headline':  'משחקים שילדים אוהבים, ושמלמדים אותם משהו',
    'landing.lede':      'אותיות, מספרים, אנגלית, לוגיקה ושימוש ראשון במחשב. בעברית ובאנגלית, עם קול שמקריא את ההוראות למי שעוד לא יודע לקרוא. בלי פרסומות.',
    'landing.signup':    'פותחים חשבון',
    'landing.guest':     'משחקים בלי חשבון',
    'landing.login':     'כבר יש לנו חשבון',
    'landing.guestNote': '{count} משחקים פתוחים לכולם, בלי הרשמה.',
    'landing.plansTitle': 'איזה מסלול מתאים לכם?',
    'landing.plansLede':  'כל מסלול כולל את כל מה שבמסלולים שלפניו. בתקופת ההשקה כולם ללא תשלום וללא כרטיס אשראי.',
    'landing.parentsTitle': 'מה חשוב לדעת',
    'landing.why1h': 'ילדים שעוד לא קוראים מסתדרים לבד',
    'landing.why1':  'קול מקריא את ההוראות, את האותיות ואת המספרים.',
    'landing.why2h': 'טעות לא מענישה',
    'landing.why2':  'תשובה לא נכונה פשוט מנסים שוב, בלי ניקוד ובלי מפסידים.',
    'landing.why3h': 'בלי פרסומות',
    'landing.why3':  'אין באתר פרסומות, ואין בו קישורים החוצה שילד יכול ללחוץ עליהם בטעות.',
    'landing.why4h': 'לא שואלים כלום על הילד',
    'landing.why4':  'החשבון הוא של ההורה ודורש אימייל וסיסמה בלבד. אפשר למחוק אותו בכל רגע.',
    'landing.footerGames': 'למשחקים',
    'landing.gamesCount':  '{count} משחקים',
    'landing.addsCount':   'עוד {count} משחקים',
    'plan.pick':   'בוחרים במסלול {plan}',
    'plan.early':  'ללא תשלום בתקופת ההשקה',
    'plan.freeForever': 'בלי תשלום',
    'plan.includes': 'כולל את המשחקים הפתוחים',
    'plan.includesPrev': 'כולל את כל מה שבמסלול {plan}',
    'plan.current': 'המסלול שלכם',

    'legal.privacy': 'פרטיות',
    'legal.terms':   'תנאי שימוש',
    'legal.back':    'חזרה',

    'auth.title.signup': 'פתיחת חשבון — הגנון של עלמון',
    'auth.title.login':  'כניסה — הגנון של עלמון',
    'auth.title.forgot': 'שכחתי סיסמה — הגנון של עלמון',
    'auth.title.reset':  'סיסמה חדשה — הגנון של עלמון',
    'auth.title.account': 'החשבון שלי — הגנון של עלמון',
    'auth.signup.heading': 'פותחים חשבון',
    'auth.signup.lede':    'החשבון הוא של ההורה. לא שואלים שום דבר על הילד.',
    'auth.login.heading':  'נכנסים לחשבון',
    'auth.email':       'אימייל',
    'auth.password':    'סיסמה',
    'auth.password.new':  'סיסמה (8 תווים לפחות)',
    'auth.plan':        'מסלול',
    'auth.accept':      'אני מעל גיל 18, ואני מסכים/ה ל<a href="terms.html" target="_blank">תנאי השימוש</a> ול<a href="privacy.html" target="_blank">מדיניות הפרטיות</a>.',
    'auth.signup.go':   'פותחים חשבון',
    'auth.login.go':    'נכנסים',
    'auth.forgot.link': 'שכחתי סיסמה',
    'auth.toLogin':     'כבר יש לכם חשבון? נכנסים',
    'auth.toSignup':    'עוד אין לכם חשבון? פותחים',
    'auth.guest':       'ממשיכים בלי חשבון',
    'auth.forgot.heading': 'שכחתם סיסמה?',
    'auth.forgot.lede':    'כתבו את האימייל של החשבון ונשלח אליו קישור לבחירת סיסמה חדשה.',
    'auth.forgot.go':      'שולחים קישור',
    'auth.forgot.sent':    'אם יש חשבון עם האימייל הזה, הקישור כבר בדרך אליו. הוא עובד במשך שעה. כדאי להציץ גם בספאם.',
    'auth.reset.heading':  'בוחרים סיסמה חדשה',
    'auth.reset.go':       'שומרים סיסמה',
    'auth.reset.done':     'הסיסמה נשמרה. אפשר להיכנס איתה עכשיו.',
    'auth.account.heading': 'החשבון שלי',
    'auth.account.plan':    'המסלול שלכם',
    'auth.account.changed': 'המסלול עודכן.',
    'auth.account.play':    'למשחקים',
    'auth.account.logout':  'יציאה מהחשבון',
    'auth.delete.heading':  'מחיקת החשבון',
    'auth.delete.text':     'החשבון יימחק לתמיד. כדי לאשר, כתבו את הסיסמה.',
    'auth.delete.go':       'מוחקים את החשבון',
    'auth.delete.done':     'החשבון נמחק.',
    'auth.busy':            'רגע…',
    'auth.error.network':   'אין כרגע חיבור לשרת. בינתיים אפשר לשחק בלי חשבון, ולנסות שוב מאוחר יותר.',
    'auth.error.server':    'משהו השתבש אצלנו. נסו שוב בעוד רגע.',
    'auth.error.bad_email': 'כתובת האימייל לא נראית תקינה.',
    'auth.error.weak_password': 'הסיסמה צריכה להיות באורך 8 תווים לפחות.',
    'auth.error.bad_plan':  'בחרו מסלול.',
    'auth.error.must_accept': 'כדי לפתוח חשבון צריך לאשר את התנאים.',
    'auth.error.email_taken': 'כבר יש חשבון עם האימייל הזה. אפשר להיכנס אליו או לאפס את הסיסמה.',
    'auth.error.bad_login': 'האימייל או הסיסמה לא נכונים.',
    'auth.error.bad_password': 'הסיסמה לא נכונה.',
    'auth.error.too_many':  'היו יותר מדי ניסיונות. נסו שוב בעוד כרבע שעה.',
    'auth.error.bad_token': 'הקישור כבר נוצל או שפג תוקפו. אפשר לבקש קישור חדש.',
    'auth.error.signed_out': 'יצאתם מהחשבון. היכנסו שוב.',
    'auth.error.bad_request': 'משהו השתבש. נסו שוב.',

    'game.pageTitle':    'משחק — הגנון של עלמון',
    'game.back':         'חזרה למשחקים',
    'game.loadingTitle': 'טוען…',
    'game.allGames':     'לכל המשחקים',
    'game.sets.label':   'שלב',
    'game.reset':        'מתחילים את השלב מחדש',

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
    'appbar.greeting':  'What shall we play today?',

    'sound.label':   'Sound: {state}. Press to change',
    'sound.all':     'Music',
    'sound.effects': 'Sounds',
    'sound.off':     'Quiet',

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

    'nav.about':   'About the site',
    'browse.tier': 'More games with {plan}',
    'lock.title':   'This game is part of {plan}',
    'lock.text':    'Call a grown-up, it takes a minute. During the launch there is nothing to pay and no card to enter.',
    'lock.signup':  'Open an account',
    'lock.upgrade': 'Unlock this plan',
    'lock.close':   'Not now',
    'account.login': 'Log in',
    'account.mine':  'My account',

    'console.kicker':      'ED-DECK · PLAY CONSOLE',
    'console.allAges':     'All ages',
    'console.allChannels': 'All channels',
    'console.allGames':    'All games',
    'console.cartridges':  '{count} cartridges',
    'console.playNow':     'Play now',
    'console.prevGame':    'Previous game',
    'console.nextGame':    'Next game',
    'console.lastPlayed':  'Last played',

    'settings.button':               'Design & Settings',
    'settings.title':                'Site Design & Settings',
    'settings.close':                'Close',
    'settings.themeLabel':           'Choose a look for your child (changes the site shell, not the games):',
    'settings.theme.default.title':  'Studio Console',
    'settings.theme.default.sub':    'Sleek, dark & focused',
    'settings.theme.princess.title': 'Princess & Fairytales 👑',
    'settings.theme.princess.sub':   'Crowns, castle & magic',
    'settings.theme.spiderman.title':'Spider-Man 🕷️',
    'settings.theme.spiderman.sub':  'Webs & comic action',
    'settings.selected':             'Selected ✓',
    'settings.pick':                 'Choose',
    'settings.parentsLabel':         'More for parents:',
    'settings.accountBtn':           'Account & Plans',
    'settings.crust.princess':       '👑 Princess Edition',
    'settings.crust.spiderman':      '🕷️ Spider-Man Edition',

    'landing.title':     'EDgames — educational games for children aged 3 to 8',
    'landing.kicker':    'Games for children aged 3 to 8',
    'landing.headline':  'Games children love, that teach them something',
    'landing.lede':      'Letters, numbers, English, logic and a first go at a computer. In Hebrew and English, with a voice that reads the instructions to children who cannot read yet. No ads.',
    'landing.signup':    'Open an account',
    'landing.guest':     'Play without an account',
    'landing.login':     'We already have an account',
    'landing.guestNote': '{count} games are open to everyone, with no sign-up.',
    'landing.plansTitle': 'Which plan suits you?',
    'landing.plansLede':  'Each plan includes everything in the plans before it. During the launch all of them are free, with no card.',
    'landing.parentsTitle': 'Good to know',
    'landing.why1h': 'Children who cannot read yet manage alone',
    'landing.why1':  'A voice says the instructions, the letters and the numbers.',
    'landing.why2h': 'A mistake is not punished',
    'landing.why2':  'After a wrong answer you just try again. No scores, no losers.',
    'landing.why3h': 'No ads',
    'landing.why3':  'There are no ads on the site, and no links out for a child to press by accident.',
    'landing.why4h': 'Nothing is asked about your child',
    'landing.why4':  'The account is the parent’s and needs only an email and a password. You can delete it at any moment.',
    'landing.footerGames': 'To the games',
    'landing.gamesCount':  '{count} games',
    'landing.addsCount':   '{count} more games',
    'plan.pick':   'Choose {plan}',
    'plan.early':  'Free during the launch',
    'plan.freeForever': 'No payment',
    'plan.includes': 'Includes the open games',
    'plan.includesPrev': 'Includes everything in {plan}',
    'plan.current': 'Your plan',

    'legal.privacy': 'Privacy',
    'legal.terms':   'Terms of use',
    'legal.back':    'Back',

    'auth.title.signup': 'Open an account — EDgames',
    'auth.title.login':  'Log in — EDgames',
    'auth.title.forgot': 'Forgot password — EDgames',
    'auth.title.reset':  'New password — EDgames',
    'auth.title.account': 'My account — EDgames',
    'auth.signup.heading': 'Open an account',
    'auth.signup.lede':    'The account is the parent’s. Nothing is asked about your child.',
    'auth.login.heading':  'Log in',
    'auth.email':       'Email',
    'auth.password':    'Password',
    'auth.password.new':  'Password (at least 8 characters)',
    'auth.plan':        'Plan',
    'auth.accept':      'I am over 18, and I agree to the <a href="terms.html?lang=en" target="_blank">terms of use</a> and the <a href="privacy.html?lang=en" target="_blank">privacy policy</a>.',
    'auth.signup.go':   'Open an account',
    'auth.login.go':    'Log in',
    'auth.forgot.link': 'Forgot password',
    'auth.toLogin':     'Already have an account? Log in',
    'auth.toSignup':    'No account yet? Open one',
    'auth.guest':       'Carry on without an account',
    'auth.forgot.heading': 'Forgot your password?',
    'auth.forgot.lede':    'Enter the account’s email and we will send it a link for choosing a new password.',
    'auth.forgot.go':      'Send the link',
    'auth.forgot.sent':    'If there is an account with this email, the link is on its way. It works for one hour. Check the spam folder too.',
    'auth.reset.heading':  'Choose a new password',
    'auth.reset.go':       'Save the password',
    'auth.reset.done':     'The password is saved. You can log in with it now.',
    'auth.account.heading': 'My account',
    'auth.account.plan':    'Your plan',
    'auth.account.changed': 'Your plan was updated.',
    'auth.account.play':    'To the games',
    'auth.account.logout':  'Log out',
    'auth.delete.heading':  'Delete the account',
    'auth.delete.text':     'The account will be deleted for good. To confirm, type the password.',
    'auth.delete.go':       'Delete the account',
    'auth.delete.done':     'The account was deleted.',
    'auth.busy':            'One moment…',
    'auth.error.network':   'We cannot reach the server right now. You can still play without an account, and try again later.',
    'auth.error.server':    'Something went wrong on our side. Try again in a moment.',
    'auth.error.bad_email': 'That email address does not look right.',
    'auth.error.weak_password': 'The password needs at least 8 characters.',
    'auth.error.bad_plan':  'Choose a plan.',
    'auth.error.must_accept': 'To open an account, please accept the terms.',
    'auth.error.email_taken': 'There is already an account with this email. You can log in or reset the password.',
    'auth.error.bad_login': 'The email or the password is not right.',
    'auth.error.bad_password': 'That password is not right.',
    'auth.error.too_many':  'Too many tries. Try again in about 15 minutes.',
    'auth.error.bad_token': 'That link was already used or has expired. You can ask for a new one.',
    'auth.error.signed_out': 'You were logged out. Please log in again.',
    'auth.error.bad_request': 'Something went wrong. Try again.',

    'game.pageTitle':    'Game — EDgames',
    'game.back':         'Back to games',
    'game.loadingTitle': 'Loading…',
    'game.allGames':     'All the games',
    'game.sets.label':   'Step',
    'game.reset':        'Start this step over',

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
    const qs = p.toString();
    /* A history-replacing navigation, not a push: assigning location.search
       added a second entry for this same page, so the back button's first
       press after a toggle landed here again instead of the grid. Building
       the path by hand (rather than location.href) keeps it relative, which
       matters when the site is opened as a file. */
    location.replace(`${location.pathname}${qs ? `?${qs}` : ''}`);
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
    btn.innerHTML = `${EDGlyphs.icon('globe')}<span>${UI[next]['lang.name']}</span>`;
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

/* Kid-chosen website theme (Studio Default / Princess & Fairytales / Spider-Man).
   Changes the website shell (play.html, game.html outer console frame, index.html,
   account.html) while keeping the inner game canvas (#stage) untouched. */
const KID_THEMES = ['default', 'princess', 'spiderman'];
const KID_THEME_KEY = 'edgames-kid-theme';

function readKidTheme() {
  try { return localStorage.getItem(KID_THEME_KEY); } catch { return null; }
}
function saveKidTheme(theme) {
  try { localStorage.setItem(KID_THEME_KEY, theme); } catch { /* session only */ }
}

const EDTheme = window.EDTheme = {
  current: 'default',

  set(theme, persist = true) {
    if (!KID_THEMES.includes(theme)) theme = 'default';
    this.current = theme;
    if (persist) saveKidTheme(theme);
    document.documentElement.dataset.kidTheme = theme;
    if (document.body) document.body.dataset.kidTheme = theme;
    /* Sync any cached game iframes inside EDPlayer so returning to an open game
       immediately reflects the newly chosen console theme. */
    document.querySelectorAll('.player iframe').forEach((frame) => {
      try {
        if (frame.contentWindow && frame.contentWindow.EDTheme) {
          frame.contentWindow.EDTheme.set(theme, false);
        }
      } catch { /* cross-origin or not loaded yet */ }
    });
    window.dispatchEvent(new CustomEvent('edthemechange', { detail: { theme } }));
  },
};

(function () {
  const fromUrl = new URLSearchParams(location.search).get('theme');
  const stored = readKidTheme();
  const initial = KID_THEMES.includes(fromUrl) ? fromUrl : (KID_THEMES.includes(stored) ? stored : 'default');
  EDTheme.set(initial, KID_THEMES.includes(fromUrl));
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.body) {
        document.body.dataset.kidTheme = EDTheme.current;
      }
    });
  }
  window.addEventListener('storage', (e) => {
    if (e.key === KID_THEME_KEY && e.newValue && KID_THEMES.includes(e.newValue)) {
      EDTheme.set(e.newValue, false);
    }
  });
})();
