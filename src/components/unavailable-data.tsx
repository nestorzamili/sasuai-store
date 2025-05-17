import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnavailableDataProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export const UnavailableData = ({
  icon = <AlertCircle className="h-10 w-10 text-muted-foreground" />,
  title = 'No Data Available',
  description = 'The requested data is currently unavailable.',
  action,
  className,
  containerClassName,
}: UnavailableDataProps) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center w-full h-full',
        containerClassName
      )}
    >
      <div
        className={cn(
          'flex flex-col items-center justify-center space-y-4 text-center',
          className
        )}
      >
        {icon}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-[250px]">
            {description}
          </p>
        </div>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
};
