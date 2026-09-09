import React, { useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';
import { cn } from '../../utils/cn';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  iconOnly?: boolean;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  iconOnly = false,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-flex items-center group uppercase font-mono font-bold">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className={cn('inline-flex items-center cursor-help', className)}
      >
        {children ? (
          children
        ) : iconOnly ? (
          <HelpCircle className="w-3.5 h-3.5 text-terminal-muted hover:text-terminal-primary transition-none" />
        ) : (
          <Info className="w-3.5 h-3.5 text-terminal-primary" />
        )}
      </div>

      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 p-2.5 rounded-none bg-background border border-terminal-primary text-xs text-terminal-primary shadow-none pointer-events-none transition-none">
          <div className="leading-relaxed">{content}</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-terminal-primary" />
        </div>
      )}
    </div>
  );
};
