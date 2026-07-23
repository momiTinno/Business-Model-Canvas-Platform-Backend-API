import { AppError } from "../../utils/app-error.util.js";
import { PortkeyService } from "../portkey/portkey.service.js";
export class BusinessIdeaAiService {
  constructor(portkeyService = new PortkeyService()) {
    this.portkeyService = portkeyService;
  }
  enhance = async (originalIdea) => {
    const response =
      await this.portkeyService.enhanceBusinessIdea(originalIdea);
    const content = response?.body?.choices?.[0]?.message?.content?.trim();
    if (!content || content.length > 10000)
      throw new AppError("AI response is invalid", 502, "AI_RESPONSE_INVALID");
    return content;
  };
}
