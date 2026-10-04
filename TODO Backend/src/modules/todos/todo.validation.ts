import { z } from "zod";
//= Types
import { Priority, Status } from "./todo.types.js";
import mongoose from "mongoose";

const tagsSchema = z
  .array(
    z
      .string()
      .trim()
      .min(1, "Tag cannot be empty")
      .max(40, "Max 40 characters per tag"),
  )
  .max(20, "At most 20 tags are allowed")
  .optional();

const subtaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Max 120 characters"),
  completed: z.boolean(),
});

export const todoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Max 120 characters"),
  description: z.string().max(500, "Max 500 characters").optional(),
  priority: z.enum(Priority),
  status: z.enum(Status),
  category: z.string().max(40),
  dueDate: z.coerce.date().optional(),
  tags: tagsSchema,
  subtasks: z
    .array(subtaskSchema)
    .max(50, "At most 50 subtasks are allowed")
    .optional(),
});

export const updateTodoSchema = todoSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const todosQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).max(1000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    title: z
      .string()
      .trim()
      .max(120, "Max 120 characters for title search")
      .transform((value) => (value === "" ? undefined : value))
      .optional(),
    priority: z.enum(Priority).optional(),
    status: z.enum(Status).optional(),
    category: z
      .string()
      .trim()
      .max(40, "Max 40 characters for category search")
      .transform((value) => (value === "" ? undefined : value))
      .optional(),
    tags: z.preprocess((value) => {
      if (typeof value === "string") {
        return [value];
      }
      return value;
    }, tagsSchema),
    dueDateFrom: z.coerce.date().optional(),
    dueDateTo: z.coerce.date().optional(),
  })
  .strict()
  .refine((data) => (data.page - 1) * data.limit <= 10000, {
    message:
      "Pagination may skip at most 10000 Todos; narrow your filters for deeper results",
    path: ["page"],
  })
  .refine(
    (data) => {
      if (!data.dueDateFrom || !data.dueDateTo) {
        return true;
      }

      return data.dueDateFrom <= data.dueDateTo;
    },
    {
      message: "dueDateFrom must be before or equal dueDateTo",
      path: ["dueDateFrom"],
    },
  );

export const todoParamSchema = z.object({
  todoId: z
    .string()
    .refine(
      (value) => mongoose.isValidObjectId(value),
      "Invalid MongoDB ObjectId",
    ),
});

export type TodoType = z.infer<typeof todoSchema>;
export type UpdateTodoType = z.infer<typeof updateTodoSchema>;
export type TodosQuery = z.infer<typeof todosQuerySchema>;
export type TodoParamSchema = z.infer<typeof todoParamSchema>;
