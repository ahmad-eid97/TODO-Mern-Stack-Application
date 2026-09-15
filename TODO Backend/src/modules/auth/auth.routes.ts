//= Modules
import { Router } from "express";
//= Middlewares
import validate from "../../middlewares/validation/validate.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
//= Controllers
import { register, login, logout } from "./auth.controller.js";
//= Validation
import { registerSchema, loginSchema } from "./auth.validation.js";

const router = Router();

router.post("/register", validate(registerSchema), asyncHandler(register));

router.post("/login", validate(loginSchema), asyncHandler(login));

router.post("/logout", asyncHandler(logout));

export default router;
