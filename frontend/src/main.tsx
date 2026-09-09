import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ActiveWalletProvider } from './context/ActiveWalletContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ActiveWalletProvider>
        <App />
      </ActiveWalletProvider>
    </BrowserRouter>
  </React.StrictMode>
);
