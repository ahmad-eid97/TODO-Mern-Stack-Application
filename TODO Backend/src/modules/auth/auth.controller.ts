//= Services
import authService from "./auth.service.js";
import { toPublicUser } from "./auth.response.js";
//= Utils
import { generateAccessToken } from "../../utils/jwt.js";
import {
  accessTokenCookieOptions,
  getAccessTokenCookieOptions,
} from "./auth.cookie.js";
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
    tokenVersion: userData.tokenVersion,
  });

  res.cookie(
    ACCESS_TOKEN_COOKIE,
    userAccessToken,
    getAccessTokenCookieOptions(userAccessToken),
  );

  res.status(201).json({
    data: toPublicUser(userData),
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
    tokenVersion: userData.tokenVersion,
  });

  res.cookie(
    ACCESS_TOKEN_COOKIE,
    userAccessToken,
    getAccessTokenCookieOptions(userAccessToken),
  );

  res.status(200).json({
    data: toPublicUser(userData),
  });
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  res.status(200).json({
    data: toPublicUser(req.user!),
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
