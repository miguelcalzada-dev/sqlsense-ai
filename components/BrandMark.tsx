import { cn } from "@/lib/utils";

export default function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("relative grid h-9 w-9 shrink-0 place-items-center", className)} aria-hidden="true">
      <svg viewBox="0 0 40 40" className="h-full w-full" fill="none">
        <defs>
          <linearGradient id="sqlsense-mark" x1="5" y1="4" x2="36" y2="37" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0A84FF" />
            <stop offset="1" stopColor="#5E5CE6" />
          </linearGradient>
        </defs>
        <rect x="1.5" y="1.5" width="37" height="37" rx="12" fill="url(#sqlsense-mark)" />
        <path d="M12 14.25C12 11.9 14.1 10 16.7 10h6.6c2.6 0 4.7 1.9 4.7 4.25 0 2.35-2.1 4.25-4.7 4.25h-6.6c-2.6 0-4.7 1.9-4.7 4.25S14.1 27 16.7 27h6.6c2.6 0 4.7-1.9 4.7-4.25" stroke="white" strokeWidth="2.7" strokeLinecap="round" />
        <path d="M20 14.2v12.1" stroke="white" strokeOpacity=".45" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="1.5" y="1.5" width="37" height="37" rx="12" stroke="white" strokeOpacity=".22" />
      </svg>
    </span>
  );
}
