//= Services
import authService from "./auth.service.js";
//= Utils
import { generateAccessToken } from "../../utils/jwt.js";
import { accessTokenCookieOptions } from "./auth.cookie.js";
//= Types
import type { Request, Response, NextFunction } from "express";
import { ACCESS_TOKEN_COOKIE } from "./auth.constants.js";

export const register = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const userData = await authService.registerUser(req.body);

  const userAccessToken = generateAccessToken({
    userId: userData._id.toString(),
  });

  res.cookie(ACCESS_TOKEN_COOKIE, userAccessToken, accessTokenCookieOptions);

  res.status(201).json({
    data: userData,
  });
};

export const login = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const { email, password } = req.body;

  const userData = await authService.loginUser({ email, password });

  const userAccessToken = generateAccessToken({
    userId: userData._id.toString(),
  });

  res.cookie(ACCESS_TOKEN_COOKIE, userAccessToken, accessTokenCookieOptions);

  res.status(200).json({
    data: userData,
  });
};

export const logout = async (
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  res.clearCookie(ACCESS_TOKEN_COOKIE, accessTokenCookieOptions);

  res.status(200).json({
    message: "Successfully logged out",
  });
};
