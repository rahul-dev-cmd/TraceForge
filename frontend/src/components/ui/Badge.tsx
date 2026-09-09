import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'cyber' | 'warning' | 'danger' | 'success' | 'outline' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-background text-terminal-muted border-terminal-muted',
    cyber: 'bg-background text-terminal-primary border-terminal-primary',
    warning: 'bg-background text-terminal-secondary border-terminal-secondary',
    danger: 'bg-background text-terminal-error border-terminal-error',
    success: 'bg-background text-terminal-primary border-terminal-primary',
    outline: 'bg-transparent text-terminal-muted border-terminal-muted',
    purple: 'bg-background text-terminal-primary border-terminal-primary',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-bold',
    md: 'text-[11px] px-2.5 py-1 font-bold',
    lg: 'text-xs px-3 py-1.5 font-bold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-none border uppercase tracking-wide select-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      [{children}]
    </span>
  );
};
