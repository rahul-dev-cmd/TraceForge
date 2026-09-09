import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { GlobalSearchModal } from './GlobalSearchModal';
import { FloatingCopilot } from './FloatingCopilot';

export const AppLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('All Blockchains');

  return (
    <>
      <div className="min-h-screen bg-background text-terminal-primary flex flex-row selection:bg-terminal-primary selection:text-background relative">
        <div className="crt-overlay"></div>
        
        {/* Persistent Left Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden relative z-10">
          {/* Persistent Top Navigation Bar */}
          <TopNav
            onOpenSearch={() => setIsSearchOpen(true)}
            selectedNetwork={selectedNetwork}
            onSelectNetwork={setSelectedNetwork}
          />

          {/* Dynamic Page Router Outlet */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
            <Outlet context={{ selectedNetwork }} />
          </main>
        </div>

        {/* Global Forensic Omnibox Modal */}
        <GlobalSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
      </div>
      
      {/* Global Floating AI Forensic Copilot Drawer */}
      <FloatingCopilot />
    </>
  );
};
