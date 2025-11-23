/** @type {import('next').NextConfig} */

// Define a single source of truth for the API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const MCP_WS_URL = process.env.NEXT_PUBLIC_MCP_WS_URL || 'ws://localhost:3000';

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // These values are exposed to the client-side code
  env: {
    NEXT_PUBLIC_API_URL: API_URL,
    NEXT_PUBLIC_MCP_WS_URL: MCP_WS_URL,
  },

  images: {
    domains: ['i.ytimg.com', 'img.youtube.com'],
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // Use the same defaulted API_URL here so it is NEVER "undefined/..."
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
