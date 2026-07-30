import { environment } from "../../config/env.config.js";

export class AiTaskLoggerService {
  constructor() {
    this.enabled = environment.get("AI_DEBUG_LOGGING") === "true";
  }

  logPortkeyRequest = ({ task, resourceId, promptId, variables }) => {
    if (!this.enabled) return;
    console.info({
      task,
      event: "portkey-request",
      occurredAt: new Date().toISOString(),
      resourceId,
      promptId,
      variables,
    });
  };

  logPortkeyResponse = ({ task, resourceId, promptId, response }) => {
    if (!this.enabled) return;
    console.info({
      task,
      event: "portkey-response",
      occurredAt: new Date().toISOString(),
      resourceId,
      promptId,
      response: this.toLoggableJson(response),
    });
  };

  toLoggableJson = (value) => {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return { unavailable: "Portkey response could not be serialized" };
    }
  };
}
