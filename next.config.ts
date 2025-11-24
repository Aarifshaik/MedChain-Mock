import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/MedChain-Mock',
  assetPrefix: '/MedChain-Mock',
};

export default nextConfig;
