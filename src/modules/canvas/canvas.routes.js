import { Router } from "express";
import { authenticationMiddleware } from "../../middleware/authentication.middleware.js";
import { uuidValidationMiddleware } from "../../middleware/uuid-validation.middleware.js";
import { CanvasController } from "./canvas.controller.js";
export const canvasRouter = Router();
const canvasController = new CanvasController();
canvasRouter.use(authenticationMiddleware.authenticate);
canvasRouter.get("/", canvasController.listCanvasTypes);
canvasRouter.get(
  "/:canvasTypeId/categories",
  uuidValidationMiddleware.validateParam("canvasTypeId"),
  canvasController.listCategories,
);
