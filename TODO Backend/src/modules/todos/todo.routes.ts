import { Router } from "express";
import asyncHandler from "../../middlewares/asyncHandler.js";
//= Controllers
import {
  addNewTodo,
  getTodos,
  getTodosStats,
  getTodosCategories,
  editTodo,
  deleteTodo,
  deleteCompletedTodos,
} from "./todo.controller.js";
//= Middlewares
import authenticate from "../../middlewares/auth/authenticate.js";
import validate from "../../middlewares/validation/validate.js";
//= Types
import {
  todoSchema,
  updateTodoSchema,
  todosQuerySchema,
  todoParamSchema,
} from "./todo.validation.js";

const router = Router();

router.post(
  "/todos",
  authenticate,
  validate(todoSchema),
  asyncHandler(addNewTodo),
);

router.get(
  "/todos",
  authenticate,
  validate(todosQuerySchema, "query"),
  asyncHandler(getTodos),
);

router.get("/todos/stats", authenticate, asyncHandler(getTodosStats));

router.get("/todos/categories", authenticate, asyncHandler(getTodosCategories));

router.patch(
  "/todos/:todoId",
  authenticate,
  validate(todoParamSchema, "params"),
  validate(updateTodoSchema),
  asyncHandler(editTodo),
);

router.delete(
  "/todos/completed",
  authenticate,
  asyncHandler(deleteCompletedTodos),
);

router.delete(
  "/todos/:todoId",
  authenticate,
  validate(todoParamSchema, "params"),
  asyncHandler(deleteTodo),
);

export default router;
