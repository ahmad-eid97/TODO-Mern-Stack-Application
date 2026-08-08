import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, ArrowRight, Plus, CheckSquare } from "lucide-react";
import { useTodos } from "../todos/TodoContext";
import TodoCard from "../todos/TodoCard";
import TodoForm from "../todos/TodoForm";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";

export default function RecentTodos() {
  const { todos } = useTodos();
  const [showForm, setShowForm] = useState(false);

  const recentTodos = [...todos]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  return (
    <>
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            Recent Todos
          </h2>
          <Link
            to="/todos"
            className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentTodos.length === 0 ? (
          <EmptyState
            icon={<CheckSquare className="w-6 h-6" />}
            title="No todos yet"
            description="Create your first todo to get started."
            action={
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setShowForm(true)}
              >
                Create Todo
              </Button>
            }
          />
        ) : (
          <div className="space-y-2">
            {recentTodos.map((todo) => (
              <TodoCard key={todo.id} todo={todo} />
            ))}
          </div>
        )}
      </div>

      <TodoForm isOpen={showForm} onClose={() => setShowForm(false)} />
    </>
  );
}
