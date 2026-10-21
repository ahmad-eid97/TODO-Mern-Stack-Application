import { useState } from "react";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "../auth/AuthContext";
import { useTodos } from "../todos/TodoContext";
import Button from "../ui/Button";
import TodoForm from "../todos/TodoForm";

export default function DashboardHeader() {
  const { user } = useAuth();
  const { dashboard, isLoading, error } = useTodos();
  const stats = dashboard?.stats;
  const [showForm, setShowForm] = useState(false);

  const now = new Date();
  const greeting =
    now.getHours() < 12
      ? "Good morning"
      : now.getHours() < 17
        ? "Good afternoon"
        : "Good evening";

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {greeting}, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {format(now, "EEEE, MMMM d, yyyy")} &nbsp;·&nbsp;
            {isLoading || error || !stats
              ? "Your task overview"
              : stats.pending
              ? `You have ${stats.pending} pending todo${stats.pending === 1 ? "" : "s"}`
              : "You're all caught up!"}
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setShowForm(true)}
          className="shrink-0"
        >
          New Todo
        </Button>
      </div>

      <TodoForm isOpen={showForm} onClose={() => setShowForm(false)} />
    </>
  );
}
