import { cn } from "@/lib/utils";

export default function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("relative grid h-10 w-10 shrink-0 place-items-center", className)} aria-hidden="true">
      <svg viewBox="0 0 40 40" className="h-full w-full" fill="none">
        <rect x="2" y="2" width="36" height="36" fill="#ff3e00" stroke="#111" strokeWidth="3" />
        <ellipse cx="20" cy="13" rx="9" ry="4" fill="none" stroke="white" strokeWidth="2.2" />
        <path d="M11 13v14c0 2.2 4 4 9 4s9-1.8 9-4V13" fill="none" stroke="white" strokeWidth="2.2" />
        <path d="M11 20c0 2.2 4 4 9 4s9-1.8 9-4" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6" />
      </svg>
    </span>
  );
}
