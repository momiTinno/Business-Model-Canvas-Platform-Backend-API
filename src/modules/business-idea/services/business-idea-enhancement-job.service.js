import { AppError } from "../../../utils/app-error.util.js";
import { BusinessIdeaAiService } from "./business-idea-ai.service.js";
import { BusinessIdeaDbService } from "./business-idea-db.service.js";

export class BusinessIdeaEnhancementJobService {
  constructor() {
    this.businessIdeaAiService = new BusinessIdeaAiService();
    this.businessIdeaDbService = new BusinessIdeaDbService();
  }

  process = async ({ businessIdeaId }) => {
    const idea =
      await this.businessIdeaDbService.findBusinessIdeaById(businessIdeaId);
    if (!idea)
      throw new AppError(
        "Business idea not found",
        404,
        "BUSINESS_IDEA_NOT_FOUND",
      );
    if (idea.generationStatus === "COMPLETED") return;
    if (!(await this.businessIdeaDbService.claimEnhancement(businessIdeaId)))
      return;
    const aiEnhancedIdea = await this.businessIdeaAiService.enhance(
      idea.originalIdea,
    );
    await this.businessIdeaDbService.updateEnhancement({
      id: businessIdeaId,
      userId: idea.user_id,
      enhancedIdea: aiEnhancedIdea,
      status: "COMPLETED",
    });
  };

  recordFailure = async ({ businessIdeaId, finalAttempt }) => {
    await this.businessIdeaDbService.recordEnhancementJobFailure({
      id: businessIdeaId,
      status: finalAttempt ? "FAILED" : "PENDING",
      failureMessage: finalAttempt
        ? "The AI enhancement could not be completed"
        : null,
    });
  };
}
