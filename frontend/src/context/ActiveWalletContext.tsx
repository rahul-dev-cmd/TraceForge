import React, { createContext, useContext, useState, useEffect } from 'react';

interface ActiveWalletContextType {
  activeWallet: string | null;
  setActiveWallet: (address: string | null) => void;
}

const ActiveWalletContext = createContext<ActiveWalletContextType>({
  activeWallet: null,
  setActiveWallet: () => {},
});

const STORAGE_KEY = 'traceforge_active_wallet';

export const ActiveWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeWallet, setActiveWalletState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  const setActiveWallet = (address: string | null) => {
    const cleanAddress = address ? address.trim().toLowerCase() : null;
    setActiveWalletState(cleanAddress);
    try {
      if (cleanAddress) {
        localStorage.setItem(STORAGE_KEY, cleanAddress);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Could not persist active wallet to localStorage:', e);
    }
  };

  return (
    <ActiveWalletContext.Provider value={{ activeWallet, setActiveWallet }}>
      {children}
    </ActiveWalletContext.Provider>
  );
};

export const useActiveWallet = (): ActiveWalletContextType => {
  const context = useContext(ActiveWalletContext);
  if (!context) {
    throw new Error('useActiveWallet must be used within an ActiveWalletProvider');
  }
  return context;
};
