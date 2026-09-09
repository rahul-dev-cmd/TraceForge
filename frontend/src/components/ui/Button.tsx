import React from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  isLoading = false,
  className,
  disabled,
  children,
  ...props
}) => {
  const variantStyles = {
    primary:
      'bg-terminal-primary text-background border border-terminal-primary hover:bg-background hover:text-terminal-primary',
    secondary:
      'bg-background text-terminal-muted border border-terminal-muted hover:border-terminal-primary hover:text-terminal-primary',
    danger:
      'bg-terminal-error text-background border border-terminal-error hover:bg-background hover:text-terminal-error',
    warning:
      'bg-terminal-secondary text-background border border-terminal-secondary hover:bg-background hover:text-terminal-secondary',
    outline:
      'bg-background text-terminal-primary border border-terminal-primary hover:bg-terminal-primary hover:text-background',
    ghost:
      'bg-transparent text-terminal-muted hover:text-terminal-primary border border-transparent',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-3 py-1.5 gap-1.5',
    md: 'text-xs px-4 py-2 gap-2',
    lg: 'text-sm px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center font-bold uppercase transition-none focus:outline-none focus:ring-1 focus:ring-terminal-primary disabled:opacity-50 disabled:pointer-events-none rounded-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon && iconPosition === 'left' ? (
        <Icon className="w-4 h-4 shrink-0" strokeWidth={2} />
      ) : null}

      <span>{variant === 'outline' || variant === 'ghost' ? `[ ${children} ]` : children}</span>

      {!isLoading && Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4 shrink-0" strokeWidth={2} />
      )}
    </button>
  );
};
