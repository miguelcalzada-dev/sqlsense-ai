import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://miguelcalzada.com"),
  alternates: { canonical: "https://miguelcalzada.com/sqlsense" },
  title: {
    default: "SQLSense AI — Aprende SQL hablando con IA",
    template: "%s · SQLSense AI",
  },
  description:
    "Traduce lenguaje natural a SQL con IA y experimenta con un laboratorio de base de datos efimero que vive en tu navegador.",
  keywords: ["SQL", "aprender SQL", "IA", "SQLite", "WebAssembly", "laboratorio", "lenguaje natural"],
  authors: [{ name: "Miguel Calzada" }],
  openGraph: {
    title: "SQLSense AI — Aprende SQL hablando con IA",
    description:
      "Traduce lenguaje natural a SQL, ejecuta y experimenta en un laboratorio efimero en tu navegador.",
    type: "website",
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><rect x='2' y='2' width='36' height='36' fill='%23ff3e00' stroke='%23111' stroke-width='3'/><ellipse cx='20' cy='13' rx='9' ry='4' fill='none' stroke='white' stroke-width='2.2'/><path d='M11 13v14c0 2.2 4 4 9 4s9-1.8 9-4V13' fill='none' stroke='white' stroke-width='2.2'/><path d='M11 20c0 2.2 4 4 9 4s9-1.8 9-4' fill='none' stroke='white' stroke-width='1.5' opacity='0.6'/></svg>",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#eae8e3",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="font-body">
        <Navbar />
        <main className="relative z-10 pt-24">{children}</main>
        <Footer />
        {/* Cloudflare Web Analytics */}
        <script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon={'{"token": "1f517d798f314877860e151bb7b33f83"}'}
        />      </body>
    </html>
  );
}
