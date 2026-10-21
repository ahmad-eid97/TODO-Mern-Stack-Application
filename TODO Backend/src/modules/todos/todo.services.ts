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
import { Status } from "./todo.types.js";

const overdueExpression = (now: Date) => ({
  $and: [
    { $eq: [{ $type: "$dueDate" }, "date"] },
    { $lt: ["$dueDate", now] },
    { $ne: ["$status", Status.completed] },
  ],
});

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
    search,
    priority,
    status,
    overdue,
    category,
    tags,
    dueDateFrom,
    dueDateTo,
    sortOrder,
  } = query;
  const skip = (page - 1) * limit;

  const escapedSearchTerm = search ? escapeRegex(search) : "";

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
    ...(overdue && { $expr: overdueExpression(new Date()) }),
    ...(search && {
      $or: [
        {
          title: {
            $regex: escapedSearchTerm,
            $options: "i",
          },
        },
        {
          description: {
            $regex: escapedSearchTerm,
            $options: "i",
          },
        },
        {
          category: {
            $regex: escapedSearchTerm,
            $options: "i",
          },
        },
        {
          tags: {
            $regex: escapedSearchTerm,
            $options: "i",
          },
        },
      ],
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
        createdAt: sortOrder === "asc" ? 1 : -1,
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

const calculateTodosStats = async (user: IUser) => {
  const now = new Date();
  const [stats] = await TodoModel.aggregate([
    {
      $match: {
        owner: user._id,
      },
    },
    {
      $group: {
        _id: null,
        all: {
          $sum: 1,
        },
        completed: {
          $sum: {
            $cond: [{ $eq: ["$status", Status.completed] }, 1, 0],
          },
        },
        pending: {
          $sum: {
            $cond: [{ $eq: ["$status", Status.pending] }, 1, 0],
          },
        },
        overdue: {
          $sum: {
            $cond: [overdueExpression(now), 1, 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        all: 1,
        completed: 1,
        pending: 1,
        overdue: 1,
      },
    },
  ]);

  return stats
    ? stats
    : {
      all: 0,
      completed: 0,
      pending: 0,
      overdue: 0,
    };
};

const getCategories = async (user: IUser) => {
  const categories = await TodoModel.distinct("category", {
    owner: user._id,
  });

  return categories;
};

const handleEditTodo = async (
  user: IUser,
  params: TodoParamSchema,
  body: UpdateTodoType,
) => {
  const todoId = params.todoId;
  const userId = user._id;

  const existingTodo = await TodoModel.findOne({
    owner: userId,
    _id: todoId,
  });

  if (!existingTodo) {
    throw new AppError("Todo not found", 404, "TODO_NOT_FOUND");
  }

  if (body.status) {
    const wasCompleted = existingTodo.status === Status.completed;
    const willBeCompleted = body.status === Status.completed;

    if (!wasCompleted && willBeCompleted) {
      existingTodo.completedAt = new Date();
    }

    if (wasCompleted && !willBeCompleted) {
      existingTodo.completedAt = undefined;
    }
  }

  if (body.dueDate === null) {
    existingTodo.dueDate = undefined;
  }

  const { dueDate, ...fields } = body;

  Object.assign(existingTodo, fields);

  if (dueDate !== undefined && dueDate !== null) {
    existingTodo.dueDate = dueDate;
  }

  await existingTodo.save();

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

const handleDeleteCompletedTodos = async (user: IUser) => {
  const result = await TodoModel.deleteMany({
    owner: user._id,
    status: Status.completed,
  });

  return result.deletedCount;
};

export default {
  saveNewTodo,
  getUserTodos,
  calculateTodosStats,
  getCategories,
  handleEditTodo,
  handleDeleteTodo,
  handleDeleteCompletedTodos,
};
