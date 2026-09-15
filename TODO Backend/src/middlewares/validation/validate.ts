import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
//= Validation
import { AppError } from "../../errors/AppError.js";

type RequestPart = "body" | "query" | "params";

const validate = (schema: ZodType, part: RequestPart = "body") => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      const details = result.error.issues.map((error) => ({
        field: error.path.join("."),
        message: error.message,
      }));

      return next(
        new AppError("Validation Error", 400, "VALIDATION_ERROR", details),
      );
    }

    req[part] = result.data;

    next();
  };
};

export default validate;
