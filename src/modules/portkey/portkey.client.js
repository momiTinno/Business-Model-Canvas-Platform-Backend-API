import { portkeyConfig } from "../../config/portkey.config.js";
export class PortkeyClient {
  async completePrompt({ promptId, variables }) {
    const response = await fetch(
      `https://api.portkey.ai/v1/prompts/${encodeURIComponent(promptId)}/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-portkey-api-key": portkeyConfig.apiKey,
        },
        body: JSON.stringify({ variables }),
      },
    );
    if (!response.ok)
      throw new Error(`Portkey request failed: ${response.status}`);
    return response.json();
  }
}
