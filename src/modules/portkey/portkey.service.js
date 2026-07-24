import { portkeyConfig } from "../../config/portkey.config.js";
import { PortkeyClient } from "./portkey.client.js";
export class PortkeyService {
  constructor() {
    this.portkeyClient = new PortkeyClient();
  }
  enhanceBusinessIdea = async (businessIdea) =>
    this.portkeyClient.completePrompt({
      promptId: portkeyConfig.businessIdeaPromptId,
      variables: { businessIdea },
    });
  generateCanvas = async ({ canvasType, categoryNamesStr, description }) =>
    this.portkeyClient.completePrompt({
      promptId: portkeyConfig.canvasGenerationPromptId,
      variables: { canvasType, categoryNamesStr, description },
    });
}
