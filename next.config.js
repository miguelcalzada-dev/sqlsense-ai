/** @type {import('next').NextConfig} */
const nextConfig = {
  // Se sirve bajo https://miguelcalzada.com/sqlsense
  basePath: "/sqlsense",
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