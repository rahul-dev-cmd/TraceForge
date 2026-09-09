import React from 'react';
import { cn } from '../../utils/cn';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'TRACING ON-CHAIN HEURISTICS...',
  size = 'md',
  className,
}) => {
  const sizeMap = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-2',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center uppercase font-mono font-bold', className)}>
      <div className="relative flex items-center justify-center mb-4">
        {/* Outer square */}
        <div
          className={cn(
            'rounded-none border-terminal-muted border-t-terminal-primary animate-spin',
            sizeMap[size]
          )}
        />
        {/* Inner square */}
        <div className="absolute w-2 h-2 rounded-none bg-terminal-primary animate-ping" />
      </div>

      {label && (
        <p className="text-xs text-terminal-primary animate-pulse tracking-widest">
          {label}
        </p>
      )}
    </div>
  );
};
