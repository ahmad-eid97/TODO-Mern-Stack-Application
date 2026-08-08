import { useTodos } from "./TodoContext";
import TodoCard from "./TodoCard";
import EmptyState from "../ui/EmptyState";
import Button from "../ui/Button";
import { CheckSquare, Plus } from "lucide-react";
import { useState } from "react";
import TodoForm from "./TodoForm";

export default function TodoList() {
  const { filteredTodos, isLoading, filters } = useTodos();
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

  if (filteredTodos.length === 0) {
    const isFiltered =
      filters.search ||
      filters.status !== "all" ||
      filters.priority !== "all" ||
      filters.category !== "all";

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
    <div className="space-y-2.5 animate-fade-in">
      {filteredTodos.map((todo) => (
        <TodoCard key={todo.id} todo={todo} />
      ))}
    </div>
  );
}
