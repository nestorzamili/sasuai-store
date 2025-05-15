'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/context/theme-context';

export function useThemeIllustration(
  lightIllustration: string | { src: string },
  darkIllustration: string | { src: string },
) {
  const { theme } = useTheme();
  const [illustration, setIllustration] = useState<string>('');

  useEffect(() => {
    const isDarkTheme =
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Handle both string paths and imported images
    const lightSrc =
      typeof lightIllustration === 'string'
        ? lightIllustration
        : lightIllustration.src;

    const darkSrc =
      typeof darkIllustration === 'string'
        ? darkIllustration
        : darkIllustration.src;

    setIllustration(isDarkTheme ? darkSrc : lightSrc);
  }, [theme, lightIllustration, darkIllustration]);

  return illustration;
}
