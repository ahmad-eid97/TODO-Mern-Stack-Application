import type { CookieOptions } from "express";
import jwt from "jsonwebtoken";
import env from "../../config/env.js";

export const accessTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

export const getAccessTokenCookieOptions = (
  accessToken: string,
): CookieOptions => {
  const payload = jwt.decode(accessToken);

  if (
    !payload ||
    typeof payload === "string" ||
    typeof payload.exp !== "number" ||
    !Number.isFinite(payload.exp)
  ) {
    throw new Error("Generated access token must have a valid expiration");
  }

  return {
    ...accessTokenCookieOptions,
    expires: new Date(payload.exp * 1000),
  };
};
