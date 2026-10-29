import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App.jsx';
import { loadRoute } from './routes.js';
export async function render(route) {
  const loaded = await loadRoute(route);
  return {
    html: renderToString(<App {...loaded} />),
    head: loaded.data.head,
    lang: loaded.data.lang,
  };
}
