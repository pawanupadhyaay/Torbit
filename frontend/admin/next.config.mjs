/** @type {import('next').NextConfig} */
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || (process.env.NODE_ENV === 'production' ? 'https://api.torbitrealty.com' : 'http://127.0.0.1:5000');

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["images.unsplash.com", "via.placeholder.com", "localhost", "127.0.0.1", "pub-eb6c1f57d56548118a8cce2abc2983f2.r2.dev"],
  },
  experimental: {
    optimizePackageImports: ['@mui/icons-material', '@mui/material', 'lucide-react'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      }
    ];
  }
};

export default nextConfig;

