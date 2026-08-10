import { cn } from "@/lib/utils";

export default function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("relative grid h-10 w-10 shrink-0 place-items-center", className)} aria-hidden="true">
      <svg viewBox="0 0 40 40" className="h-full w-full" fill="none">
        <rect x="2" y="2" width="36" height="36" fill="#ff3e00" stroke="#111" strokeWidth="3" />
        <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" fill="white" fontFamily="Space Mono, monospace" fontSize="18" fontWeight="700" fontStyle="italic">
          &gt;_
        </text>
      </svg>
    </span>
  );
}
