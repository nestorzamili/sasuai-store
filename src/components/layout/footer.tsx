'use client';

import { Coffee } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';
import { useMemo } from 'react';
import { appInfo } from '@/lib/appInfo';

type GitHubLinkProps = {
  username: string;
  displayName: string;
};

const GitHubLink = ({ username, displayName }: GitHubLinkProps) => (
  <Link
    href={`https://github.com/${username}`}
    target="_blank"
    rel="noopener noreferrer"
    className="font-medium hover:underline mx-1"
    aria-label={`GitHub profile of ${displayName}`}
  >
    {displayName}
  </Link>
);

type BaseFooterProps = {
  isCollapsed?: boolean;
  showFullCoffeeText?: boolean;
};

const BaseFooter = ({
  isCollapsed = false,
  showFullCoffeeText = true,
}: BaseFooterProps) => {
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer
      className={cn(
        'border-t py-2 w-full mt-auto',
        isCollapsed ? 'px-2' : 'px-4',
      )}
    >
      <div
        className={cn(
          'flex flex-col items-center gap-1 text-xs',
          isCollapsed ? 'text-center' : '',
        )}
      >
        <p className="flex flex-wrap justify-center items-center">
          © {currentYear}{' '}
          <GitHubLink username="nestorzamili" displayName="samunu" />
          <GitHubLink username="ibobdb" displayName="ibobdb" />
        </p>
        <p className="flex items-center" aria-label="Made with coffee">
          Made with <Coffee size={14} className="mx-1" />
          {showFullCoffeeText && 'coffee'}
        </p>
        <p className="text-center text-xs text-muted-foreground">
          Version {appInfo.version}
        </p>
      </div>
    </footer>
  );
};

export function Footer() {
  const { state: sidebarState = 'expanded' } = useSidebar?.() || {};

  return (
    <BaseFooter
      isCollapsed={sidebarState === 'collapsed'}
      showFullCoffeeText={sidebarState === 'expanded'}
    />
  );
}

export function StandaloneFooter() {
  return <BaseFooter showFullCoffeeText={true} />;
}
