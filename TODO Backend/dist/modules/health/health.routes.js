//= Modules
import { Router } from "express";
//= Controllers
import { healthCheck } from "./health.controller.js";
const router = Router();
router.get("/health", healthCheck);
export default router;
//# sourceMappingURL=health.routes.js.map