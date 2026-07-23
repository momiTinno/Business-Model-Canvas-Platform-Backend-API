import { Router } from "express";

import { HealthController } from "./health.controller.js";

export const healthRouter = Router();
const healthController = new HealthController();
healthRouter.get("/health", healthController.getHealth);
