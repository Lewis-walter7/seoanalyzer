'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface FormCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  isLoading?: boolean;
  error?: string | null;
}

export const FormCard: React.FC<FormCardProps> = ({
  title,
  description,
  children,
  footer,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  isLoading = false,
  error,
}) => {
  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      {(title || description) && (
        <CardHeader className={cn('space-y-1', headerClassName)}>
          {title && (
            <CardTitle className="text-2xl font-semibold tracking-tight">
              {title}
            </CardTitle>
          )}
          {description && (
            <CardDescription className="text-sm text-muted-foreground">
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      
      <CardContent className={cn('space-y-4', contentClassName)}>
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {error}
          </div>
        )}
        
        <div className={cn('space-y-4', isLoading && 'opacity-60 pointer-events-none')}>
          {children}
        </div>
      </CardContent>
      
      {footer && (
        <CardFooter className={cn('flex flex-col space-y-2', footerClassName)}>
          {footer}
        </CardFooter>
      )}
    </Card>
  );
};

export default FormCard;
