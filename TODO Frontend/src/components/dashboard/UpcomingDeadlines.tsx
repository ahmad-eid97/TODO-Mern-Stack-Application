import { Link } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { useTodos } from "../todos/TodoContext";
import Badge from "../ui/Badge";

export default function UpcomingDeadlines() {
  const { dashboard } = useTodos();
  const todos = dashboard?.upcomingDeadlines ?? [];
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold text-white"><Calendar className="h-4 w-4 text-slate-400" />Upcoming Deadlines</h2>
        <Link to="/todos" className="flex items-center gap-1 text-xs text-violet-400">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
      </div>
      {todos.length === 0 ? <p className="py-10 text-center text-sm text-slate-400">No upcoming deadlines</p> : (
        <div className="space-y-2.5">
          {todos.map(todo => <Link key={todo.id} to="/todos" className="flex items-center gap-3 rounded-xl border border-slate-700/50 bg-slate-800/60 px-3 py-2 hover:bg-slate-700/60">
            <div className="h-8 w-1.5 shrink-0 rounded-full bg-violet-500" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-white">{todo.title}</p>
              <p className="mt-0.5 text-xs text-slate-400">{todo.dueDate ? format(new Date(todo.dueDate), "MMM d, yyyy") : "No deadline"}</p>
            </div>
            <Badge variant={todo.priority}>{todo.priority}</Badge>
          </Link>)}
        </div>
      )}
    </div>
  );
}
