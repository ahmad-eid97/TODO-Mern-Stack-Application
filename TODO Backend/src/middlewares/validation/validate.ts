import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
//= Validation
import { AppError } from "../../errors/AppError.js";

type RequestPart = "body" | "query" | "params";

const validate = (schema: ZodType, part: RequestPart = "body") => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      // Keep invalid arrays from producing excessively large error responses.
      const details = result.error.issues.slice(0, 20).map((error) => ({
        field: error.path.join("."),
        message: error.message,
      }));

      return next(
        new AppError("Validation Error", 400, "VALIDATION_ERROR", details),
      );
    }
    if (part === "query") {
      req.validatedQuery = result.data;
    } else {
      req[part] = result.data;
    }

    next();
  };
};

export default validate;
