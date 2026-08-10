import { cn } from "@/lib/utils";

export default function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("relative grid h-9 w-9 shrink-0 place-items-center", className)} aria-hidden="true">
      <svg viewBox="0 0 40 40" className="h-full w-full" fill="none">
        <defs>
          <linearGradient id="brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(6, 182, 212)" />
            <stop offset="100%" stopColor="rgb(139, 92, 246)" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="38" height="38" rx="10" fill="url(#brand-grad)" />
        <path
          d="M12 14L18 20L12 26"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20 26H28"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
