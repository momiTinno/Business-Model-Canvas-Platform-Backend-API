import { Queue } from "bullmq";

import { queueConfig } from "../../config/queue.config.js";
import { redisConnection } from "../redis.connection.js";

export class CanvasGenerationQueue {
  constructor() {
    this.queue = new Queue(queueConfig.canvasGeneration.name, {
      connection: redisConnection.connection,
      defaultJobOptions: {
        attempts: queueConfig.canvasGeneration.attempts,
        backoff: {
          type: "exponential",
          delay: queueConfig.canvasGeneration.backoffMs,
        },
        removeOnComplete: 1000,
        removeOnFail: 1000,
      },
    });
  }

  addGeneration = async ({ generationId, correlationId = null }) =>
    this.queue.add(
      "generate-canvas",
      { generationId, correlationId },
      { jobId: generationId },
    );

  close = async () => this.queue.close();
}
