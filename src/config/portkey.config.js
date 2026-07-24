import { environment } from "./env.config.js";
export const portkeyConfig = Object.freeze({
  apiKey: environment.get("PORTKEY_API_KEY"),
  businessIdeaPromptId: environment.get("BUSINESS_IDEA_PROMPT_ID"),
  canvasGenerationPromptId: environment.get("CANVAS_GENERATION_PROMPT_ID"),
});
