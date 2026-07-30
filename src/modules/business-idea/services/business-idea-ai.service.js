import { AppError } from "../../../utils/app-error.util.js";
import { PortkeyService } from "../../portkey/portkey.service.js";
import { PortkeyResponseMapper } from "../../portkey/portkey-response.mapper.js";
import { AiTaskLoggerService } from "../../../jobs/services/ai-task-logger.service.js";
import { portkeyConfig } from "../../../config/portkey.config.js";
export class BusinessIdeaAiService {
  constructor() {
    this.portkeyService = new PortkeyService();
    this.portkeyResponseMapper = new PortkeyResponseMapper();
    this.aiTaskLoggerService = new AiTaskLoggerService();
  }
  enhance = async (originalIdea, { businessIdeaId } = {}) => {
    const variables = { businessIdea: originalIdea };
    this.aiTaskLoggerService.logPortkeyRequest({
      task: "business-idea-enhancement",
      resourceId: businessIdeaId,
      promptId: portkeyConfig.businessIdeaPromptId,
      variables,
    });
    const response =
      await this.portkeyService.enhanceBusinessIdea(originalIdea);
    this.aiTaskLoggerService.logPortkeyResponse({
      task: "business-idea-enhancement",
      resourceId: businessIdeaId,
      promptId: portkeyConfig.businessIdeaPromptId,
      response,
    });
    const content = this.portkeyResponseMapper.getCompletionContent(response);
    if (!content || content.length > 10000)
      throw new AppError("AI response is invalid", 502, "AI_RESPONSE_INVALID");
    return content;
  };
}
