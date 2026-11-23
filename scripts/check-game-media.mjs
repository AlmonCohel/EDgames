#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const languages = ['he', 'en'];
const pictureExt = /\.(?:avif|gif|jpe?g|png|svg|webp)$/i;
const soundExt = /\.(?:aac|m4a|mp3|ogg|wav)$/i;
const mediaExt = (file) => pictureExt.test(file) || soundExt.test(file);
const read = (file) => readFileSync(path.join(root, file), 'utf8');

function filesIn(dir) {
  return readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const file = `${dir}/${entry.name}`;
    return entry.isDirectory() ? filesIn(file) : entry.isFile() ? [file] : [];
  }).sort();
}

// Read the literal lists and selected fields as source. Nested expressions in
// other fields (e.g. the synthesized animal calls) are skipped, never evaluated.
function tokens(source) {
  return [...source.matchAll(/\/\*[\s\S]*?\*\/|\/\/[^\r\n]*|"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|`(?:\\[\s\S]|[^`\\])*`|[\w$]+|[^\s]/g)]
    .map(([token]) => token).filter((token) => !/^\/[*\/]/.test(token));
}

function parts(list, open) {
  const closing = { '[': ']', '{': '}', '(': ')' };
  if (list?.[0] !== open) throw new Error(`Expected ${open}, found ${list?.[0] ?? 'no value'}`);
  const stack = [closing[open]];
  const result = [];
  let start = 1;
  for (let i = 1; i < list.length; i += 1) {
    const token = list[i];
    if (token === stack.at(-1)) {
      stack.pop();
      if (!stack.length) {
        if (i > start) result.push(list.slice(start, i));
        return result;
      }
    } else if (Object.hasOwn(closing, token)) {
      stack.push(closing[token]);
    } else if (token === ',' && stack.length === 1) {
      result.push(list.slice(start, i));
      start = i + 1;
    }
  }
  throw new Error(`Unclosed ${open} in content list`);
}

function literal(list) {
  if (!list?.length || list[0] === 'null' || list[0] === 'undefined') return '';
  const [token] = list;
  if (list.length !== 1 || !/^['"]/.test(token)) throw new Error(`Expected a string literal, found ${list.join(' ')}`);
  return token.slice(1, -1).replace(/\\(['"\\])/g, '$1');
}

function fields(list) {
  return new Map(parts(list, '{').map(([key, colon, ...value]) => {
    if (colon !== ':') throw new Error(`Expected a property value for ${key}`);
    return [/^['"]/.test(key) ? literal([key]) : key, value];
  }));
}

function declaration(game, name) {
  const start = game.source.match(new RegExp(`\\bconst ${name}\\s*=\\s*`));
  if (!start) throw new Error(`Cannot find ${name} in ${game.id}`);
  return tokens(game.source.slice(start.index + start[0].length));
}

const strings = (list) => parts(list, '[').map(literal);
const sets = (game) => parts(declaration(game, 'SETS'), '[').map(fields);
const unique = (values) => [...new Set(values)];
const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i);
const voiceFile = (lang, key) => `assets/voice/${lang}/${key}.mp3`;
const slug = (word) => word.toLowerCase().replace(/[^a-z]/g, '');

const inventory = new Set(filesIn('assets').filter(mediaExt));
const filesUsed = new Map();
const games = new Map();
const gaps = new Map();
const shared = { id: 'Shared files', entries: new Set(), missing: new Set(), collisions: new Set() };

function issue(game, type, detail) {
  const key = `${type}: ${detail}`;
  game.missing.add(key);
  if (!gaps.has(key)) gaps.set(key, new Set());
  gaps.get(key).add(game.id);
}

function useFile(game, file, word) {
  const normalized = path.posix.normalize(file.replace(/^\//, ''));
  const uses = filesUsed.get(normalized) ?? new Map();
  filesUsed.set(normalized, uses);
  if (word) {
    if (!uses.has(word)) uses.set(word, new Set());
    uses.get(word).add(game);
  }
  // The inventory preserves casing even on Windows.
  if (!inventory.has(normalized) || statSync(path.join(root, normalized)).size === 0) {
    issue(game, 'Missing or empty file', normalized);
  }
}

function entry(game, lang, word, picture, audio = [], pictureOwner) {
  if (!word) throw new Error(`Empty entry in ${game.id}`);
  const name = `${lang}/${word.toLowerCase()}`;
  game.entries.add(name);
  if (!picture) issue(game, 'No picture assigned', name);
  else if (pictureExt.test(picture)) useFile(game, picture, pictureOwner ?? name);
  else if (!/\p{Extended_Pictographic}|^drawn$/u.test(picture)) issue(game, 'Invalid inline picture', name);
  if (!audio.length) issue(game, 'No recording assigned', name);
  audio.forEach((file) => useFile(game, file, name));
}

function named(game, word, picture, key, extra = []) {
  for (const lang of languages) {
    // One illustration serves both labels for the same item.
    entry(game, lang, word, picture, [voiceFile(lang, key)], `en/${word}`);
  }
  extra.forEach((file) => useFile(game, file, `en/${word}`));
}

function recordingPath(game, helper) {
  const signature = new RegExp(`const ${helper} = \\((\\w+)\\) => \\(\\{ key: (.+?), lang: '([a-z]+)' \\}\\)`);
  const match = game.source.match(signature);
  if (!match) throw new Error(`Could not resolve ${helper}`);
  const [, parameter, code, lang] = match;
  if (!code.startsWith('`')) return () => voiceFile(lang, literal([code]));
  return (word) => {
    const key = code.slice(1, -1).replace(/\$\{([^}]+)\}/g, (placeholder, expression) => {
      if (expression === parameter) return word;
      if (expression === `slug(${parameter})`) return slug(word);
      return placeholder;
    });
    if (!/^[a-z0-9-]+$/.test(key)) throw new Error(`Unsupported recording key in ${helper}`);
    return voiceFile(lang, key);
  };
}

function animalSample(game, id) {
  const match = game.source.match(/EDSound\.sample\(`([^`]+)`\)/);
  if (!match) throw new Error('Could not resolve the animal sample path');
  const file = match[1].replace(/\$\{(?:drawn\.id|KEYS\[i\]\.en)\}/g, id);
  if (!soundExt.test(file) || file.includes('${')) throw new Error(`Unsupported sample path: ${file}`);
  return file;
}

function vocabulary(game) {
  switch (game.id) {
    case 'english-words':
    case 'spell-it':
    case 'sentence-train': {
      const sentences = game.id === 'sentence-train';
      const wordRecording = recordingPath(game, 'wordKey');
      const sentenceRecording = sentences ? recordingPath(game, 'sentKey') : wordRecording;
      for (const set of sets(game)) {
        for (const row of parts(set.get(sentences ? 'items' : 'words'), '[')) {
          const [word, picture] = parts(row, '[').map(literal);
          entry(game, 'en', word, picture, [sentenceRecording(word)]);
          if (sentences) {
            for (const card of word.split(' ')) {
              entry(game, 'en', card, '', [wordRecording(card)]);
            }
          }
        }
      }
      break;
    }
    case 'first-letter':
    case 'build-a-word':
    case 'wizard-spell':
      for (const [lang, list] of fields(declaration(game, 'WORDS'))) {
        for (const row of parts(list, '[')) {
          if (game.id === 'first-letter') {
            const [, word, picture] = parts(row, '[').map(literal);
            entry(game, lang, word, picture);
          } else {
            const item = fields(row);
            entry(game, lang, literal(item.get('word')), literal(item.get('emoji')));
          }
        }
      }
      break;
    case 'final-letters':
      for (const row of parts(declaration(game, 'WORDS'), '[')) {
        const [word, picture] = parts(row, '[').map(literal);
        entry(game, 'he', word, picture);
      }
      break;
    case 'castle-shadows': {
      const pictures = fields(declaration(game, 'ITEMS'));
      const items = sets(game).flatMap((set) => {
        if (set.has('groups')) return parts(set.get('groups'), '[').flatMap(strings);
        if (set.get('pool').join('') === 'Object.keys(ITEMS)') return [...pictures.keys()];
        return strings(set.get('pool'));
      });
      unique(items).forEach((word) => named(game, word, literal(pictures.get(word)), `item-${word}`));
      break;
    }
    case 'alefbet-dots': {
      const pictures = fields(declaration(game, 'PICS'));
      for (const word of unique(sets(game).flatMap((set) => strings(set.get('pics'))))) {
        const points = pictures.get(word);
        named(game, word, points && fields(points).has('pts') ? 'drawn' : '', `pic-${word}`);
      }
      break;
    }
    case 'animal-sounds':
    case 'piano-pets': {
      const calls = game.id === 'animal-sounds';
      const animals = parts(declaration(game, calls ? 'ANIMALS' : 'KEYS'), '[').map(fields);
      const animalIds = animals.map((animal) => literal(animal.get(calls ? 'id' : 'en')));
      const ids = calls
        ? unique(sets(game).flatMap((set) => {
          const selection = set.get('animals');
          return selection.join('') === 'ANIMALS.map((a)=>a.id)' ? animalIds : strings(selection);
        }))
        : animalIds;
      for (const id of ids) {
        const picture = literal(animals[animalIds.indexOf(id)]?.get('emoji'));
        const sound = animalSample(game, id);
        if (calls) named(game, id, picture, `animal-${id}`, [sound]);
        else entry(game, 'en', id, picture, [sound]);
      }
      break;
    }
    case 'castle-builder': {
      const icons = fields(declaration(game, 'ICON'));
      for (const shape of unique(sets(game).flatMap((set) => strings(set.get('tray'))))) {
        named(game, shape, icons.has(shape) ? 'drawn' : '', `shape-${shape}`);
      }
      break;
    }
    case 'color-lab':
    case 'unicorn-rainbow': {
      const paint = fields(declaration(game, 'PAINT'));
      const colors = game.id === 'color-lab' ? sets(game).flatMap((set) => strings(set.get('targets'))) : [...paint.keys()];
      for (const color of unique(colors)) named(game, color, paint.has(color) ? 'drawn' : '', `color-${color}`);
      break;
    }
    default:
      if (/(?:\bconst WORDS\s*=|\bwords\s*:\s*\[\s*\[)/.test(game.source)) {
        issue(game, 'Unsupported word list', 'add its content format to vocabulary()');
      }
  }
}

// Direct paths in runtime code, HTML and CSS. Dynamic paths are expanded
// from their runtime lists below, without using the inventory as a whitelist.
const assetPath = /(?:\.\.\/)*\/?assets\/[\w./-]+/g;
function directFiles(game, source, from = '.') {
  for (const match of source.matchAll(assetPath)) {
    const file = match[0];
    if (mediaExt(file)) useFile(game, file.startsWith('/') ? file.slice(1) : path.posix.join(from, file));
  }
}

function worldFiles(game) {
  const art = literal(declaration(game, 'ART').slice(0, 1));
  const ww = game.id === 'whispering-woods';
  const values = (name) => strings(declaration(game, name));
  const substitutions = ww ? {
    sp: values('SPECIES'), kind: values('SPECIES'), 'round.kind': values('SPECIES'),
    cv: values('COVERS'), coverType: values('COVERS'),
    p: values('GIRL_POSES'), girlPose: values('GIRL_POSES'), pose: ['hidden', 'found', 'happy'],
  } : {
    'item.size': values('SIZES'), 'item.shape': values('SHAPES'),
    'bear.pose': unique([...game.source.matchAll(/\b(?:bear\.pose\s*=|pose:)\s*['"]([a-z]+)['"]/g)].map(([, pose]) => pose)),
  };
  const templates = /\$\{ART\}((?:[\w.-]|\$\{[\w.]+\})+\.(?:png|jpg|webp))/g;
  const expand = (name) => {
    const slot = name.match(/\$\{([\w.]+)\}/);
    if (!slot) return [name];
    const choices = substitutions[slot[1]];
    if (!choices?.length) throw new Error(`Unknown asset template in ${game.id}: ${name}`);
    return choices.flatMap((value) => expand(name.replace(slot[0], value)));
  };
  for (const [, template] of game.source.matchAll(templates)) {
    expand(template).forEach((file) => useFile(game, art + file));
  }
  if (ww) {
    for (const [, word, count] of game.source.matchAll(/\{\s*kind:\s*'([\w-]+)',\s*count:\s*(\d+),\s*neighborCount:/g)) {
      for (const lang of languages) {
        entry(game, lang, word, art + `${word}-found.png`, [voiceFile(lang, `ww-find-${count}-${word}`)], `en/${word}`);
      }
    }
  } else {
    for (const [, file] of game.source.matchAll(/['"]([\w-]+\.(?:png|jpg|webp))['"]/g)) useFile(game, art + file);
    for (const [type, values] of [['size', substitutions['item.size']], ['shape', substitutions['item.shape']]]) {
      for (const word of values) named(game, word, art + `stone-${word}.png`, `sc-${type}-${word}`);
    }
    // Counts share a base stone while the dots are drawn separately.
    for (const count of range(1, 4)) named(game, String(count), 'drawn', `sc-count-${count}`);
  }
}

// The recording ledger supplies candidates for literal prompt keys. A ledger
// entry by itself does not make a file used.
const ledger = Object.keys(JSON.parse(read('assets/voice/recorded.json')));
const keysByLanguage = new Map();
for (const [lang, key] of ledger.map((id) => id.split('/'))) {
  if (!keysByLanguage.has(key)) keysByLanguage.set(key, new Set());
  keysByLanguage.get(key).add(lang);
}
const lines = { id: 'Voice lines', source: read('assets/voice-lines.js') };
for (const lang of languages) {
  const blocks = new RegExp(`(?:const ${lang}\\s*=|Object\\.assign\\(${lang},)\\s*\\{([\\s\\S]*?)^  \\}`, 'gm');
  for (const [, block] of lines.source.matchAll(blocks)) {
    for (const [, key] of block.matchAll(/['"]([a-z0-9-]+)['"]\s*:/g)) {
      if (!keysByLanguage.has(key)) keysByLanguage.set(key, new Set());
      keysByLanguage.get(key).add(lang);
    }
  }
}

function prompts(game, source) {
  for (const token of unique(tokens(source))) {
    if (!/^['"]/.test(token)) continue;
    const key = literal([token]);
    for (const lang of keysByLanguage.get(key) ?? []) useFile(game, voiceFile(lang, key));
  }
}

function dynamicPrompts(game, keys, langs = languages) {
  keys.forEach((key) => langs.forEach((lang) => useFile(game, voiceFile(lang, key))));
}

const ready = new Set([...read('assets/catalog.js').matchAll(/^    id: '([^']+)',(?:(?!^  \},)[\s\S])*?^    status: 'ready'/gm)].map(([, id]) => id));
if (!ready.size) throw new Error('No ready games found in the catalog');
for (const file of filesIn('games').filter((file) => file.endsWith('.js'))) {
  const id = path.posix.basename(file, '.js');
  games.set(id, { id, entries: new Set(), missing: new Set(), collisions: new Set() });
  const game = games.get(id);
  game.source = read(file);
  try {
    vocabulary(game);
    directFiles(game, game.source.replace(/\/\*[\s\S]*?\*\//g, ''));
    prompts(game, game.source);
    if (id === 'whispering-woods' || id === 'stream-crossing') worldFiles(game);
  } catch (error) {
    issue(game, 'Could not audit source', error.message);
  }
}
for (const id of ready) {
  if (!games.has(id)) {
    const game = { id, entries: new Set(), missing: new Set(), collisions: new Set() };
    games.set(id, game);
    issue(game, 'Missing module', `games/${id}.js`);
  }
}

// Shared letters and numbers, and prompts composed from each game's choices.
const letters = [...fields(declaration(lines, 'HE_LETTERS')).values()].map((value) => `letter-${strings(value)[0]}`);
dynamicPrompts(shared, letters, ['he']);
dynamicPrompts(shared, [...fields(declaration(lines, 'EN_LETTERS')).keys()].map((ch) => `letter-${ch.toLowerCase()}`), ['en']);
dynamicPrompts(shared, [...range(0, 20), 30, 40].map((n) => `num-${n}`));
dynamicPrompts(shared, range(1, 4).map((n) => `praise-${n}`));
const candles = games.get('birthday-candles');
dynamicPrompts(candles, range(1, Math.max(...sets(candles).map((set) => Number(set.get('max')[0])))).map((n) => `candles-${n}`));
const comparisons = games.get('more-or-less');
dynamicPrompts(comparisons, sets(comparisons).map((set) => `${literal(set.get('mode'))}-ask`));
const makeTen = games.get('make-ten');
dynamicPrompts(makeTen, sets(makeTen).filter((set) => literal(set.get('mode')) === 'make')
  .map((set) => `ten-ask-${set.get('whole')[0]}`));
dynamicPrompts(games.get('number-line'), [2, 3, 4, 5, 10].flatMap((size) =>
  range(3, size >= 5 ? 4 : 5).map((hops) => `nl-skip-${size}-${hops}`)));
const dress = games.get('princess-dress');
dynamicPrompts(dress, [...fields(declaration(dress, 'COLOURS')).keys()].flatMap((color) =>
  ['dress', 'gem', 'shoes'].map((item) => `${item}-${color}`)));
const pizza = games.get('pizza-shop');
dynamicPrompts(pizza, strings(declaration(pizza, 'ORDERABLE')).flatMap((topping) =>
  range(1, Math.max(...sets(pizza).map((set) => Number(set.get('max')[0])))).map((n) => `pizza-${topping}-${n}`)));

const runtimeFiles = [
  ...readdirSync(root).filter((file) => file.endsWith('.html')),
  ...filesIn('assets').filter((file) => /\.(?:js|css)$/.test(file) && file !== 'assets/voice-lines.js'),
];
for (const file of runtimeFiles) {
  const source = read(file);
  directFiles(shared, source);
  prompts(shared, source);
}

const collisions = [];
for (const [file, uses] of filesUsed) {
  if (uses.size < 2) continue;
  collisions.push(`${file}: ${[...uses.keys()].join(', ')}`);
  for (const game of [...uses.values()].flatMap((owners) => [...owners])) game.collisions.add(file);
}
const unused = [...inventory].filter((file) => !filesUsed.has(file));

console.log('Game                      Content   Gaps   Reused');
for (const game of [...games.values(), shared]) {
  const cells = [game.entries.size || '-', game.missing.size, game.collisions.size];
  console.log(`${game.id.padEnd(25)} ${String(cells[0]).padStart(7)} ${String(cells[1]).padStart(6)} ${String(cells[2]).padStart(8)}`);
}
function printDetails(title, details) {
  if (details.length) console.log(`\n${title}\n  ${details.sort().join('\n  ')}`);
}
printDetails('Picture and sound gaps', [...gaps].map(([detail, owners]) => `${detail} (${[...owners].join(', ')})`));
printDetails('Files shared by different words', collisions);
printDetails('Files without a runtime reference (includes retained design art)', unused);
console.log(`\n${games.size} games. ${gaps.size} gaps, ${collisions.length} files shared by different words, ${unused.length} unused media files.`);
// Words still waiting for a recording or picture are listed, not failed: voices
// are added last on purpose. A push is blocked only by things that are broken.
const REPORT_ONLY = ['No recording assigned: ', 'No picture assigned: '];
const broken = [...gaps.keys()].filter((key) => !REPORT_ONLY.some((p) => key.startsWith(p)));
if (broken.length || collisions.length) process.exitCode = 1;
console.log(broken.length || collisions.length
  ? `FAIL: ${broken.length} broken references, ${collisions.length} shared files.`
  : 'OK: no broken media references (missing recordings/pictures and unused files are listed for information).');
