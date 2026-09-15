//= Modules
import jwt from "jsonwebtoken";
//= Utils
import { AppError } from "../../errors/AppError.js";
//= Config
import env from "../../config/env.js";
//= Models
import User from "../../modules/auth/user.model.js";
//= Types
import type { Request, Response, NextFunction } from "express";
import { ACCESS_TOKEN_COOKIE } from "../../modules/auth/auth.constants.js";

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies[ACCESS_TOKEN_COOKIE];

  if (!token) {
    return next(
      new AppError(
        "Authentication token is missing",
        401,
        "AUTH_TOKEN_MISSING",
      ),
    );
  }

  try {
    const decodedToken = jwt.verify(token, env.JWT_SECRET as string) as {
      userId: string;
    };

    const user = await User.findById(decodedToken.userId);

    if (!user) {
      return next(new AppError("User not found", 401, "AUTH_USER_NOT_FOUND"));
    }

    req.user = user;

    next();
  } catch (error) {
    return next(
      new AppError("Invalid authentication token", 401, "AUTH_TOKEN_INVALID"),
    );
  }
};
