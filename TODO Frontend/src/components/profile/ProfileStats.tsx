import { CheckCircle2, ListTodo, TrendingUp, Clock } from "lucide-react";
import { useTodos } from "../todos/TodoContext";

export default function ProfileStats() {
  const { stats } = useTodos();

  const items = [
    {
      icon: <ListTodo className="w-5 h-5" />,
      label: "Total",
      value: stats?.total ?? 0,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      icon: <CheckCircle2 className="w-5 h-5" />,
      label: "Completed",
      value: stats?.completed ?? 0,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: "Pending",
      value: stats?.pending ?? 0,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: "Done Rate",
      value: `${stats?.completionRate ?? 0}%`,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((s) => (
        <div
          key={s.label}
          className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 flex items-center gap-3"
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}
          >
            <span className={s.color}>{s.icon}</span>
          </div>
          <div>
            <p className="text-lg font-bold text-white">{s.value}</p>
            <p className="text-xs text-slate-400">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
