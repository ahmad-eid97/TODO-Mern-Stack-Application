import axiosInstance from "./axiosInstance";
import type {
  Todo,
  TodoStatus,
  TodoPriority,
  CreateTodoPayload,
  UpdateTodoPayload,
  TodoStats,
  TodoPagination,
  TodosQuery,
} from "../types/todo.types";

const STATUS_TO_API = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
} as const;

const PRIORITY_TO_API = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
} as const;

type ApiStatus = (typeof STATUS_TO_API)[TodoStatus];
type ApiPriority = (typeof PRIORITY_TO_API)[TodoPriority];

const STATUS_FROM_API: Record<ApiStatus, TodoStatus> = {
  Pending: "pending",
  "In Progress": "in_progress",
  Completed: "completed",
};

const PRIORITY_FROM_API: Record<ApiPriority, TodoPriority> = {
  Low: "low",
  Medium: "medium",
  High: "high",
  Urgent: "urgent",
};

interface ApiTodo {
  _id: string;
  owner: string;
  title: string;
  description?: string;
  status: ApiStatus;
  priority: ApiPriority;
  category?: string;
  dueDate?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  subtasks?: { _id: string; title: string; completed: boolean }[];
}

const toTodo = (todo: ApiTodo): Todo => ({
  id: todo._id,
  userId: todo.owner,
  title: todo.title,
  description: todo.description,
  status: STATUS_FROM_API[todo.status],
  priority: PRIORITY_FROM_API[todo.priority],
  category: todo.category,
  dueDate: todo.dueDate ?? undefined,
  completedAt: todo.completedAt ?? undefined,
  createdAt: todo.createdAt,
  updatedAt: todo.updatedAt,
  tags: todo.tags ?? [],
  subtasks: (todo.subtasks ?? []).map((subtask) => ({
    id: subtask._id,
    title: subtask.title,
    completed: subtask.completed,
  })),
});

export const todosApi = {
  getAll: async (
    query: TodosQuery = {},
    signal?: AbortSignal,
  ): Promise<{ todos: Todo[]; pagination: TodoPagination }> => {
    const response = await axiosInstance.get<{
      data: { todos: ApiTodo[]; pagination: TodoPagination };
    }>("/todos", {
      signal,
      params: {
        ...query,
        status: query.status ? STATUS_TO_API[query.status] : undefined,
        priority: query.priority ? PRIORITY_TO_API[query.priority] : undefined,
        overdue:
          query.overdue === undefined ? undefined : String(query.overdue),
      },
    });
    return {
      todos: response.data.data.todos.map(toTodo),
      pagination: response.data.data.pagination,
    };
  },

  create: async (payload: CreateTodoPayload): Promise<Todo> => {
    const response = await axiosInstance.post<{ data: ApiTodo }>("/todos", {
      ...payload,
      priority: PRIORITY_TO_API[payload.priority],
      status: STATUS_TO_API.pending,
      category: payload.category ?? "",
      subtasks: (payload.subtasks ?? []).map((subtask) => ({
        title: subtask.title,
        completed: false,
      })),
    });
    return toTodo(response.data.data);
  },

  update: async (id: string, payload: UpdateTodoPayload): Promise<Todo> => {
    const response = await axiosInstance.patch<{ data: ApiTodo }>(
      `/todos/${id}`,
      {
        ...payload,
        priority: payload.priority
          ? PRIORITY_TO_API[payload.priority]
          : undefined,
        status: payload.status ? STATUS_TO_API[payload.status] : undefined,
        subtasks: payload.subtasks?.map((subtask) => ({
          ...(subtask.id && { _id: subtask.id }),
          title: subtask.title,
          completed: subtask.completed,
        })),
      },
    );
    return toTodo(response.data.data);
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/todos/${id}`);
  },

  deleteCompleted: async (): Promise<number> => {
    const response = await axiosInstance.delete<{
      data: { deletedCount: number };
    }>("/todos/completed");
    return response.data.data.deletedCount;
  },

  getStats: async (signal?: AbortSignal): Promise<TodoStats> => {
    const response = await axiosInstance.get<{
      data: {
        all: number;
        completed: number;
        pending: number;
        overdue: number;
      };
    }>("/todos/stats", { signal });
    const { all, completed, pending, overdue } = response.data.data;
    return {
      total: all,
      completed,
      pending,
      overdue,
      inProgress: all - completed - pending,
      completionRate: all > 0 ? Math.round((completed / all) * 100) : 0,
    };
  },

  getCategories: async (signal?: AbortSignal): Promise<string[]> => {
    const response = await axiosInstance.get<{ data: string[] }>(
      "/todos/categories",
      { signal },
    );
    return response.data.data
      .filter((category) => typeof category === "string" && category.trim())
      .sort((a, b) => a.localeCompare(b));
  },
};
