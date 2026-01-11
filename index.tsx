
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Debug logs to verify script execution
console.log('Application starting...');
console.log('Looking for root element...');

const rootElement = document.getElementById('root');

if (!rootElement) {
  const msg = 'FATAL: Could not find root element with id "root". Application cannot mount.';
  console.error(msg);
  document.body.innerHTML = `<div style="color:red; padding: 20px;">${msg}</div>`;
  throw new Error(msg);
}

console.log('Root element found. Creating React root...');

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('React application mounted successfully.');
} catch (error) {
  console.error('CRITICAL: Failed to mount React application:', error);
}
