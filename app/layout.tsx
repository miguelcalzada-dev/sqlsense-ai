import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], display: "swap" });

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
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <Navbar />
          <main className="relative z-10 pt-20">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
