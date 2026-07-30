import { HTTP_STATUS } from "../../constants/http-status.constants.js";
import { CanvasGenerationService } from "./canvas-generation.service.js";
import { OutboxPublisherService } from "../../jobs/services/outbox-publisher.service.js";

export class CanvasGenerationController {
  constructor() {
    this.canvasGenerationService = new CanvasGenerationService();
    this.outboxPublisherService = new OutboxPublisherService();
  }

  createCanvasGeneration = async (req, res, next) => {
    try {
      const generation =
        await this.canvasGenerationService.requestCanvasGeneration({
          idea: req.businessIdea,
          userId: req.user.id,
          correlationId: req.correlationId,
        });
      try {
        await this.outboxPublisherService.publishPendingEvents();
      } catch (error) {
        console.error("Canvas generation outbox publish failed", {
          code: error.code ?? "OUTBOX_PUBLISH_FAILED",
          correlationId: req.correlationId,
        });
      }
      res.status(HTTP_STATUS.ACCEPTED).json({
        success: true,
        data: generation,
      });
    } catch (error) {
      next(error);
    }
  };

  getCanvasGeneration = async (req, res, next) => {
    try {
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          ...req.canvasGeneration,
          statusTimeline: await this.canvasGenerationService.getStatusTimeline(
            req.canvasGeneration.id,
          ),
        },
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
