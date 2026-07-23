import { portkeyConfig } from "../../config/portkey.config.js";
import { PortkeyClient } from "./portkey.client.js";
export class PortkeyService {
  constructor(portkeyClient = new PortkeyClient()) {
    this.portkeyClient = portkeyClient;
  }
  enhanceBusinessIdea = async (businessIdea) =>
    this.portkeyClient.completePrompt({
      promptId: portkeyConfig.businessIdeaPromptId,
      variables: { businessIdea },
    });
}
