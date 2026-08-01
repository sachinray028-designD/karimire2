import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { hydrateRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const root = document.getElementById('root')!;
const hasSSGContent = root.innerHTML.trim().length > 0 && window.__SSG_DATA__;

if (hasSSGContent) {
  hydrateRoot(
    root,
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
