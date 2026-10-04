import type { RequestHandler } from "express";
import env from "../../config/env.js";
import { AppError } from "../../errors/AppError.js";
import { ACCESS_TOKEN_COOKIE } from "../../modules/auth/auth.constants.js";

const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

const enforceOrigin: RequestHandler = (req, res, next) => {
  res.vary("Origin");
  const origin = req.get("Origin");

  if (origin !== undefined) {
    if (origin !== env.CORS_ORIGIN) {
      return next(
        new AppError(
          "Request origin is not allowed",
          403,
          "ORIGIN_NOT_ALLOWED",
        ),
      );
    }

    return next();
  }

  if (safeMethods.has(req.method)) {
    return next();
  }

  // Referer is a fallback for browser writes that omit Origin.
  const referer = req.get("Referer");
  if (referer !== undefined) {
    try {
      const source = new URL(referer);
      if (
        source.origin === env.CORS_ORIGIN &&
        !source.username &&
        !source.password
      ) {
        return next();
      }
    } catch {
      // Malformed source headers are rejected below.
    }

    return next(
      new AppError("Request origin is not allowed", 403, "ORIGIN_NOT_ALLOWED"),
    );
  }

  // Require a trusted browser source for cookie-backed writes. Non-browser
  // clients using cookies can explicitly send the configured Origin header.
  if (
    req.cookies?.[ACCESS_TOKEN_COOKIE] !== undefined ||
    req.get("Sec-Fetch-Site") !== undefined
  ) {
    return next(
      new AppError(
        "A trusted request origin is required",
        403,
        "ORIGIN_REQUIRED",
      ),
    );
  }

  return next();
};

export default enforceOrigin;
