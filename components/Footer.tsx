import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-line-soft">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-[12px] bg-gradient-to-br from-accent to-accent2 shadow-md">
                <Sparkles className="h-4.5 w-4.5 text-white" strokeWidth={2.4} />
              </span>
              <span className="text-[15px] font-semibold tracking-tight">
                SQLSense<span className="text-accent">.</span>
              </span>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-ink-sub">
              Aprende SQL traduciendo lenguaje natural ⇄ SQL. Laboratorio
              efímero en tu navegador con SQLite WebAssembly. Proyecto de
              portfolio de IA aplicada.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-3 sm:grid-cols-3">
            <FooterCol
              title="App"
              items={[
                { label: "Laboratorio", href: "/lab" },
                { label: "Datos & Esquema", href: "/data" },
                { label: "Retos", href: "/challenges" },
                { label: "Guía", href: "/guide" },
              ]}
            />
            <FooterCol
              title="Recursos"
              items={[
                {
                  label: "GitHub",
                  href: "https://github.com/miguelcalzada-dev",
                  external: true,
                },
                { label: "SQLite WASM", href: "https://sql.js.org", external: true },
                { label: "Next.js", href: "https://nextjs.org", external: true },
              ]}
            />
            <FooterCol
              title="Tecnologías"
              items={[
                { label: "Next.js 14", href: "/", external: false },
                { label: "TypeScript", href: "/", external: false },
                { label: "Tailwind", href: "/", external: false },
                { label: "Framer", href: "/", external: false },
              ]}
            />
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-line-soft pt-6 sm:flex-row sm:items-center">
          <p className="text-[12px] text-ink-sub">
            © {new Date().getFullYear()} SQLSense AI · Hecho con cuidado por{" "}
            <a
              href="https://github.com/miguelcalzada-dev"
              target="_blank"
              rel="noreferrer"
              className="link-underline font-medium text-ink-soft"
            >
              Miguel Calzada
            </a>
          </p>
          <p className="text-[12px] text-ink-sub">
            Base de datos efímera · No se envían tus datos al servidor
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string; external?: boolean }[];
}) {
  return (
    <div>
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-ink-sub">
        {title}
      </h4>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.label}>
            {item.external ? (
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="text-[13px] text-ink-soft transition-colors hover:text-ink"
              >
                {item.label}
              </a>
            ) : (
              <Link
                href={item.href}
                className="text-[13px] text-ink-soft transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}