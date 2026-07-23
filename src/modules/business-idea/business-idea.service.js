import { AppError } from "../../utils/app-error.util.js";
import { generate } from "../../utils/uuid.util.js";
import { CanvasService } from "../canvas/canvas.service.js";
import { BusinessIdeaDbService } from "./business-idea.db.service.js";
import { BusinessIdeaAiService } from "./business-idea-ai.service.js";
export class BusinessIdeaService {
  constructor() {
    this.businessIdeaDbService = new BusinessIdeaDbService();
    this.canvasService = new CanvasService();
    this.businessIdeaAiService = new BusinessIdeaAiService();
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
      generationStatus: "PENDING",
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
  enhanceBusinessIdea = async (idea, userId) => {
    try {
      const aiEnhancedIdea = await this.businessIdeaAiService.enhance(
        idea.originalIdea,
      );
      await this.businessIdeaDbService.updateEnhancement({
        id: idea.id,
        userId,
        enhancedIdea: aiEnhancedIdea,
        status: "COMPLETED",
      });
      return {
        id: idea.id,
        originalIdea: idea.originalIdea,
        aiEnhancedIdea,
        generationStatus: "COMPLETED",
      };
    } catch (error) {
      await this.businessIdeaDbService.updateEnhancement({
        id: idea.id,
        userId,
        enhancedIdea: null,
        status: "FAILED",
      });
      throw error;
    }
  };
}
