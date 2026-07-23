import { AppError } from "../../utils/app-error.util.js";
import { generate } from "../../utils/uuid.util.js";
import { CanvasService } from "../canvas/canvas.service.js";
import { BusinessIdeaDbService } from "./business-idea.db.service.js";
export class BusinessIdeaService {
  constructor(
    businessIdeaDbService = new BusinessIdeaDbService(),
    canvasService = new CanvasService(),
  ) {
    this.businessIdeaDbService = businessIdeaDbService;
    this.canvasService = canvasService;
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
}
