import { Router } from "express";
import { authenticationMiddleware } from "../../middleware/authentication.middleware.js";
import { uuidValidationMiddleware } from "../../middleware/uuid-validation.middleware.js";
import { businessIdeaMiddleware } from "../business-idea/middleware/business-idea.middleware.js";
import { CanvasGenerationController } from "./canvas-generation.controller.js";
import { canvasGenerationMiddleware } from "./middleware/canvas-generation.middleware.js";

export const canvasGenerationRouter = Router();
const canvasGenerationController = new CanvasGenerationController();

canvasGenerationRouter.use(authenticationMiddleware.authenticate);
canvasGenerationRouter.post(
  "/business-ideas/:businessIdeaId/canvas-generations",
  uuidValidationMiddleware.validateParam("businessIdeaId"),
  businessIdeaMiddleware.loadOwnedBusinessIdea,
  canvasGenerationController.createCanvasGeneration,
);
canvasGenerationRouter.get(
  "/canvas-generations/:canvasGenerationId",
  uuidValidationMiddleware.validateParam("canvasGenerationId"),
  canvasGenerationMiddleware.loadOwnedCanvasGeneration,
  canvasGenerationController.getCanvasGeneration,
);
canvasGenerationRouter.get(
  "/canvas-generations/:canvasGenerationId/entries",
  uuidValidationMiddleware.validateParam("canvasGenerationId"),
  canvasGenerationMiddleware.loadOwnedCanvasGeneration,
  canvasGenerationController.getCanvasGenerationEntries,
);
