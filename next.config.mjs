/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  swcMinify: true,
  pageExtensions: ['ts', 'tsx'],
  experimental: {
    optimizePackageImports: ['recharts', '@fullcalendar/react'],
  },
  // Don't try to build API routes as static pages
  staticPageGenerationTimeout: 1000,
};

export default nextConfig;
