import { readFile, readdir, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
const root = resolve('dist'),
  failures = [],
  pages = (await readdir(root)).filter((name) => name.endsWith('.html'));
const expected = JSON.parse(await readFile('src/content/routes.json', 'utf8'));
for (const route of Object.keys(expected))
  if (!pages.includes(route)) failures.push(`Missing route ${route}`);
for (const name of pages) {
  const html = await readFile(resolve(root, name), 'utf8');
  if (!html.includes('data-prerendered="true"')) failures.push(`${name}: missing React prerender`);
  if (/<!--(?:app-html|page-head)-->|\{\{[\w-]+\}\}/.test(html))
    failures.push(`${name}: unrendered template`);
  for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
    const value = match[1];
    if (/^(https?:|mailto:|tel:|data:|javascript:|#)/.test(value)) continue;
    const [path, hash] = value.split('#'),
      file = path.split('?')[0];
    if (!file) continue;
    let target = resolve(dirname(resolve(root, name)), file.replace(/^\//, ''));
    if (file.endsWith('/')) target = resolve(target, 'index.html');
    try {
      await access(target);
      if (hash && file.endsWith('.html')) {
        const linked = await readFile(target, 'utf8');
        if (!linked.includes(`id="${hash}"`)) failures.push(`${name}: missing anchor ${value}`);
      }
    } catch {
      failures.push(`${name}: missing ${file}`);
    }
  }
}
const captures = JSON.parse(await readFile('src/content/captures.json', 'utf8')),
  frames = new Set();
for (const lang of ['uk', 'en'])
  for (const [id, sequence] of Object.entries(captures.languages[lang])) {
    if (!sequence.source.startsWith('native-'))
      failures.push(`${lang}/${id}: stale capture source`);
    for (const frame of sequence.frames) frames.add(frame);
  }
await Promise.all(
  [...frames].map(async (frame) => {
    try {
      await access(resolve(root, frame));
    } catch {
      failures.push(`Missing native frame ${frame}`);
    }
  })
);
const films = JSON.parse(await readFile('src/content/films.json', 'utf8'));
let filmCount = 0;
for (const lang of ['uk', 'en'])
  for (const [id, film] of Object.entries(films.languages[lang])) {
    filmCount++;
    try {
      await access(resolve(root, film.src));
    } catch {
      failures.push(`Missing native film ${lang}/${id}`);
    }
    for (const step of film.steps)
      if (
        step.press <= step.start ||
        step.transition <= step.press ||
        step.settle <= step.transition ||
        step.end <= step.settle
      )
        failures.push(`Invalid causal timing ${lang}/${id}`);
  }
for (const forbidden of ['src', 'server', 'content', 'node_modules', '.git', '.build']) {
  try {
    await access(resolve(root, forbidden));
    failures.push(`Private source directory in public output: ${forbidden}`);
  } catch {}
}
if (failures.length) {
  console.error([...new Set(failures)].join('\n'));
  process.exitCode = 1;
} else
  console.log(
    `Checked ${pages.length} React routes, ${frames.size} native frames, ${filmCount} native films, links and public output.`
  );
