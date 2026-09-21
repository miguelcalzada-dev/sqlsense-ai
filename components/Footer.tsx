import Link from "next/link";
import BrandMark from "./BrandMark";

export default function Footer() {
  return (
    <footer className="mt-24 border-t-4 border-line bg-bg-soft">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <BrandMark />
              <span className="font-heading text-2xl uppercase">
                SQLSense<span className="text-gradient">.</span>
              </span>
            </div>
            <p className="mt-4 font-mono text-xs uppercase tracking-wider text-sub">
              Aprende SQL traduciendo lenguaje natural a SQL con IA. Laboratorio
              efímero en tu navegador con SQLite WebAssembly.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-3 sm:grid-cols-3">
            <FooterCol
              title="App"
              items={[
                { label: "Laboratorio", href: "/lab" },
                { label: "Datos", href: "/data" },
                { label: "Retos", href: "/challenges" },
                { label: "Guía", href: "/guide" },
              ]}
            />
            <FooterCol
              title="Recursos"
              items={[
                { label: "GitHub", href: "https://github.com/miguelcalzada-dev", external: true },
                { label: "Portfolio", href: "https://portfolio-miguelcalzada.vercel.app/", external: true },
                { label: "SQLite WASM", href: "https://sql.js.org", external: true },
              ]}
            />
            <FooterCol
              title="Stack"
              items={[
                { label: "Next.js 14", href: "/" },
                { label: "TypeScript", href: "/" },
                { label: "Tailwind CSS", href: "/" },
                { label: "Framer Motion", href: "/" },
              ]}
            />
          </div>
        </div>

        <div className="mt-10 border-t-2 border-line pt-6">
          <p className="font-mono text-xs uppercase tracking-wider text-sub text-center">
            &copy; {new Date().getFullYear()} SQLSense AI · Hecho por{" "}
            <a
              href="https://github.com/miguelcalzada-dev"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-ink hover:text-accent transition-colors"
            >
              Miguel Calzada
            </a>
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
      <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-ink mb-3">
        {title}
      </h4>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.label}>
            {item.external ? (
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs uppercase tracking-wider text-sub hover:text-accent transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <Link prefetch={false}
                href={item.href}
                className="font-mono text-xs uppercase tracking-wider text-sub hover:text-accent transition-colors"
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
