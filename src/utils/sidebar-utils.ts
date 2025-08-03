/**
 * Utility function to parse sidebar state from cookies
 * Returns the saved sidebar state or defaults to true (open)
 */
export const getSidebarStateFromCookie = (): boolean => {
  if (typeof document === 'undefined') return true;

  const savedState = document.cookie
    .split('; ')
    .find((row) => row.startsWith('sidebar:state='))
    ?.split('=')[1];

  return savedState !== 'false';
};
