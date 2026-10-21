import { useTodos } from "../todos/TodoContext";
import Badge from "../ui/Badge";
import type { TodoPriority } from "../../types/todo.types";

const PRIORITIES: TodoPriority[] = ["urgent", "high", "medium", "low"];

const BAR_COLOR: Record<TodoPriority, string> = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-blue-500",
  low: "bg-slate-500",
};

export default function PriorityBreakdown() {
  const { dashboard } = useTodos();

  if (!dashboard || dashboard.stats.total === 0) return null;

  return (
    <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5">
      <h2 className="text-base font-semibold text-white mb-4">
        Priority Breakdown
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PRIORITIES.map((p) => {
          const { total = 0, completed = 0 } = dashboard.priorityBreakdown.find(item => item.priority === p) ?? {};
          const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

          return (
            <div
              key={p}
              className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50"
            >
              <div className="flex items-center justify-between mb-1.5">
                <Badge variant={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Badge>
                <span className="text-sm font-semibold text-white">
                  {total}
                </span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full">
                <div
                  className={`h-full rounded-full transition-all ${BAR_COLOR[p]}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">{pct}% done</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
