import { AppError } from "../../utils/app-error.util.js";
import { generate } from "../../utils/uuid.util.js";
import { CanvasService } from "../canvas/canvas.service.js";
import { CanvasGenerationDbService } from "../canvas-generation/services/canvas-generation-db.service.js";
import { BusinessIdeaDbService } from "./services/business-idea-db.service.js";
import { BusinessIdeaAiService } from "./services/business-idea-ai.service.js";
import { OutboxEventDbService } from "../../jobs/services/outbox-event-db.service.js";
import { mysqlTransaction } from "../../db/mysql/transaction.js";
export class BusinessIdeaService {
  constructor() {
    this.businessIdeaDbService = new BusinessIdeaDbService();
    this.canvasService = new CanvasService();
    this.businessIdeaAiService = new BusinessIdeaAiService();
    this.canvasGenerationDbService = new CanvasGenerationDbService();
    this.outboxEventDbService = new OutboxEventDbService();
    this.mysqlTransaction = mysqlTransaction;
  }
  createBusinessIdea = async ({ userId, canvasTypeId, businessIdea }) => {
    if (!(await this.canvasService.getCanvasTypeById(canvasTypeId)))
      throw new AppError("Canvas type not found", 400, "CANVAS_TYPE_NOT_FOUND");
    const id = generate();
    await this.businessIdeaDbService.createBusinessIdea({
      id,
      userId,
      canvasId: canvasTypeId,
      originalIdea: businessIdea,
    });
    return {
      id,
      canvasTypeId,
      originalIdea: businessIdea,
      aiEnhancedIdea: null,
      generationStatus: "NOT_REQUESTED",
    };
  };

  createAndRequestBusinessIdeaEnhancement = async ({
    userId,
    canvasTypeId,
    businessIdea,
    correlationId = null,
  }) => {
    if (!(await this.canvasService.getCanvasTypeById(canvasTypeId)))
      throw new AppError("Canvas type not found", 400, "CANVAS_TYPE_NOT_FOUND");
    const id = generate();
    await this.mysqlTransaction.run(async (connection) => {
      await this.businessIdeaDbService.createBusinessIdea({
        connection,
        id,
        userId,
        canvasId: canvasTypeId,
        originalIdea: businessIdea,
      });
      await this.businessIdeaDbService.requestEnhancement({
        connection,
        id,
        userId,
      });
      await this.outboxEventDbService.createEvent({
        connection,
        id: generate(),
        eventType: "BUSINESS_IDEA_ENHANCEMENT_REQUESTED",
        payload: { businessIdeaId: id, correlationId },
      });
    });
    return {
      id,
      canvasTypeId,
      originalIdea: businessIdea,
      aiEnhancedIdea: null,
      generationStatus: "PENDING",
      failureMessage: null,
    };
  };
  listBusinessIdeas = async ({ userId, page, limit }) => {
    const [items, total] = await Promise.all([
      this.businessIdeaDbService.findBusinessIdeasByUser(
        userId,
        limit,
        (page - 1) * limit,
      ),
      this.businessIdeaDbService.countBusinessIdeasByUser(userId),
    ]);
    return { items, page, limit, total };
  };
  getOwnedBusinessIdea = async (businessIdeaId, userId) => {
    const idea =
      await this.businessIdeaDbService.findBusinessIdeaById(businessIdeaId);
    if (!idea || idea.user_id !== userId)
      throw new AppError(
        "Business idea not found",
        404,
        "BUSINESS_IDEA_NOT_FOUND",
      );
    return idea;
  };
  selectVersion = async ({ idea, userId, selectionType }) => {
    if (
      await this.canvasGenerationDbService.findCompletedCanvasGenerationByBusinessIdeaId(
        idea.id,
      )
    )
      throw new AppError(
        "Selection cannot change after canvas generation",
        409,
        "SELECTION_LOCKED_AFTER_GENERATION",
      );
    if (
      await this.canvasGenerationDbService.findActiveCanvasGenerationByBusinessIdeaId(
        idea.id,
      )
    )
      throw new AppError(
        "Canvas generation is in progress",
        409,
        "GENERATION_IN_PROGRESS",
      );
    if (selectionType === "AI_ENHANCED" && !idea.aiEnhancedIdea)
      throw new AppError(
        "An AI-enhanced idea is required for this selection",
        409,
        "AI_ENHANCED_IDEA_NOT_AVAILABLE",
      );
    const selectedIdea =
      selectionType === "ORIGINAL" ? idea.originalIdea : idea.aiEnhancedIdea;
    await this.businessIdeaDbService.updateSelection({
      id: idea.id,
      userId,
      selectedIdea,
      selectionType,
    });
    return { id: idea.id, selectedIdea, selectionType };
  };
  requestBusinessIdeaEnhancement = async ({
    idea,
    userId,
    correlationId = null,
  }) => {
    await this.mysqlTransaction.run(async (connection) => {
      if (
        !(await this.businessIdeaDbService.requestEnhancement({
          connection,
          id: idea.id,
          userId,
        }))
      )
        throw new AppError(
          "Business idea enhancement is in progress",
          409,
          "ENHANCEMENT_IN_PROGRESS",
        );
      await this.outboxEventDbService.createEvent({
        connection,
        id: generate(),
        eventType: "BUSINESS_IDEA_ENHANCEMENT_REQUESTED",
        payload: { businessIdeaId: idea.id, correlationId },
      });
    });
    return {
      id: idea.id,
      originalIdea: idea.originalIdea,
      aiEnhancedIdea: null,
      generationStatus: "PENDING",
    };
  };
}
