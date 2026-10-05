import {
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  ListTodo,
} from "lucide-react";
import clsx from "clsx";
import { useTodos } from "./TodoContext";
import type { FilterStatus } from "../../types/todo.types";
import { useNavigate } from "react-router-dom";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
  color: string;
  bgColor: string;
  borderColor: string;
  onClick?: () => void;
  active?: boolean;
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
  bgColor,
  borderColor,
  onClick,
  active,
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "flex items-center gap-4 bg-slate-800/60 rounded-xl p-4 border transition-all duration-150",
        onClick && "cursor-pointer hover:bg-slate-800",
        active ? `${borderColor} shadow-lg` : "border-slate-700/60",
      )}
    >
      <div
        className={clsx(
          "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
          bgColor,
        )}
      >
        <span className={clsx("w-5 h-5", color)}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-white leading-none">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5">{label}</p>
        {sub && (
          <p className={clsx("text-xs font-medium mt-0.5", color)}>{sub}</p>
        )}
      </div>
    </div>
  );
}

export default function TodoStats() {
  const { stats, filters, setStatus } = useTodos();
  const navigate = useNavigate();

  if (!stats) return null;

  const clickFilter = (status: FilterStatus) => {
    setStatus(filters.status === status ? "all" : status);
    navigate("/todos");
  };

  const cards = [
    {
      icon: <ListTodo className="w-5 h-5" />,
      label: "Total Todos",
      value: stats.total,
      color: "text-violet-400",
      bgColor: "bg-violet-500/15",
      borderColor: "border-violet-500/40",
      onClick: () => clickFilter("all"),
      status: "all" as FilterStatus,
    },
    {
      icon: <CheckCircle2 className="w-5 h-5" />,
      label: "Completed",
      value: stats.completed,
      sub: stats.total > 0 ? `${stats.completionRate}% rate` : undefined,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/15",
      borderColor: "border-emerald-500/40",
      onClick: () => clickFilter("completed"),
      status: "completed" as FilterStatus,
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: "Pending",
      value: stats.pending,
      color: "text-blue-400",
      bgColor: "bg-blue-500/15",
      borderColor: "border-blue-500/40",
      onClick: () => clickFilter("pending"),
      status: "pending" as FilterStatus,
    },
    {
      icon: <AlertCircle className="w-5 h-5" />,
      label: "Overdue",
      value: stats.overdue,
      color: "text-red-400",
      bgColor: "bg-red-500/15",
      borderColor: "border-red-500/40",
      onClick: () => clickFilter("overdue"),
      status: "overdue" as FilterStatus,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => (
          <StatCard
            key={card.label}
            {...card}
            active={filters.status === card.status}
          />
        ))}
      </div>

      {/* Progress bar */}
      {stats.total > 0 && (
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <TrendingUp className="w-4 h-4 text-violet-400" />
              <span>Overall Progress</span>
            </div>
            <span className="text-sm font-semibold text-white">
              {stats.completionRate}%
            </span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-purple-500 rounded-full transition-all duration-700"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
            <span>{stats.completed} completed</span>
            <span>{stats.total - stats.completed} remaining</span>
          </div>
        </div>
      )}
    </div>
  );
}
