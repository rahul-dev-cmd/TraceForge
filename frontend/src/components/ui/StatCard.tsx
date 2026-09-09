import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StatCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  change?: string;
  changeDirection?: 'up' | 'down' | 'neutral';
  description: string;
  glowColor?: 'cyan' | 'red' | 'amber' | 'emerald' | 'purple' | 'blue';
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  icon: Icon,
  change,
  changeDirection = 'up',
  description,
  glowColor = 'cyan',
  className,
  onClick,
}) => {
  const colorMap: Record<string, string> = {
    cyan: 'text-terminal-primary border-terminal-primary hover:bg-terminal-primary hover:text-background',
    red: 'text-terminal-error border-terminal-error hover:bg-terminal-error hover:text-background',
    amber: 'text-terminal-secondary border-terminal-secondary hover:bg-terminal-secondary hover:text-background',
    emerald: 'text-terminal-primary border-terminal-primary hover:bg-terminal-primary hover:text-background',
    purple: 'text-terminal-primary border-terminal-primary hover:bg-terminal-primary hover:text-background',
    blue: 'text-terminal-primary border-terminal-primary hover:bg-terminal-primary hover:text-background',
  };

  const textMap: Record<string, string> = {
    cyan: 'text-terminal-primary',
    red: 'text-terminal-error',
    amber: 'text-terminal-secondary',
    emerald: 'text-terminal-primary',
    purple: 'text-terminal-primary',
    blue: 'text-terminal-primary',
  };

  const borderClass = colorMap[glowColor] || colorMap.cyan;
  const textClass = textMap[glowColor] || textMap.cyan;

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-background rounded-none p-3 lg:p-4 transition-none border flex flex-col justify-between group uppercase font-mono font-bold',
        onClick && 'cursor-pointer hover:border-terminal-primary',
        'border-terminal-muted hover:border-terminal-primary',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] tracking-wider text-terminal-muted font-bold mb-1 truncate">
            {title}
          </p>
          <div className="flex flex-col xl:flex-row xl:items-baseline gap-1">
            <h3 className={cn("text-lg lg:text-xl font-bold tracking-widest group-hover:animate-blink truncate", textClass)}>
              {value}
            </h3>
            {subValue && (
              <span className="text-[9px] text-terminal-muted font-bold truncate">
                [{subValue}]
              </span>
            )}
          </div>
        </div>
        <div
          className={cn(
            'p-1.5 border flex items-center justify-center shrink-0 transition-none',
            borderClass,
            'bg-background'
          )}
        >
          <Icon className="w-4 h-4" strokeWidth={1.5} />
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-terminal-muted flex items-center justify-between text-[9px]">
        <span className="text-terminal-muted line-clamp-1">{description}</span>
        {change && (
          <div
            className={cn(
              'flex items-center gap-1 font-bold shrink-0 ml-1',
              changeDirection === 'up'
                ? 'text-terminal-error'
                : changeDirection === 'down'
                ? 'text-terminal-primary'
                : 'text-terminal-muted'
            )}
          >
            {changeDirection === 'up' ? (
              <TrendingUp className="w-2.5 h-2.5" />
            ) : changeDirection === 'down' ? (
              <TrendingDown className="w-2.5 h-2.5" />
            ) : null}
            <span>{change}</span>
          </div>
        )}
      </div>
    </div>
  );
};
