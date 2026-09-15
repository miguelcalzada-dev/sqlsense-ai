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

  // Las URLs antiguas (sqlsense-ai-production.up.railway.app) redirigen al dominio nuevo.
  // basePath: false evita el prefijo para no interferir con el proxy del portal.
  redirects: async () => [
    { source: "/", destination: "https://miguelcalzada.com/sqlsense", permanent: true, basePath: false },
    { source: "/lab", destination: "https://miguelcalzada.com/sqlsense/lab", permanent: true, basePath: false },
    { source: "/data", destination: "https://miguelcalzada.com/sqlsense/data", permanent: true, basePath: false },
    { source: "/challenges", destination: "https://miguelcalzada.com/sqlsense/challenges", permanent: true, basePath: false },
    { source: "/guide", destination: "https://miguelcalzada.com/sqlsense/guide", permanent: true, basePath: false },
  ],
};

module.exports = nextConfig;