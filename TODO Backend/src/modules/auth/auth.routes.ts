//= Modules
import { Router } from "express";
//= Middlewares
import { loginLimiter, registerLimiter } from "../../middlewares/rateLimit.js";
import validate from "../../middlewares/validation/validate.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import authenticate from "../../middlewares/auth/authenticate.js";
//= Controllers
import { register, login, logout, getCurrentUser } from "./auth.controller.js";
//= Validation
import { registerSchema, loginSchema } from "./auth.validation.js";

const router = Router();

router.post(
  "/register",
  registerLimiter,
  validate(registerSchema),
  asyncHandler(register),
);

router.post("/login", loginLimiter, validate(loginSchema), asyncHandler(login));

router.post("/logout", asyncHandler(logout));

router.get("/me", authenticate, asyncHandler(getCurrentUser));

export default router;
