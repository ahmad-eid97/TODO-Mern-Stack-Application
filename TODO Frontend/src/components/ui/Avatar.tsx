import clsx from "clsx";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const sizeClasses: Record<AvatarSize, string> = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-xl",
};

interface AvatarProps {
  name: string;
  src?: string;
  size?: AvatarSize;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// Generate a stable hue from a string
function nameToColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "from-violet-600 to-purple-600",
    "from-indigo-600 to-blue-600",
    "from-emerald-600 to-teal-600",
    "from-orange-600 to-amber-600",
    "from-pink-600 to-rose-600",
    "from-cyan-600 to-sky-600",
  ];
  return colors[Math.abs(hash) % colors.length];
}

export default function Avatar({
  name,
  src,
  size = "md",
  className,
}: AvatarProps) {
  return (
    <div
      className={clsx(
        "rounded-full shrink-0 overflow-hidden flex items-center justify-center font-semibold text-white",
        !src && `bg-gradient-to-br ${nameToColor(name)}`,
        sizeClasses[size],
        className,
      )}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}
