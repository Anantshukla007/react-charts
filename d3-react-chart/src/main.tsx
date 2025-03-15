import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';  // Updated path
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
