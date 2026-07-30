import { AppError } from "../../../utils/app-error.util.js";
import { PortkeyResponseMapper } from "../../portkey/portkey-response.mapper.js";
import { PortkeyService } from "../../portkey/portkey.service.js";
import { AiTaskLoggerService } from "../../../jobs/services/ai-task-logger.service.js";
import { portkeyConfig } from "../../../config/portkey.config.js";

export class CanvasGenerationAiService {
  constructor() {
    this.portkeyService = new PortkeyService();
    this.portkeyResponseMapper = new PortkeyResponseMapper();
    this.aiTaskLoggerService = new AiTaskLoggerService();
  }

  generate = async ({ taskContext = {}, ...payload }) => {
    try {
      this.aiTaskLoggerService.logPortkeyRequest({
        task: "canvas-generation",
        resourceId: taskContext.canvasGenerationId,
        promptId: portkeyConfig.canvasGenerationPromptId,
        variables: payload,
      });
      const response = await this.portkeyService.generateCanvas(payload);
      this.aiTaskLoggerService.logPortkeyResponse({
        task: "canvas-generation",
        resourceId: taskContext.canvasGenerationId,
        promptId: portkeyConfig.canvasGenerationPromptId,
        response,
      });
      const content = this.portkeyResponseMapper.getCompletionContent(response);
      if (!content)
        throw new AppError(
          "AI response is invalid",
          502,
          "AI_RESPONSE_INVALID",
        );
      return content;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        "Canvas generation provider failed",
        502,
        "AI_PROVIDER_ERROR",
      );
    }
  };
}
