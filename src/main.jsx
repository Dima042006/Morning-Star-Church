import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import { watchTypography } from './typography';

const rootEl = document.getElementById('root');
createRoot(rootEl).render(<App />);
requestAnimationFrame(() => watchTypography(rootEl));

// Прелоадер ховається, коли сторінка (разом із фото першого екрана) завантажилась,
// але не раніше ніж через 0,6 с і не пізніше ніж через 3 с.
const started = performance.now();
let done = false;
function hidePreloader() {
  if (done) return;
  done = true;
  const wait = Math.max(0, 600 - (performance.now() - started));
  setTimeout(() => {
    document.getElementById('preloader')?.classList.add('is-done');
    document.documentElement.classList.remove('is-loading');
    setTimeout(() => document.getElementById('preloader')?.remove(), 800);
  }, wait);
}
if (document.readyState === 'complete') hidePreloader();
else window.addEventListener('load', hidePreloader, { once: true });
setTimeout(hidePreloader, 3000);
