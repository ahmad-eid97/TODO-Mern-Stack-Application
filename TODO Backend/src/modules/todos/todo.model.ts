import { Schema, model } from "mongoose";
//= Types
import type { Todo, Subtask } from "./todo.types.js";
import { Priority, Status } from "./todo.types.js";

const SubtaskSchema = new Schema<Subtask>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  completed: {
    type: Boolean,
    required: true,
  },
});

const TodoSchema = new Schema<Todo>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    priority: {
      type: String,
      enum: Priority,
      required: true,
    },
    status: {
      type: String,
      enum: Status,
      required: true,
    },
    category: {
      type: String,
      default: "",
    },
    dueDate: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    tags: [
      {
        type: String,
      },
    ],
    subtasks: {
      type: [SubtaskSchema],
      default: [],
    },
  },
  { timestamps: true },
);

const TodoModel = model<Todo>("Todo", TodoSchema);

export default TodoModel;
