export { routeFromPath } from './route-path.js';
const documents = import.meta.glob('../content/documents/*.json');
export async function loadRoute(route) {
  if (route === 'index.html' || route === 'en.html') {
    const lang = route === 'index.html' ? 'uk' : 'en';
    const [page, content] = await Promise.all([
      import('../pages/LandingPage.jsx'),
      lang === 'uk' ? import('../content/landing/uk.json') : import('../content/landing/en.json'),
    ]);
    return { Component: page.default, data: content.default };
  }
  const name = route.replace(/\.html$/, '');
  const loader = documents[`../content/documents/${name}.json`];
  if (!loader) return loadRoute('index.html');
  const [page, content] = await Promise.all([
    route === 'split.html' ? import('../pages/SplitPage.jsx') : import('../pages/DocumentPage.jsx'),
    loader(),
  ]);
  return { Component: page.default, data: content.default };
}
