'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ErrorAlertProps {
  title?: string;
  message: string;
  className?: string;
  onClose?: () => void;
  variant?: 'error' | 'warning' | 'info';
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title,
  message,
  className,
  onClose,
  variant = 'error',
}) => {
  const variants = {
    error: {
      container: 'bg-destructive/10 border-destructive/20 text-destructive',
      icon: 'text-destructive',
      title: 'text-destructive',
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-200',
      icon: 'text-amber-600 dark:text-amber-400',
      title: 'text-amber-800 dark:text-amber-200',
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-200',
      icon: 'text-blue-600 dark:text-blue-400',
      title: 'text-blue-800 dark:text-blue-200',
    },
  };

  const variantStyles = variants[variant];

  return (
    <div
      className={cn(
        'relative rounded-md border p-4',
        variantStyles.container,
        className
      )}
      role="alert"
    >
      <div className="flex items-start space-x-3">
        <AlertTriangle 
          className={cn('h-5 w-5 mt-0.5 flex-shrink-0', variantStyles.icon)} 
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={cn('text-sm font-semibold mb-1', variantStyles.title)}>
              {title}
            </h3>
          )}
          <p className="text-sm leading-relaxed">
            {message}
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors',
              variantStyles.icon
            )}
            aria-label="Close alert"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;
