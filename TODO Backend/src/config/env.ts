import "dotenv/config";

const PORT = process.env.PORT || 9999;

const MONGODB_URL =
  process.env.MONGODB_URL || "mongodb://localhost:27017/todoapp";

const NODE_ENV = process.env.NODE_ENV || "development";

if (!["development", "test", "production"].includes(NODE_ENV)) {
  throw new Error("NODE_ENV must be development, test, or production");
}

const configuredOrigin = process.env.CORS_ORIGIN?.trim();

if (NODE_ENV === "production" && !configuredOrigin) {
  throw new Error("CORS_ORIGIN must be explicitly configured in production");
}

let CORS_ORIGIN: string;
try {
  const url = new URL(configuredOrigin || "http://localhost:5173");
  if (
    !["http:", "https:"].includes(url.protocol) ||
    !url.hostname ||
    url.hostname.includes("*") ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    (NODE_ENV === "production" && url.protocol !== "https:")
  ) {
    throw new Error("Invalid frontend origin");
  }

  // Normalize the optional trailing slash and default port to a browser origin.
  CORS_ORIGIN = url.origin;
} catch {
  throw new Error(
    "CORS_ORIGIN must be a single HTTP(S) origin without wildcards, credentials, paths, query strings, or fragments; production requires HTTPS",
  );
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || Buffer.byteLength(JWT_SECRET.trim(), "utf8") < 32) {
  throw new Error(
    "JWT_SECRET must be a randomly generated secret of at least 32 bytes",
  );
}

const jwtLifetime = process.env.JWT_EXPIRES_IN ?? "7d";
const lifetimeMatch = /^([1-9]\d*)(s|m|h|d|w)$/.exec(jwtLifetime);
const secondsPerUnit: Record<string, number> = {
  s: 1,
  m: 60,
  h: 60 * 60,
  d: 24 * 60 * 60,
  w: 7 * 24 * 60 * 60,
};
const JWT_EXPIRES_IN = lifetimeMatch
  ? Number(lifetimeMatch[1]) * secondsPerUnit[lifetimeMatch[2]!]!
  : NaN;

if (
  !Number.isSafeInteger(JWT_EXPIRES_IN) ||
  JWT_EXPIRES_IN <= 0 ||
  !Number.isFinite(new Date(Date.now() + JWT_EXPIRES_IN * 1000).getTime())
) {
  throw new Error(
    "JWT_EXPIRES_IN must be a positive whole-number duration such as 15m, 1h, or 7d (units: s, m, h, d, w)",
  );
}

const env = {
  PORT,
  MONGODB_URL,
  CORS_ORIGIN,
  NODE_ENV,
  JWT_SECRET,
  JWT_EXPIRES_IN,
};

export default env;
