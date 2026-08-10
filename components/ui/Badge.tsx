import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  color,
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11.5px] font-medium",
        !color && "border-line-soft bg-bg-soft text-ink-soft",
        className,
      )}
      style={
        color
          ? {
              color,
              background: `color-mix(in srgb, ${color} 10%, transparent)`,
              borderColor: `color-mix(in srgb, ${color} 20%, transparent)`,
            }
          : undefined
      }
    >
      {children}
    </span>
  );
}