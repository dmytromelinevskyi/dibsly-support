import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { routeFromPath } from '../src/app/route-path.js';
test('all 13 public pages resolve through their original URL and Cloudflare clean alias', async () => {
  const routes = JSON.parse(await readFile(new URL('../src/content/routes.json', import.meta.url)));
  assert.equal(routeFromPath('/'), 'index.html');
  for (const route of Object.keys(routes)) {
    assert.equal(routeFromPath('/' + route), route);
    assert.equal(routeFromPath('/' + route.replace('.html', '')), route);
  }
});
test('current short receipt links hydrate the receipt page', () => {
  for (const path of ['/s/abc123', '/s/ABCD/', '/s/123456789ABC'])
    assert.equal(routeFromPath(path), 'split.html');
});
