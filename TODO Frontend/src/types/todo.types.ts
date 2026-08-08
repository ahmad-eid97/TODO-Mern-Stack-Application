export type TodoStatus = "pending" | "in_progress" | "completed";
export type TodoPriority = "low" | "medium" | "high" | "urgent";
export type FilterStatus = TodoStatus | "all" | "overdue";

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface Todo {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: TodoStatus;
  priority: TodoPriority;
  category?: string;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  subtasks: SubTask[];
}

export interface CreateTodoPayload {
  title: string;
  description?: string;
  priority: TodoPriority;
  category?: string;
  dueDate?: string;
  tags?: string[];
  subtasks?: Pick<SubTask, "title">[];
}

export interface UpdateTodoPayload {
  title?: string;
  description?: string;
  priority?: TodoPriority;
  status?: TodoStatus;
  category?: string;
  dueDate?: string;
  tags?: string[];
  subtasks?: SubTask[];
}

export interface TodoFilters {
  search: string;
  status: FilterStatus;
  priority: TodoPriority | "all";
  category: string;
  sortBy: "createdAt" | "dueDate" | "priority" | "title";
  sortDir: "asc" | "desc";
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  overdue: number;
  completionRate: number;
}
