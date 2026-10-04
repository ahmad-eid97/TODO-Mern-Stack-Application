import type { RequestHandler } from "express";
import { AppError } from "../../errors/AppError.js";

const requestProtection: RequestHandler = (req, _res, next) => {
  const queryStart = req.originalUrl.indexOf("?");
  const query = queryStart === -1 ? "" : req.originalUrl.slice(queryStart + 1);

  // Check the raw query before Express parses it or authentication queries MongoDB.
  if (Buffer.byteLength(query, "utf8") > 4 * 1024) {
    return next(
      new AppError("Query string exceeds 4 KB", 414, "QUERY_TOO_LARGE"),
    );
  }

  if (new URLSearchParams(query).size > 50) {
    return next(
      new AppError(
        "At most 50 query parameters are allowed",
        400,
        "TOO_MANY_QUERY_PARAMETERS",
      ),
    );
  }

  const hasBody =
    req.headers["transfer-encoding"] !== undefined ||
    (req.headers["content-length"] !== undefined &&
      Number(req.headers["content-length"]) > 0);

  if (hasBody && !req.is("application/json")) {
    return next(
      new AppError(
        "Request bodies must use application/json",
        415,
        "UNSUPPORTED_CONTENT_TYPE",
      ),
    );
  }

  return next();
};

export default requestProtection;
