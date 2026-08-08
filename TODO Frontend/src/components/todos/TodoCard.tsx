import { useState } from "react";
import {
  Pencil,
  Trash2,
  Calendar,
  Tag,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import clsx from "clsx";
import type { Todo } from "../../types/todo.types";
import { useTodos } from "./TodoContext";
import Badge from "../ui/Badge";
import ConfirmDialog from "../ui/ConfirmDialog";
import TodoForm from "./TodoForm";
import { formatDueDate } from "../../utils/dateUtils";

interface TodoCardProps {
  todo: Todo;
}

const priorityBorder: Record<string, string> = {
  low: "border-l-slate-600",
  medium: "border-l-blue-500",
  high: "border-l-orange-500",
  urgent: "border-l-red-500",
};

const statusLabel: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
};

export default function TodoCard({ todo }: TodoCardProps) {
  const { toggleTodo, deleteTodo, toggleSubtask } = useTodos();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);

  const isCompleted = todo.status === "completed";
  const dueInfo = todo.dueDate ? formatDueDate(todo.dueDate) : null;
  const completedSubtasks = todo.subtasks.filter((s) => s.completed).length;

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteTodo(todo.id);
    } finally {
      setDeleteLoading(false);
      setShowDelete(false);
    }
  };

  return (
    <>
      <div
        className={clsx(
          "group bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 border-l-4 transition-all duration-150",
          "hover:bg-slate-800 hover:border-slate-600/80 hover:shadow-lg hover:shadow-black/20",
          priorityBorder[todo.priority],
          isCompleted && "opacity-60",
        )}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={() => toggleTodo(todo.id)}
            className={clsx(
              "mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
              isCompleted
                ? "bg-emerald-500 border-emerald-500 text-white"
                : "border-slate-500 hover:border-violet-400",
            )}
          >
            {isCompleted && (
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={clsx(
                  "text-sm font-medium text-white leading-snug",
                  isCompleted && "line-through text-slate-400",
                )}
              >
                {todo.title}
              </h3>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => setShowEdit(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 transition-all"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setShowDelete(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {todo.description && (
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                {todo.description}
              </p>
            )}

            {todo.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {todo.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-slate-400 bg-slate-700/60 px-2 py-0.5 rounded-full flex items-center gap-1"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center flex-wrap gap-2 mt-3">
              <Badge variant={todo.priority} dot>
                {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
              </Badge>
              <Badge variant={todo.status} dot>
                {statusLabel[todo.status]}
              </Badge>
              {todo.category && <Badge variant="purple">{todo.category}</Badge>}
              {dueInfo && (
                <span
                  className={clsx(
                    "text-xs flex items-center gap-1",
                    dueInfo.isOverdue
                      ? "text-red-400"
                      : dueInfo.isUrgent
                        ? "text-amber-400"
                        : "text-slate-400",
                  )}
                >
                  <Calendar className="w-3 h-3" />
                  {dueInfo.label}
                </span>
              )}
              {todo.subtasks.length > 0 && (
                <button
                  onClick={() => setShowSubtasks((s) => !s)}
                  className="ml-auto text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                >
                  <span className="text-slate-500">
                    {completedSubtasks}/{todo.subtasks.length}
                  </span>
                  {showSubtasks ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>

            {todo.subtasks.length > 0 && (
              <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${(completedSubtasks / todo.subtasks.length) * 100}%`,
                  }}
                />
              </div>
            )}

            {showSubtasks && todo.subtasks.length > 0 && (
              <div className="mt-3 space-y-1.5 pl-1 border-l-2 border-slate-700">
                {todo.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSubtask(todo.id, subtask.id)}
                      className={clsx(
                        "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all",
                        subtask.completed
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-slate-500 hover:border-slate-400",
                      )}
                    >
                      {subtask.completed && (
                        <svg
                          className="w-2.5 h-2.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>
                    <span
                      className={clsx(
                        "text-xs text-slate-400",
                        subtask.completed && "line-through text-slate-600",
                      )}
                    >
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <TodoForm
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        todo={todo}
      />
      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        isLoading={deleteLoading}
        title="Delete Todo"
        message={`"${todo.title}" will be permanently deleted.`}
      />
    </>
  );
}
