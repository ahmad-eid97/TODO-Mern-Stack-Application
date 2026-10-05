import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useTodos } from "./TodoContext";
import TodoFilters from "./TodoFilters";
import TodoList from "./TodoList";
import TodoForm from "./TodoForm";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/errorUtils";

export default function Todos() {
  const {
    stats,
    filteredTodos,
    deleteCompleted,
    metadataError,
    refreshMetadata,
  } = useTodos();
  const [showForm, setShowForm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);

  const handleClearCompleted = async () => {
    setClearLoading(true);
    try {
      await deleteCompleted();
      setShowClearConfirm(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setClearLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Todos</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {filteredTodos.length} todo{filteredTodos.length !== 1 ? "s" : ""}{" "}
            shown
            {stats &&
              stats.total !== filteredTodos.length &&
              ` of ${stats.total} total`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {stats && stats.completed > 0 && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => setShowClearConfirm(true)}
              className="text-slate-500 hover:text-red-400"
            >
              Clear completed
            </Button>
          )}
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowForm(true)}
          >
            New Todo
          </Button>
        </div>
      </div>

      {metadataError && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 space-y-3"
        >
          <p className="text-sm text-red-300">
            Could not refresh counts and categories: {metadataError}
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void refreshMetadata()}
          >
            Try again
          </Button>
        </div>
      )}

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4">
        <TodoFilters />
      </div>

      <TodoList />

      <TodoForm isOpen={showForm} onClose={() => setShowForm(false)} />
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearCompleted}
        isLoading={clearLoading}
        title="Clear Completed Todos"
        message={`This will permanently delete all ${stats?.completed} completed todo${stats?.completed === 1 ? "" : "s"}.`}
        confirmLabel="Clear All"
      />
    </div>
  );
}
