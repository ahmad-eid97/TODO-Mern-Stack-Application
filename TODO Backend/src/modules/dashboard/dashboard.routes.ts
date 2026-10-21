//= Modules
import { Router } from "express";
//= Controllers
import { getDashboard } from "./dashboard.controller.js";
//= Middlewares
import authenticate from "../../middlewares/auth/authenticate.js";

const router = Router();

router.get("/dashboard", authenticate, getDashboard);

export default router;