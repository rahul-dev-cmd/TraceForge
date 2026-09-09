import React from 'react';
import { RiskLevel } from '../../types/investigation';
import { getRiskLevelStyles } from '../../utils/formatters';
import { cn } from '../../utils/cn';

interface RiskBadgeProps {
  level: RiskLevel | undefined;
  score?: number;
  showDot?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level = 'INFO',
  score,
  showDot = true,
  className,
  size = 'md',
}) => {
  // Override styles to use terminal equivalents
  const terminalStyles: Record<string, string> = {
    CRITICAL: 'bg-background text-terminal-error border-terminal-error',
    HIGH: 'bg-background text-terminal-secondary border-terminal-secondary',
    MEDIUM: 'bg-background text-terminal-primary border-terminal-primary',
    LOW: 'bg-background text-terminal-primary border-terminal-primary',
    INFO: 'bg-background text-terminal-primary border-terminal-primary',
  };

  const terminalDots: Record<string, string> = {
    CRITICAL: 'bg-terminal-error animate-blink',
    HIGH: 'bg-terminal-secondary animate-blink',
    MEDIUM: 'bg-terminal-primary animate-blink',
    LOW: 'bg-terminal-primary',
    INFO: 'bg-terminal-primary',
  };

  const badgeStyle = terminalStyles[level] || terminalStyles.INFO;
  const dotStyle = terminalDots[level] || terminalDots.INFO;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-[11px] px-2.5 py-1',
    lg: 'text-xs px-3.5 py-1.5 font-bold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-none border font-bold uppercase tracking-wider',
        badgeStyle,
        sizeClasses[size],
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-none shrink-0',
            dotStyle
          )}
        />
      )}
      <span>[{level}]</span>
      {score !== undefined && (
        <span className="border-l border-terminal-muted pl-1.5 ml-0.5">
          {score}
        </span>
      )}
    </span>
  );
};
