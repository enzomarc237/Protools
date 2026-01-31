import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    unoptimized: true,
  },
  
  // TypeScript configuration for build
  typescript: {
    ignoreBuildErrors: false,
  },
}

export default nextConfig
