import Cookies from 'js-cookie';
import { SearchProvider } from '@/context/search-context';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { cn } from '@/lib/utils';
import { StrictMode } from 'react';
import { AuthProvider } from '@/context/auth-context';

export const metadata = {
  title: {
    template: '%s | Sasuai Store',
    default: 'Sasuai Store',
  },
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const defaultOpen = Cookies.get('sidebar:state') !== 'false';

  return (
    <div className="group/body">
      <StrictMode>
        <AuthProvider>
          <SearchProvider>
            <SidebarProvider defaultOpen={defaultOpen}>
              <AppSidebar />
              <div
                id="content"
                className={cn(
                  'max-w-full w-full ml-auto',
                  'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
                  'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
                  'transition-[width] ease-linear duration-200',
                  'h-svh flex flex-col',
                  'group-data-[scroll-locked=1]/body:h-full',
                  'group-data-[scroll-locked=1]/body:has-[main.fixed-main]:h-svh'
                )}
              >
                {children}
              </div>
            </SidebarProvider>
          </SearchProvider>
        </AuthProvider>
      </StrictMode>
    </div>
  );
}
