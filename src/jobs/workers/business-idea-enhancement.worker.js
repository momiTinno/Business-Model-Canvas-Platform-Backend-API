import { Worker } from "bullmq";

import { queueConfig } from "../../config/queue.config.js";
import { BusinessIdeaEnhancementJobService } from "../../modules/business-idea/services/business-idea-enhancement-job.service.js";
import { redisConnection } from "../redis.connection.js";

export class BusinessIdeaEnhancementWorker {
  constructor() {
    this.businessIdeaEnhancementJobService =
      new BusinessIdeaEnhancementJobService();
    this.worker = new Worker(
      queueConfig.businessIdeaEnhancement.name,
      async (job) => this.processJob(job),
      {
        connection: redisConnection.duplicate(),
        concurrency: queueConfig.businessIdeaEnhancement.concurrency,
      },
    );
  }

  async processJob(job) {
    try {
      await this.businessIdeaEnhancementJobService.process({
        businessIdeaId: job.data.businessIdeaId,
      });
    } catch (error) {
      await this.businessIdeaEnhancementJobService.recordFailure({
        businessIdeaId: job.data.businessIdeaId,
        finalAttempt:
          job.attemptsMade + 1 >=
          (job.opts.attempts ?? queueConfig.businessIdeaEnhancement.attempts),
      });
      throw error;
    }
  }

  close = async () => this.worker.close();
}
