import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../errors/AppError.js";

const notFound = (req: Request, _res: Response, next: NextFunction) => {
  next(
    new AppError(
      `Route ${req.method} ${req.originalUrl} not found`,
      404,
      "ROUTE_NOT_FOUND",
    ),
  );
};

export default notFound;
