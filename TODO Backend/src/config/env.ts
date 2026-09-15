import "dotenv/config";

import type { SignOptions } from "jsonwebtoken";

const PORT = process.env.PORT || 9999;

const MONGODB_URL =
  process.env.MONGODB_URL || "mongodb://localhost:27017/todoapp";

const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

const JWT_SECRET = process.env.JWT_SECRET;

const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? "7d") as NonNullable<
  SignOptions["expiresIn"]
>;

const NODE_ENV = process.env.NODE_ENV || "development";

const env = {
  PORT,
  MONGODB_URL,
  CORS_ORIGIN,
  NODE_ENV,
  JWT_SECRET,
  JWT_EXPIRES_IN,
};

export default env;
