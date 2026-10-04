import { Router } from "express";
import asyncHandler from "../../middlewares/asyncHandler.js";
//= Controllers
import {
  addNewTodo,
  getTodos,
  editTodo,
  deleteTodo,
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

router.patch(
  "/todos/:todoId",
  authenticate,
  validate(todoParamSchema, "params"),
  validate(updateTodoSchema),
  asyncHandler(editTodo),
);

router.delete(
  "/todos/:todoId",
  authenticate,
  validate(todoParamSchema, "params"),
  asyncHandler(deleteTodo),
);

export default router;
