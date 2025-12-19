import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Turbopack due to Prisma compatibility issues
  experimental: {
    // Turbopack can be explicitly disabled if needed
  },
  // Configure webpack for Prisma
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client');
    }
    return config;
  },
};

export default nextConfig;
