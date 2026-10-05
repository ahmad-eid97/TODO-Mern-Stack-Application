import { useState } from "react";
import {
  Pencil,
  Trash2,
  Calendar,
  Tag,
  Check,
  ListChecks,
  ChevronDown,
} from "lucide-react";
import clsx from "clsx";
import type { Todo } from "../../types/todo.types";
import { useTodos } from "./TodoContext";
import Badge from "../ui/Badge";
import ConfirmDialog from "../ui/ConfirmDialog";
import TodoForm from "./TodoForm";
import { formatDueDate } from "../../utils/dateUtils";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/errorUtils";

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
  const { toggleTodo, deleteTodo, toggleSubtask, pendingTodoIds } = useTodos();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);

  const isCompleted = todo.status === "completed";
  const isPending = pendingTodoIds.includes(todo.id);
  const dueInfo = todo.dueDate
    ? formatDueDate(todo.dueDate, isCompleted)
    : null;
  const completedSubtasks = todo.subtasks.filter((s) => s.completed).length;

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteTodo(todo.id);
      setShowDelete(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleteLoading(false);
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
            role="checkbox"
            aria-checked={isCompleted}
            aria-label={`Mark ${todo.title} as ${isCompleted ? "pending" : "completed"}`}
            disabled={isPending}
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
                  aria-label={`Edit ${todo.title}`}
                  disabled={isPending}
                  onClick={() => setShowEdit(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 transition-all"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  aria-label={`Delete ${todo.title}`}
                  disabled={isPending}
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
            </div>

            {todo.subtasks.length > 0 && (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900/30">
                <button
                  type="button"
                  aria-expanded={showSubtasks}
                  aria-controls={`subtasks-${todo.id}`}
                  aria-label={`${showSubtasks ? "Hide" : "Show"} subtasks for ${todo.title}`}
                  onClick={() => setShowSubtasks((open) => !open)}
                  className="w-full px-3 py-3 text-left transition-colors hover:bg-slate-700/20"
                >
                  <div className="flex items-center gap-2">
                    <ListChecks className="h-4 w-4 shrink-0 text-violet-400" />
                    <span className="flex-1 text-xs font-medium text-slate-200">
                      Subtasks
                    </span>
                    <span
                      className={clsx(
                        "rounded-md px-2 py-0.5 text-xs font-medium tabular-nums",
                        completedSubtasks === todo.subtasks.length
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-slate-700/60 text-slate-400",
                      )}
                    >
                      {completedSubtasks}/{todo.subtasks.length} done
                    </span>
                    <ChevronDown
                      className={clsx(
                        "h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200",
                        showSubtasks && "rotate-180",
                      )}
                    />
                  </div>
                  <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-slate-700/60">
                    <div
                      className={clsx(
                        "h-full rounded-full transition-all duration-300",
                        completedSubtasks === todo.subtasks.length
                          ? "bg-emerald-500"
                          : "bg-violet-500",
                      )}
                      style={{
                        width: `${(completedSubtasks / todo.subtasks.length) * 100}%`,
                      }}
                    />
                  </div>
                </button>

                {showSubtasks && (
                  <ul
                    id={`subtasks-${todo.id}`}
                    className="space-y-1 border-t border-slate-700/50 p-2"
                  >
                    {todo.subtasks.map((subtask) => (
                      <li key={subtask.id}>
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={subtask.completed}
                          aria-label={`Toggle subtask ${subtask.title}`}
                          disabled={isPending}
                          onClick={() => toggleSubtask(todo.id, subtask.id)}
                          className="flex min-h-10 w-full items-start gap-2.5 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-slate-700/30 disabled:cursor-wait disabled:opacity-60"
                        >
                          <span
                            className={clsx(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-colors",
                              subtask.completed
                                ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400"
                                : "border-slate-500 bg-slate-800/60",
                            )}
                          >
                            {subtask.completed && (
                              <Check className="h-3 w-3" strokeWidth={3} />
                            )}
                          </span>
                          <span
                            className={clsx(
                              "min-w-0 flex-1 break-words text-xs leading-4",
                              subtask.completed
                                ? "text-slate-500 line-through"
                                : "text-slate-300",
                            )}
                          >
                            {subtask.title}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
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
