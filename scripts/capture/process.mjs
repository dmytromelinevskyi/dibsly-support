/** Extract actual native motion, dropping inactive recording time rather than inventing UI transitions. */
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import ffmpeg from '@ffmpeg-installer/ffmpeg';
import sharp from 'sharp';
const raw = resolve(process.env.DIBSLY_CAPTURE_DIR || '.qa/capture-sources');
const lang = process.argv[2] || 'uk',
  ids = (process.argv[3] || 'auto,plus,ask,plan,invest,money,fop,analytics,together').split(',');
const output = resolve('public/assets/cinema', lang);
await mkdir(output, { recursive: true });
let part = {};
try {
  part = JSON.parse(await readFile(`content/captures/${lang}-sequences.json`));
} catch {}
for (const id of ids) {
  const meta = JSON.parse(await readFile(`${raw}/${lang}/${id}.record.json`));
  const events = JSON.parse(await readFile(`${raw}/${lang}/${id}.events.json`));
  const start = Math.max(0, events[0].time - meta.startedAt - 8),
    end = meta.endedAt - meta.startedAt;
  const folder = `${output}/${id}`,
    decoded = `${raw}/decoded-${lang}-${id}`;
  await mkdir(folder, { recursive: true });
  await rm(decoded, { recursive: true, force: true });
  await mkdir(decoded, { recursive: true });
  for (const file of await readdir(folder))
    if (file.endsWith('.webp')) await rm(`${folder}/${file}`);
  const args = [
    '-hide_banner',
    '-nostats',
    '-y',
    '-i',
    meta.video,
    '-vf',
    `fps=24,trim=start=${start}:end=${end},setpts=PTS-STARTPTS,scale=640:-2:flags=lanczos,mpdecimate=hi=900:lo=400:frac=0.2,showinfo`,
    '-vsync',
    'vfr',
    `${decoded}/%04d.png`,
  ];
  const log = await new Promise((done, reject) => {
    const p = spawn(ffmpeg.path, args);
    let log = '';
    p.stderr.on('data', (d) => (log += d));
    p.on('error', reject);
    p.on('close', (code) => (code ? reject(Error(log.slice(-4000))) : done(log)));
  });
  let times = [...log.matchAll(/\bn:\s*\d+\s+pts:\s*\d+\s+pts_time:([\d.]+)/g)].map(
    (m) => Number(m[1]) + start
  );
  const pngs = (await readdir(decoded)).filter((f) => f.endsWith('.png')).sort();
  for (let i = 0; i < pngs.length; i += 4)
    await Promise.all(
      pngs.slice(i, i + 4).map((file) =>
        sharp(`${decoded}/${file}`)
          .webp({ quality: 80, effort: 3 })
          .toFile(`${folder}/${file.replace('.png', '.webp')}`)
      )
    );
  let files = pngs.map((file) => file.replace('.png', '.webp'));
  // Roma's debts showcase opened late; a recording that starts on Main has no such capture to align to.
  if (id === 'money' && existsSync(`${raw}/${lang}/showcase/debts.png`)) {
    // A debug showcase may still be opening when recording starts. Begin at its real settled list.
    const reference = await sharp(`${raw}/${lang}/showcase/debts.png`)
      .resize(64, 140)
      .removeAlpha()
      .raw()
      .toBuffer();
    const scores = [];
    for (const file of files) {
      const pixels = await sharp(`${folder}/${file}`)
        .resize(64, 140)
        .removeAlpha()
        .raw()
        .toBuffer();
      let score = 0;
      for (let index = 0; index < pixels.length; index++)
        score += (pixels[index] - reference[index]) ** 2;
      scores.push(score / pixels.length);
    }
    const minimum = Math.min(...scores),
      first = scores.findIndex((score) => score <= minimum + 1);
    for (const file of files.slice(0, first)) await rm(`${folder}/${file}`);
    files = files.slice(first);
    times = times.slice(first);
  }
  await rm(decoded, { recursive: true, force: true });
  if (!files.length) throw Error(`No frames for ${lang}/${id}`);
  const frames = files.map((file) => `assets/cinema/${lang}/${id}/${file}`);
  // A little breathing room at every labelled action, still completely controlled by scroll.
  const expanded = [],
    sourceIndices = [];
  for (let i = 0; i < frames.length; i++) {
    sourceIndices.push(expanded.length);
    expanded.push(frames[i]);
    if (i === 0 || events.some((e) => Math.abs(e.time - meta.startedAt - (times[i] || 0)) < 0.025))
      for (let j = 0; j < 4; j++) expanded.push(frames[i]);
  }
  for (let i = 0; i < 10; i++) expanded.push(frames.at(-1));
  const actions = events.map((event) => {
    const found = times.findIndex((t) => t >= event.time - meta.startedAt - 0.15);
    const at = found < 0 ? times.length - 1 : found;
    const frame = sourceIndices[at] || 0;
    return { at: frame / Math.max(1, expanded.length - 1), frame, text: event.text };
  });
  actions[0].at = 0;
  actions[0].frame = 0;
  for (let index = 1; index < actions.length; index++)
    actions[index].at = Math.max(actions[index - 1].at + 0.01, Math.min(0.94, actions[index].at));
  part[id] = {
    poster: frames[0],
    frames: expanded,
    actions,
    source: 'native-simulator-recording',
    uniqueFrames: frames.length,
  };
  await writeFile(
    `content/captures/${lang}-${id}.json`,
    JSON.stringify(
      {
        sourceCommit: '5c497b974511d7ee9a37378f14711e219b8a7be6',
        device: 'iPhone 17 Pro / iOS 26.5',
        recorded: '2026-10-29',
        trim: { start, end },
        sourceFrames: times,
        actions: events,
      },
      null,
      2
    )
  );
  console.log(`${lang}/${id}: ${frames.length} native frames`, true);
}
await sharp(`${raw}/${lang}/main.png`)
  .resize(750)
  .webp({ quality: 88 })
  .toFile(`${output}/main.webp`);
part.hero = {
  poster: `assets/cinema/${lang}/main.webp`,
  frames: [`assets/cinema/${lang}/main.webp`],
  actions: [
    {
      at: 0,
      frame: 0,
      text:
        lang === 'uk'
          ? 'Справжній Dibsly. Гортай, щоб пройти всі дев’ять історій.'
          : 'The real Dibsly. Scroll to explore all nine stories.',
    },
  ],
  source: 'native-simulator-screenshot',
};
await writeFile(`content/captures/${lang}-sequences.json`, JSON.stringify(part, null, 2));
