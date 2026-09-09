import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { CopilotChat } from '../ai/CopilotChat';
import { useActiveWallet } from '../../context/ActiveWalletContext';

export const FloatingCopilot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { activeWallet } = useActiveWallet();

  const short = activeWallet ? `${activeWallet.slice(0, 6)}...${activeWallet.slice(-4)}` : null;

  return (
    <>
      {/* Floating Trigger Button in bottom right corner */}
      <div className="fixed bottom-6 right-6 z-40 uppercase font-mono font-bold">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-none bg-background text-terminal-primary shadow-none border border-terminal-primary hover:bg-terminal-primary hover:text-background transition-none group"
          title="Toggle Forensic AI Copilot"
        >
          <div className="w-5 h-5 rounded-none border border-transparent group-hover:border-background flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 group-hover:text-background text-terminal-primary animate-pulse" />
          </div>
          <span>[ AI FORENSIC COPILOT{short ? `: ${short}` : ''} ]</span>
          <span className={`w-2 h-2 rounded-none ${short ? 'bg-terminal-primary' : 'bg-terminal-error'} animate-blink ml-0.5`} />
        </button>
      </div>

      {/* Slide-out Drawer */}
      {isOpen && (
        <div className="fixed top-16 right-0 bottom-0 w-full sm:w-[460px] z-50 p-4 transition-none font-mono uppercase">
          <div className="relative h-full rounded-none border border-terminal-primary overflow-hidden bg-background flex flex-col">
            {/* Close Button Bar */}
            <div className="absolute top-3 right-3 z-20">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-none bg-background hover:bg-terminal-primary text-terminal-muted hover:text-background transition-none border border-terminal-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <CopilotChat address={activeWallet || undefined} className="h-full border-none rounded-none" />
          </div>
        </div>
      )}
    </>
  );
};
