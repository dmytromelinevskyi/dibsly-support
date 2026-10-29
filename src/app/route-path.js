/** Cloudflare serves both public .html URLs and their clean aliases. */
export function routeFromPath(pathname = '/') {
  if (/^\/s\/[A-Za-z0-9]{4,12}\/?$/.test(pathname)) return 'split.html';
  const name = pathname.split('/').filter(Boolean).at(-1) || 'index.html';
  return name.includes('.') ? name : `${name}.html`;
}
