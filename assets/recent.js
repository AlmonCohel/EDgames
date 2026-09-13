/* The last game this browser opened, which is what the big card at the top of
   the home screen offers to carry on with.

   One game id in localStorage and nothing else — no history, no counts, no
   profile. The card is the first thing on a phone screen, so it has to be true;
   a made-up "continue" is worse than no card at all, and that is exactly what
   hiding it when there is nothing to carry on with means.

   Written by game.html, read by index.html, which is why it is its own file. */

const RECENT_KEY = 'edgames-last-played';

const EDRecent = {
  /* localStorage throws rather than returns null in a few browsers on file://
     and in private windows, and the site is meant to work from a file. */
  read() {
    try { return localStorage.getItem(RECENT_KEY); } catch { return null; }
  },

  write(id) {
    try { localStorage.setItem(RECENT_KEY, id); } catch { /* then the card simply stays hidden */ }
  },

  /* The catalog is the authority: an id from an older visit whose game has
     since been renamed, or gone back to being built, is not offered. */
  game() {
    const g = gameById(this.read() || '');
    return g && g.status === 'ready' ? g : null;
  },
};
