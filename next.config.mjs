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
};

export default nextConfig;
