import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "SQLSense AI — Aprende SQL hablando con IA",
    template: "%s · SQLSense AI",
  },
  description:
    "Traduce lenguaje natural ⇄ SQL con IA y experimenta con un laboratorio de base de datos efímero que vive en tu navegador. Aprende SQL retándote, no memorizando.",
  keywords: [
    "SQL",
    "aprender SQL",
    "IA",
    "SQLite",
    "WebAssembly",
    "laboratorio",
    "lenguaje natural",
  ],
  authors: [{ name: "Miguel Calzada" }],
  openGraph: {
    title: "SQLSense AI — Aprende SQL hablando con IA",
    description:
      "Traduce lenguaje natural ⇄ SQL, ejecuta y experimenta en un laboratorio efímero en tu navegador.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#09090c" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Navbar />
          <main className="relative z-10 pt-20">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}