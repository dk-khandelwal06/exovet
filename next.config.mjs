/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    if (process.env.API_URL) {
      return [
        {
          source: '/api/:path*',
          destination: `${process.env.API_URL}/api/:path*`,
        },
      ];
    }
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://127.0.0.1:8000/api/:path*',
        },
      ];
    }
    // On Vercel production, vercel.json handles routing /api/* to the serverless function
    return [];
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },
};

export default nextConfig;
