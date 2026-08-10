"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyButton({
  text,
  className,
  label,
}: {
  text: string;
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
          } else {
            const t = document.createElement("textarea");
            t.value = text;
            t.style.position = "fixed";
            t.style.opacity = "0";
            document.body.appendChild(t);
            t.select();
            document.execCommand("copy");
            document.body.removeChild(t);
          }
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        } catch {
          /* ignore */
        }
      }}
      aria-label="Copiar"
      className={cn(
        "inline-flex items-center gap-1.5 border-2 border-line bg-surface px-2 py-1 font-mono text-xs font-bold uppercase tracking-wider shadow-brutal-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal",
        className,
      )}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-accent-4" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {label ?? (copied ? "Copiado" : "Copiar")}
    </button>
  );
}

export default CopyButton;
