//= Types
import { Types } from "mongoose";

export enum Priority {
  low = "Low",
  medium = "Medium",
  high = "High",
  urgent = "Urgent",
}

export enum Status {
  pending = "Pending",
  inProgress = "In Progress",
  completed = "Completed",
}

export interface Subtask {
  _id: Types.ObjectId;
  title: string;
  completed: boolean;
}

export interface Todo {
  owner: Types.ObjectId;
  title: string;
  description: string | undefined;
  priority: Priority;
  status: Status;
  category: string | undefined;
  dueDate: Date | undefined;
  completedAt: Date | undefined;
  tags: string[] | undefined;
  subtasks: Subtask[] | undefined;
  createdAt: Date;
  updatedAt: Date;
}
