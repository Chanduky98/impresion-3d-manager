/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  swcMinify: true,
  pageExtensions: ['ts', 'tsx'],
  experimental: {
    optimizePackageImports: ['recharts', '@fullcalendar/react'],
  },
};

export default nextConfig;
