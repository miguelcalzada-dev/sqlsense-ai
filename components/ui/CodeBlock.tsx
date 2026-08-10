"use client";

import { useMemo, type CSSProperties } from "react";
import CopyButton from "./CopyButton";
import { highlightTokens } from "@/lib/sql-highlight";
import { cn } from "@/lib/utils";

const COLOR: Record<string, CSSProperties> = {
  keyword: { color: "#cc3300", fontWeight: 700 },
  function: { color: "#2400ff", fontWeight: 700 },
  type: { color: "#008055", fontStyle: "italic" },
  string: { color: "#008055" },
  number: { color: "#b86e00" },
  ident: { color: "#111" },
  identifier: { color: "#444" },
  comment: { color: "#888", fontStyle: "italic" },
  punct: { color: "#444" },
  other: { color: "#444" },
  ws: {},
};

export default function CodeBlock({
  code,
  className,
  showCopy = true,
  title,
}: {
  code: string;
  className?: string;
  showCopy?: boolean;
  title?: string;
}) {
  const tokens = useMemo(() => highlightTokens(code), [code]);
  return (
    <div
      className={cn(
        "group relative overflow-hidden border-4 border-line bg-bg-tertiary font-mono text-sm shadow-brutal-sm",
        className,
      )}
    >
      {title && (
        <div className="flex items-center justify-between border-b-2 border-line px-3 py-2 bg-bg-tertiary">
          <span className="font-mono text-xs font-bold uppercase tracking-wider">
            {title}
          </span>
          {showCopy && <CopyButton text={code} />}
        </div>
      )}
      <pre className="overflow-x-auto px-4 py-3 leading-relaxed text-ink">
        <code>
          {tokens.map((t, i) => {
            if (t.type === "ws") return <span key={i}>{t.value}</span>;
            return (
              <span key={i} style={COLOR[t.type] ?? {}}>
                {t.value}
              </span>
            );
          })}
        </code>
      </pre>
      {!title && showCopy && (
        <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
          <CopyButton text={code} />
        </div>
      )}
    </div>
  );
}
