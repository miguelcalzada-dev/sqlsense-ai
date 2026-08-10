import { cn } from "@/lib/utils";

export default function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("relative grid h-9 w-9 shrink-0 place-items-center", className)} aria-hidden="true">
      <svg viewBox="0 0 40 40" className="h-full w-full" fill="none">
        <rect x="1.5" y="1.5" width="37" height="37" rx="12" fill="rgb(var(--ink))" />
        <path d="M10 13.5h20M10 20h20M10 26.5h20" stroke="rgb(var(--bg))" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="14" cy="13.5" r="1.4" fill="rgb(var(--accent))" />
        <circle cx="14" cy="20" r="1.4" fill="rgb(var(--accent-4))" />
        <circle cx="14" cy="26.5" r="1.4" fill="rgb(var(--accent-5))" />
        <rect x="1.5" y="1.5" width="37" height="37" rx="12" stroke="rgb(var(--bg))" strokeOpacity=".14" />
      </svg>
    </span>
  );
}
