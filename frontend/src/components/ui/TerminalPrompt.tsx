import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface TerminalPromptProps {
  prompt?: string;
  className?: string;
  children?: React.ReactNode;
}

export const TerminalPrompt: React.FC<TerminalPromptProps> = ({ 
  prompt = 'user@sys:~$', 
  className, 
  children 
}) => {
  return (
    <div className={twMerge('flex items-center gap-2 text-terminal-primary', className)}>
      <span className="shrink-0">{prompt}</span>
      <div className="flex-1 flex items-center gap-1">
        {children}
        <span className="animate-blink block w-2.5 h-5 bg-terminal-primary"></span>
      </div>
    </div>
  );
};
