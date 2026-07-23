import { Router } from "express";
import { authenticate } from "../../middleware/authentication.middleware.js";
import { validateUuidParam } from "../../middleware/uuid-validation.middleware.js";
import { CanvasController } from "./canvas.controller.js";
export const canvasRouter = Router();
const canvasController = new CanvasController();
canvasRouter.use(authenticate);
canvasRouter.get("/", canvasController.listCanvasTypes);
canvasRouter.get(
  "/:canvasTypeId/categories",
  validateUuidParam("canvasTypeId"),
  canvasController.listCategories,
);
