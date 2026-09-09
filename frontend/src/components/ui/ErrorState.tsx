import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils/cn';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'INVESTIGATION FEED ERROR',
  message = 'AN UNEXPECTED ERROR OCCURRED WHILE QUERYING THE MOCK BLOCKCHAIN ANALYTICS PIPELINE.',
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'bg-background rounded-none p-10 text-center border border-terminal-error flex flex-col items-center justify-center max-w-md mx-auto my-8 shadow-none uppercase font-mono font-bold',
        className
      )}
    >
      <div className="w-12 h-12 rounded-none bg-background border border-terminal-error flex items-center justify-center text-terminal-error mb-4">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <h4 className="text-base text-terminal-error mb-2">{title}</h4>
      <p className="text-xs text-terminal-muted mb-5 leading-relaxed">{message}</p>

      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          icon={RotateCcw}
          onClick={onRetry}
        >
          RETRY QUERY
        </Button>
      )}
    </div>
  );
};
