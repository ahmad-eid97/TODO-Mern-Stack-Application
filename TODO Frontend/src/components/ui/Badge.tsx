import clsx from "clsx";
import type { TodoPriority, TodoStatus } from "../../types/todo.types";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "purple"
  | TodoPriority
  | TodoStatus;

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-slate-700 text-slate-300",
  success: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  warning: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
  danger: "bg-red-500/15 text-red-400 border border-red-500/20",
  info: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  purple: "bg-violet-500/15 text-violet-400 border border-violet-500/20",
  // Priority
  low: "bg-slate-600/40 text-slate-300 border border-slate-600/40",
  medium: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  high: "bg-orange-500/15 text-orange-400 border border-orange-500/20",
  urgent: "bg-red-500/15 text-red-400 border border-red-500/20",
  // Status
  pending: "bg-slate-600/40 text-slate-300 border border-slate-600/40",
  in_progress: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  completed: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export default function Badge({
  variant = "default",
  children,
  className,
  dot,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full",
        variantStyles[variant],
        className,
      )}
    >
      {dot && (
        <span
          className={clsx("w-1.5 h-1.5 rounded-full shrink-0", {
            "bg-slate-400":
              variant === "default" ||
              variant === "pending" ||
              variant === "low",
            "bg-emerald-400": variant === "success" || variant === "completed",
            "bg-amber-400": variant === "warning",
            "bg-red-400": variant === "danger" || variant === "urgent",
            "bg-blue-400":
              variant === "info" ||
              variant === "in_progress" ||
              variant === "medium",
            "bg-orange-400": variant === "high",
            "bg-violet-400": variant === "purple",
          })}
        />
      )}
      {children}
    </span>
  );
}
