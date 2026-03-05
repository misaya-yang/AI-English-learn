import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.tsx'

if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    const key = 'vite-preload-reload-once';
    const hasReloaded = sessionStorage.getItem(key) === '1';
    if (hasReloaded) {
      sessionStorage.removeItem(key);
      return;
    }
    sessionStorage.setItem(key, '1');
    window.location.reload();
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
