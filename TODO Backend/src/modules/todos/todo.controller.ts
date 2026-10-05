//= Services
import todoServices from "./todo.services.js";
//= Types
import type { Request, Response, NextFunction } from "express";
import type { TodoParamSchema, TodosQuery } from "./todo.validation.js";

export const addNewTodo = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const newTodo = await todoServices.saveNewTodo(req.user!, req.body);

  res.status(201).json({
    data: newTodo,
  });
};

export const getTodos = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const todosResponse = await todoServices.getUserTodos(
    req.user!,
    req.validatedQuery as unknown as TodosQuery,
  );

  res.status(200).json({
    data: todosResponse,
  });
};

export const getTodosStats = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const stats = await todoServices.calculateTodosStats(req.user!);

  res.status(200).json({
    data: stats,
  });
};

export const getTodosCategories = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const categories = await todoServices.getCategories(req.user!);

  res.status(200).json({
    data: categories,
  });
};

export const editTodo = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const updatedTodo = await todoServices.handleEditTodo(
    req.user!,
    req.params as TodoParamSchema,
    req.body,
  );

  res.status(201).json({
    data: updatedTodo,
  });
};

export const deleteTodo = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  await todoServices.handleDeleteTodo(req.user!, req.params as TodoParamSchema);

  res.status(204).send();
};

export const deleteCompletedTodos = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const deletedCount = await todoServices.handleDeleteCompletedTodos(req.user!);

  res.status(200).json({
    data: {
      deletedCount,
    },
  });
};
