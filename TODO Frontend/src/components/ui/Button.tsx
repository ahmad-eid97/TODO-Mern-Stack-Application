import { forwardRef, type ButtonHTMLAttributes } from "react";
import clsx from "clsx";
import Spinner from "./Spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white border border-violet-600 hover:border-violet-500 shadow-lg shadow-violet-900/30",
  secondary:
    "bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-slate-100 border border-slate-600 hover:border-slate-500",
  ghost:
    "bg-transparent hover:bg-slate-700/60 active:bg-slate-700 text-slate-300 hover:text-white border border-transparent",
  danger:
    "bg-red-600/20 hover:bg-red-600/30 active:bg-red-600/40 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50",
  outline:
    "bg-transparent hover:bg-violet-600/10 active:bg-violet-600/20 text-violet-400 hover:text-violet-300 border border-violet-500/40 hover:border-violet-500/70",
};

const sizeStyles: Record<Size, string> = {
  xs: "text-xs px-2.5 py-1.5 rounded-lg gap-1",
  sm: "text-sm px-3 py-2 rounded-lg gap-1.5",
  md: "text-sm px-4 py-2.5 rounded-xl gap-2",
  lg: "text-base px-5 py-3 rounded-xl gap-2",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading,
      leftIcon,
      rightIcon,
      fullWidth,
      className,
      children,
      disabled,
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;
    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={clsx(
          "inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer select-none",
          "focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className,
        )}
        {...rest}
      >
        {isLoading ? (
          <Spinner size="sm" className="shrink-0" />
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {!isLoading && rightIcon && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  },
);
Button.displayName = "Button";
export default Button;
