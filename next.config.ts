import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  logging: {
    fetches: {
      hmrRefreshes: true,
    },
  },
};

export default nextConfig;
