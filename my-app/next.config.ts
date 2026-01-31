import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Static export configuration (optional - remove for dynamic hosting)
  // output: 'export',
  // distDir: 'dist',
  
  // Image optimization
  images: {
    unoptimized: true,
  },
  
  // TypeScript and ESLint configuration for build
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
