#!/usr/bin/env node
/* Records every line in assets/voice-lines.js into assets/voice/<lang>/<key>.mp3.

   Mac only: it uses the system voices (Carmit for Hebrew, Samantha for
   English) through `say`, and ffmpeg (brew install ffmpeg) to make a small,
   level mp3. A line is re-recorded only when its text changed — the texts that
   were recorded are kept in assets/voice/recorded.json.

     node scripts/make-voice.mjs          # new and changed lines
     node scripts/make-voice.mjs --all    # everything again */

import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lines = createRequire(import.meta.url)(join(root, 'assets/voice-lines.js'));
const VOICES = { he: ['Carmit', '165'], en: ['Samantha', '165'] };
const out = join(root, 'assets/voice');
const ledgerPath = join(out, 'recorded.json');
const ledger = existsSync(ledgerPath) ? JSON.parse(readFileSync(ledgerPath, 'utf8')) : {};
const all = process.argv.includes('--all');

let made = 0;
for (const lang of ['he', 'en']) {
  mkdirSync(join(out, lang), { recursive: true });
  const [voice, rate] = VOICES[lang];
  for (const [key, text] of Object.entries(lines[lang])) {
    const id = `${lang}/${key}`;
    const file = join(out, lang, `${key}.mp3`);
    if (!all && ledger[id] === text && existsSync(file)) continue;
    const aiff = join(tmpdir(), `edvoice-${process.pid}.aiff`);
    execFileSync('say', ['-v', voice, '-r', rate, '-o', aiff, text]);
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', aiff, '-ac', '1', '-ar', '44100',
      '-af', 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,loudnorm=I=-16:TP=-1.5',
      '-c:a', 'libmp3lame', '-b:a', '64k', file]);
    rmSync(aiff, { force: true });
    ledger[id] = text;
    made += 1;
  }
}
writeFileSync(ledgerPath, `${JSON.stringify(ledger, null, 1)}\n`);
console.log(`recorded ${made} line(s)`);
