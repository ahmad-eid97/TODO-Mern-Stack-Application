import jwt from "jsonwebtoken";
import env from "../config/env.js";

interface AccessTokenPayload {
  userId: string;
}

interface VerifiedAccessTokenPayload extends AccessTokenPayload {
  exp: number;
}

export const generateAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

export const verifyAccessToken = (
  token: unknown,
): VerifiedAccessTokenPayload => {
  if (typeof token !== "string" || !token) {
    throw new jwt.JsonWebTokenError("Invalid access token");
  }

  const payload = jwt.verify(token, env.JWT_SECRET, {
    algorithms: ["HS256"],
  });

  if (
    typeof payload === "string" ||
    typeof payload.userId !== "string" ||
    !/^[a-fA-F0-9]{24}$/.test(payload.userId) ||
    typeof payload.exp !== "number" ||
    !Number.isSafeInteger(payload.exp) ||
    payload.exp <= 0
  ) {
    throw new jwt.JsonWebTokenError("Invalid access token claims");
  }

  return { userId: payload.userId, exp: payload.exp };
};
