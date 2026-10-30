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
    `Checked ${pages.length} React routes, their links and images, and the public output.`
  );
