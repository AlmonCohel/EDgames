/* The game catalog — the single source of truth for the grid and the game page.
   Adding a game means adding an entry here and a module in games/<id>.js.
   Set status to 'ready' once that module exists; until then it shows as 'soon'.

   Every piece of text a child or a parent reads is written in both languages,
   { he, en }, and rendered through EDLang.pick.

   `sound: true` marks a game that makes its own sounds (the listening games):
   the site's tune stops while it is open. Every other game plays with the tune
   under it. */

const SUBJECTS = [
  { id: 'letters', label: { he: 'אותיות ומילים',  en: 'Letters & words'   }, emoji: '🔤' },
  { id: 'numbers', label: { he: 'מספרים וחשבון',  en: 'Numbers & counting' }, emoji: '🔢' },
  { id: 'shapes',  label: { he: 'צורות וצבעים',   en: 'Shapes & colors'   }, emoji: '🎨' },
  { id: 'memory',  label: { he: 'זיכרון וחשיבה',  en: 'Memory & thinking' }, emoji: '🧩' },
  { id: 'nature',  label: { he: 'חיות וטבע',      en: 'Animals & nature'  }, emoji: '🦋' },
  { id: 'music',   label: { he: 'צלילים ומוזיקה', en: 'Sounds & music'    }, emoji: '🎵' },
  { id: 'computer', label: { he: 'מקלדת ועכבר',   en: 'Keyboard & mouse'  }, emoji: '💻' },
  { id: 'fairytale', label: { he: 'נסיכות וקסמים', en: 'Princesses & magic' }, emoji: '👑' },
];

/* Age groups the filter offers. A game matches a group when their ranges overlap,
   so a 3–5 game shows up under both "3–4" and "5–6". */
const AGE_GROUPS = [
  { id: 'tots',    label: { he: 'גיל 3–4', en: 'Ages 3–4' }, emoji: '🍼', min: 3, max: 4 },
  { id: 'gan',     label: { he: 'גיל 5–6', en: 'Ages 5–6' }, emoji: '🧸', min: 5, max: 6 },
  { id: 'school',  label: { he: 'גיל 7–8', en: 'Ages 7–8' }, emoji: '🎒', min: 7, max: 8 },
];

const GAMES = [
  {
    id: 'color-pop',
    title: { he: 'פיצוץ צבעים', en: 'Color Pop' },
    emoji: '🎈',
    subject: 'shapes',
    ageMin: 3, ageMax: 5,
    blurb: {
      he: 'מוצאים את הבלון בצבע הנכון ומפוצצים אותו בלחיצה.',
      en: 'Find the balloon in the right color and pop it with a tap.',
    },
    status: 'ready',
  },
  {
    id: 'count-the-ducks',
    title: { he: 'סופרים ברווזים', en: 'Counting Ducks' },
    emoji: '🦆',
    subject: 'numbers',
    ageMin: 3, ageMax: 5,
    blurb: {
      he: 'כמה ברווזים שוחים באגם? סופרים ובוחרים את המספר.',
      en: 'How many ducks are swimming in the lake? Count them and pick the number.',
    },
    status: 'ready',
  },
  {
    id: 'shape-match',
    title: { he: 'מוצאים צורה', en: 'Find the Shape' },
    emoji: '🔺',
    subject: 'shapes',
    ageMin: 3, ageMax: 5,
    blurb: {
      he: 'מתאימים כל צורה לחור המתאים לה על הלוח.',
      en: 'Match every shape to the hole it belongs in on the board.',
    },
    status: 'ready',
  },
  {
    id: 'animal-sounds',
    title: { he: 'מי אמר את זה?', en: 'Who Said That?' },
    emoji: '🐮',
    subject: 'nature',
    ageMin: 3, ageMax: 5,
    blurb: {
      he: 'שומעים קול של חיה ומנחשים למי הוא שייך.',
      en: 'Listen to an animal sound and guess who it belongs to.',
    },
    sound: true,
    status: 'ready',
  },
  {
    id: 'piano-pets',
    title: { he: 'פסנתר החיות', en: 'Animal Piano' },
    emoji: '🎹',
    subject: 'music',
    ageMin: 3, ageMax: 6,
    blurb: {
      he: 'כל קליד הוא חיה אחרת. מנגנים ומגלים איך היא נשמעת.',
      en: 'Every key is a different animal. Play and find out how it sounds.',
    },
    sound: true,
    status: 'ready',
  },
  {
    id: 'memory-pairs',
    title: { he: 'זוג זוג', en: 'Pair by Pair' },
    emoji: '🧠',
    subject: 'memory',
    ageMin: 4, ageMax: 7,
    blurb: {
      he: 'הופכים קלפים וזוכרים איפה מסתתר הזוג המתאים.',
      en: 'Turn the cards over and remember where the matching pair is hiding.',
    },
    status: 'ready',
  },
  {
    id: 'rhythm-tap',
    title: { he: 'מוחאים בקצב', en: 'Clap the Beat' },
    emoji: '🥁',
    subject: 'music',
    ageMin: 4, ageMax: 7,
    blurb: {
      he: 'מקשיבים לקצב ומנסים לחזור עליו בדיוק אותו הדבר.',
      en: 'Listen to a rhythm and try to repeat it exactly the same way.',
    },
    sound: true,
    status: 'ready',
  },
  {
    id: 'mouse-moves',
    title: { he: 'העכבר הזריז', en: 'Mouse Moves' },
    emoji: '🖱️',
    subject: 'computer',
    ageMin: 4, ageMax: 7,
    blurb: {
      he: 'מצביעים, לוחצים, לוחצים פעמיים וגוררים — כל מה שעכבר יודע לעשות.',
      en: 'Point, click, double-click and drag — everything a mouse can do.',
    },
    status: 'ready',
  },
  {
    id: 'arrow-trail',
    title: { he: 'בדרך הביתה', en: 'The Way Home' },
    emoji: '🐢',
    subject: 'computer',
    ageMin: 4, ageMax: 7,
    blurb: {
      he: 'לוחצים על מקשי החצים ומובילים את הצב צעד אחרי צעד עד הבית.',
      en: 'Press the arrow keys and lead the turtle home, one step at a time.',
    },
    status: 'ready',
  },
  {
    id: 'story-order',
    title: { he: 'מה קרה קודם?', en: 'What Happened First?' },
    emoji: '📖',
    subject: 'memory',
    ageMin: 4, ageMax: 7,
    blurb: {
      he: 'מסדרים את תמונות האגדה — מה קרה קודם ומה אחר כך.',
      en: 'Put the fairytale pictures in order — what happened first, and what came next.',
    },
    status: 'ready',
  },
  {
    id: 'puzzle-park',
    title: { he: 'פאזל בפארק', en: 'Park Puzzle' },
    emoji: '🧩',
    subject: 'memory',
    ageMin: 4, ageMax: 8,
    blurb: {
      he: 'מרכיבים תמונה של הפארק חתיכה אחרי חתיכה.',
      en: 'Put a picture of the park together piece after piece.',
    },
    status: 'ready',
  },
  {
    id: 'letter-hunt',
    title: { he: 'ציד אותיות', en: 'Letter Hunt' },
    emoji: '🔍',
    subject: 'letters',
    ageMin: 5, ageMax: 7,
    blurb: {
      he: 'האות מסתתרת בין כל השאר. מי ימצא אותה ראשון?',
      en: 'The letter is hiding among all the others. Who will find it first?',
    },
    status: 'ready',
  },
  {
    id: 'wizard-spell',
    title: { he: 'הלחש של הקוסם', en: "The Wizard's Spell" },
    emoji: '🔮',
    subject: 'letters',
    ageMin: 5, ageMax: 8,
    blurb: {
      he: 'הקוסם מהאגדה איבד אות מהלחש. מוצאים אותה ומשלימים את המילה.',
      en: 'The fairytale wizard has lost a letter from his spell. Find it and finish the word.',
    },
    status: 'ready',
  },
  {
    id: 'tower-steps',
    title: { he: 'מדרגות המגדל', en: 'The Tower Stairs' },
    emoji: '🏰',
    subject: 'numbers',
    ageMin: 5, ageMax: 8,
    blurb: {
      he: 'מדרגה אחת במגדל האגדה נעלמה. איזה מספר צריך להיות שם?',
      en: 'One stair in the fairytale tower has vanished. Which number belongs there?',
    },
    status: 'ready',
  },
  {
    id: 'keyboard-keys',
    title: { he: 'מכירים את המקלדת', en: 'Meet the Keyboard' },
    emoji: '⌨️',
    subject: 'computer',
    ageMin: 5, ageMax: 8,
    blurb: {
      he: 'מחפשים את המקש שביקשנו על המקלדת האמיתית ולוחצים עליו.',
      en: 'Find the key we asked for on the real keyboard and press it.',
    },
    status: 'ready',
  },
  {
    id: 'click-catch',
    title: { he: 'תופסים בלחיצה', en: 'Catch and Click' },
    emoji: '🐞',
    subject: 'computer',
    ageMin: 5, ageMax: 8,
    blurb: {
      he: 'החיפושית מסתובבת על המסך. מכוונים אליה את החץ ולוחצים בדיוק עליה.',
      en: 'The ladybird will not hold still. Aim the arrow at it and click.',
    },
    status: 'ready',
  },
  {
    id: 'weather-day',
    title: { he: 'איזה מזג אוויר?', en: 'What Is the Weather?' },
    emoji: '⛅',
    subject: 'nature',
    ageMin: 5, ageMax: 7,
    blurb: {
      he: 'מתאימים בגדים ליום שמשי, גשום או מושלג.',
      en: 'Match the clothes to a sunny, a rainy or a snowy day.',
    },
    status: 'ready',
  },
  {
    id: 'build-a-word',
    title: { he: 'בונים מילה', en: 'Build a Word' },
    emoji: '✏️',
    subject: 'letters',
    ageMin: 6, ageMax: 8,
    /* Not dragged: this site taps, because a small hand on a tablet loses a
       dragged piece halfway. The blurb said "drag" while the game was still a
       sentence rather than a screen. */
    blurb: {
      he: 'לוחצים על האותיות לפי הסדר ובונים את המילה שבתמונה.',
      en: 'Tap the letters in order and build the word in the picture.',
    },
    status: 'ready',
  },
  {
    id: 'first-letter',
    title: { he: 'מה האות הראשונה?', en: 'First Letter' },
    emoji: '🍎',
    subject: 'letters',
    ageMin: 4, ageMax: 6,
    blurb: {
      he: 'רואים תמונה, אומרים את המילה בקול ובוחרים באיזו אות היא מתחילה.',
      en: 'See a picture, say the word out loud and pick the letter it starts with.',
    },
    status: 'ready',
  },
  {
    id: 'final-letters',
    title: { he: 'אותיות סופיות', en: 'Final Letters' },
    emoji: '🔗',
    subject: 'letters',
    ageMin: 6, ageMax: 8,
    blurb: {
      he: 'כ מ נ פ צ משנות צורה בסוף מילה. מוצאים לכל אחת את הזוג הסופי שלה.',
      en: 'Five Hebrew letters change shape at the end of a word. Match each to its final form.',
    },
    status: 'ready',
  },
  {
    id: 'letter-trace',
    title: { he: 'כותבים אות', en: 'Trace the Letter' },
    emoji: '✏️',
    subject: 'letters',
    ageMin: 3, ageMax: 6,
    blurb: {
      he: 'עוברים עם האצבע על האות הגדולה וצובעים אותה עד שהיא מתמלאת.',
      en: 'Go over the big letter with your finger until it is all coloured in.',
    },
    status: 'ready',
  },
  {
    id: 'plus-minus',
    title: { he: 'ועוד ופחות', en: 'Plus and Minus' },
    emoji: '➕',
    subject: 'numbers',
    ageMin: 6, ageMax: 8,
    blurb: {
      he: 'תרגילי חיבור וחיסור קטנים עם עוגיות במקום מספרים.',
      en: 'Small addition and subtraction, with cookies instead of numbers.',
    },
    status: 'ready',
  },
  /* ---- October 2026: numbers for 3–5, princesses, and more letters ---- */
  {
    id: 'birthday-candles',
    title: { he: 'עוגת יום הולדת', en: 'Birthday Cake' },
    emoji: '🎂',
    subject: 'numbers',
    ageMin: 3, ageMax: 5,
    blurb: {
      he: 'שמים על העוגה בדיוק כמה נרות שביקשו, סופרים בקול ומכבים.',
      en: 'Put exactly the number of candles asked for on the cake, count them out loud, then blow them out.',
    },
    status: 'ready',
  },
  {
    id: 'frog-hops',
    title: { he: 'הצפרדע קופצת', en: 'Frog Hops' },
    emoji: '🐸',
    subject: 'numbers',
    ageMin: 3, ageMax: 5,
    blurb: {
      he: 'מוצאים את העלה עם המספר, והצפרדע קופצת אליו וסופרת כל קפיצה.',
      en: 'Find the lily pad with the number, and the frog hops there counting every hop.',
    },
    status: 'ready',
  },
  {
    id: 'more-or-less',
    title: { he: 'איפה יש יותר?', en: 'Which Has More?' },
    emoji: '🧺',
    subject: 'numbers',
    ageMin: 3, ageMax: 5,
    blurb: {
      he: 'שני סלים של פירות — באיזה יש יותר, באיזה פחות, ובאיזה בדיוק המספר.',
      en: 'Two baskets of fruit — which has more, which has less, and which has exactly the number.',
    },
    status: 'ready',
  },
  {
    id: 'princess-dress',
    title: { he: 'מלבישים את הנסיכה', en: 'Dress the Princess' },
    emoji: '👗',
    subject: 'fairytale',
    ageMin: 3, ageMax: 6,
    blurb: {
      he: 'הנסיכה אומרת מה היא רוצה ללבוש לנשף — מקשיבים ומלבישים אותה.',
      en: 'The princess says what she wants to wear to the ball — listen and dress her.',
    },
    status: 'ready',
  },
  {
    id: 'unicorn-rainbow',
    title: { he: 'הקשת של חד-הקרן', en: "The Unicorn's Rainbow" },
    emoji: '🦄',
    subject: 'fairytale',
    ageMin: 3, ageMax: 6,
    blurb: {
      he: 'צובעים קשת לפי התוכנית כדי שחד-הקרן יגיע לטירה בעננים.',
      en: 'Paint a rainbow to the plan so the unicorn can reach the castle in the clouds.',
    },
    status: 'ready',
  },
  {
    id: 'castle-shadows',
    title: { he: 'צללים בטירה', en: 'Shadows in the Castle' },
    emoji: '🪞',
    subject: 'fairytale',
    ageMin: 3, ageMax: 6,
    blurb: {
      he: 'במראה הקסומה יש רק צל. של מי הוא — הכתר, הנעל או הדרקון?',
      en: 'The magic mirror shows only a shadow. Whose is it — the crown, the slipper or the dragon?',
    },
    status: 'ready',
  },
  {
    id: 'castle-builder',
    title: { he: 'בונים טירה', en: 'Build the Castle' },
    emoji: '🏰',
    subject: 'fairytale',
    ageMin: 4, ageMax: 7,
    blurb: {
      he: 'בונים לנסיכה טירה לפי התוכנית — כל חלק הוא צורה אחרת.',
      en: 'Build the princess a castle to the plan — every part is a different shape.',
    },
    status: 'ready',
  },
  {
    id: 'letter-listen',
    title: { he: 'איזו אות שמעתי?', en: 'Which Letter Did You Hear?' },
    emoji: '👂',
    subject: 'letters',
    ageMin: 3, ageMax: 6,
    blurb: {
      he: 'שומעים את שם האות ומוצאים אותה בין הכרטיסים.',
      en: "Hear a Hebrew letter's name and find it among the cards.",
    },
    status: 'ready',
  },
  {
    id: 'letter-balloons',
    title: { he: 'בלוני אותיות', en: 'Letter Balloons' },
    emoji: '🎈',
    subject: 'letters',
    ageMin: 4, ageMax: 6,
    blurb: {
      he: 'בלונים עם אותיות עפים למעלה. מפוצצים את כל הבלונים עם האות שביקשו.',
      en: 'Balloons with Hebrew letters float up. Pop every balloon with the letter asked for.',
    },
    status: 'ready',
  },
  {
    id: 'alefbet-dots',
    title: { he: 'מחברים נקודות א-ב', en: 'Alef-Bet Dot to Dot' },
    emoji: '✨',
    subject: 'letters',
    ageMin: 4, ageMax: 7,
    blurb: {
      he: 'מחברים את הנקודות לפי סדר האלף-בית ומגלים איזו תמונה יצאה.',
      en: 'Join the dots in Alef-Bet order and find out what picture comes out.',
    },
    status: 'ready',
  },
  {
    id: 'abc-big-small',
    title: { he: 'ABC — גדולות וקטנות', en: 'ABC: Big and Small' },
    emoji: '🐥',
    subject: 'letters',
    ageMin: 4, ageMax: 7,
    blurb: {
      he: 'לכל אות באנגלית יש צורה גדולה וקטנה. מוצאים לאמא ברווזה את הברווזון שלה.',
      en: 'Every English letter has a big and a small shape. Find Mother Duck her duckling.',
    },
    status: 'ready',
  },
  {
    id: 'abc-caterpillar',
    title: { he: 'זחל ה-ABC', en: 'The ABC Caterpillar' },
    emoji: '🐛',
    subject: 'letters',
    ageMin: 4, ageMax: 7,
    blurb: {
      he: 'לזחל חסרה אות באמצע. איזו אות באנגלית באה שם?',
      en: 'The caterpillar is missing a letter. Which English letter goes there?',
    },
    status: 'ready',
  },
];

const subjectById = (id) => SUBJECTS.find((s) => s.id === id);
const gameById = (id) => GAMES.find((g) => g.id === id);
/* Whether a subject has anything a child can actually play right now. */
const subjectHasReady = (id) => GAMES.some((g) => g.subject === id && g.status === 'ready');
