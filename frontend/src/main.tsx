import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/styles/index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Failed to find the root element. Make sure you have a <div id='root'> in your public/index.html file.");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);