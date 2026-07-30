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
    this.worker.on("active", (job) => {
      console.info({
        task: "business-idea-enhancement",
        event: "processing",
        occurredAt: new Date().toISOString(),
        businessIdeaId: job.data.businessIdeaId,
        jobId: job.id,
      });
    });
    this.worker.on("completed", (job) => {
      console.info({
        task: "business-idea-enhancement",
        event: "completed",
        occurredAt: new Date().toISOString(),
        businessIdeaId: job.data.businessIdeaId,
        jobId: job.id,
      });
    });
    this.worker.on("failed", (job, error) => {
      console.error({
        task: "business-idea-enhancement",
        event: "failed",
        occurredAt: new Date().toISOString(),
        businessIdeaId: job?.data.businessIdeaId,
        jobId: job?.id,
        code: error?.code ?? "AI_ENHANCEMENT_FAILED",
        finalAttempt:
          job &&
          job.attemptsMade >=
            (job.opts.attempts ?? queueConfig.businessIdeaEnhancement.attempts),
      });
    });
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
