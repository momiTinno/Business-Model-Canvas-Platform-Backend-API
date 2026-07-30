import { AppError } from "../../../utils/app-error.util.js";
import { BusinessIdeaAiService } from "./business-idea-ai.service.js";
import { BusinessIdeaDbService } from "./business-idea-db.service.js";
import { mysqlTransaction } from "../../../db/mysql/transaction.js";
import { BackgroundTaskStatusHistoryDbService } from "../../../jobs/services/background-task-status-history-db.service.js";

const BUSINESS_IDEA_ENHANCEMENT = "BUSINESS_IDEA_ENHANCEMENT";

export class BusinessIdeaEnhancementJobService {
  constructor() {
    this.businessIdeaAiService = new BusinessIdeaAiService();
    this.businessIdeaDbService = new BusinessIdeaDbService();
    this.mysqlTransaction = mysqlTransaction;
    this.backgroundTaskStatusHistoryDbService =
      new BackgroundTaskStatusHistoryDbService();
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
    const claimed = await this.mysqlTransaction.run(async (connection) => {
      if (
        !(await this.businessIdeaDbService.claimEnhancement({
          connection,
          id: businessIdeaId,
        }))
      )
        return false;
      await this.backgroundTaskStatusHistoryDbService.recordStatus({
        connection,
        taskType: BUSINESS_IDEA_ENHANCEMENT,
        resourceId: businessIdeaId,
        status: "PROCESSING",
      });
      return true;
    });
    if (!claimed) return;
    const aiEnhancedIdea = await this.businessIdeaAiService.enhance(
      idea.originalIdea,
      { businessIdeaId },
    );
    await this.mysqlTransaction.run(async (connection) => {
      await this.businessIdeaDbService.updateEnhancement({
        connection,
        id: businessIdeaId,
        userId: idea.user_id,
        enhancedIdea: aiEnhancedIdea,
        status: "COMPLETED",
      });
      await this.backgroundTaskStatusHistoryDbService.recordStatus({
        connection,
        taskType: BUSINESS_IDEA_ENHANCEMENT,
        resourceId: businessIdeaId,
        status: "COMPLETED",
      });
    });
  };

  recordFailure = async ({ businessIdeaId, finalAttempt }) => {
    const status = finalAttempt ? "FAILED" : "PENDING";
    await this.mysqlTransaction.run(async (connection) => {
      await this.businessIdeaDbService.recordEnhancementJobFailure({
        connection,
        id: businessIdeaId,
        status,
        failureMessage: finalAttempt
          ? "The AI enhancement could not be completed"
          : null,
      });
      await this.backgroundTaskStatusHistoryDbService.recordStatus({
        connection,
        taskType: BUSINESS_IDEA_ENHANCEMENT,
        resourceId: businessIdeaId,
        status,
      });
    });
  };
}
