'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type BreadcrumbStateContextType = {
  dynamicSegments: Record<string, string>;
  setSegmentName: (id: string, name: string) => void;
  getSegmentName: (id: string) => string | undefined;
};

const BreadcrumbStateContext = createContext<BreadcrumbStateContextType>({
  dynamicSegments: {},
  setSegmentName: () => {},
  getSegmentName: () => undefined,
});

export function BreadcrumbStateProvider({ children }: { children: ReactNode }) {
  const [dynamicSegments, setDynamicSegments] = useState<
    Record<string, string>
  >({});

  const setSegmentName = (id: string, name: string) => {
    setDynamicSegments((prev) => ({ ...prev, [id]: name }));
  };

  const getSegmentName = (id: string) => {
    return dynamicSegments[id];
  };

  return (
    <BreadcrumbStateContext.Provider
      value={{
        dynamicSegments,
        setSegmentName,
        getSegmentName,
      }}
    >
      {children}
    </BreadcrumbStateContext.Provider>
  );
}

export const useBreadcrumbState = () => useContext(BreadcrumbStateContext);
