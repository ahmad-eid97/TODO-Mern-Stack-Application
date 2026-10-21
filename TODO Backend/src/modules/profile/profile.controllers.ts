//= Modules
import type { Request, Response, NextFunction } from "express";
//= Services
import { handleEditUser, handleEditUserPassword } from "./profile.services.js";
//= Utils
import { toPublicUser } from "../auth/auth.response.js";
import { generateAccessToken } from "../../utils/jwt.js";
import { ACCESS_TOKEN_COOKIE } from "../auth/auth.constants.js";
import { getAccessTokenCookieOptions } from "../auth/auth.cookie.js";

export const editUser = async (req: Request, res: Response, _next: NextFunction) => {
  const updatedUser = await handleEditUser(req.user!, req.body, req.file);

  res.status(200).json({
    data: toPublicUser(updatedUser)
  })
}

export const editUserPassword = async (req: Request, res: Response, _next: NextFunction) => {
  const user = await handleEditUserPassword(req.user!._id, req.body);
  const token = generateAccessToken({ userId: user._id.toString(), tokenVersion: user.tokenVersion });
  res.cookie(ACCESS_TOKEN_COOKIE, token, getAccessTokenCookieOptions(token));

  res.status(200).json({
    message: "Password changed successfully"
  })
}
