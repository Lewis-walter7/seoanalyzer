'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface ResultCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  isLoading?: boolean;
  error?: string | null;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  title,
  description,
  children,
  actions,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  isLoading = false,
  error,
}) => {
  return (
    <Card className={cn('w-full', className)}>
      {(title || description || actions) && (
        <CardHeader className={cn('flex items-start justify-between mb-4', headerClassName)}>
          {(title || description) && (
            <div>
              {title && (
                <CardTitle className="text-lg font-semibold tracking-tight">
                  {title}
                </CardTitle>
              )}
              {description && (
                <CardDescription className="text-sm text-muted-foreground">
                  {description}
                </CardDescription>
              )}
            </div>
          )}
          {actions && <div>{actions}</div>}
        </CardHeader>
      )}

      <CardContent className={cn('space-y-2', contentClassName)}>
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {error}
          </div>
        )}

        <div className={cn('space-y-2', isLoading && 'opacity-60 pointer-events-none')}>
          {children}
        </div>
      </CardContent>

      {actions && (
        <CardFooter className={cn('flex justify-end', footerClassName)}>
          {actions}
        </CardFooter>
      )}
    </Card>
  );
};

export default ResultCard;

