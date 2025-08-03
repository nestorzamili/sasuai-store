import { useState, useEffect } from 'react';

/**
 * Custom hook to handle client-side hydration state
 * Prevents SSR/hydration mismatches by tracking when the component has mounted on the client
 */
export const useClientHydration = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
};
