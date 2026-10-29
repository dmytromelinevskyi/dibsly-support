import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import ffmpeg from '@ffmpeg-installer/ffmpeg';
import sharp from 'sharp';
import { edits } from '../../content/cinema/edits.mjs';
const root = resolve('.'),
  raw = resolve('.qa/capture-sources'),
  work = resolve('.qa/film-build');
const captures = JSON.parse(await readFile('src/content/captures.json'));
const only = process.argv[2];
const result = only
  ? JSON.parse(await readFile('src/content/films.json'))
  : { schema: 1, fps: 30, languages: { uk: {}, en: {} } };
const run = (args) =>
  new Promise((done, reject) => {
    const p = spawn(ffmpeg.path, ['-hide_banner', '-loglevel', 'error', '-y', ...args]);
    let error = '';
    p.stderr.on('data', (d) => (error += d));
    p.on('error', reject);
    p.on('close', (code) => (code ? reject(Error(error)) : done()));
  });
for (const lang of ['uk', 'en'])
  for (const [id, beats] of Object.entries(edits[lang])) {
    if (only && only !== `${lang}/${id}`) continue;
    const sequence = captures.languages[lang][id],
      frames = [...new Set(sequence.frames)];
    const meta = JSON.parse(await readFile(`content/captures/${lang}-${id}.json`));
    const folder = `${work}/${lang}-${id}`;
    await rm(folder, { recursive: true, force: true });
    await mkdir(folder, { recursive: true });
    const entries = [],
      steps = [];
    let time = 0;
    const append = (file, duration) => {
      entries.push({ file, duration });
      time += duration;
    };
    async function still(index) {
      const file = `${folder}/still-${index}.png`;
      await sharp(`public/${frames[index]}`).resize(640, 1392).png().toFile(file);
      return file;
    }
    for (let n = 0; n < beats.length; n++) {
      const beat = beats[n];
      if (beat.to >= frames.length) throw Error(`${lang}/${id}: frame bounds`);
      const before = await still(beat.from),
        after = await still(beat.to);
      const start = time;
      append(before, 1.4);
      const press = time;
      append(before, 0.45);
      const transition = time;
      // Keep every native frame from the original video inside each actual transition. Omit idle gaps.
      let groupStart = beat.from;
      const groups = [];
      for (let index = beat.from + 1; index <= beat.to; index++) {
        if (meta.sourceFrames[index] - meta.sourceFrames[index - 1] > 0.24) {
          if (index - 1 > groupStart) groups.push([groupStart, index - 1]);
          groupStart = index;
        }
      }
      if (beat.to >= groupStart) groups.push([groupStart, beat.to]);
      let segment = 0;
      for (const [a, b] of groups) {
        const first = Math.max(0, meta.sourceFrames[a] - 0.045),
          last = meta.sourceFrames[b] + 0.055;
        const target = `${folder}/motion-${n}-${segment++}`;
        await mkdir(target, { recursive: true });
        await run([
          '-ss',
          String(first),
          '-i',
          `${raw}/${lang}/${id}.mp4`,
          '-t',
          String(Math.min(3, last - first)),
          '-vf',
          'scale=640:1392:flags=lanczos,fps=30',
          '-vsync',
          '0',
          `${target}/%04d.png`,
        ]);
        let files = (await readdir(target)).sort();
        // Some simulator recordings have sparse keyframes: decode from the beginning if input seeking yields no frame.
        if (!files.length) {
          await run([
            '-i',
            `${raw}/${lang}/${id}.mp4`,
            '-ss',
            String(first),
            '-t',
            String(Math.min(3, last - first)),
            '-vf',
            'scale=640:1392:flags=lanczos,fps=30',
            '-vsync',
            '0',
            `${target}/%04d.png`,
          ]);
          files = (await readdir(target)).sort();
        }
        if (!files.length) throw Error(`${lang}/${id}: empty native interval ${a}..${b}`);
        for (const file of files) append(`${target}/${file}`, 1.3 / 30);
      }
      const settle = time;
      append(after, 1.5);
      steps.push({
        start,
        press,
        transition,
        settle,
        end: time,
        target: beat.target,
        ...(beat.watch ? { watch: true } : {}),
        control: beat.control[lang],
        description: beat.description[lang],
        before: frames[beat.from],
        after: frames[beat.to],
      });
    }
    append(entries.at(-1).file, 1.1);
    const list =
      entries.map((item) => `file '${item.file}'\nduration ${item.duration}`).join('\n') +
      `\nfile '${entries.at(-1).file}'\n`;
    await writeFile(`${folder}/concat.txt`, list);
    const output = `public/assets/cinema/${lang}/films`;
    await mkdir(output, { recursive: true });
    await run([
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      `${folder}/concat.txt`,
      '-vf',
      'fps=30,format=yuv420p',
      '-c:v',
      'libx264',
      '-preset',
      'fast',
      '-crf',
      '23',
      // A key frame a second: films play through (2026-10-29), the short GOP was for seeking on every scroll.
      '-g',
      '30',
      '-keyint_min',
      '30',
      '-sc_threshold',
      '0',
      '-bf',
      '0',
      '-movflags',
      '+faststart',
      '-an',
      `${output}/${id}.mp4`,
    ]);
    result.languages[lang][id] = {
      src: `assets/cinema/${lang}/films/${id}.mp4`,
      duration: time,
      poster: steps[0].before,
      steps,
      source: 'native-ios-edited-film',
    };
    console.log(`${lang}/${id}: ${time.toFixed(1)}s, ${steps.length} visible taps`, true);
    await rm(folder, { recursive: true, force: true });
  }
await writeFile('src/content/films.json', JSON.stringify(result, null, 2) + '\n');
console.log('All native films built.');
