import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type LoaderCardVariant = 'default' | 'card' | 'compact' | 'inline';
type LoaderType = 'skeleton' | 'spinner';

interface LoaderCardContentProps {
  variant?: LoaderCardVariant;
  className?: string;
  containerClassName?: string;
  rows?: number;
  showAvatar?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  type?: LoaderType;
  spinnerClassName?: string;
  spinnerSize?: number;
}

export const LoaderCardContent = ({
  variant = 'default',
  className,
  containerClassName,

  type = 'spinner', // Changed default from 'skeleton' to 'spinner'
  spinnerClassName,
  spinnerSize,
}: LoaderCardContentProps) => {
  // Adjust styling based on variant
  const containerStyles = {
    default: 'w-full h-full p-6',
    card: 'w-full h-full p-4',
    compact: 'w-full p-3',
    inline: 'w-full p-2',
  };

  // Define spinner sizes by variant
  const defaultSpinnerSizes = {
    default: 32,
    card: 28,
    compact: 24,
    inline: 20,
  };

  // Use provided spinner size or default based on variant
  const currentSpinnerSize = spinnerSize || defaultSpinnerSizes[variant];

  // Render spinner loading
  if (type === 'spinner') {
    return (
      <div
        className={cn(
          containerStyles[variant],
          'flex items-center justify-center',
          containerClassName,
        )}
      >
        <Loader2
          className={cn('animate-spin text-primary/70', spinnerClassName)}
          size={currentSpinnerSize}
        />
      </div>
    );
  }

  // Render skeleton loading (simplified version with pulse animation)
  return (
    <div className={cn(containerStyles[variant], containerClassName)}>
      <div
        className={cn(
          'w-full h-full min-h-[120px] bg-muted/40 animate-pulse rounded-md',
          variant === 'default' && 'min-h-[200px]',
          variant === 'card' && 'min-h-[160px]',
          variant === 'compact' && 'min-h-[100px]',
          variant === 'inline' && 'min-h-[60px]',
          className,
        )}
      />
    </div>
  );
};
