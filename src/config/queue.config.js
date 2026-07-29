import { environment } from "./env.config.js";

export const queueConfig = Object.freeze({
  redis: {
    host: environment.get("REDIS_HOST"),
    port: Number(environment.get("REDIS_PORT")),
    password: environment.get("REDIS_PASSWORD") || undefined,
    db: Number(environment.get("REDIS_DB")),
  },
  canvasGeneration: {
    name: "canvas-generation",
    concurrency: Number(environment.get("QUEUE_CANVAS_GENERATION_CONCURRENCY")),
    attempts: Number(environment.get("QUEUE_JOB_ATTEMPTS")),
    backoffMs: Number(environment.get("QUEUE_BACKOFF_MS")),
  },
  businessIdeaEnhancement: {
    name: "business-idea-enhancement",
    concurrency: Number(
      environment.get("QUEUE_BUSINESS_IDEA_ENHANCEMENT_CONCURRENCY"),
    ),
    attempts: Number(environment.get("QUEUE_JOB_ATTEMPTS")),
    backoffMs: Number(environment.get("QUEUE_BACKOFF_MS")),
  },
});
