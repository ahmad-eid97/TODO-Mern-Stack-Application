import { Link } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { useTodos } from "../todos/TodoContext";
import Badge from "../ui/Badge";

export default function UpcomingDeadlines() {
  const { todos } = useTodos();
  const now = new Date();

  const upcoming = todos
    .filter((t) => t.dueDate && t.status !== "completed")
    .sort(
      (a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          Upcoming Deadlines
        </h2>
        <Link
          to="/todos"
          className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
        >
          View all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Calendar className="w-8 h-8 text-slate-600 mb-2" />
          <p className="text-sm text-slate-400">No upcoming deadlines</p>
          <p className="text-xs text-slate-600 mt-1">
            Add a due date to your todos
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {upcoming.map((todo) => {
            const isOverdue = new Date(todo.dueDate!) < now;
            return (
              <div
                key={todo.id}
                className="flex items-center gap-3 py-2 px-3 bg-slate-800/60 rounded-xl border border-slate-700/50"
              >
                <div
                  className={`w-1.5 h-8 rounded-full shrink-0 ${
                    isOverdue ? "bg-red-500" : "bg-violet-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{todo.title}</p>
                  <p
                    className={`text-xs mt-0.5 ${isOverdue ? "text-red-400" : "text-slate-400"}`}
                  >
                    {format(new Date(todo.dueDate!), "MMM d, yyyy")}
                    {isOverdue && " · Overdue"}
                  </p>
                </div>
                <Badge variant={todo.priority}>{todo.priority}</Badge>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
