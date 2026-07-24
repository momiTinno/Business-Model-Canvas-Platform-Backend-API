import { CanvasGenerationService } from "../canvas-generation.service.js";

export class CanvasGenerationMiddleware {
  constructor() {
    this.canvasGenerationService = new CanvasGenerationService();
  }

  loadOwnedCanvasGeneration = async (req, res, next) => {
    try {
      req.canvasGeneration =
        await this.canvasGenerationService.getOwnedCanvasGeneration(
          req.params.canvasGenerationId,
          req.user.id,
        );
      next();
    } catch (error) {
      next(error);
    }
  };
}

export const canvasGenerationMiddleware = new CanvasGenerationMiddleware();
