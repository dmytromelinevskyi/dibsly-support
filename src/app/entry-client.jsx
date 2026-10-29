import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.jsx';
import { loadRoute, routeFromPath } from './routes.js';
const route = routeFromPath(location.pathname),
  loaded = await loadRoute(route);
const element = <App {...loaded} />;
document.documentElement.lang = loaded.data.lang;
const root = document.getElementById('root');
if (root.hasChildNodes() && root.dataset.prerendered === 'true') hydrateRoot(root, element);
else createRoot(root).render(element);
