//= Services
import authService from "./auth.service.js";
import { toPublicUser } from "./auth.response.js";
//= Utils
import { generateAccessToken } from "../../utils/jwt.js";
import {
  accessTokenCookieOptions,
  getAccessTokenCookieOptions,
} from "./auth.cookie.js";
import { ACCESS_TOKEN_COOKIE } from "./auth.constants.js";

export const register = async (req, res, _next) => {
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
export const login = async (req, res, _next) => {
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
export const getCurrentUser = async (req, res, _next) => {
  res.status(200).json({
    data: toPublicUser(req.user),
  });
};
export const logout = async (_req, res, _next) => {
  res.clearCookie(ACCESS_TOKEN_COOKIE, accessTokenCookieOptions);
  res.status(200).json({
    message: "Successfully logged out",
  });
};
//# sourceMappingURL=auth.controller.js.map
