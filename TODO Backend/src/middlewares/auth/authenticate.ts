//= Modules
import jwt from "jsonwebtoken";
//= Utils
import { AppError } from "../../errors/AppError.js";
import { verifyAccessToken } from "../../utils/jwt.js";
import { accessTokenCookieOptions } from "../../modules/auth/auth.cookie.js";
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
  const token: unknown = req.cookies?.[ACCESS_TOKEN_COOKIE];

  if (!token) {
    return next(
      new AppError("User is not authenticated", 401, "USER_NOT_AUTHENTICATED"),
    );
  }

  let userId: string;
  try {
    userId = verifyAccessToken(token).userId;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.clearCookie(ACCESS_TOKEN_COOKIE, accessTokenCookieOptions);
      return next(
        new AppError(
          "Your session has expired. Please log in again",
          401,
          "AUTH_TOKEN_EXPIRED",
        ),
      );
    }

    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.NotBeforeError
    ) {
      res.clearCookie(ACCESS_TOKEN_COOKIE, accessTokenCookieOptions);
      return next(
        new AppError("Invalid authentication token", 401, "AUTH_TOKEN_INVALID"),
      );
    }

    return next(error);
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      res.clearCookie(ACCESS_TOKEN_COOKIE, accessTokenCookieOptions);
      return next(new AppError("User not found", 401, "AUTH_USER_NOT_FOUND"));
    }

    req.user = user;

    next();
  } catch (error) {
    return next(error);
  }
};

export default authenticate;
