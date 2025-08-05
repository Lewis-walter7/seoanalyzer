'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface LoadingSkeletonProps {
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 1,
  className,
}) => {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className={cn(
            'animate-pulse bg-muted/30 rounded-md h-4 mb-2 last:mb-0',
            className
          )}
        />
      ))}
    </>
  );
};

export default LoadingSkeleton;

