//= Modules
import { Router } from "express";
//= Middlewares
import authenticate from "../../middlewares/auth/authenticate.js";
import requireContentType from "../../middlewares/security/requireContentType.js";
import upload from "../../middlewares/upload/upload.js";
import validate from "../../middlewares/validation/validate.js";
import validateFile from "../../middlewares/upload/validateFile.js";
import { passwordChangeLimiter } from "../../middlewares/rateLimit.js";
//= Controllers
import { editUser } from "./profile.controllers.js";
import { editUserPassword } from "./profile.controllers.js"
//= Validation
import { userEditSchema } from './profile.validations.js';
import { passwordEditSchema } from "./profile.validations.js";

const router = Router();

router.patch(
  "/profile/me",
  authenticate,
  requireContentType("multipart/form-data"),
  upload.single("avatar"),
  validate(userEditSchema),
  validateFile,
  editUser,
);

router.patch("/profile/password", authenticate, passwordChangeLimiter, validate(passwordEditSchema), editUserPassword)

export default router;
