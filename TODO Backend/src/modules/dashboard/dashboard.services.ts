//= Models
import UserModel from "../auth/user.model.js";
import TodoModel from "../todos/todo.model.js";
//= Types
import type { IUser } from "../auth/auth.types.js";
import { AppError } from "../../errors/AppError.js";
import type { PipelineStage } from "mongoose";
import { Status, Priority } from "../todos/todo.types.js";

const getDashboardData = async (user: IUser) => {
  const existingUser = await UserModel.findById(user._id);

  const now = new Date();

  const PRIORITIES = Object.values(Priority);

  const statsPipeline = [
    {
      $group: {
        _id: null,
        all: { $sum: 1 },
        completed: {
          $sum: {
            $cond: [
              { $eq: ["$status", Status.completed] },
              1,
              0
            ]
          }
        },
        pending: {
          $sum: {
            $cond: [
              { $eq: ["$status", "Pending"] },
              1,
              0
            ]
          }
        },
        overdue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $lt: ["$dueDate", now] },
                  { $ne: ["$status", Status.completed] },
                  { $ne: [{ $ifNull: ["$dueDate", null] }, null] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        all: 1,
        completed: 1,
        pending: 1,
        overdue: 1,
      }
    }
  ];

  const priorityPipeline = [
    {
      $group: {
        _id: "$priority",
        total: {
          $sum: 1
        },
        completed: {
          $sum: {
            $cond: [
              { $eq: ["$status", Status.completed] },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        priority: "$_id",
        total: 1,
        completed: 1,
      }
    }
  ];

  const recentTodosPipeline: PipelineStage.FacetPipelineStage[] = [
    { $sort: { createdAt: -1, _id: -1 } },
    { $limit: 5 },
    {
      $project: {
        title: 1,
        status: 1,
        priority: 1,
        dueDate: 1,
        createdAt: 1,
      }
    }
  ];

  const upcomingDeadlinesPipeline: PipelineStage.FacetPipelineStage[] = [
    {
      $match: {
        status: { $ne: Status.completed },
        dueDate: { $gte: now }
      }
    },
    { $sort: { dueDate: 1, _id: 1 } },
    { $limit: 5 },
    {
      $project: {
        title: 1,
        status: 1,
        priority: 1,
        dueDate: 1
      }
    }
  ]

  if (!existingUser) {
    throw new AppError("User not found", 401, "USER_NOT_FOUND");
  }

  const [dashboardData] = await TodoModel.aggregate([
    {
      $match: {
        owner: user._id
      }
    },
    {
      $facet: {
        status: statsPipeline,
        priorityBreakdown: priorityPipeline,
        recentTodos: recentTodosPipeline,
        upcomingDeadlines: upcomingDeadlinesPipeline,
      }
    }
  ]);

  const priorityBreakdown = PRIORITIES.map((priority) => {
    // @ts-ignore-next-line
    const existing = dashboardData.priorityBreakdown.find(
      (item: { priority: string }) => item.priority === priority
    );

    return {
      priority,
      total: existing?.total ?? 0,
      completed: existing?.completed ?? 0,
    };
  });

  return { ...dashboardData, priorityBreakdown };
}

export {
  getDashboardData
}