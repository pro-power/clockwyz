// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import only the comprehensive CSS file
import './styles/clockwyz-complete.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);