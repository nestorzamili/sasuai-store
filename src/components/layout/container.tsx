import { cn } from '@/lib/utils';

export function Container({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('container px-4 md:px-6', className)} {...props}>
      {children}
    </div>
  );
}
