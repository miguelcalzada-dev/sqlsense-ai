/** @type {import('next').NextConfig} */
const NO_SNIFF = { key: "X-Content-Type-Options", value: "nosniff" };
// Las paginas HTML no deben cachearse: miguelcalzada.com las sirve por rewrite y,
// con el s-maxage largo que Next da a las paginas estaticas, un deploy nuevo no se
// veia hasta que expiraba la cache (monograma/estilos desincronizados).
const NO_STORE = { key: "Cache-Control", value: "public, max-age=0, s-maxage=0, must-revalidate" };

const nextConfig = {
  // Se sirve bajo https://miguelcalzada.com/sqlsense
  basePath: "/sqlsense",
  reactStrictMode: true,

  headers: async () => [
    { source: "/", headers: [NO_SNIFF, NO_STORE] },
    { source: "/lab", headers: [NO_SNIFF, NO_STORE] },
    { source: "/data", headers: [NO_SNIFF, NO_STORE] },
    { source: "/challenges", headers: [NO_SNIFF, NO_STORE] },
    { source: "/guide", headers: [NO_SNIFF, NO_STORE] },
    { source: "/(.*)", headers: [NO_SNIFF] },
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