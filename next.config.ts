import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
  },
  output: 'standalone',
  eslint: {
    // Warning: This disables ESLint during builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
