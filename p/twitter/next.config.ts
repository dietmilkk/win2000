import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/p/twitter/out',
  assetPrefix: '/p/twitter/out',
};

export default nextConfig;
