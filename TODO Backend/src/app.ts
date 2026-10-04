//= Modules
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
//= Utils
import env from "./config/env.js";
//= Routes
import healthRouter from "./modules/health/health.routes.js";
import authRouter from "./modules/auth/auth.routes.js";
import todoRouter from "./modules/todos/todo.routes.js";
//= Middleware
import { apiLimiter } from "./middlewares/rateLimit.js";
import notFound from "./middlewares/error/notFound.js";
import errorHandler from "./middlewares/error/errorHandler.js";
import enforceOrigin from "./middlewares/security/enforceOrigin.js";
import requestProtection from "./middlewares/security/requestProtection.js";

const app = express();

app.set(
  "trust proxy",
  env.TRUST_PROXY_HOPS === 0 ? false : env.TRUST_PROXY_HOPS,
);

// Global Middleware
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(enforceOrigin);
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, origin === env.CORS_ORIGIN ? env.CORS_ORIGIN : false);
    },
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type"],
  }),
);
app.use(requestProtection);
app.use(express.json({ limit: "10kb", strict: true, inflate: false }));

app.use("/", apiLimiter);

//= Routes
app.use("/", healthRouter);
app.use("/auth", authRouter);
app.use("/", todoRouter);

//= Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

export default app;
