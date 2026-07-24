import { HTTP_STATUS } from "../../constants/http-status.constants.js";
import { CanvasGenerationService } from "./canvas-generation.service.js";

export class CanvasGenerationController {
  constructor() {
    this.canvasGenerationService = new CanvasGenerationService();
  }

  createCanvasGeneration = async (req, res, next) => {
    try {
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: await this.canvasGenerationService.generateCanvas({
          idea: req.businessIdea,
          userId: req.user.id,
        }),
      });
    } catch (error) {
      next(error);
    }
  };

  getCanvasGeneration = async (req, res, next) => {
    try {
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: req.canvasGeneration,
      });
    } catch (error) {
      next(error);
    }
  };

  getCanvasGenerationEntries = async (req, res, next) => {
    try {
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          id: req.canvasGeneration.id,
          categories: await this.canvasGenerationService.getGroupedEntries(
            req.canvasGeneration.id,
            req.canvasGeneration.canvasTypeId,
          ),
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
