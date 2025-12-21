/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  env: {
    NEXT_PUBLIC_MCP_WS_URL: process.env.NEXT_PUBLIC_MCP_WS_URL || "ws://localhost:3000",
  },

  images: {
    domains: ["i.ytimg.com", "img.youtube.com"],
  },

  /**
   * IMPORTANT:
   * Do NOT rewrite /api/* to an external backend in production.
   * Your Next.js serverless routes live under src/app/api/* and must be reachable.
   *
   * If you ever want the old behavior for local dev, you can re-enable it
   * only when EXTERNAL_API_PROXY=1 is set.
   */
  async rewrites() {
    if (process.env.EXTERNAL_API_PROXY === "1" && process.env.NEXT_PUBLIC_API_URL) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
      return [
        {
          source: "/api/:path*",
          destination: `${apiUrl}/api/:path*`,
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;
