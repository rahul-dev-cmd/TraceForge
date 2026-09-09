import React from 'react';
import { cn } from '../../utils/cn';

export const SkeletonCard: React.FC<{ count?: number; className?: string }> = ({
  count = 1,
  className,
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'bg-background rounded-none p-5 border border-terminal-muted animate-pulse space-y-4',
            className
          )}
        >
          <div className="flex justify-between items-center">
            <div className="h-4 bg-terminal-muted rounded-none w-1/3" />
            <div className="h-6 w-6 bg-terminal-muted rounded-none" />
          </div>
          <div className="h-8 bg-terminal-muted/80 rounded-none w-1/2" />
          <div className="pt-2 border-t border-terminal-muted flex justify-between">
            <div className="h-3 bg-terminal-muted rounded-none w-2/3" />
            <div className="h-3 bg-terminal-muted rounded-none w-1/6" />
          </div>
        </div>
      ))}
    </>
  );
};
