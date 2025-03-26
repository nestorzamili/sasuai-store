'use client';

import { Coffee } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { state: sidebarState = 'expanded' } = useSidebar?.() || {};

  return (
    <footer
      className={cn(
        'border-t py-2 w-full mt-auto',
        sidebarState === 'collapsed' ? 'px-2' : 'px-4',
      )}
    >
      <div
        className={cn(
          'flex flex-col items-center gap-1 text-xs',
          sidebarState === 'collapsed' ? 'text-center' : '',
        )}
      >
        <p className="flex flex-wrap justify-center items-center">
          © {currentYear}{' '}
          <Link
            href="https://github.com/nestorzamili"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline mx-1"
          >
            samunu
          </Link>
          <Link
            href="https://github.com/ibobdb"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline mx-1"
          >
            ibobdb
          </Link>
        </p>
        <p className="flex items-center">
          Made with <Coffee size={14} className="mx-1" />
          {sidebarState === 'expanded' && 'coffee'}
        </p>
      </div>
    </footer>
  );
}

export function StandaloneFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t py-2 w-full mt-auto px-4">
      <div className="flex flex-col items-center gap-1 text-xs">
        <p className="flex flex-wrap justify-center items-center">
          © {currentYear}{' '}
          <Link
            href="https://github.com/nestorzamili"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline mx-1"
          >
            samunu
          </Link>
          <Link
            href="https://github.com/ibobdb"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline mx-1"
          >
            ibobdb
          </Link>
        </p>
        <p className="flex items-center">
          Made with <Coffee size={14} className="mx-1" /> coffee
        </p>
      </div>
    </footer>
  );
}
