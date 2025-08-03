import { createContext, useContext } from 'react';

export type BreadcrumbLabels = Record<string, string>;

// Breadcrumb Context interface
export interface BreadcrumbContextType {
  breadcrumbLabels: BreadcrumbLabels;
  updateBreadcrumb: (id: string, label: string) => void;
}

export const BreadcrumbContext = createContext<
  BreadcrumbContextType | undefined
>(undefined);

/**
 * Hook to access breadcrumb context
 * Must be used within a BreadcrumbContext.Provider
 */
export const useBreadcrumb = () => {
  const context = useContext(BreadcrumbContext);
  if (context === undefined) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider');
  }
  return context;
};
