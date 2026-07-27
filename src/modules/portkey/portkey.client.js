import { Portkey } from "portkey-ai";
import { portkeyConfig } from "../../config/portkey.config.js";

export class PortkeyClient {
  constructor() {
    this.portkey = new Portkey({ apiKey: portkeyConfig.apiKey });
  }

  completePrompt = ({ promptId, variables }) =>
    this.portkey.prompts.completions.create({
      promptID: promptId,
      variables,
    });
}
