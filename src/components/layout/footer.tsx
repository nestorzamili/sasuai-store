'use client';

import { Coffee } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';

export function Footer() {
  const currentYear = new Date().getFullYear();
  // Bungkus useSidebar dalam try-catch untuk menghindari error
  let sidebarState = 'expanded';
  try {
    const { state } = useSidebar();
    sidebarState = state;
  } catch (error) {
    // Jika komponen digunakan di luar SidebarProvider,
    // gunakan default 'expanded' dan lanjutkan
  }

  return (
    <footer className="border-t py-2 md:py-2 w-full mt-auto">
      <div
        className={cn(
          'container flex flex-col items-center gap-1 text-sm',
          sidebarState === 'collapsed' ? 'max-w-full px-4' : '',
        )}
      >
        <p className="flex items-center text-center">
          © {currentYear}{' '}
          <Link
            href="https://github.com/nestorzamili"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline mx-1"
          >
            Samunu
          </Link>
        </p>
        <p className="flex items-center">
          Made with <Coffee size={16} className="mx-1" /> coffee.
        </p>
      </div>
    </footer>
  );
}

// Versi alternatif dari Footer yang tidak menggunakan SidebarContext
export function StandaloneFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t py-2 md:py-2 w-full mt-auto">
      <div className="container flex flex-col items-center gap-1 text-sm">
        <p className="flex items-center text-center">
          © {currentYear}{' '}
          <Link
            href="https://github.com/nestorzamili"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline mx-1"
          >
            Samunu
          </Link>
        </p>
        <p className="flex items-center">
          Made with <Coffee size={16} className="mx-1" /> coffee.
        </p>
      </div>
    </footer>
  );
}
