import { Queue } from "bullmq";

import { queueConfig } from "../../config/queue.config.js";
import { redisConnection } from "../redis.connection.js";

export class BusinessIdeaEnhancementQueue {
  constructor() {
    this.queue = new Queue(queueConfig.businessIdeaEnhancement.name, {
      connection: redisConnection.connection,
      defaultJobOptions: {
        attempts: queueConfig.businessIdeaEnhancement.attempts,
        backoff: {
          type: "exponential",
          delay: queueConfig.businessIdeaEnhancement.backoffMs,
        },
        removeOnComplete: 1000,
        removeOnFail: 1000,
      },
    });
  }

  addEnhancement = async ({ businessIdeaId, correlationId = null }) =>
    this.queue.add(
      "enhance-business-idea",
      { businessIdeaId, correlationId },
      { jobId: businessIdeaId },
    );

  close = async () => this.queue.close();
}
