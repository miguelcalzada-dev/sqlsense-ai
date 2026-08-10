"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "subtle";
type Size = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
};

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-ink text-[rgb(var(--bg))] hover:opacity-90 active:scale-[0.98] shadow-sm",
  secondary:
    "bg-surface text-ink border border-line hover:bg-bg-soft active:scale-[0.98]",
  ghost: "text-ink-soft hover:text-ink hover:bg-bg-soft",
  danger:
    "bg-accent3/10 text-accent3 border border-accent3/20 hover:bg-accent3/15",
  subtle:
    "bg-bg-soft text-ink-soft hover:text-ink hover:bg-line-soft active:scale-[0.98]",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-lg",
  md: "h-10 px-4 text-[14px] gap-2 rounded-apple",
  lg: "h-12 px-6 text-[15px] gap-2.5 rounded-apple",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      iconLeft,
      iconRight,
      children,
      disabled,
      ...rest
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-semibold ring-focus transition-all duration-200 select-none disabled:opacity-50 disabled:pointer-events-none",
          VARIANTS[variant],
          SIZES[size],
          className,
        )}
        {...rest}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.4} />
        ) : (
          iconLeft
        )}
        {children}
        {!loading && iconRight}
      </button>
    );
  },
);

export default Button;