import React from 'react';
import { LucideIcon, Search, ShieldAlert } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils/cn';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Search,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'bg-background rounded-none p-12 text-center border border-terminal-muted flex flex-col items-center justify-center max-w-lg mx-auto my-8 uppercase font-mono font-bold',
        className
      )}
    >
      <div className="w-14 h-14 rounded-none bg-background border border-terminal-primary flex items-center justify-center text-terminal-primary mb-4 shadow-none">
        <Icon className="w-7 h-7" />
      </div>

      <h4 className="text-lg text-terminal-primary mb-2 tracking-wider">
        {title}
      </h4>

      <p className="text-sm text-terminal-muted max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
