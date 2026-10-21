//= Modules
import type { Request, Response, NextFunction } from "express";
//= Services
import { getDashboardData } from "./dashboard.services.js";

export const getDashboard = async (req: Request, res: Response, _next: NextFunction) => {
  const dashboardData = await getDashboardData(req.user!);

  res.status(200).json({
    data: dashboardData
  });
}