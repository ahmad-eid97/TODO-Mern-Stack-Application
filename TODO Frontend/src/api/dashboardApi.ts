import axiosInstance from "./axiosInstance";
import type { TodoPriority, TodoStats, TodoStatus } from "../types/todo.types";

export interface DashboardTodo {
  id: string;
  title: string;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate?: string | null;
  createdAt?: string;
}

export interface DashboardData {
  stats: TodoStats;
  priorityBreakdown: { priority: TodoPriority; total: number; completed: number }[];
  recentTodos: DashboardTodo[];
  upcomingDeadlines: DashboardTodo[];
}

type ApiStatus = "Pending" | "In Progress" | "Completed";
type ApiPriority = "Low" | "Medium" | "High" | "Urgent";
interface ApiDashboardTodo extends Omit<DashboardTodo, "id" | "status" | "priority"> {
  _id: string;
  status: ApiStatus;
  priority: ApiPriority;
}

interface ApiDashboardData {
  status: { all: number; completed: number; pending: number; overdue: number }[];
  priorityBreakdown: { priority: ApiPriority; total: number; completed: number }[];
  recentTodos: ApiDashboardTodo[];
  upcomingDeadlines: ApiDashboardTodo[];
}

const statuses: Record<ApiStatus, TodoStatus> = {
  Pending: "pending", "In Progress": "in_progress", Completed: "completed",
};
const priorities: Record<ApiPriority, TodoPriority> = {
  Low: "low", Medium: "medium", High: "high", Urgent: "urgent",
};
const toSummary = ({ _id, status, priority, ...todo }: ApiDashboardTodo): DashboardTodo => ({
  ...todo, id: _id, status: statuses[status], priority: priorities[priority],
});

export const dashboardApi = {
  get: async (signal?: AbortSignal): Promise<DashboardData> => {
    const response = await axiosInstance.get<{ data: ApiDashboardData }>("/dashboard", { signal });
    const data = response.data.data;
    const counts = data.status[0] ?? { all: 0, completed: 0, pending: 0, overdue: 0 };
    return {
      stats: {
        total: counts.all,
        completed: counts.completed,
        pending: counts.pending,
        overdue: counts.overdue,
        inProgress: counts.all - counts.completed - counts.pending,
        completionRate: counts.all ? Math.round(counts.completed / counts.all * 100) : 0,
      },
      priorityBreakdown: data.priorityBreakdown.map(item => ({ ...item, priority: priorities[item.priority] })),
      recentTodos: data.recentTodos.map(toSummary),
      upcomingDeadlines: data.upcomingDeadlines.map(toSummary),
    };
  },
};
