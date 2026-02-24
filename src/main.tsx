import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

const basePath = (import.meta.env.VITE_BASE_PATH || '/soap-note-web-app/').replace(/\/$/, '') || '/soap-note-web-app';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basePath}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
