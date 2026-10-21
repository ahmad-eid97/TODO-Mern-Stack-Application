/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { dashboardApi, type DashboardData } from "../../api/dashboardApi";
import { todosApi } from "../../api/todosApi";
import type {
  Todo,
  CreateTodoPayload,
  UpdateTodoPayload,
  TodoFilters,
  TodoStats,
  TodoPagination,
  FilterStatus,
  TodosQuery,
} from "../../types/todo.types";
import { useAuth } from "../auth/AuthContext";
import { getErrorMessage } from "../../utils/errorUtils";

export const DEFAULT_FILTERS: TodoFilters = {
  search: "",
  status: "all",
  priority: "all",
  category: "",
  sortDir: "desc",
};

const EMPTY_PAGINATION: TodoPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

interface TodoState {
  dashboard: DashboardData | null;
  todos: Todo[];
  listKey: string;
  listScopeKey: string;
  stats: TodoStats | null;
  categories: string[];
  pagination: TodoPagination;
  page: number;
  isLoading: boolean;
  isFetching: boolean;
  refreshInBackground: boolean;
  error: string | null;
  metadataError: string | null;
  filters: TodoFilters;
  revision: number;
  pendingTodoIds: string[];
}

type TodoAction =
  | { type: "DASHBOARD"; data: DashboardData }
  | { type: "FETCHING"; background: boolean }
  | {
      type: "LIST";
      todos: Todo[];
      pagination: TodoPagination;
      key: string;
      scopeKey: string;
    }
  | {
      type: "ERROR";
      message: string;
      key: string;
      scopeKey: string;
      background: boolean;
    }
  | { type: "STATS"; stats: TodoStats }
  | { type: "CATEGORIES"; categories: string[] }
  | { type: "METADATA_ERROR"; message: string | null }
  | { type: "FILTERS"; filters: Partial<TodoFilters> }
  | { type: "PAGE"; page: number; background?: boolean }
  | { type: "RESET_FILTERS" }
  | {
      type: "INVALIDATE";
      firstPage?: boolean;
      todo?: Todo;
      background?: boolean;
    }
  | { type: "BUSY"; id: string; busy: boolean }
  | { type: "CLEAR" };

const initialState: TodoState = {
  dashboard: null,
  todos: [],
  listKey: "",
  listScopeKey: "",
  stats: null,
  categories: [],
  pagination: EMPTY_PAGINATION,
  page: 1,
  isLoading: true,
  isFetching: false,
  refreshInBackground: false,
  error: null,
  metadataError: null,
  filters: DEFAULT_FILTERS,
  revision: 0,
  pendingTodoIds: [],
};

function reducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case "DASHBOARD":
      return { ...state, dashboard: action.data, stats: action.data.stats };
    case "FETCHING":
      return {
        ...state,
        isLoading: action.background ? state.isLoading : true,
        isFetching: true,
        error: null,
      };
    case "LIST":
      return {
        ...state,
        todos: action.todos,
        listKey: action.key,
        listScopeKey: action.scopeKey,
        pagination: action.pagination,
        isLoading: false,
        isFetching: false,
        error: null,
      };
    case "ERROR":
      return {
        ...state,
        listKey: action.background ? state.listKey : action.key,
        listScopeKey: action.background ? state.listScopeKey : action.scopeKey,
        isLoading: false,
        isFetching: false,
        error: action.background ? null : action.message,
      };
    case "STATS":
      return { ...state, stats: action.stats };
    case "CATEGORIES":
      return { ...state, categories: action.categories };
    case "METADATA_ERROR":
      return { ...state, metadataError: action.message };
    case "FILTERS":
      return {
        ...state,
        filters: { ...state.filters, ...action.filters },
        page: 1,
        isLoading: true,
        refreshInBackground: false,
        error: null,
      };
    case "PAGE":
      return {
        ...state,
        page: action.page,
        isLoading: !action.background,
        isFetching: true,
        refreshInBackground: action.background ?? false,
        error: null,
      };
    case "RESET_FILTERS":
      return {
        ...state,
        filters: DEFAULT_FILTERS,
        page: 1,
        isLoading: true,
        refreshInBackground: false,
        error: null,
      };
    case "INVALIDATE":
      return {
        ...state,
        revision: state.revision + 1,
        page: action.firstPage ? 1 : state.page,
        todos: action.todo
          ? state.todos.map((todo) =>
              todo.id === action.todo!.id ? action.todo! : todo,
            )
          : state.todos,
        isLoading: action.background ? state.isLoading : true,
        isFetching: true,
        refreshInBackground: action.background ?? false,
      };
    case "BUSY":
      return {
        ...state,
        pendingTodoIds: action.busy
          ? [...state.pendingTodoIds, action.id]
          : state.pendingTodoIds.filter((id) => id !== action.id),
      };
    case "CLEAR":
      return { ...initialState, isLoading: false };
    default:
      return state;
  }
}

interface TodoContextValue extends TodoState {
  filteredTodos: Todo[];
  createTodo: (payload: CreateTodoPayload) => Promise<void>;
  updateTodo: (id: string, payload: UpdateTodoPayload) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  toggleSubtask: (todoId: string, subtaskId: string) => Promise<void>;
  deleteCompleted: () => Promise<void>;
  setFilters: (filters: Partial<TodoFilters>) => void;
  setStatus: (status: FilterStatus) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
  refreshTodos: (options?: { background?: boolean }) => Promise<void>;
  refreshMetadata: () => Promise<void>;
}

const TodoContext = createContext<TodoContextValue | undefined>(undefined);

export function TodoProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const { pathname } = useLocation();
  const isTodosPage = pathname === "/todos";
  const isDashboardPage = pathname === "/dashboard" || pathname === "/";
  const [state, dispatch] = useReducer(reducer, initialState);
  const listRequest = useRef<AbortController | null>(null);
  const metadataRequest = useRef<AbortController | null>(null);
  const sessionId = useRef<string | undefined>(undefined);
  const pendingMutations = useRef(new Set<string>());
  const clearingCompleted = useRef(false);
  const visibleList = useRef({ scopeKey: "", isLoading: true });
  const { filters, page, revision, refreshInBackground } = state;
  const userId = user?.id;
  const listScopeKey = JSON.stringify([
    userId,
    isTodosPage,
    isDashboardPage,
    ...(isTodosPage ? [filters] : []),
  ]);
  const listKey = JSON.stringify([
    userId,
    isTodosPage,
    isDashboardPage,
    ...(isTodosPage ? [filters, page] : []),
  ]);

  useEffect(() => {
    visibleList.current = {
      scopeKey: state.listScopeKey,
      isLoading: state.isLoading,
    };
  }, [state.listScopeKey, state.isLoading]);

  useEffect(() => {
    sessionId.current = userId;
    return () => {
      sessionId.current = undefined;
    };
  }, [userId]);

  const refreshTodos = useCallback(
    async (options: { background?: boolean } = {}) => {
      if (!isAuthenticated) return;
      listRequest.current?.abort();
      const controller = new AbortController();
      listRequest.current = controller;
      const background =
        options.background === true &&
        visibleList.current.scopeKey === listScopeKey &&
        !visibleList.current.isLoading;
      dispatch({ type: "FETCHING", background });

      const query: TodosQuery = isTodosPage
        ? {
            page,
            limit: 10,
            sortOrder: filters.sortDir,
            ...(filters.search.trim() && { search: filters.search.trim() }),
            ...(filters.priority !== "all" && { priority: filters.priority }),
            ...(filters.category !== DEFAULT_FILTERS.category && {
              category: filters.category,
            }),
            ...(filters.status === "overdue"
              ? { overdue: true }
              : filters.status !== "all" && { status: filters.status }),
          }
        : { page: 1, limit: 100, sortOrder: "desc" };

      try {
        if (isDashboardPage) {
          const data = await dashboardApi.get(controller.signal);
          if (controller.signal.aborted) return;
          dispatch({ type: "DASHBOARD", data });
          dispatch({ type: "LIST", todos: [], pagination: EMPTY_PAGINATION, key: listKey, scopeKey: listScopeKey });
          return;
        }
        const result = await todosApi.getAll(query, controller.signal);
        if (controller.signal.aborted) return;

        if (isTodosPage) {
          // Deleting the final item on a page may reduce the number of pages.
          const lastPage = Math.max(1, result.pagination.totalPages);
          if (page > lastPage) {
            dispatch({ type: "PAGE", page: lastPage, background });
            return;
          }
        } else {
          // Dashboard/profile summaries need unfiltered data across all pages.
          for (
            let nextPage = 2;
            nextPage <= result.pagination.totalPages;
            nextPage++
          ) {
            const next = await todosApi.getAll(
              { ...query, page: nextPage },
              controller.signal,
            );
            result.todos.push(...next.todos);
          }
        }

        if (!controller.signal.aborted) {
          dispatch({
            type: "LIST",
            todos: result.todos,
            pagination: result.pagination,
            key: listKey,
            scopeKey: listScopeKey,
          });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          dispatch({
            type: "ERROR",
            message: getErrorMessage(error),
            key: listKey,
            scopeKey: listScopeKey,
            background,
          });
          if (background) toast.error(getErrorMessage(error));
        }
      }
    },
    [isAuthenticated, isTodosPage, isDashboardPage, filters, page, listKey, listScopeKey],
  );

  const refreshMetadata = useCallback(async () => {
    if (!isAuthenticated) return;
    metadataRequest.current?.abort();
    const controller = new AbortController();
    metadataRequest.current = controller;
    const [stats, categories] = await Promise.allSettled([
      isDashboardPage ? Promise.resolve(null) : todosApi.getStats(controller.signal),
      todosApi.getCategories(controller.signal),
    ]);
    if (controller.signal.aborted) return;
    if (stats.status === "fulfilled" && stats.value) {
      dispatch({ type: "STATS", stats: stats.value });
    }
    if (categories.status === "fulfilled") {
      dispatch({ type: "CATEGORIES", categories: categories.value });
    }
    const failed = [stats, categories].find(
      (result) => result.status === "rejected",
    );
    dispatch({
      type: "METADATA_ERROR",
      message:
        failed?.status === "rejected" ? getErrorMessage(failed.reason) : null,
    });
  }, [isAuthenticated, isDashboardPage]);

  useEffect(() => {
    const timer = setTimeout(
      () => {
        if (isAuthenticated) {
          void refreshTodos({ background: refreshInBackground });
        } else {
          pendingMutations.current.clear();
          dispatch({ type: "CLEAR" });
        }
      },
      isTodosPage && filters.search ? 250 : 0,
    );

    return () => {
      clearTimeout(timer);
      listRequest.current?.abort();
    };
  }, [
    isAuthenticated,
    userId,
    refreshTodos,
    isTodosPage,
    filters.search,
    revision,
    refreshInBackground,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) void refreshMetadata();
    }, 0);
    return () => {
      clearTimeout(timer);
      metadataRequest.current?.abort();
    };
  }, [isAuthenticated, userId, refreshMetadata, revision]);

  const invalidate = (todo?: Todo, firstPage = false, background = false) => {
    if (sessionId.current === userId) {
      dispatch({ type: "INVALIDATE", todo, firstPage, background });
    }
  };

  const withTodoMutation = async (id: string, action: () => Promise<void>) => {
    if (pendingMutations.current.has(id)) {
      throw new Error("This Todo is being updated. Please try again shortly.");
    }
    pendingMutations.current.add(id);
    dispatch({ type: "BUSY", id, busy: true });
    try {
      await action();
    } finally {
      pendingMutations.current.delete(id);
      if (sessionId.current === userId) {
        dispatch({ type: "BUSY", id, busy: false });
      }
    }
  };

  const createTodo = async (payload: CreateTodoPayload) => {
    await todosApi.create(payload);
    invalidate(undefined, true);
    toast.success("Todo created!");
  };

  const updateTodo = async (id: string, payload: UpdateTodoPayload) => {
    await withTodoMutation(id, async () => {
      const todo = await todosApi.update(id, payload);
      invalidate(todo);
      toast.success("Todo updated!");
    });
  };

  const deleteTodo = async (id: string) => {
    await withTodoMutation(id, async () => {
      await todosApi.delete(id);
      invalidate();
      toast.success("Todo deleted");
    });
  };

  const toggleTodo = async (id: string) => {
    const todo = state.todos.find((item) => item.id === id);
    if (!todo) return;
    try {
      await withTodoMutation(id, async () => {
        const updated = await todosApi.update(id, {
          status: todo.status === "completed" ? "pending" : "completed",
        });
        invalidate(updated, false, true);
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const toggleSubtask = async (todoId: string, subtaskId: string) => {
    const todo = state.todos.find((item) => item.id === todoId);
    if (!todo || !todo.subtasks.some((subtask) => subtask.id === subtaskId)) {
      return;
    }
    try {
      await withTodoMutation(todoId, async () => {
        const updated = await todosApi.update(todoId, {
          subtasks: todo.subtasks.map((subtask) =>
            subtask.id === subtaskId
              ? { ...subtask, completed: !subtask.completed }
              : subtask,
          ),
        });
        invalidate(updated, false, true);
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const deleteCompleted = async () => {
    if (clearingCompleted.current) return;
    clearingCompleted.current = true;
    try {
      const count = await todosApi.deleteCompleted();
      invalidate();
      toast.success(
        count === 1
          ? "1 completed Todo cleared"
          : count + " completed Todos cleared",
      );
    } finally {
      clearingCompleted.current = false;
    }
  };

  const setFilters = (next: Partial<TodoFilters>) =>
    dispatch({ type: "FILTERS", filters: next });
  const setStatus = (status: FilterStatus) => setFilters({ status });
  const setPage = (nextPage: number) => {
    const lastPage = Math.max(1, state.pagination.totalPages);
    if (nextPage >= 1 && nextPage <= lastPage) {
      dispatch({ type: "PAGE", page: nextPage });
    }
  };
  const resetFilters = () => dispatch({ type: "RESET_FILTERS" });
  const keepPreviousData =
    refreshInBackground && state.listScopeKey === listScopeKey;

  return (
    <TodoContext.Provider
      value={{
        ...state,
        dashboard: state.listKey === listKey ? state.dashboard : null,
        isLoading:
          state.isLoading ||
          (isAuthenticated && state.listKey !== listKey && !keepPreviousData),
        error: state.listKey === listKey ? state.error : null,
        filteredTodos:
          state.listKey === listKey || keepPreviousData ? state.todos : [],
        createTodo,
        updateTodo,
        deleteTodo,
        toggleTodo,
        toggleSubtask,
        deleteCompleted,
        setFilters,
        setStatus,
        setPage,
        resetFilters,
        refreshTodos,
        refreshMetadata,
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
