// import axiosInstance from './axiosInstance'; // ← Uncomment this when backend is ready
import type {
  Todo,
  SubTask,
  CreateTodoPayload,
  UpdateTodoPayload,
  TodoStats,
} from "../types/todo.types";
import type { ApiResponse } from "../types/api.types";

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const TODOS_STORE = "mock_todos";

const readTodos = (): Todo[] =>
  JSON.parse(localStorage.getItem(TODOS_STORE) || "[]");

const writeTodos = (todos: Todo[]) =>
  localStorage.setItem(TODOS_STORE, JSON.stringify(todos));

const currentUserId = (): string =>
  (JSON.parse(localStorage.getItem("auth_user") || "{}") as { id?: string })
    .id ?? "";

export const todosApi = {
  getAll: async (): Promise<ApiResponse<Todo[]>> => {
    // return (await axiosInstance.get('/todos')).data;

    await delay(500);
    const uid = currentUserId();
    const todos = readTodos().filter((t) => t.userId === uid);
    return { data: todos, message: "Todos fetched", success: true };
  },

  getById: async (id: string): Promise<ApiResponse<Todo>> => {
    // return (await axiosInstance.get(`/todos/${id}`)).data;

    await delay(300);
    const uid = currentUserId();
    const todo = readTodos().find((t) => t.id === id && t.userId === uid);
    if (!todo)
      throw { response: { status: 404, data: { message: "Todo not found" } } };
    return { data: todo, message: "Todo fetched", success: true };
  },

  create: async (payload: CreateTodoPayload): Promise<ApiResponse<Todo>> => {
    // return (await axiosInstance.post('/todos', payload)).data;

    await delay(400);
    const now = new Date().toISOString();
    const subtasks: SubTask[] = (payload.subtasks ?? []).map((s) => ({
      id: crypto.randomUUID(),
      title: s.title,
      completed: false,
      createdAt: now,
    }));
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      userId: currentUserId(),
      title: payload.title,
      description: payload.description,
      status: "pending",
      priority: payload.priority,
      category: payload.category,
      dueDate: payload.dueDate,
      tags: payload.tags ?? [],
      subtasks,
      createdAt: now,
      updatedAt: now,
    };
    writeTodos([...readTodos(), newTodo]);
    return { data: newTodo, message: "Todo created", success: true };
  },

  update: async (
    id: string,
    payload: UpdateTodoPayload,
  ): Promise<ApiResponse<Todo>> => {
    // return (await axiosInstance.put(`/todos/${id}`, payload)).data;

    await delay(400);
    const uid = currentUserId();
    const todos = readTodos();
    const idx = todos.findIndex((t) => t.id === id && t.userId === uid);
    if (idx === -1)
      throw { response: { status: 404, data: { message: "Todo not found" } } };
    const now = new Date().toISOString();
    const updated: Todo = {
      ...todos[idx],
      ...payload,
      updatedAt: now,
      completedAt:
        payload.status === "completed"
          ? now
          : payload.status != null
            ? undefined
            : todos[idx].completedAt,
    };
    todos[idx] = updated;
    writeTodos(todos);
    return { data: updated, message: "Todo updated", success: true };
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    // return (await axiosInstance.delete(`/todos/${id}`)).data;

    await delay(400);
    const uid = currentUserId();
    const todos = readTodos();
    const next = todos.filter((t) => !(t.id === id && t.userId === uid));
    if (next.length === todos.length)
      throw { response: { status: 404, data: { message: "Todo not found" } } };
    writeTodos(next);
    return { data: null, message: "Todo deleted", success: true };
  },

  toggle: async (id: string): Promise<ApiResponse<Todo>> => {
    // return (await axiosInstance.patch(`/todos/${id}/toggle`)).data;

    await delay(300);
    const uid = currentUserId();
    const todos = readTodos();
    const idx = todos.findIndex((t) => t.id === id && t.userId === uid);
    if (idx === -1)
      throw { response: { status: 404, data: { message: "Todo not found" } } };
    const now = new Date().toISOString();
    const nextStatus =
      todos[idx].status === "completed" ? "pending" : "completed";
    const updated: Todo = {
      ...todos[idx],
      status: nextStatus,
      completedAt: nextStatus === "completed" ? now : undefined,
      updatedAt: now,
    };
    todos[idx] = updated;
    writeTodos(todos);
    return { data: updated, message: "Todo toggled", success: true };
  },

  toggleSubtask: async (
    todoId: string,
    subtaskId: string,
  ): Promise<ApiResponse<Todo>> => {
    // return (await axiosInstance.patch(`/todos/${todoId}/subtasks/${subtaskId}/toggle`)).data;

    await delay(250);
    const uid = currentUserId();
    const todos = readTodos();
    const idx = todos.findIndex((t) => t.id === todoId && t.userId === uid);
    if (idx === -1)
      throw { response: { status: 404, data: { message: "Todo not found" } } };
    const updated: Todo = {
      ...todos[idx],
      subtasks: todos[idx].subtasks.map((s) =>
        s.id === subtaskId ? { ...s, completed: !s.completed } : s,
      ),
      updatedAt: new Date().toISOString(),
    };
    todos[idx] = updated;
    writeTodos(todos);
    return { data: updated, message: "Subtask toggled", success: true };
  },

  deleteCompleted: async (): Promise<ApiResponse<null>> => {
    // return (await axiosInstance.delete('/todos/completed')).data;

    await delay(400);
    const uid = currentUserId();
    writeTodos(
      readTodos().filter(
        (t) => !(t.userId === uid && t.status === "completed"),
      ),
    );
    return { data: null, message: "Completed todos cleared", success: true };
  },

  getStats: async (): Promise<ApiResponse<TodoStats>> => {
    // return (await axiosInstance.get('/todos/stats')).data;

    await delay(300);
    const uid = currentUserId();
    const todos = readTodos().filter((t) => t.userId === uid);
    const now = new Date();
    const completed = todos.filter((t) => t.status === "completed").length;
    const overdue = todos.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "completed",
    ).length;
    const stats: TodoStats = {
      total: todos.length,
      completed,
      pending: todos.filter((t) => t.status === "pending").length,
      inProgress: todos.filter((t) => t.status === "in_progress").length,
      overdue,
      completionRate:
        todos.length > 0 ? Math.round((completed / todos.length) * 100) : 0,
    };
    return { data: stats, message: "Stats fetched", success: true };
  },
};
