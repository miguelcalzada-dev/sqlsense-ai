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
  primary: "bg-accent text-white border-line hover:bg-[#e63800]",
  secondary: "bg-surface text-ink border-line hover:bg-bg-soft",
  ghost: "bg-transparent text-ink hover:bg-line hover:text-white",
  danger: "bg-accent-3 text-white border-line",
  subtle: "bg-bg-soft text-ink border-line hover:bg-bg-tertiary",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-xs gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-13 px-6 text-sm gap-2.5",
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
          "inline-flex items-center justify-center font-mono font-bold uppercase tracking-wider border-4 shadow-brutal transition-all duration-100 select-none disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none active:shadow-none active:translate-x-1 active:translate-y-1",
          VARIANTS[variant],
          SIZES[size],
          className,
        )}
        {...rest}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
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
