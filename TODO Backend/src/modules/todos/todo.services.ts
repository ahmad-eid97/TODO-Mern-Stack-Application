//= Models
import TodoModel from "./todo.model.js";
//= Utils
import { escapeRegex } from "../../utils/escapeRegex.js";
import { AppError } from "../../errors/AppError.js";
//= Types
import type { IUser } from "../auth/auth.types.js";
import type {
  TodoParamSchema,
  TodoType,
  UpdateTodoType,
  TodosQuery,
} from "./todo.validation.js";

const saveNewTodo = async (user: IUser, newTodo: TodoType) => {
  const userId = user?._id;

  const todoPayload = {
    ...newTodo,
    owner: userId,
  };

  const todo = await TodoModel.create(todoPayload);

  return todo;
};

const getUserTodos = async (user: IUser, query: TodosQuery) => {
  const {
    page = 1,
    limit = 10,
    title,
    priority,
    status,
    category,
    tags,
    dueDateFrom,
    dueDateTo,
  } = query;
  const skip = (page - 1) * limit;

  const escapedTitle = title ? escapeRegex(title) : "";

  const dueDateFilter: Record<string, Date> = {};

  if (dueDateFrom) {
    const from = new Date(dueDateFrom);
    from.setUTCHours(0, 0, 0, 0);

    dueDateFilter.$gte = from;
  }

  if (dueDateTo) {
    const to = new Date(dueDateTo);
    to.setUTCHours(23, 59, 59, 999);

    dueDateFilter.$lte = to;
  }

  const filter = {
    owner: user._id,
    ...(title && {
      title: {
        $regex: escapedTitle,
        $options: "i",
      },
    }),
    ...(priority && { priority }),
    ...(status && { status }),
    ...(category && { category }),
    ...(tags?.length && {
      tags: {
        $in: tags,
      },
    }),
    ...(Object.keys(dueDateFilter).length > 0 && {
      dueDate: dueDateFilter,
    }),
  };

  const [totalCount, todos] = await Promise.all([
    TodoModel.countDocuments(filter),
    TodoModel.find(filter)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  const pagination = {
    page: +page,
    limit: +limit,
    total: totalCount,
    totalPages,
  };

  return {
    todos,
    pagination,
  };
};

const handleEditTodo = async (
  user: IUser,
  params: TodoParamSchema,
  body: UpdateTodoType,
) => {
  const todoId = params.todoId;
  const userId = user._id;

  const existingTodo = await TodoModel.findOneAndUpdate(
    { owner: userId, _id: todoId },
    { $set: body },
    { returnDocument: "after" },
  );

  if (!existingTodo) {
    throw new AppError("Todo not found", 404, "TODO_NOT_FOUND");
  }

  return existingTodo;
};

const handleDeleteTodo = async (user: IUser, params: TodoParamSchema) => {
  const existingTodo = await TodoModel.findOneAndDelete({
    owner: user._id,
    _id: params.todoId,
  });

  if (!existingTodo) {
    throw new AppError("Todo not found", 404, "TODO_NOT_FOUND");
  }

  return existingTodo;
};

export default { saveNewTodo, getUserTodos, handleEditTodo, handleDeleteTodo };
