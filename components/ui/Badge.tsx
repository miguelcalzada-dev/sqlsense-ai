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
        "inline-flex items-center gap-1 border-2 border-line px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider shadow-brutal-sm",
        !color && "bg-bg-soft",
        className,
      )}
      style={
        color
          ? {
              color: "white",
              background: color,
            }
          : undefined
      }
    >
      {children}
    </span>
  );
}

export default Badge;
