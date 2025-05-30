'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean;
  ref?: React.Ref<HTMLElement>;
}

export const Header = ({
  className,
  fixed,
  children,
  ...props
}: HeaderProps) => {
  const [offset, setOffset] = React.useState(0);

  React.useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop);
    };

    document.addEventListener('scroll', onScroll, { passive: true });
    return () => document.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'flex h-14 shrink-0 items-center gap-2',
        'border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        'px-4',
        fixed && 'sticky top-0 z-50',
        offset > 10 && fixed ? 'shadow-sm' : '',
        className,
      )}
      {...props}
    >
      <SidebarTrigger
        className={cn(
          'h-9 w-9 rounded-md p-0',
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:bg-accent focus-visible:text-accent-foreground',
          'transition-colors duration-200',
        )}
      />
      <div className="flex flex-1 items-center justify-between gap-2">
        {children}
      </div>
    </header>
  );
};

Header.displayName = 'Header';
