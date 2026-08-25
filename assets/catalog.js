/* The game catalog — the single source of truth for the grid and the game page.
   Adding a game means adding an entry here and a module in games/<id>.js.
   Set status to 'ready' once that module exists; until then it shows as 'soon'.

   Every piece of text a child or a parent reads is written in both languages,
   { he, en }, and rendered through EDLang.pick. */

const SUBJECTS = [
  { id: 'letters', label: { he: 'אותיות ומילים',  en: 'Letters & words'   }, emoji: '🔤' },
  { id: 'numbers', label: { he: 'מספרים וחשבון',  en: 'Numbers & counting' }, emoji: '🔢' },
  { id: 'shapes',  label: { he: 'צורות וצבעים',   en: 'Shapes & colors'   }, emoji: '🎨' },
  { id: 'memory',  label: { he: 'זיכרון וחשיבה',  en: 'Memory & thinking' }, emoji: '🧩' },
  { id: 'nature',  label: { he: 'חיות וטבע',      en: 'Animals & nature'  }, emoji: '🦋' },
  { id: 'music',   label: { he: 'צלילים ומוזיקה', en: 'Sounds & music'    }, emoji: '🎵' },
  { id: 'computer', label: { he: 'מקלדת ועכבר',   en: 'Keyboard & mouse'  }, emoji: '💻' },
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
    status: 'soon',
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
    status: 'soon',
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
    status: 'soon',
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
    status: 'soon',
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
    status: 'soon',
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
    status: 'soon',
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
    id: 'puzzle-park',
    title: { he: 'פאזל בפארק', en: 'Park Puzzle' },
    emoji: '🧩',
    subject: 'memory',
    ageMin: 4, ageMax: 8,
    blurb: {
      he: 'מרכיבים תמונה של הפארק חתיכה אחרי חתיכה.',
      en: 'Put a picture of the park together piece after piece.',
    },
    status: 'soon',
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
    status: 'soon',
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
    id: 'weather-day',
    title: { he: 'איזה מזג אוויר?', en: 'What Is the Weather?' },
    emoji: '⛅',
    subject: 'nature',
    ageMin: 5, ageMax: 7,
    blurb: {
      he: 'מתאימים בגדים ליום שמשי, גשום או מושלג.',
      en: 'Match the clothes to a sunny, a rainy or a snowy day.',
    },
    status: 'soon',
  },
  {
    id: 'build-a-word',
    title: { he: 'בונים מילה', en: 'Build a Word' },
    emoji: '✏️',
    subject: 'letters',
    ageMin: 6, ageMax: 8,
    blurb: {
      he: 'גוררים אותיות למקום ומרכיבים את המילה שבתמונה.',
      en: 'Drag the letters into place and build the word in the picture.',
    },
    status: 'soon',
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
    status: 'soon',
  },
];

const subjectById = (id) => SUBJECTS.find((s) => s.id === id);
const gameById = (id) => GAMES.find((g) => g.id === id);
