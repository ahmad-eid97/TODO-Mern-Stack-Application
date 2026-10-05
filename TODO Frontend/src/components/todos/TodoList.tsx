import { useTodos } from "./TodoContext";
import TodoCard from "./TodoCard";
import EmptyState from "../ui/EmptyState";
import Button from "../ui/Button";
import { CheckSquare, Plus } from "lucide-react";
import { useState } from "react";
import TodoForm from "./TodoForm";

export default function TodoList() {
  const {
    filteredTodos,
    isLoading,
    isFetching,
    filters,
    error,
    refreshTodos,
    pagination,
    page,
    setPage,
  } = useTodos();
  const [showForm, setShowForm] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl skeleton" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 space-y-3"
      >
        <p className="text-sm text-red-300">{error}</p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => void refreshTodos()}
        >
          Try again
        </Button>
      </div>
    );
  }

  if (filteredTodos.length === 0) {
    const isFiltered =
      filters.search ||
      filters.status !== "all" ||
      filters.priority !== "all" ||
      Boolean(filters.category);

    return (
      <>
        <EmptyState
          icon={<CheckSquare className="w-8 h-8" />}
          title={isFiltered ? "No todos match your filters" : "No todos yet"}
          description={
            isFiltered
              ? "Try adjusting your search or filters."
              : "Create your first todo to get started!"
          }
          action={
            !isFiltered ? (
              <Button
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setShowForm(true)}
              >
                Create Todo
              </Button>
            ) : undefined
          }
        />
        <TodoForm isOpen={showForm} onClose={() => setShowForm(false)} />
      </>
    );
  }

  return (
    <div className="space-y-2.5 animate-fade-in" aria-busy={isFetching}>
      {filteredTodos.map((todo) => (
        <TodoCard key={todo.id} todo={todo} />
      ))}
      {pagination.totalPages > 1 && (
        <nav
          aria-label="Todo pages"
          className="flex items-center justify-between gap-3 pt-3"
        >
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-slate-400">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </nav>
      )}
    </div>
  );
}
