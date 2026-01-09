import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Calendar, Layout, LogOut, ChevronLeft, ChevronRight, Plus, Trash2, CheckCircle2 } from 'lucide-react';

// NOTE: In a real project with a bundler, you would install lucide-react. 
// Since this is a single-file logical output (for the purpose of the prompt), 
// we assume standard imports work. If using a raw HTML environment without a bundler like Vite/CRA, 
// you might need a different icon strategy or import maps.
// For this standard React 18 + TS setup, these imports assume a `package.json` with `lucide-react`.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
