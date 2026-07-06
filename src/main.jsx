import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.scss'

// Auto-recover from chunk/lazy-loading 404s after new builds are deployed
const handleChunkError = (msg) => {
  if (
    /failed to fetch dynamically imported module/i.test(msg) ||
    /importing a module script failed/i.test(msg) ||
    /loading chunk/i.test(msg)
  ) {
    console.warn('Dynamic import chunk load error detected. Reloading page to fetch latest version...');
    window.location.reload();
  }
};

window.addEventListener('unhandledrejection', (event) => {
  handleChunkError(event.reason?.message || '');
});

window.addEventListener('error', (event) => {
  handleChunkError(event.message || '');
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
