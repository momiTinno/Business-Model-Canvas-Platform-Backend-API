import { Worker } from "bullmq";

import { queueConfig } from "../../config/queue.config.js";
import { redisConnection } from "../redis.connection.js";
import { CanvasGenerationJobService } from "../../modules/canvas-generation/services/canvas-generation-job.service.js";

export class CanvasGenerationWorker {
  constructor() {
    this.canvasGenerationJobService = new CanvasGenerationJobService();
    this.worker = new Worker(
      queueConfig.canvasGeneration.name,
      async (job) => this.processJob(job),
      {
        connection: redisConnection.duplicate(),
        concurrency: queueConfig.canvasGeneration.concurrency,
      },
    );
    this.worker.on("active", (job) => {
      console.info({
        task: "canvas-generation",
        event: "processing",
        canvasGenerationId: job.data.generationId,
        jobId: job.id,
      });
    });
    this.worker.on("completed", (job) => {
      console.info({
        task: "canvas-generation",
        event: "completed",
        canvasGenerationId: job.data.generationId,
        jobId: job.id,
      });
    });
    this.worker.on("failed", (job, error) => {
      console.error({
        task: "canvas-generation",
        event: "failed",
        canvasGenerationId: job?.data.generationId,
        jobId: job?.id,
        code: error?.code ?? "CANVAS_GENERATION_FAILED",
        finalAttempt:
          job &&
          job.attemptsMade >=
            (job.opts.attempts ?? queueConfig.canvasGeneration.attempts),
      });
    });
  }

  async processJob(job) {
    try {
      await this.canvasGenerationJobService.process({
        generationId: job.data.generationId,
      });
    } catch (error) {
      await this.canvasGenerationJobService.recordFailure({
        generationId: job.data.generationId,
        errorCode: error.code ?? "CANVAS_GENERATION_FAILED",
        finalAttempt:
          job.attemptsMade + 1 >=
          (job.opts.attempts ?? queueConfig.canvasGeneration.attempts),
      });
      throw error;
    }
  }

  close = async () => this.worker.close();
}
