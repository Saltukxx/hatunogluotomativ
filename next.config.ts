import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: "standalone",

  // Empty turbopack config to silence the Turbopack/webpack conflict error
  turbopack: {},
};

export default nextConfig;
