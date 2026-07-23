import { Router } from "express";
import { authenticate } from "../../middleware/authentication.middleware.js";
import { validateUuidParam } from "../../middleware/uuid-validation.middleware.js";
import { listCanvasTypes, listCategories } from "./canvas.controller.js";
export const canvasRouter = Router();
canvasRouter.use(authenticate);
canvasRouter.get("/", listCanvasTypes);
canvasRouter.get(
  "/:canvasTypeId/categories",
  validateUuidParam("canvasTypeId"),
  listCategories,
);
