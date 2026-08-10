"use client";

import { useMemo, type CSSProperties } from "react";
import CopyButton from "./CopyButton";
import { highlightTokens } from "@/lib/sql-highlight";
import { cn } from "@/lib/utils";

const COLOR: Record<string, CSSProperties> = {
  keyword: { color: "rgb(var(--accent-2))", fontWeight: 600 },
  function: { color: "rgb(var(--accent-5))", fontWeight: 600 },
  type: { color: "rgb(var(--accent-4))", fontStyle: "italic" },
  string: { color: "rgb(var(--accent-4))" },
  number: { color: "rgb(var(--accent-5))" },
  ident: { color: "rgb(var(--ink))" },
  identifier: { color: "rgb(var(--ink-soft))" },
  comment: { color: "rgb(var(--sub))", fontStyle: "italic" },
  punct: { color: "rgb(var(--ink-soft))" },
  other: { color: "rgb(var(--ink-soft))" },
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
        "group relative overflow-hidden rounded-apple border border-line-soft bg-[#0c0c0f] text-[13px] font-mono",
        className,
      )}
    >
      {title && (
        <div className="flex items-center justify-between border-b border-white/5 px-3 py-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">
            {title}
          </span>
          {showCopy && (
            <CopyButton
              text={code}
              className="border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-white/20"
            />
          )}
        </div>
      )}
      <pre className="overflow-x-auto px-4 py-3 leading-relaxed text-[rgb(245,245,248)]">
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
          <CopyButton
            text={code}
            className="border-white/10 bg-black/40 text-white/70 hover:text-white hover:border-white/20"
          />
        </div>
      )}
    </div>
  );
}