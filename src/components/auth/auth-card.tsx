'use client';

import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface AuthCardProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthCard({
  title,
  icon: Icon,
  children,
  footer,
}: AuthCardProps) {
  return (
    <Card className="w-full p-4 sm:p-6 md:p-7 shadow-md sm:shadow-lg border-primary/10">
      <div className="flex items-center mb-4 sm:mb-5">
        <Icon className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        <h2 className="text-xl sm:text-2xl font-semibold">{title}</h2>
      </div>

      {children}

      {footer && <div className="mt-4 sm:mt-6">{footer}</div>}
    </Card>
  );
}
