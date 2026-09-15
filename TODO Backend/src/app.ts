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
//= Middleware
import notFound from "./middlewares/error/notFound.js";
import errorHandler from "./middlewares/error/errorHandler.js";

const app = express();

// Global Middleware
app.use(helmet());
app.use(morgan("dev"));
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type"],
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));

//= Routes
app.use("/", healthRouter);
app.use("/auth", authRouter);

//= Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

export default app;
