/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import toast from "react-hot-toast";
import { todosApi } from "../../api/todosApi";
import type {
  Todo,
  CreateTodoPayload,
  UpdateTodoPayload,
  TodoFilters,
  TodoStats,
  FilterStatus,
  TodoPriority,
} from "../../types/todo.types";
import { useAuth } from "../auth/AuthContext";
import { getErrorMessage } from "../../utils/errorUtils";

const PRIORITY_ORDER: Record<TodoPriority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export const DEFAULT_FILTERS: TodoFilters = {
  search: "",
  status: "all",
  priority: "all",
  category: "all",
  sortBy: "createdAt",
  sortDir: "desc",
};

function applyFilters(todos: Todo[], filters: TodoFilters): Todo[] {
  let result = [...todos];
  const now = new Date();

  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        t.category?.toLowerCase().includes(q),
    );
  }

  if (filters.status !== "all") {
    if (filters.status === "overdue") {
      result = result.filter(
        (t) =>
          t.dueDate && new Date(t.dueDate) < now && t.status !== "completed",
      );
    } else {
      result = result.filter((t) => t.status === filters.status);
    }
  }

  if (filters.priority !== "all") {
    result = result.filter((t) => t.priority === filters.priority);
  }

  if (filters.category !== "all") {
    result = result.filter((t) => t.category === filters.category);
  }

  result.sort((a, b) => {
    switch (filters.sortBy) {
      case "title":
        return filters.sortDir === "desc"
          ? -a.title.localeCompare(b.title)
          : a.title.localeCompare(b.title);
      case "priority":
        return filters.sortDir === "desc"
          ? -(PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority])
          : PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
      case "dueDate":
        if (!a.dueDate && !b.dueDate) {
          return 0;
        }
        if (!a.dueDate) {
          return filters.sortDir === "desc" ? -1 : 1;
        }
        if (!b.dueDate) {
          return filters.sortDir === "desc" ? 1 : -1;
        }
        return filters.sortDir === "desc"
          ? -(new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
          : new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case "createdAt":
      default:
        return filters.sortDir === "desc"
          ? -(new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return result;
}

interface TodoState {
  todos: Todo[];
  stats: TodoStats | null;
  isLoading: boolean;
  filters: TodoFilters;
}

type TodoAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_TODOS"; payload: Todo[] }
  | { type: "SET_STATS"; payload: TodoStats }
  | { type: "ADD_TODO"; payload: Todo }
  | { type: "UPDATE_TODO"; payload: Todo }
  | { type: "REMOVE_TODO"; payload: string }
  | { type: "SET_FILTERS"; payload: Partial<TodoFilters> }
  | { type: "RESET_FILTERS" }
  | { type: "CLEAR" };

const initialState: TodoState = {
  todos: [],
  stats: null,
  isLoading: false,
  filters: DEFAULT_FILTERS,
};

function reducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_TODOS":
      return { ...state, todos: action.payload, isLoading: false };
    case "SET_STATS":
      return { ...state, stats: action.payload };
    case "ADD_TODO":
      return { ...state, todos: [action.payload, ...state.todos] };
    case "UPDATE_TODO":
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.payload.id ? action.payload : t,
        ),
      };
    case "REMOVE_TODO":
      return {
        ...state,
        todos: state.todos.filter((t) => t.id !== action.payload),
      };
    case "SET_FILTERS":
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case "RESET_FILTERS":
      return { ...state, filters: DEFAULT_FILTERS };
    case "CLEAR":
      return { ...initialState };
    default:
      return state;
  }
}

interface TodoContextValue extends TodoState {
  filteredTodos: Todo[];
  categories: string[];
  createTodo: (payload: CreateTodoPayload) => Promise<void>;
  updateTodo: (id: string, payload: UpdateTodoPayload) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  toggleSubtask: (todoId: string, subtaskId: string) => Promise<void>;
  deleteCompleted: () => Promise<void>;
  setFilters: (f: Partial<TodoFilters>) => void;
  setStatus: (s: FilterStatus) => void;
  resetFilters: () => void;
  refreshTodos: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

const TodoContext = createContext<TodoContextValue | undefined>(undefined);

export function TodoProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  const refreshTodos = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const res = await todosApi.getAll();
      dispatch({ type: "SET_TODOS", payload: res.data });
    } catch {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      const res = await todosApi.getStats();
      dispatch({ type: "SET_STATS", payload: res.data });
    } catch {
      //
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refreshTodos();
      refreshStats();
    } else {
      dispatch({ type: "CLEAR" });
    }
  }, [isAuthenticated, refreshTodos, refreshStats]);

  useEffect(() => {
    const now = new Date();
    const { todos } = state;
    const completed = todos.filter((t) => t.status === "completed").length;
    const stats: TodoStats = {
      total: todos.length,
      completed,
      pending: todos.filter((t) => t.status === "pending").length,
      inProgress: todos.filter((t) => t.status === "in_progress").length,
      overdue: todos.filter(
        (t) =>
          t.dueDate && new Date(t.dueDate) < now && t.status !== "completed",
      ).length,
      completionRate:
        todos.length > 0 ? Math.round((completed / todos.length) * 100) : 0,
    };
    dispatch({ type: "SET_STATS", payload: stats });
  }, [state.todos]); // eslint-disable-line react-hooks/exhaustive-deps

  const createTodo = async (payload: CreateTodoPayload) => {
    const res = await todosApi.create(payload);
    dispatch({ type: "ADD_TODO", payload: res.data });
    toast.success("Todo created!");
  };

  const updateTodo = async (id: string, payload: UpdateTodoPayload) => {
    const res = await todosApi.update(id, payload);
    dispatch({ type: "UPDATE_TODO", payload: res.data });
    toast.success("Todo updated!");
  };

  const deleteTodo = async (id: string) => {
    await todosApi.delete(id);
    dispatch({ type: "REMOVE_TODO", payload: id });
    toast.success("Todo deleted");
  };

  const toggleTodo = async (id: string) => {
    try {
      const res = await todosApi.toggle(id);
      dispatch({ type: "UPDATE_TODO", payload: res.data });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const toggleSubtask = async (todoId: string, subtaskId: string) => {
    try {
      const res = await todosApi.toggleSubtask(todoId, subtaskId);
      dispatch({ type: "UPDATE_TODO", payload: res.data });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const deleteCompleted = async () => {
    await todosApi.deleteCompleted();
    await refreshTodos();
    toast.success("Completed todos cleared");
  };

  const setFilters = (f: Partial<TodoFilters>) =>
    dispatch({ type: "SET_FILTERS", payload: f });
  const setStatus = (s: FilterStatus) =>
    dispatch({ type: "SET_FILTERS", payload: { status: s } });
  const resetFilters = () => dispatch({ type: "RESET_FILTERS" });

  const categories = Array.from(
    new Set(state.todos.map((t) => t.category).filter(Boolean)),
  ) as string[];

  const filteredTodos = applyFilters(state.todos, state.filters);

  return (
    <TodoContext.Provider
      value={{
        ...state,
        filteredTodos,
        categories,
        createTodo,
        updateTodo,
        deleteTodo,
        toggleTodo,
        toggleSubtask,
        deleteCompleted,
        setFilters,
        setStatus,
        resetFilters,
        refreshTodos,
        refreshStats,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}

export function useTodos(): TodoContextValue {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error("useTodos must be used within <TodoProvider>");
  return ctx;
}
