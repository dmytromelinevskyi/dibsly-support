import { build } from 'vite';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
await build();
const template = await readFile('dist/index.html', 'utf8');
await build({
  build: {
    ssr: 'src/app/entry-server.jsx',
    outDir: '.build/server',
    emptyOutDir: true,
    manifest: false,
    copyPublicDir: false,
  },
});
const { render } = await import(pathToFileURL(resolve('.build/server/entry-server.js')).href);
const routes = JSON.parse(await readFile('src/content/routes.json', 'utf8'));
const manifest = JSON.parse(await readFile('dist/.vite/manifest.json', 'utf8'));
const collectCSS = (key, visited = new Set()) => {
  if (visited.has(key)) return [];
  visited.add(key);
  const item = manifest[key];
  if (!item) return [];
  return [...(item.css || []), ...(item.imports || []).flatMap((key) => collectCSS(key, visited))];
};
for (const route of Object.keys(routes)) {
  const { html, head, lang } = await render(route);
  const pageKey =
    route === 'index.html' || route === 'en.html'
      ? 'src/pages/LandingPage.jsx'
      : route === 'split.html'
        ? 'src/pages/SplitPage.jsx'
        : 'src/pages/DocumentPage.jsx';
  const styles = [...new Set(collectCSS(pageKey))]
    .map((file) => `<link rel="stylesheet" href="./${file}">`)
    .join('\n');
  const preload = manifest[pageKey]
    ? `<link rel="modulepreload" href="./${manifest[pageKey].file}">`
    : '';
  let output = template
    .replace('<html lang="uk">', `<html lang="${lang}">`)
    .replace(
      '<!--page-head-->',
      head.replace(/<meta name="theme-color"[^>]*>/g, '') + '\n' + styles + '\n' + preload
    )
    .replace('<div id="root">', '<div id="root" data-prerendered="true">')
    .replace('<!--app-html-->', html);
  await writeFile(`dist/${route}`, output);
}
console.log(`Prerendered ${Object.keys(routes).length} React pages.`);
await rm('.build', { recursive: true, force: true });
