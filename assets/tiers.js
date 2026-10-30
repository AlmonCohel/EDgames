/* The plans. Four levels, each one everything below it plus more:

     guest  no account at all — every game the site had before accounts existed
     free   a free account     — a few more games
     basic  paid (later)       — richer games, with more to them
     pro    paid (later)       — structured learning: English, maths, logic

   A game's level is `tier` on its catalog entry, and no `tier` means guest. To
   move a game between plans, change that one word.

   The ids must match PLANS in worker/src/index.js. */

const TIERS = [
  { id: 'guest', name: { he: 'בלי חשבון', en: 'No account' } },
  {
    id: 'free',
    name: { he: 'חינם', en: 'Free' },
    tagline: { he: 'כל המשחקים הפתוחים, ועוד כמה שמחכים רק למי שנרשם', en: 'All the open games, plus a few kept for those who sign up' },
  },
  {
    id: 'basic',
    name: { he: 'בסיסי', en: 'Basic' },
    tagline: { he: 'משחקים גדולים יותר, עם יותר מה לעשות בהם', en: 'Bigger games, with much more to do in them' },
  },
  {
    id: 'pro',
    name: { he: 'פרו', en: 'Pro' },
    tagline: { he: 'לומדים באמת: אנגלית, חשבון ולוגיקה, שלב אחרי שלב', en: 'Real learning: English, maths and logic, step by step' },
  },
];

const PLAN_IDS = ['free', 'basic', 'pro'];
const tierById = (id) => TIERS.find((t) => t.id === id) || TIERS[0];
const tierRank = (id) => Math.max(0, TIERS.findIndex((t) => t.id === id));
const gameTier = (game) => game.tier || 'guest';
