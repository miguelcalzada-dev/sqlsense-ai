import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
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
      </body>
    </html>
  );
}
