import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { useTodos } from "../todos/TodoContext";

export default function OverdueAlert() {
  const { todos } = useTodos();
  const overdue = todos.filter(
    (t) =>
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "completed",
  );

  if (overdue.length === 0) return null;

  return (
    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
      <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
      <p className="text-sm text-red-300">
        You have <strong>{overdue.length}</strong> overdue todo
        {overdue.length === 1 ? "" : "s"}.{" "}
        <Link
          to="/todos"
          className="underline underline-offset-2 hover:text-red-200 transition-colors"
        >
          Review them →
        </Link>
      </p>
    </div>
  );
}
