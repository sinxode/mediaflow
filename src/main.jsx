import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.scss'

// Auto-recover from chunk/lazy-loading 404s after new builds are deployed
// Captures script and link load failures at the browser level before React crashes
window.addEventListener('error', (event) => {
  const target = event.target;
  if (target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
    const url = target.src || target.href || '';
    if (url && (url.includes('/assets/') || url.includes('.js') || url.includes('.css'))) {
      console.warn('Production asset failed to load (404):', url, 'Force-reloading page to fetch latest build...');
      window.location.reload();
    }
  }
}, true); // useCapture=true is critical since resource load errors do not bubble

window.addEventListener('unhandledrejection', (event) => {
  const msg = event.reason?.message || '';
  if (
    /failed to fetch dynamically imported module/i.test(msg) ||
    /importing a module script failed/i.test(msg) ||
    /loading chunk/i.test(msg)
  ) {
    console.warn('Unhandled chunk rejection. Reloading page...');
    window.location.reload();
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
