import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto uppercase font-mono font-bold">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-background/90 transition-none"
      />

      {/* Dialog Box */}
      <div
        className={cn(
          'relative w-full bg-background border border-terminal-primary rounded-none shadow-none overflow-hidden z-10 transition-none',
          maxWidthStyles[maxWidth]
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-terminal-primary bg-background">
          <div>
            <h3 className="text-lg text-terminal-primary tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-none bg-terminal-primary animate-pulse" />
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-terminal-muted mt-1">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-none text-terminal-muted hover:text-background hover:bg-terminal-primary border border-transparent hover:border-terminal-primary transition-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
