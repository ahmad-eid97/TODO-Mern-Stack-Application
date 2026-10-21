import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import { useTodos } from "../todos/TodoContext";
import Badge from "../ui/Badge";

export default function RecentTodos() {
  const { dashboard } = useTodos();
  const todos = dashboard?.recentTodos ?? [];
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold text-white"><Clock className="h-4 w-4 text-slate-400" />Recent Todos</h2>
        <Link to="/todos" className="flex items-center gap-1 text-xs text-violet-400">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
      </div>
      {todos.length === 0 ? <p className="py-10 text-center text-sm text-slate-400">No todos yet. Use New Todo to create your first task.</p> : (
        <div className="space-y-2">
          {todos.map(todo => <Link key={todo.id} to="/todos" className="flex items-center justify-between gap-3 rounded-xl border border-slate-700/50 bg-slate-800/60 p-3 hover:bg-slate-700/60">
            <div className="min-w-0">
              <p className="truncate text-sm text-white">{todo.title}</p>
              <p className="mt-1 text-xs text-slate-400">{todo.status === "in_progress" ? "In progress" : todo.status === "completed" ? "Completed" : "Pending"}</p>
            </div>
            <Badge variant={todo.priority}>{todo.priority}</Badge>
          </Link>)}
        </div>
      )}
    </div>
  );
}
