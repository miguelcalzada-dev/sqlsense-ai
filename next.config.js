/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = { ...config.resolve.alias };
    return config;
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [{ key: "X-Content-Type-Options", value: "nosniff" }],
    },
  ],
};

module.exports = nextConfig;