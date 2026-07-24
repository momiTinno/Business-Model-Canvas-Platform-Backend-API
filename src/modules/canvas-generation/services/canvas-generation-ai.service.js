import { AppError } from "../../../utils/app-error.util.js";
import { PortkeyResponseMapper } from "../../portkey/portkey-response.mapper.js";
import { PortkeyService } from "../../portkey/portkey.service.js";

export class CanvasGenerationAiService {
  constructor() {
    this.portkeyService = new PortkeyService();
    this.portkeyResponseMapper = new PortkeyResponseMapper();
  }

  generate = async (payload) => {
    try {
      const response = await this.portkeyService.generateCanvas(payload);
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
