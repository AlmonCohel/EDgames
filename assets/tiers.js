/* The plans. Four levels, each one everything below it plus more:

     guest  no account at all — every game the site had before accounts existed
     free   a free account     — ניצנים / Sprouts (free forever)
     basic  paid plan          — סקרנים / Explorers (₪19/mo or ₪149/yr, $4.99/mo or $39/yr)
     pro    paid plan          — אלופים / Champions (₪29/mo or ₪229/yr, $7.99/mo or $59/yr)

   A game's level is `tier` on its catalog entry, and no `tier` means guest. To
   move a game between plans, change that one word.

   The ids must match PLANS in worker/src/index.js. */

const TIERS = [
  { id: 'guest', name: { he: 'בלי חשבון', en: 'No account' } },
  {
    id: 'free',
    name: { he: 'ניצנים', en: 'Sprouts' },
    price: {
      he: 'חינם לתמיד',
      en: 'Free forever',
      monthly: 0,
      annual: 0,
    },
    tagline: { he: 'כל המשחקים הפתוחים, ועוד כמה שמחכים רק למי שנרשם', en: 'All the open games, plus a few kept for those who sign up' },
  },
  {
    id: 'basic',
    name: { he: 'סקרנים', en: 'Explorers' },
    price: {
      he: '₪19 לחודש · ₪149 לשנה',
      en: '$4.99 / mo · $39 / yr',
      monthly: { ils: 19, usd: 4.99 },
      annual: { ils: 149, usd: 39 },
    },
    tagline: { he: 'משחקים גדולים יותר, עם יותר מה לעשות בהם', en: 'Bigger games, with much more to do in them' },
  },
  {
    id: 'pro',
    name: { he: 'אלופים', en: 'Champions' },
    price: {
      he: '₪29 לחודש · ₪229 לשנה',
      en: '$7.99 / mo · $59 / yr',
      monthly: { ils: 29, usd: 7.99 },
      annual: { ils: 229, usd: 59 },
    },
    tagline: { he: 'לומדים באמת: אנגלית, חשבון ולוגיקה, שלב אחרי שלב', en: 'Real learning: English, maths and logic, step by step' },
  },
];

const PLAN_IDS = ['free', 'basic', 'pro'];
const tierById = (id) => TIERS.find((t) => t.id === id) || TIERS[0];
const tierRank = (id) => Math.max(0, TIERS.findIndex((t) => t.id === id));
const gameTier = (game) => game.tier || 'guest';
