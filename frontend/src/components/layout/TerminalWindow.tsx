import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface TerminalWindowProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const TerminalWindow: React.FC<TerminalWindowProps> = ({ children, title, className }) => {
  return (
    <div className={twMerge('border border-terminal-muted bg-background flex flex-col', className)}>
      {title && (
        <div className="border-b border-terminal-muted px-2 py-1 text-terminal-primary flex items-center justify-between uppercase">
          <span>+--- {title} ---+</span>
          <span>[OK]</span>
        </div>
      )}
      <div className="flex-1 p-4 overflow-hidden relative">
        {children}
      </div>
    </div>
  );
};
