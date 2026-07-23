import { AppError } from "../utils/app-error.util.js";
import { isValid } from "../utils/uuid.util.js";
import { BusinessIdeaService } from "../modules/business-idea/business-idea.service.js";
export class BusinessIdeaMiddleware {
  constructor() {
    this.businessIdeaService = new BusinessIdeaService();
  }
  validateCreate = (req, res, next) => {
    try {
      const canvasTypeId = req.body?.canvasTypeId;
      const businessIdea = req.body?.businessIdea?.trim();
      if (!isValid(canvasTypeId) || !businessIdea)
        throw new AppError(
          "A valid canvas type and business idea are required",
          400,
          "VALIDATION_ERROR",
        );
      req.validatedBody = { canvasTypeId, businessIdea };
      next();
    } catch (error) {
      next(error);
    }
  };
  loadOwnedBusinessIdea = async (req, res, next) => {
    try {
      req.businessIdea = await this.businessIdeaService.getOwnedBusinessIdea(
        req.params.businessIdeaId,
        req.user.id,
      );
      next();
    } catch (error) {
      next(error);
    }
  };
}
export const businessIdeaMiddleware = new BusinessIdeaMiddleware();
