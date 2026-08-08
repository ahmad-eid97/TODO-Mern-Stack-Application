import clsx from "clsx";

type SpinnerSize = "xs" | "sm" | "md" | "lg";

const sizeClasses: Record<SpinnerSize, string> = {
  xs: "w-3 h-3 border-[2px]",
  sm: "w-4 h-4 border-[2px]",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-[3px]",
};

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

export default function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <span
      role="status"
      className={clsx(
        "inline-block rounded-full border-slate-600 border-t-violet-500 animate-spin",
        sizeClasses[size],
        className,
      )}
    />
  );
}
