import React from 'react';
import ReactDOM from 'react-dom/client';
import Routing from './Routing';
window.addEventListener("error", (e) => {
  if (e.message && e.message.includes("ResizeObserver loop")) {
    e.stopImmediatePropagation();
  }
});


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Routing />

  </React.StrictMode>
);


