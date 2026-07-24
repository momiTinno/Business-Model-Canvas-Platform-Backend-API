import { Router } from "express";
import { authenticationMiddleware } from "../../middleware/authentication.middleware.js";
import { businessIdeaMiddleware } from "./middleware/business-idea.middleware.js";
import { uuidValidationMiddleware } from "../../middleware/uuid-validation.middleware.js";
import { BusinessIdeaController } from "./business-idea.controller.js";
export const businessIdeaRouter = Router();
const businessIdeaController = new BusinessIdeaController();
businessIdeaRouter.use(authenticationMiddleware.authenticate);
businessIdeaRouter.post(
  "/",
  businessIdeaMiddleware.validateCreate,
  businessIdeaController.createBusinessIdea,
);
businessIdeaRouter.get("/", businessIdeaController.listBusinessIdeas);
businessIdeaRouter.get(
  "/:businessIdeaId",
  uuidValidationMiddleware.validateParam("businessIdeaId"),
  businessIdeaMiddleware.loadOwnedBusinessIdea,
  businessIdeaController.getBusinessIdea,
);
businessIdeaRouter.patch(
  "/:businessIdeaId/select",
  uuidValidationMiddleware.validateParam("businessIdeaId"),
  businessIdeaMiddleware.loadOwnedBusinessIdea,
  businessIdeaMiddleware.validateSelection,
  businessIdeaController.selectBusinessIdeaVersion,
);
businessIdeaRouter.post(
  "/:businessIdeaId/enhance",
  uuidValidationMiddleware.validateParam("businessIdeaId"),
  businessIdeaMiddleware.loadOwnedBusinessIdea,
  businessIdeaController.enhanceBusinessIdea,
);
