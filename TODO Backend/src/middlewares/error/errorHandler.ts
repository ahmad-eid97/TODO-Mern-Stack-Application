//= Types
import type {
  ErrorRequestHandler,
  Request,
  Response,
  NextFunction,
} from "express";
import { AppError } from "../../errors/AppError.js";

const errorHandler: ErrorRequestHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
      code: err.code,
      ...(err.details !== undefined && { details: err.details }),
    });
  }

  //= Malformed JSON bodies are thrown by express.json() as a tagged SyntaxError, not an AppError.
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      status: 400,
      message: "Invalid JSON payload",
      code: "INVALID_JSON",
    });
  }

  //= For us as a BE development team, we want to know what went wrong in the server, so we log the error to the console.
  console.error("Unexpected Error:", err);

  res.status(500).json({
    status: 500,
    message: "Internal Server Error",
    code: "INTERNAL_SERVER_ERROR",
  });
};

export default errorHandler;
