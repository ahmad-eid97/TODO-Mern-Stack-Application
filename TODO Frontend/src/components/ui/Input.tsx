import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightElement,
      containerClassName,
      className,
      type,
      ...rest
    },
    ref,
  ) => {
    const [showPwd, setShowPwd] = useState(false);
    const isPassword = type === "password";
    const resolvedType = isPassword ? (showPwd ? "text" : "password") : type;

    return (
      <div className={clsx("flex flex-col gap-1.5", containerClassName)}>
        {label && (
          <label className="text-sm font-medium text-slate-300">{label}</label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-slate-400 pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            type={resolvedType}
            className={clsx(
              "w-full bg-slate-800 border rounded-xl text-slate-100 placeholder:text-slate-500",
              "transition-all duration-150",
              "focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500",
              leftIcon ? "pl-10" : "pl-4",
              isPassword || rightElement ? "pr-10" : "pr-4",
              "py-2.5 text-sm",
              error
                ? "border-red-500/60 focus:ring-red-500/40 focus:border-red-500"
                : "border-slate-700 hover:border-slate-600",
              className,
            )}
            {...rest}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPwd((p) => !p)}
              className="absolute right-3 text-slate-400 hover:text-slate-200 transition-colors"
            >
              {showPwd ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
          {!isPassword && rightElement && (
            <span className="absolute right-3 text-slate-400">
              {rightElement}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {!error && hint && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, containerClassName, className, ...rest }, ref) => (
    <div className={clsx("flex flex-col gap-1.5", containerClassName)}>
      {label && (
        <label className="text-sm font-medium text-slate-300">{label}</label>
      )}
      <textarea
        ref={ref}
        className={clsx(
          "w-full bg-slate-800 border rounded-xl text-slate-100 placeholder:text-slate-500",
          "px-4 py-2.5 text-sm resize-none transition-all duration-150",
          "focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500",
          error
            ? "border-red-500/60 focus:ring-red-500/40 focus:border-red-500"
            : "border-slate-700 hover:border-slate-600",
          className,
        )}
        {...rest}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {!error && hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  ),
);
Textarea.displayName = "Textarea";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, containerClassName, options, className, ...rest }, ref) => (
    <div className={clsx("flex flex-col gap-1.5", containerClassName)}>
      {label && (
        <label className="text-sm font-medium text-slate-300">{label}</label>
      )}
      <select
        ref={ref}
        className={clsx(
          "w-full bg-slate-800 border rounded-xl text-slate-100 px-4 py-2.5 text-sm",
          "transition-all duration-150 cursor-pointer appearance-none",
          "focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500",
          error
            ? "border-red-500/60"
            : "border-slate-700 hover:border-slate-600",
          className,
        )}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-slate-800">
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  ),
);
Select.displayName = "Select";

export default Input;
