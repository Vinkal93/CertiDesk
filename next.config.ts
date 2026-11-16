import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Prevent Windows ENOENT pack file cache corruption in dev server
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
