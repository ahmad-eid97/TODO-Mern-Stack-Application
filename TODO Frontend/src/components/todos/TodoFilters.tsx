import { SortAsc, SortDesc, X } from "lucide-react";
import clsx from "clsx";
import { useTodos, DEFAULT_FILTERS } from "./TodoContext";
import type { FilterStatus, TodoPriority } from "../../types/todo.types";
import { Select } from "../ui/Input";
import Button from "../ui/Button";

const STATUS_TABS: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "overdue", label: "Overdue" },
];

const PRIORITY_OPTIONS = [
  { value: "all", label: "All priorities" },
  { value: "urgent", label: "🟥 Urgent" },
  { value: "high", label: "🟧 High" },
  { value: "medium", label: "🟨 Medium" },
  { value: "low", label: "🟦 Low" },
];

const SORT_OPTIONS = [
  { value: "createdAt", label: "Date created" },
  { value: "dueDate", label: "Due date" },
  { value: "priority", label: "Priority" },
  { value: "title", label: "Title (A–Z)" },
];

export default function TodoFilters() {
  const {
    filters,
    setFilters,
    setStatus,
    resetFilters,
    filteredTodos,
    todos,
    categories,
  } = useTodos();

  const isFiltered =
    filters.search !== DEFAULT_FILTERS.search ||
    filters.status !== DEFAULT_FILTERS.status ||
    filters.priority !== DEFAULT_FILTERS.priority ||
    filters.category !== DEFAULT_FILTERS.category;

  const categoryOptions = [
    { value: "all", label: "All categories" },
    ...categories.map((c) => ({ value: c, label: c })),
  ];

  const toggleSort = () =>
    setFilters({ sortDir: filters.sortDir === "desc" ? "asc" : "desc" });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {STATUS_TABS.map((tab) => {
          const count =
            tab.value === "all"
              ? todos.length
              : tab.value === "overdue"
                ? todos.filter(
                    (t) =>
                      t.dueDate &&
                      new Date(t.dueDate) < new Date() &&
                      t.status !== "completed",
                  ).length
                : todos.filter((t) => t.status === tab.value).length;

          return (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-1.5",
                filters.status === tab.value
                  ? tab.value === "overdue"
                    ? "bg-red-500/20 text-red-300 border border-red-500/40"
                    : "bg-violet-600/20 text-violet-300 border border-violet-500/40"
                  : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-slate-200",
              )}
            >
              {tab.label}
              <span
                className={clsx(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  filters.status === tab.value
                    ? tab.value === "overdue"
                      ? "bg-red-500/30 text-red-300"
                      : "bg-violet-600/30 text-violet-300"
                    : "bg-slate-700 text-slate-500",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Select
            containerClassName="min-w-[150px]"
            options={PRIORITY_OPTIONS}
            value={filters.priority}
            onChange={(e) =>
              setFilters({ priority: e.target.value as TodoPriority | "all" })
            }
          />
          {categories.length > 0 && (
            <Select
              containerClassName="min-w-[150px]"
              options={categoryOptions}
              value={filters.category}
              onChange={(e) => setFilters({ category: e.target.value })}
            />
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Select
            containerClassName="w-40"
            options={SORT_OPTIONS}
            value={filters.sortBy}
            onChange={(e) =>
              setFilters({ sortBy: e.target.value as typeof filters.sortBy })
            }
          />
          <button
            onClick={toggleSort}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
            title={`Sort ${filters.sortDir === "desc" ? "ascending" : "descending"}`}
          >
            {filters.sortDir === "desc" ? (
              <SortDesc className="w-4 h-4" />
            ) : (
              <SortAsc className="w-4 h-4" />
            )}
          </button>

          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<X className="w-3.5 h-3.5" />}
              onClick={resetFilters}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {isFiltered && (
        <p className="text-xs text-slate-500">
          Showing{" "}
          <span className="text-slate-300 font-medium">
            {filteredTodos.length}
          </span>{" "}
          of <span className="text-slate-300 font-medium">{todos.length}</span>{" "}
          todos
        </p>
      )}
    </div>
  );
}
